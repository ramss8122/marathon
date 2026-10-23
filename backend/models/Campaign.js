import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    trim: true
  },
  statusFilter: {
    type: String,
    enum: ['Confirmed', 'Pending', 'All'],
    default: 'All'
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
  template: {
    type: String,
    default: ''
  },
  sentCount: {
    type: Number,
    default: 0
  },
  failedCount: {
    type: Number,
    default: 0
  },
  totalRecipients: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['sending', 'completed', 'failed'],
    default: 'sending'
  },
  recipients: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  completedAt: {
    type: Date,
    default: null
  }
});

const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', campaignSchema);

export default Campaign;
