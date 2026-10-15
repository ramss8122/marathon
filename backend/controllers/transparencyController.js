import Registration from '../models/Registration.js';
import { isDbReady } from '../config/db.js';

export const getTransparencyStats = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        success: false,
        message: 'Database is currently unavailable. Live registration counts cannot be fetched.'
      });
    }

    const [
      totalRegistrations,
      pendingRegistrations,
      confirmedRegistrations,
      completedPayments
    ] = await Promise.all([
      Registration.countDocuments(),
      Registration.countDocuments({ registrationStatus: 'Pending' }),
      Registration.countDocuments({ registrationStatus: 'Confirmed' }),
      Registration.countDocuments({ paymentStatus: 'Paid' })
    ]);

    res.json({
      success: true,
      data: {
        totalRegistrations,
        pendingRegistrations,
        confirmedRegistrations,
        completedPayments
      },
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching transparency stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
