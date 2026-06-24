const Gig = require('../models/Gig');
const Freelancer = require('../models/Freelancer');
const { recommendFreelancersForGig, recommendGigsForFreelancer } = require('../services/aiMatchingService');

// @desc    Create a new Gig / Project
// @route   POST /api/gigs
// @access  Private (Client only)
exports.createGig = async (req, res, next) => {
  try {
    const { title, description, skills, budgetType, minBudget, maxBudget, milestones, location, attachments } = req.body;

    const parsedCoordinates = location?.coordinates || [0, 0];

    const gig = await Gig.create({
      client: req.user.id,
      title,
      description,
      skills,
      budgetType,
      minBudget,
      maxBudget,
      milestones: milestones || [],
      attachments: attachments || [],
      location: {
        type: 'Point',
        coordinates: parsedCoordinates,
        address: location?.address || ''
      }
    });

    // Run AI Recommendation to get matching freelancers for response
    const matches = await recommendFreelancersForGig(gig._id);

    res.status(201).json({
      success: true,
      data: gig,
      recommendedFreelancers: matches
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all Gigs (Browse Gigs marketplace with advanced search)
// @route   GET /api/gigs
// @access  Public
exports.getGigs = async (req, res, next) => {
  try {
    const { skills, minBudget, maxBudget, budgetType, address, latitude, longitude, radius, search } = req.query;
    let query = { status: 'published' };

    // Text Search
    if (search) {
      query.$text = { $search: search };
    }

    // Skill Filter
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillsArray.map(s => new RegExp(s, 'i')) };
    }

    // Budget Filters
    if (budgetType) {
      query.budgetType = budgetType;
    }

    if (minBudget || maxBudget) {
      if (minBudget) query.minBudget = { $gte: Number(minBudget) };
      if (maxBudget) query.maxBudget = { $lte: Number(maxBudget) };
    }

    // Hyperlocal Location Filter (Radius in km)
    if (latitude && longitude && radius) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
        }
      };
    }

    const gigs = await Gig.find(query).populate('client', 'name avatar');
    res.status(200).json({ success: true, count: gigs.length, data: gigs });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Gig details by ID
// @route   GET /api/gigs/:id
// @access  Public
exports.getGigById = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate('client', 'name email avatar')
      .populate('freelancer', 'name email avatar');

    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    res.status(200).json({ success: true, data: gig });
  } catch (err) {
    next(err);
  }
};

// @desc    Update Gig
// @route   PUT /api/gigs/:id
// @access  Private (Client only)
exports.updateGig = async (req, res, next) => {
  try {
    let gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    // Make sure user is gig client
    if (gig.client.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this gig' });
    }

    gig = await Gig.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: gig });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete Gig
// @route   DELETE /api/gigs/:id
// @access  Private (Client only)
exports.deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    // Make sure user is gig client
    if (gig.client.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this gig' });
    }

    await gig.deleteOne();
    res.status(200).json({ success: true, message: 'Gig deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get AI Personalized Gigs Recommendations for Freelancer
// @route   GET /api/gigs/recommendations/freelancer
// @access  Private (Freelancer only)
exports.getPersonalizedGigs = async (req, res, next) => {
  try {
    const freelancer = await Freelancer.findOne({ user: req.user.id });
    if (!freelancer) {
      return res.status(404).json({ success: false, message: 'Freelancer profile not found' });
    }

    const matches = await recommendGigsForFreelancer(freelancer._id);
    res.status(200).json({ success: true, count: matches.length, data: matches });
  } catch (err) {
    next(err);
  }
};

// @desc    Get AI Matching Freelancers for Client Gig
// @route   GET /api/gigs/:id/recommendations/freelancers
// @access  Private (Client only)
exports.getMatchingFreelancers = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    if (gig.client.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to view matching freelancers for this gig' });
    }

    const matches = await recommendFreelancersForGig(gig._id);
    res.status(200).json({ success: true, count: matches.length, data: matches });
  } catch (err) {
    next(err);
  }
};
