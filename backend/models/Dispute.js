const mongoose = require('mongoose');

const DisputeSchema = new mongoose.Schema({
  gig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true
  },
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  against: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: [true, 'Please provide the reason for dispute'],
    maxlength: [2000, 'Reason cannot exceed 2000 characters']
  },
  evidence: [String], // Array of uploaded document/image URLs on Cloudinary
  status: {
    type: String,
    enum: ['open', 'reviewing', 'resolved', 'rejected'],
    default: 'open'
  },
  adminDecision: {
    type: String,
    default: ''
  },
  resolvedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Dispute', DisputeSchema);
