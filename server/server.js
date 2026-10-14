import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env if available, fallback to root .env
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/runora_marathon';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Admin credentials from environment
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'runtrust@26';

// ── CORS & BODY PARSER MIDDLEWARE ──
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-to-server) or same-origin
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// ── DATABASE CONNECTION ──
let isDbConnected = false;

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000
})
  .then(() => {
    isDbConnected = true;
    console.log(`[MongoDB] Connected successfully to ${MONGODB_URI.replace(/\/\/.*@/, '//***@')}`);
  })
  .catch((err) => {
    isDbConnected = false;
    console.error(`[MongoDB] Initial connection error: ${err.message}`);
  });

mongoose.connection.on('connected', () => {
  isDbConnected = true;
  console.log('[MongoDB] Connection state: Connected');
});

mongoose.connection.on('disconnected', () => {
  isDbConnected = false;
  console.warn('[MongoDB] Connection state: Disconnected');
});

mongoose.connection.on('error', (err) => {
  isDbConnected = false;
  console.error(`[MongoDB] Connection error event: ${err.message}`);
});

const isDbReady = () => mongoose.connection.readyState === 1;

// ── MONGOOSE SCHEMAS & MODELS ──
const registrationSchema = new mongoose.Schema({
  registrationRef: { type: String, required: true, unique: true },
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  mobileNumber: { type: String, required: true, trim: true },
  dob: { type: String, required: true },
  gender: { type: String, default: 'Male' },
  city: { type: String, required: true, trim: true },
  state: { type: String, default: 'Tamil Nadu', trim: true },
  raceCategory: { type: String, required: true },
  selectedEvent: { type: String, required: true },
  eventName: { type: String, default: 'South India Marathon Series' },
  distance: { type: String, default: '5K' },
  amount: { type: Number, default: 699 },
  emergencyContact: { type: String, required: true, trim: true },
  emergencyPhone: { type: String, required: true, trim: true },
  registrationStatus: {
    type: String,
    enum: ['Confirmed', 'Pending', 'Cancelled'],
    default: 'Confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Failed'],
    default: 'Pending'
  },
  paymentMethod: { type: String, default: 'Online' },
  paymentRef: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Registration = mongoose.model('Registration', registrationSchema);

const contactMessageSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  subject: { type: String, default: 'General Inquiry', trim: true },
  message: { type: String, required: true, trim: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

// Helper to determine distance label & amount
const getPackageDetails = (category) => {
  const map = {
    '1k': { distance: '1K', amount: 499, name: '1K Fun Run' },
    '3k': { distance: '3K', amount: 599, name: '3K Health Stride' },
    '5k': { distance: '5K', amount: 699, name: '5K Fitness Run' },
    '10k': { distance: '10K', amount: 799, name: '10K Endurance Challenge' },
    '21k': { distance: '21K', amount: 899, name: '21K Half Marathon' }
  };
  return map[category?.toLowerCase()] || { distance: '5K', amount: 699, name: '5K Classic Run' };
};

const getEventName = (eventId) => {
  const map = {
    'chennai-coastal-run': 'Chennai Coastal Sunrise Run',
    'coimbatore-hills-run': 'Coimbatore Green Foothills Marathon',
    'bengaluru-tech-stride': 'Bengaluru Heritage & Lakes Stride',
    'kochi-backwater-marathon': 'Kochi Marine Drive Backwater Run'
  };
  return map[eventId] || 'South India Marathon Series';
};

// ── HEALTH-CHECK ENDPOINT ──
app.get('/api/health', (req, res) => {
  const readyState = mongoose.connection.readyState;
  const isConnected = readyState === 1;
  const stateLabels = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  res.status(isConnected ? 200 : 503).json({
    status: isConnected ? 'ok' : 'degraded',
    backend: 'running',
    database: {
      connected: isConnected,
      status: stateLabels[readyState] || 'unknown',
      host: mongoose.connection.host || '127.0.0.1',
      port: mongoose.connection.port || 27017,
      name: mongoose.connection.name || 'runora_marathon'
    },
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// ── ADMIN AUTHENTICATION ──
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required.'
    });
  }

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = 'runtrust-admin-' + Buffer.from(`${username}:${Date.now()}`).toString('base64');
    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        username: ADMIN_USERNAME,
        role: 'Administrator',
        displayName: 'RUNORA Head Coordinator'
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid username or password. Please verify your credentials.'
  });
});

// ── ADMIN DASHBOARD STATS ──
app.get('/api/admin/stats', async (req, res) => {
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
});

// ── ADMIN REGISTRATIONS LIST ──
app.get('/api/admin/registrations', async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected. Please ensure MongoDB is running.'
      });
    }

    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── ADMIN UPDATE REGISTRATION ──
app.patch('/api/admin/registrations/:id', async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected.'
      });
    }

    const { id } = req.params;
    const { registrationStatus, paymentStatus } = req.body;

    const updates = {};
    if (registrationStatus) updates.registrationStatus = registrationStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus;

    const updated = await Registration.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating registration:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── ADMIN DELETE REGISTRATION ──
app.delete('/api/admin/registrations/:id', async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected.'
      });
    }

    const { id } = req.params;
    await Registration.findByIdAndDelete(id);
    res.json({ success: true, message: 'Registration deleted successfully.' });
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── ADMIN MESSAGES LIST ──
app.get('/api/admin/messages', async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected.'
      });
    }

    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── ADMIN UPDATE MESSAGE READ STATUS ──
app.patch('/api/admin/messages/:id/read', async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected.'
      });
    }

    const { id } = req.params;
    const { isRead } = req.body;

    const updated = await ContactMessage.findByIdAndUpdate(
      id,
      { isRead: isRead !== undefined ? isRead : true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── ADMIN DELETE MESSAGE ──
app.delete('/api/admin/messages/:id', async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected.'
      });
    }

    const { id } = req.params;
    await ContactMessage.findByIdAndDelete(id);
    res.json({ success: true, message: 'Message deleted successfully.' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── PUBLIC REGISTRATION SUBMIT ──
app.post('/api/registrations', async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        success: false,
        message: 'Database connection is not available. Please ensure MongoDB is running.'
      });
    }

    const {
      fullName,
      email,
      mobileNumber,
      dob,
      gender,
      city,
      state,
      raceCategory,
      selectedEvent,
      emergencyContact,
      emergencyPhone,
      paymentMethod = 'Online'
    } = req.body;

    if (!fullName || !email || !mobileNumber || !raceCategory || !selectedEvent) {
      return res.status(400).json({
        success: false,
        message: 'Missing required registration details. Please fill in all required fields.'
      });
    }

    const pkg = getPackageDetails(raceCategory);
    const eventName = getEventName(selectedEvent);
    const registrationRef = 'RUN-' + Math.floor(100000 + Math.random() * 900000);

    const newRegistration = new Registration({
      registrationRef,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      mobileNumber: mobileNumber.trim(),
      dob: dob || '1995-01-01',
      gender: gender || 'Male',
      city: city ? city.trim() : 'Chennai',
      state: state ? state.trim() : 'Tamil Nadu',
      raceCategory: raceCategory.toLowerCase(),
      selectedEvent,
      eventName,
      distance: pkg.distance,
      amount: pkg.amount,
      emergencyContact: emergencyContact ? emergencyContact.trim() : 'Self',
      emergencyPhone: emergencyPhone ? emergencyPhone.trim() : mobileNumber.trim(),
      registrationStatus: 'Confirmed',
      paymentStatus: 'Pending',
      paymentMethod,
      createdAt: new Date()
    });

    const saved = await newRegistration.save();

    res.status(201).json({
      success: true,
      message: 'Registration created and saved to MongoDB successfully.',
      data: saved
    });
  } catch (error) {
    console.error('Registration save error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── PUBLIC CONTACT FORM SUBMIT ──
app.post('/api/contact', async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        success: false,
        message: 'Database connection is not available. Please ensure MongoDB is running.'
      });
    }

    const { fullName, email, subject, message } = req.body;

    if (!fullName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required.'
      });
    }

    const newContact = new ContactMessage({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      subject: subject ? subject.trim() : 'General Inquiry',
      message: message.trim(),
      isRead: false,
      createdAt: new Date()
    });

    const saved = await newContact.save();

    res.status(201).json({
      success: true,
      message: 'Your message has been sent and recorded successfully.',
      data: saved
    });
  } catch (error) {
    console.error('Contact message error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── START SERVER ──
app.listen(PORT, () => {
  console.log(`[Express] RUNORA backend running on http://localhost:${PORT}`);
  console.log(`[Express] MongoDB target: ${MONGODB_URI.replace(/\/\/.*@/, '//***@')}`);
  console.log(`[Express] Allowed frontend origin: ${CLIENT_URL}`);
});
