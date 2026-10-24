import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';

// Route imports
import registrationRoutes from './routes/registrationRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import transparencyRoutes from './routes/transparencyRoutes.js';
import cityRoutes from './routes/cityRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import { seedDefaultCities } from './controllers/cityController.js';
import { assertAdminConfig } from './controllers/adminController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

assertAdminConfig();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const isProduction = process.env.NODE_ENV === 'production';

// Trust first reverse proxy (e.g. Nginx, Heroku, Cloudflare)
app.set('trust proxy', 1);

// ── SECURITY HEADERS ──
app.use(helmet());

// ── CORS CONFIGURATION ──
// Restrict CORS to CLIENT_URL (plus localhost only when NODE_ENV is not production)
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, postman, server-to-server) without Origin header
    if (!origin) return callback(null, true);

    if (CLIENT_URL && origin === CLIENT_URL) {
      return callback(null, true);
    }

    if (!isProduction) {
      const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (isLocalhost) {
        return callback(null, true);
      }
    }

    return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ── BODY PARSERS (LIMITED TO 200KB) ──
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ limit: '200kb', extended: true }));

// ── RATE LIMITERS ──
// 1. Strict rate limiter on admin login: 5 attempts per 15 minutes per IP
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  }
});

// 2. Moderate rate limiter on registrations: 30 attempts per 15 minutes per IP
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many registration requests from this IP. Please try again later.'
  }
});

// 3. Moderate rate limiter on contact messages: 10 attempts per 15 minutes per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many contact messages sent from this IP. Please try again later.'
  }
});

// Request logging in development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// ── CONNECT TO MONGODB ──
connectDB();
mongoose.connection.once('open', () => {
  seedDefaultCities();
});

// ── HEALTH CHECK ENDPOINT ──
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

// ── API ROUTES WITH SECURITY RATE LIMITS ──
app.post('/api/admin/login', adminLoginLimiter);
app.use('/api/admin', adminRoutes);

app.post('/api/registrations', registrationLimiter);
app.use('/api/registrations', registrationRoutes);

app.post('/api/contact', contactLimiter);
app.use('/api/contact', contactRoutes);

app.use('/api/transparency', transparencyRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/donations', donationRoutes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'RUNTRUST Marathon Backend API',
    status: 'online',
    docs: {
      health: '/api/health',
      registrations: '/api/registrations',
      transparency: '/api/transparency/stats',
      contact: '/api/contact',
      admin: '/api/admin'
    }
  });
});

// ── 404 CATCH-ALL FOR UNMATCHED ROUTES ──
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.method} ${req.originalUrl}' not found.`
  });
});

// ── GLOBAL ERROR HANDLER ──
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.'
  });
});

// ── START HTTP SERVER ──
app.listen(PORT, () => {
  console.log(`[Express] RUNTRUST Marathon backend running on http://localhost:${PORT}`);
  console.log(`[Express] Security: Helmet, Body limits (200kb), Rate limiters & strict CORS active`);
  console.log(`[Express] Frontend origin allowed: ${CLIENT_URL} (plus localhost when in development)`);
});

export default app;
