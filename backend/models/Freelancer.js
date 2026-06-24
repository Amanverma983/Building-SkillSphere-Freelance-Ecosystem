const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  proficiency: { type: String, enum: ['Beginner', 'Intermediate', 'Expert'], default: 'Intermediate' }
});

const PortfolioItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  imageUrl: String,
  projectUrl: String
});

const CertificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuingOrg: { type: String, required: true },
  date: Date,
  verificationUrl: String
});

const ExperienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  from: { type: Date, required: true },
  to: Date,
  current: { type: Boolean, default: false },
  description: String
});

const AvailabilitySlotSchema = new mongoose.Schema({
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 }, // 0 = Sunday, 6 = Saturday
  startTime: { type: String, required: true }, // e.g. "09:00"
  endTime: { type: String, required: true } // e.g. "17:00"
});

const FreelancerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    default: ''
  },
  skills: [SkillSchema],
  portfolio: [PortfolioItemSchema],
  resume: String,
  certifications: [CertificationSchema],
  experience: [ExperienceSchema],
  availability: {
    slots: [AvailabilitySlotSchema],
    bookedDates: [Date] // Dates that are blocked
  },
  hourlyRate: {
    type: Number,
    required: [true, 'Please specify an hourly rate'],
    min: 0
  },
  milestonePricing: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profileCompletion: {
    type: Number,
    default: 0
  },
  publicSlug: {
    type: String,
    unique: true,
    sparse: true
  },
  reputationScore: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  ratingAverage: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: String
  }
}, {
  timestamps: true
});

// Index location for Geospatial Queries
FreelancerSchema.index({ location: '2dsphere' });
FreelancerSchema.index({ 'skills.name': 'text', bio: 'text' });

module.exports = mongoose.model('Freelancer', FreelancerSchema);
