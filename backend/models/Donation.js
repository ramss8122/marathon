import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    donationId: {
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
    amount: {
      type: Number,
      required: true,
      min: [1, 'Donation amount must be at least ₹1']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    message: {
      type: String,
      default: '',
      trim: true
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['Pending', 'Successful', 'Failed'],
      default: 'Pending',
      index: true
    },
    paymentGateway: {
      type: String,
      default: 'Razorpay'
    },
    razorpayOrderId: {
      type: String,
      default: '',
      index: true
    },
    razorpayPaymentId: {
      type: String,
      default: '',
      index: true
    },
    razorpaySignature: {
      type: String,
      default: ''
    },
    paidAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes for rapid transparency statistics and admin filtering
donationSchema.index({ status: 1, createdAt: -1 });
donationSchema.index({ status: 1, email: 1 });

const Donation = mongoose.model('Donation', donationSchema);

export default Donation;
