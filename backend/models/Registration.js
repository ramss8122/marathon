import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  registrationRef: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true
  },
  dob: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    default: 'Male'
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    default: 'Tamil Nadu',
    trim: true
  },
  raceCategory: {
    type: String,
    required: true
  },
  selectedCategories: {
    type: [String],
    default: []
  },
  selectedEvent: {
    type: String,
    required: true
  },
  eventName: {
    type: String,
    default: 'South India Marathon Series'
  },
  distance: {
    type: String,
    default: '5K'
  },
  amount: {
    type: Number,
    required: true,
    default: 699
  },
  emergencyContact: {
    type: String,
    required: true,
    trim: true
  },
  emergencyPhone: {
    type: String,
    required: true,
    trim: true
  },
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
  paymentMethod: {
    type: String,
    default: 'Online'
  },
  paymentRef: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

const Registration = mongoose.models.Registration || mongoose.model('Registration', registrationSchema);

export default Registration;
