const mongoose = require('mongoose');

const ProposedMilestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  deadline: Date
});

const ProposalSchema = new mongoose.Schema({
  gig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverLetter: {
    type: String,
    required: [true, 'Please provide a cover letter'],
    maxlength: [3000, 'Cover letter cannot exceed 3000 characters']
  },
  bidAmount: {
    type: Number,
    required: [true, 'Please specify your bid amount'],
    min: 0
  },
  duration: {
    type: Number, // duration in days
    required: [true, 'Please specify the estimated duration in days']
  },
  milestones: [ProposedMilestoneSchema],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'negotiating', 'completed'],
    default: 'pending'
  },
  negotiationComments: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Ensure a freelancer can bid only once on a gig
ProposalSchema.index({ gig: 1, freelancer: 1 }, { unique: true });

module.exports = mongoose.model('Proposal', ProposalSchema);
