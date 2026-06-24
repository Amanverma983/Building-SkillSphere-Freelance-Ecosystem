const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true
  },
  milestoneId: {
    type: String, // Reference to the milestone index or ID in the Gig milestones array
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please specify the payment amount'],
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'escrow', 'released', 'refunded'],
    default: 'pending'
  },
  releasedAt: Date,
  refundedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', PaymentSchema);
