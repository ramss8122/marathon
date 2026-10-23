import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  to: {
    type: [String],
    required: true
  },
  from: {
    type: String,
    default: 'India RunTrust <noreply@runtrust.org>'
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'pending', 'draft'],
    default: 'sent'
  },
  type: {
    type: String,
    enum: ['direct', 'campaign', 'reply'],
    default: 'direct'
  },
  campaignName: {
    type: String,
    default: ''
  },
  registrationId: {
    type: String,
    default: ''
  },
  messageId: {
    type: String,
    default: ''
  },
  sentAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

const Email = mongoose.models.Email || mongoose.model('Email', emailSchema);

export default Email;
