import crypto from 'crypto';
import Razorpay from 'razorpay';
import Donation from '../models/Donation.js';
import { isDbReady } from '../config/db.js';

// Initialize Razorpay client if credentials are provided
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (keyId && keySecret && keyId !== 'YOUR_RAZORPAY_KEY_ID') {
    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  }
  return null;
};

/**
 * Generate sequential/formatted Donation ID: DND00001, DND00002, etc.
 */
async function generateDonationId() {
  const total = await Donation.countDocuments();
  let candidateNum = total + 1;
  let candidateId = `DND${String(candidateNum).padStart(5, '0')}`;

  // Ensure uniqueness
  while (await Donation.exists({ donationId: candidateId })) {
    candidateNum += 1;
    candidateId = `DND${String(candidateNum).padStart(5, '0')}`;
  }
  return candidateId;
}

/**
 * Public: Get live donation statistics (Total Donors, Total Amount, Successful Donations)
 * Calculates from genuine verified successful records only.
 */
export const getDonationStats = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        success: false,
        message: 'Database is currently offline. Donation metrics cannot be retrieved.'
      });
    }

    const [uniqueEmails, totalAmountResult, successfulDonations] = await Promise.all([
      Donation.distinct('email', { status: 'Successful' }),
      Donation.aggregate([
        { $match: { status: 'Successful' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Donation.countDocuments({ status: 'Successful' })
    ]);

    const totalDonors = uniqueEmails ? uniqueEmails.length : 0;
    const totalDonationsReceived = totalAmountResult && totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;

    res.json({
      success: true,
      data: {
        totalDonors,
        totalDonationsReceived,
        successfulDonations
      },
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Donation Stats Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve donation statistics.' });
  }
};

/**
 * Public: Get public configuration for Razorpay frontend
 */
export const getDonationConfig = (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  const isConfigured = Boolean(keyId && keyId !== 'YOUR_RAZORPAY_KEY_ID');

  res.json({
    success: true,
    data: {
      keyId: isConfigured ? keyId : '',
      isConfigured,
      isTestMode: process.env.NODE_ENV !== 'production' || !isConfigured
    }
  });
};

/**
 * Public: Create Donation Order
 * Validates form inputs, stores Pending donation, creates Razorpay Order
 */
export const createDonationOrder = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        success: false,
        message: 'Database connection is unavailable. Please try again later.'
      });
    }

    const {
      fullName,
      email,
      mobileNumber,
      amount,
      message = '',
      isAnonymous = false
    } = req.body;

    // Basic Validations
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your full name.' });
    }

    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (!mobileNumber || typeof mobileNumber !== 'string' || mobileNumber.trim().length < 7) {
      return res.status(400).json({ success: false, message: 'Please provide a valid mobile number.' });
    }

    const parsedAmount = Number(amount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount < 1) {
      return res.status(400).json({ success: false, message: 'Donation amount must be at least ₹1.' });
    }

    const donationId = await generateDonationId();
    const amountInPaise = Math.round(parsedAmount * 100);

    const rzp = getRazorpayInstance();
    let orderId = '';
    let isMockOrder = false;

    if (rzp) {
      try {
        const order = await rzp.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: donationId,
          notes: {
            donationId,
            fullName: fullName.trim(),
            email: email.trim()
          }
        });
        orderId = order.id;
      } catch (rzpErr) {
        console.warn('[Razorpay API Error, falling back to test order]:', rzpErr.message);
        orderId = `order_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        isMockOrder = true;
      }
    } else {
      // Test Mode order ID
      orderId = `order_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      isMockOrder = true;
    }

    // Save pending donation
    const newDonation = new Donation({
      donationId,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      mobileNumber: mobileNumber.trim(),
      amount: parsedAmount,
      currency: 'INR',
      message: message ? message.trim() : '',
      isAnonymous: Boolean(isAnonymous),
      status: 'Pending',
      paymentGateway: 'Razorpay',
      razorpayOrderId: orderId
    });

    await newDonation.save();

    res.status(201).json({
      success: true,
      data: {
        donationId,
        orderId,
        amount: parsedAmount,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID || '',
        isMockOrder
      }
    });
  } catch (error) {
    console.error('[Create Donation Order Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to initiate donation order.' });
  }
};

/**
 * Public: Verify Donation Payment
 * Validates HMAC SHA256 signature and updates record to Successful
 */
export const verifyDonationPayment = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        success: false,
        message: 'Database is unavailable. Cannot verify payment.'
      });
    }

    const {
      donationId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!donationId) {
      return res.status(400).json({ success: false, message: 'Missing donation ID.' });
    }

    const donation = await Donation.findOne({ donationId });
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation record not found.' });
    }

    if (donation.status === 'Successful') {
      return res.json({
        success: true,
        message: 'Donation already verified successfully.',
        data: donation
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    let isValid = false;

    // Check if live razorpay secret is configured
    if (secret && secret !== 'YOUR_RAZORPAY_KEY_SECRET' && razorpay_signature && razorpay_order_id && razorpay_payment_id) {
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      isValid = generatedSignature === razorpay_signature;
    } else {
      // In development / test mode without secret, accept verified test confirmation
      if (razorpay_order_id && (donation.razorpayOrderId === razorpay_order_id || !donation.razorpayOrderId)) {
        isValid = true;
      }
    }

    if (!isValid) {
      donation.status = 'Failed';
      await donation.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Verification failed.'
      });
    }

    donation.status = 'Successful';
    donation.razorpayPaymentId = razorpay_payment_id || `pay_test_${Date.now()}`;
    donation.razorpaySignature = razorpay_signature || 'test_signature';
    donation.paidAt = new Date();
    await donation.save();

    res.json({
      success: true,
      message: 'Donation payment verified successfully. Thank you for your support!',
      data: {
        donationId: donation.donationId,
        amount: donation.amount,
        donorName: donation.isAnonymous ? 'Anonymous' : donation.fullName,
        paidAt: donation.paidAt
      }
    });
  } catch (error) {
    console.error('[Verify Donation Payment Error]:', error);
    res.status(500).json({ success: false, message: 'Error verifying donation payment.' });
  }
};

/**
 * Public: Razorpay Webhook Handler
 */
export const handleDonationWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (expectedSignature !== signature) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    const event = req.body.event;
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      if (orderId) {
        const donation = await Donation.findOne({ razorpayOrderId: orderId });
        if (donation && donation.status !== 'Successful') {
          donation.status = 'Successful';
          donation.razorpayPaymentId = paymentId;
          donation.paidAt = new Date();
          await donation.save();
        }
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('[Donation Webhook Error]:', err);
    res.status(500).json({ success: false });
  }
};

/**
 * Protected Admin: List all donations with search and filters
 */
export const adminGetDonations = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({ success: false, message: 'Database is offline.' });
    }

    const { search = '', status = 'all', page = 1, limit = 15 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim()) {
      const term = search.trim();
      const numTerm = Number(term);
      const orClauses = [
        { donationId: new RegExp(term, 'i') },
        { fullName: new RegExp(term, 'i') },
        { email: new RegExp(term, 'i') },
        { mobileNumber: new RegExp(term, 'i') },
        { razorpayPaymentId: new RegExp(term, 'i') },
        { razorpayOrderId: new RegExp(term, 'i') }
      ];
      if (!isNaN(numTerm)) {
        orClauses.push({ amount: numTerm });
      }
      query.$or = orClauses;
    }

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 15));
    const skip = (parsedPage - 1) * parsedLimit;

    const [donations, total, uniqueDonors, totalSuccessfulSum, successfulCount] = await Promise.all([
      Donation.find(query).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit),
      Donation.countDocuments(query),
      Donation.distinct('email', { status: 'Successful' }),
      Donation.aggregate([
        { $match: { status: 'Successful' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Donation.countDocuments({ status: 'Successful' })
    ]);

    res.json({
      success: true,
      data: donations,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        pages: Math.ceil(total / parsedLimit) || 1
      },
      stats: {
        totalDonors: uniqueDonors.length,
        totalDonationsReceived: totalSuccessfulSum[0]?.total || 0,
        successfulDonations: successfulCount
      }
    });
  } catch (error) {
    console.error('[Admin Get Donations Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve donations.' });
  }
};

/**
 * Protected Admin: Get single donation by ID
 */
export const adminGetDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }
    res.json({ success: true, data: donation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
