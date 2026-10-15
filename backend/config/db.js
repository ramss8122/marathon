import mongoose from 'mongoose';

let isDbConnected = false;

export const isDbReady = () => mongoose.connection.readyState === 1;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/runora_marathon';

  mongoose.connection.on('connected', () => {
    isDbConnected = true;
    console.log('[MongoDB] Connection status: Connected');
  });

  mongoose.connection.on('disconnected', () => {
    isDbConnected = false;
    console.warn('[MongoDB] Connection status: Disconnected');
  });

  mongoose.connection.on('error', (err) => {
    isDbConnected = false;
    console.error(`[MongoDB] Connection error event: ${err.message}`);
  });

  try {
    console.log(`[MongoDB] Connecting to target: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    console.log(`[MongoDB] Successfully connected to ${uri}`);
  } catch (error) {
    console.error(`[MongoDB] Initial connection failed: ${error.message}`);
    console.warn('[MongoDB] Server will continue running with degraded persistence until MongoDB is available.');
  }
};
