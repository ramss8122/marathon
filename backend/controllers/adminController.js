import Registration from '../models/Registration.js';
import ContactMessage from '../models/ContactMessage.js';
import { isDbReady } from '../config/db.js';

export const adminLogin = async (req, res) => {
  const { username, password } = req.body;

  const validUser = process.env.ADMIN_USERNAME || 'admin';
  const validPass = process.env.ADMIN_PASSWORD || 'runtrust@26';

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required.'
    });
  }

  if (username === validUser && password === validPass) {
    const token = 'token-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    return res.json({
      success: true,
      message: 'Admin authentication successful.',
      token,
      user: {
        username: validUser,
        role: 'Administrator',
        loginTime: new Date().toISOString()
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid administrative username or password.'
  });
};

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
      unreadContactMessages
    ] = await Promise.all([
      Registration.countDocuments(),
      Registration.countDocuments({ registrationStatus: 'Confirmed' }),
      Registration.countDocuments({ registrationStatus: 'Pending' }),
      Registration.countDocuments({ paymentStatus: 'Paid' }),
      Registration.countDocuments({ paymentStatus: 'Pending' }),
      ContactMessage.countDocuments(),
      ContactMessage.countDocuments({ isRead: false })
    ]);

    res.json({
      success: true,
      stats: {
        totalRegistrations,
        confirmedRegistrations,
        pendingRegistrations,
        successfulPayments,
        pendingPayments,
        totalContactMessages,
        unreadContactMessages
      },
      isDbConnected: true
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
