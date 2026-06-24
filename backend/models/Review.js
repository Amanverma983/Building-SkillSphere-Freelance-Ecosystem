const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  gig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please add review comments'],
    maxlength: [1000, 'Review comment cannot exceed 1000 characters']
  },
  role: {
    type: String,
    enum: ['client', 'freelancer'],
    required: true
  },
  verifiedContract: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate rating aggregates and reputation score for freelancer when reviews are updated/created
ReviewSchema.statics.getAverageRating = async function(userId, role) {
  const obj = await this.aggregate([
    { $match: { reviewee: userId } },
    {
      $group: {
        _id: '$reviewee',
        averageRating: { $avg: '$rating' },
        ratingCount: { $sum: 1 }
      }
    }
  ]);

  try {
    if (obj.length > 0) {
      if (role === 'freelancer') {
        const Freelancer = mongoose.model('Freelancer');
        const freelancer = await Freelancer.findOne({ user: userId });
        
        // Custom reputation score calculation: weighted average of rating, completionRate, etc.
        const avg = obj[0].averageRating;
        const count = obj[0].ratingCount;
        const compRate = freelancer ? freelancer.completionRate : 100;
        
        // Reputation score out of 100 = (avg * 15) + (compRate * 0.25)
        const reputation = Math.round((avg * 15) + (compRate * 0.25));

        await Freelancer.findOneAndUpdate({ user: userId }, {
          ratingAverage: Math.round(avg * 10) / 10,
          ratingCount: count,
          reputationScore: Math.min(reputation, 100)
        });
      } else {
        await mongoose.model('Client').findOneAndUpdate({ user: userId }, {
          ratingAverage: Math.round(obj[0].averageRating * 10) / 10,
          ratingCount: obj[0].ratingCount
        });
      }
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.reviewee, this.role);
});

module.exports = mongoose.model('Review', ReviewSchema);
