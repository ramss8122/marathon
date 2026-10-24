import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Registration from '../models/Registration.js';
import ContactMessage from '../models/ContactMessage.js';
import Donation from '../models/Donation.js';
import { isDbReady } from '../config/db.js';

/**
 * Validates that all required administrative environment variables are defined.
 * If any are missing, the server refuses to start with an explicit error.
 */
export const assertAdminConfig = () => {
  const missing = [];
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
  if (!process.env.ADMIN_USERNAME) missing.push('ADMIN_USERNAME');
  if (!process.env.ADMIN_PASSWORD_HASH) missing.push('ADMIN_PASSWORD_HASH');

  if (missing.length > 0) {
    const errorMsg = `[FATAL CONFIG ERROR] Missing required environment variable(s): ${missing.join(', ')}. Server refusing to start.`;
    console.error(errorMsg);
    process.exit(1);
  }
};

/**
 * Authenticates administrator credentials.
 * Compares password using bcrypt against ADMIN_PASSWORD_HASH.
 * Signs and returns a real JWT token with 8h expiration.
 * Uses generic error messages for wrong username or password.
 */
export const adminLogin = async (req, res) => {
  const { username, password } = req.body || {};

  const GENERIC_ERROR_MESSAGE = 'Invalid administrative username or password.';

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required.'
    });
  }

  const configuredUsername = process.env.ADMIN_USERNAME;
  const configuredPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  const jwtSecret = process.env.JWT_SECRET;

  if (!configuredUsername || !configuredPasswordHash || !jwtSecret) {
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: administrative authentication is not properly configured.'
    });
  }

  // Use the same generic error message for wrong username and wrong password
  if (username !== configuredUsername) {
    return res.status(401).json({
      success: false,
      message: GENERIC_ERROR_MESSAGE
    });
  }

  try {
    const isPasswordValid = await bcrypt.compare(password, configuredPasswordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: GENERIC_ERROR_MESSAGE
      });
    }

    const payload = {
      username: configuredUsername,
      role: 'Administrator'
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn: '8h' });

    return res.json({
      success: true,
      message: 'Admin authentication successful.',
      token,
      user: {
        username: configuredUsername,
        role: 'Administrator',
        loginTime: new Date().toISOString()
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'An error occurred during authentication.'
    });
  }
};

/**
 * Returns current authenticated admin profile ({ username, role }).
 */
export const getAdminMe = async (req, res) => {
  return res.json({
    success: true,
    username: req.admin?.username || process.env.ADMIN_USERNAME,
    role: req.admin?.role || 'Administrator'
  });
};

/**
 * Fetches administrative dashboard metrics (protected route).
 */
export const getAdminStats = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected. Please ensure MongoDB is running.'
      });
    }

    const [
      totalRegistrations,
      confirmedRegistrations,
      pendingRegistrations,
      successfulPayments,
      pendingPayments,
      totalContactMessages,
      unreadContactMessages,
      totalDonations,
      successfulDonations,
      totalDonationSum
    ] = await Promise.all([
      Registration.countDocuments(),
      Registration.countDocuments({ registrationStatus: 'Confirmed' }),
      Registration.countDocuments({ registrationStatus: 'Pending' }),
      Registration.countDocuments({ paymentStatus: 'Paid' }),
      Registration.countDocuments({ paymentStatus: 'Pending' }),
      ContactMessage.countDocuments(),
      ContactMessage.countDocuments({ isRead: false }),
      Donation.countDocuments(),
      Donation.countDocuments({ status: 'Successful' }),
      Donation.aggregate([
        { $match: { status: 'Successful' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const totalDonationsReceived = totalDonationSum && totalDonationSum.length > 0 ? totalDonationSum[0].total : 0;

    res.json({
      success: true,
      stats: {
        totalRegistrations,
        confirmedRegistrations,
        pendingRegistrations,
        successfulPayments,
        pendingPayments,
        totalContactMessages,
        unreadContactMessages,
        totalDonations,
        successfulDonations,
        totalDonationsReceived
      },
      isDbConnected: true
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
