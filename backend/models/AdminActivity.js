import mongoose from 'mongoose';

const adminActivitySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    default: 'gear' // 'gear' | 'mail' | 'bell' | 'shield' | 'calendar'
  },
  adminUser: {
    type: String,
    default: 'admin'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

const AdminActivity = mongoose.models.AdminActivity || mongoose.model('AdminActivity', adminActivitySchema);

export default AdminActivity;
