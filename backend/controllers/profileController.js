const Freelancer = require('../models/Freelancer');
const Client = require('../models/Client');
const User = require('../models/User');
const { uploadFile } = require('../utils/cloudinary');

// @desc    Get current user profile details based on role
// @route   GET /api/profile/me
// @access  Private
exports.getMyProfile = async (req, res, next) => {
  try {
    let profile;
    if (req.user.role === 'freelancer') {
      profile = await Freelancer.findOne({ user: req.user.id }).populate('user');
    } else if (req.user.role === 'client') {
      profile = await Client.findOne({ user: req.user.id }).populate('user');
    }

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Get public freelancer profile
// @route   GET /api/profile/freelancer/:id
// @access  Public
exports.getFreelancerProfile = async (req, res, next) => {
  try {
    const profile = await Freelancer.findOne({
      $or: [
        { user: req.params.id },
        { publicSlug: req.params.id }
      ]
    }).populate('user');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Freelancer profile not found' });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all freelancers (Browse Freelancers with filters)
// @route   GET /api/profile/freelancers
// @access  Public
exports.getFreelancers = async (req, res, next) => {
  try {
    const { skills, minRate, maxRate, address, latitude, longitude, radius } = req.query;
    let query = {};

    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query['skills.name'] = { $in: skillsArray.map(s => new RegExp(s, 'i')) };
    }

    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = Number(minRate);
      if (maxRate) query.hourlyRate.$lte = Number(maxRate);
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

    const freelancers = await Freelancer.find(query).populate('user');
    res.status(200).json({ success: true, count: freelancers.length, data: freelancers });
  } catch (err) {
    next(err);
  }
};

// @desc    Update Freelancer profile
// @route   PUT /api/profile/freelancer
// @access  Private (Freelancer only)
exports.updateFreelancer = async (req, res, next) => {
  try {
    const {
      bio,
      skills,
      portfolio,
      experience,
      certifications,
      availabilitySlots,
      hourlyRate,
      milestonePricing,
      publicSlug,
      address,
      coordinates
    } = req.body;

    let freelancer = await Freelancer.findOne({ user: req.user.id });
    if (!freelancer) {
      return res.status(404).json({ success: false, message: 'Freelancer profile not found' });
    }

    // Update fields
    if (bio !== undefined) freelancer.bio = bio;
    if (skills !== undefined) freelancer.skills = skills;
    if (portfolio !== undefined) freelancer.portfolio = portfolio;
    if (experience !== undefined) freelancer.experience = experience;
    if (certifications !== undefined) freelancer.certifications = certifications;
    if (availabilitySlots !== undefined) freelancer.availability.slots = availabilitySlots;
    if (hourlyRate !== undefined) freelancer.hourlyRate = hourlyRate;
    if (milestonePricing !== undefined) freelancer.milestonePricing = milestonePricing;
    if (publicSlug !== undefined) freelancer.publicSlug = publicSlug;

    if (address !== undefined) freelancer.location.address = address;
    if (coordinates !== undefined) freelancer.location.coordinates = coordinates;

    // Calculate profile completion percentage
    let completedFields = 0;
    const totalFields = 7;
    if (freelancer.bio) completedFields++;
    if (freelancer.skills.length > 0) completedFields++;
    if (freelancer.portfolio.length > 0) completedFields++;
    if (freelancer.experience.length > 0) completedFields++;
    if (freelancer.certifications.length > 0) completedFields++;
    if (freelancer.resume) completedFields++;
    if (freelancer.location.address) completedFields++;
    freelancer.profileCompletion = Math.round((completedFields / totalFields) * 100);

    await freelancer.save();
    res.status(200).json({ success: true, data: freelancer });
  } catch (err) {
    next(err);
  }
};

// @desc    Update Client profile
// @route   PUT /api/profile/client
// @access  Private (Client only)
exports.updateClient = async (req, res, next) => {
  try {
    const { companyName, website, bio, address, coordinates } = req.body;

    let client = await Client.findOne({ user: req.user.id });
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client profile not found' });
    }

    if (companyName !== undefined) client.companyName = companyName;
    if (website !== undefined) client.website = website;
    if (bio !== undefined) client.bio = bio;
    if (address !== undefined) client.location.address = address;
    if (coordinates !== undefined) client.location.coordinates = coordinates;

    await client.save();
    res.status(200).json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload Profile File (Avatar, Resume, Portfolio Item Image)
// @route   POST /api/profile/upload
// @access  Private
exports.uploadProfileFile = async (req, res, next) => {
  try {
    const { file, type } = req.body; // Expects base64 encoded file data & upload type

    if (!file) {
      return res.status(400).json({ success: false, message: 'Please provide base64 file content' });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(file.replace(/^data:image\/\w+;base64,/, '').replace(/^data:application\/pdf;base64,/, ''), 'base64');
    const folder = type === 'resume' ? 'resumes' : 'avatars';
    const uploadUrl = await uploadFile(buffer, folder);

    if (type === 'avatar') {
      await User.findByIdAndUpdate(req.user.id, { avatar: uploadUrl });
    } else if (type === 'resume' && req.user.role === 'freelancer') {
      await Freelancer.findOneAndUpdate({ user: req.user.id }, { resume: uploadUrl });
    }

    res.status(200).json({ success: true, url: uploadUrl });
  } catch (err) {
    next(err);
  }
};
