import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    default: 'admin_settings',
    unique: true
  },
  websiteName: {
    type: String,
    default: 'RUNTRUST',
    trim: true
  },
  adminDisplayName: {
    type: String,
    default: 'admin',
    trim: true
  },
  supportEmail: {
    type: String,
    default: 'support@runtrust.com',
    trim: true
  },
  timeZone: {
    type: String,
    default: 'Asia/Kolkata',
    trim: true
  },
  notifications: {
    newRegistration: { type: Boolean, default: true },
    paymentReceived: { type: Boolean, default: true },
    contactMessage: { type: Boolean, default: true },
    campaignStatus: { type: Boolean, default: true }
  },
  eventPreferences: {
    defaultEventCity: { type: String, default: 'Chennai' },
    defaultRaceCategory: { type: String, default: '3K Run' },
    maxSlotsPerRegistration: { type: Number, default: 5 }
  },
  security: {
    sessionTimeout: { type: String, default: '8 hours' }
  },
  email: {
    smtpHost: { type: String, default: '' },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: '' },
    mailFromName: { type: String, default: 'India RunTrust' },
    mailFromAddress: { type: String, default: 'noreply@runtrust.org' }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Setting = mongoose.models.Setting || mongoose.model('Setting', settingSchema);

export default Setting;
