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
  whatsappNumber: {
    type: String,
    default: '',
    trim: true
  },
  organisation: {
    type: String,
    default: '',
    trim: true
  },
  designation: {
    type: String,
    default: '',
    trim: true
  },
  tshirtSize: {
    type: String,
    default: '',
    trim: true
  },
  bloodGroup: {
    type: String,
    default: '',
    trim: true
  },
  address: {
    type: String,
    default: '',
    trim: true
  },
  pincode: {
    type: String,
    default: '',
    trim: true
  },
  country: {
    type: String,
    default: 'India',
    trim: true
  },
  facebookLink: {
    type: String,
    default: '',
    trim: true
  },
  instagramLink: {
    type: String,
    default: '',
    trim: true
  },
  hearAbout: {
    type: String,
    default: '',
    trim: true
  },
  runningGroup: {
    type: String,
    default: '',
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
  groupId: {
    type: String,
    default: '',
    index: true
  },
  orderId: {
    type: String,
    default: '',
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  // ── Ticket / Bib fields (added for race ticket generation) ──
  bibNumber: {
    type: String,
    default: ''
  },
  eventDate: {
    type: String,
    default: ''
  },
  eventVenue: {
    type: String,
    default: ''
  },
  flagOffTime: {
    type: String,
    default: ''
  },
  gatesOpenTime: {
    type: String,
    default: ''
  }
});

const Registration = mongoose.models.Registration || mongoose.model('Registration', registrationSchema);

export default Registration;
