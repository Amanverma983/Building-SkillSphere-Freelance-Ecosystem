const Review = require('../models/Review');
const Gig = require('../models/Gig');

// @desc    Submit a Review for a completed Gig
// @route   POST /api/reviews
// @access  Private
exports.submitReview = async (req, res, next) => {
  try {
    const { gigId, rating, comment } = req.body;

    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });

    if (gig.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed gigs' });
    }

    let reviewee;
    let role;

    if (req.user.role === 'client') {
      if (gig.client.toString() !== req.user.id) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }
      reviewee = gig.freelancer;
      role = 'client';
    } else if (req.user.role === 'freelancer') {
      if (gig.freelancer.toString() !== req.user.id) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }
      reviewee = gig.client;
      role = 'freelancer';
    }

    // Prevent duplicate reviews
    const existing = await Review.findOne({ gig: gigId, reviewer: req.user.id });
    if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this gig' });

    const review = await Review.create({
      gig: gigId,
      reviewer: req.user.id,
      reviewee,
      rating,
      comment,
      role
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all reviews for a specific user
// @route   GET /api/reviews/user/:userId
// @access  Public
exports.getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar role')
      .populate('gig', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    next(err);
  }
};
