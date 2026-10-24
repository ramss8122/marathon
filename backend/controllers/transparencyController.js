import Registration from '../models/Registration.js';
import Donation from '../models/Donation.js';
import { isDbReady } from '../config/db.js';

export const getTransparencyStats = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        success: false,
        message: 'Database is currently unavailable. Live counts cannot be fetched.'
      });
    }

    const [
      totalRegistrations,
      pendingRegistrations,
      confirmedRegistrations,
      completedPayments,
      uniqueDonors,
      totalDonationSum,
      successfulDonations
    ] = await Promise.all([
      Registration.countDocuments(),
      Registration.countDocuments({ registrationStatus: 'Pending' }),
      Registration.countDocuments({ registrationStatus: 'Confirmed' }),
      Registration.countDocuments({ paymentStatus: 'Paid' }),
      Donation.distinct('email', { status: 'Successful' }),
      Donation.aggregate([
        { $match: { status: 'Successful' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Donation.countDocuments({ status: 'Successful' })
    ]);

    const totalDonors = uniqueDonors ? uniqueDonors.length : 0;
    const totalDonationsReceived = totalDonationSum && totalDonationSum.length > 0 ? totalDonationSum[0].total : 0;

    res.json({
      success: true,
      data: {
        totalRegistrations,
        pendingRegistrations,
        confirmedRegistrations,
        completedPayments,
        totalDonors,
        totalDonationsReceived,
        successfulDonations: successfulDonations || 0
      },
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching transparency stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
