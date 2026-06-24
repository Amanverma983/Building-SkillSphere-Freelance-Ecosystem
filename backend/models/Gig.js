const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  amount: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['pending', 'escrow', 'released', 'refunded'],
    default: 'pending'
  },
  deadline: Date
});

const GigSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Please provide a gig title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a gig description'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  skills: {
    type: [String],
    required: [true, 'Please provide at least one required skill']
  },
  budgetType: {
    type: String,
    enum: ['fixed', 'hourly'],
    default: 'fixed'
  },
  minBudget: {
    type: Number,
    required: true,
    min: 0
  },
  maxBudget: {
    type: Number,
    required: true,
    min: 0
  },
  milestones: [MilestoneSchema],
  attachments: [String],
  status: {
    type: String,
    enum: ['draft', 'published', 'in-progress', 'completed', 'cancelled'],
    default: 'published'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: String
  },
  proposalsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

GigSchema.index({ location: '2dsphere' });
GigSchema.index({ title: 'text', description: 'text', skills: 'text' });

module.exports = mongoose.model('Gig', GigSchema);
