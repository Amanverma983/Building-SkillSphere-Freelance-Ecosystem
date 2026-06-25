const Freelancer = require('../models/Freelancer');
const Gig = require('../models/Gig');

/**
 * Calculates a match score out of 100 between a Freelancer and a Gig.
 */
exports.calculateMatchScore = (freelancer, gig) => {
  let score = 0;

  // 1. Skill Overlap (60% of total score)
  const freelancerSkills = freelancer.skills.map(s => s.name.toLowerCase());
  const gigSkills = gig.skills.map(s => s.toLowerCase());

  if (gigSkills.length > 0) {
    const matchingSkills = gigSkills.filter(skill => freelancerSkills.includes(skill));
    const skillRatio = matchingSkills.length / gigSkills.length;
    score += skillRatio * 60;
  }

  // 2. Budget / Pricing Fit (20% of total score)
  // Assuming a reasonable budget fit matches freelancer's hourly rate
  if (gig.budgetType === 'hourly') {
    // If freelancer rate fits within or close to gig range
    if (freelancer.hourlyRate <= gig.maxBudget) {
      score += 20;
    } else {
      const diff = freelancer.hourlyRate - gig.maxBudget;
      const penalty = Math.min(20, (diff / gig.maxBudget) * 20);
      score += (20 - penalty);
    }
  } else {
    // For fixed price, assume higher budgets align with Expert/Intermediate
    score += 20;
  }

  // 3. Reputation & Performance (20% of total score)
  // Uses reputation score directly (max 100 -> converts to max 20)
  const reputationContribution = (freelancer.reputationScore / 100) * 20;
  score += reputationContribution;

  return Math.round(score);
};

/**
 * Recommends top freelancers for a specific gig (Hyperlocal + Skill match).
 */
exports.recommendFreelancersForGig = async (gigId, limit = 5) => {
  const gig = await Gig.findById(gigId);
  if (!gig) return [];

  // Query nearby freelancers or fallback to general freelancers
  let query = { isVerified: true };

  // If gig location coordinates exist, find freelancers within 50km
  if (gig.location && gig.location.coordinates && gig.location.coordinates[0] !== 0) {
    query.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: gig.location.coordinates
        },
        $maxDistance: 50000 // 50km in meters
      }
    };
  }

  let freelancers = await Freelancer.find(query).populate('user');

  // If no nearby freelancers, fallback to general search without location filter
  if (freelancers.length === 0) {
    delete query.location;
    freelancers = await Freelancer.find(query).populate('user');
  }

  // Calculate scores and sort
  const scoredFreelancers = freelancers.map(freelancer => {
    const score = exports.calculateMatchScore(freelancer, gig);
    return {
      freelancer,
      score
    };
  });

  // Sort descending by score
  scoredFreelancers.sort((a, b) => b.score - a.score);

  return scoredFreelancers.slice(0, limit);
};

/**
 * Recommends top matching gigs for a specific freelancer profile.
 */
exports.recommendGigsForFreelancer = async (freelancerId, limit = 10) => {
  const freelancer = await Freelancer.findById(freelancerId);
  if (!freelancer) return [];

  // Get matching skills
  const skills = freelancer.skills.map(s => s.name);

  // Search published gigs that match any of freelancer's skills
  let gigs = await Gig.find({
    status: 'published',
    skills: { $in: skills }
  }).populate('client');

  // Fallback to all published gigs if no direct skill matches
  if (gigs.length === 0) {
    gigs = await Gig.find({ status: 'published' }).populate('client');
  }

  const scoredGigs = gigs.map(gig => {
    const score = exports.calculateMatchScore(freelancer, gig);
    return {
      gig,
      score
    };
  });

  // Sort descending by score
  scoredGigs.sort((a, b) => b.score - a.score);

  return scoredGigs.slice(0, limit);
};
