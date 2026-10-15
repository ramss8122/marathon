import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB, isDbReady } from './config/db.js';

// Route imports
import registrationRoutes from './routes/registrationRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import transparencyRoutes from './routes/transparencyRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ── CONNECT TO MONGODB ──
connectDB();

// ── MIDDLEWARE ──
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// ── API ROUTES ──
app.use('/api/registrations', registrationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transparency', transparencyRoutes);

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
  console.log(`[Express] Target MongoDB: ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/runora_marathon'}`);
  console.log(`[Express] Frontend origin allowed: ${CLIENT_URL}`);
});

export default app;
