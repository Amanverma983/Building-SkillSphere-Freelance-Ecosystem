const Proposal = require('../models/Proposal');
const Gig = require('../models/Gig');
const User = require('../models/User');

// @desc    Submit a Proposal on a Gig
// @route   POST /api/proposals
// @access  Private (Freelancer only)
exports.submitProposal = async (req, res, next) => {
  try {
    const { gigId, coverLetter, bidAmount, duration, milestones } = req.body;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    if (gig.status !== 'published') {
      return res.status(400).json({ success: false, message: 'This gig is no longer open for applications' });
    }

    // Check if freelancer already applied
    const existingProposal = await Proposal.findOne({ gig: gigId, freelancer: req.user.id });
    if (existingProposal) {
      return res.status(400).json({ success: false, message: 'You have already submitted a proposal for this gig' });
    }

    const proposal = await Proposal.create({
      gig: gigId,
      freelancer: req.user.id,
      coverLetter,
      bidAmount,
      duration,
      milestones: milestones || []
    });

    // Increment proposal count on Gig
    gig.proposalsCount += 1;
    await gig.save();

    res.status(201).json({ success: true, data: proposal });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all proposals for a specific Gig
// @route   GET /api/proposals/gig/:gigId
// @access  Private (Client of the gig only)
exports.getGigProposals = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    // Authorization check
    if (gig.client.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to view proposals for this gig' });
    }

    const proposals = await Proposal.find({ gig: req.params.gigId })
      .populate('freelancer', 'name email avatar');

    res.status(200).json({ success: true, count: proposals.length, data: proposals });
  } catch (err) {
    next(err);
  }
};

// @desc    Get currently logged in Freelancer's proposals
// @route   GET /api/proposals/my
// @access  Private (Freelancer only)
exports.getMyProposals = async (req, res, next) => {
  try {
    const proposals = await Proposal.find({ freelancer: req.user.id })
      .populate({
        path: 'gig',
        select: 'title minBudget maxBudget budgetType status client',
        populate: { path: 'client', select: 'name' }
      });

    res.status(200).json({ success: true, count: proposals.length, data: proposals });
  } catch (err) {
    next(err);
  }
};

// @desc    Accept, Reject, or Negotiate a Proposal
// @route   PUT /api/proposals/:id/status
// @access  Private (Client of the gig only)
exports.updateProposalStatus = async (req, res, next) => {
  try {
    const { status, negotiationComments } = req.body; // 'accepted', 'rejected', 'negotiating'
    
    let proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    const gig = await Gig.findById(proposal.gig);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    // Check auth
    if (gig.client.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to manage proposals for this gig' });
    }

    proposal.status = status;
    if (negotiationComments) {
      proposal.negotiationComments = negotiationComments;
    }

    if (status === 'accepted') {
      // Assign freelancer to gig, set gig in-progress
      gig.freelancer = proposal.freelancer;
      gig.status = 'in-progress';

      // Import proposal milestones into gig's milestone lists
      if (proposal.milestones && proposal.milestones.length > 0) {
        gig.milestones = proposal.milestones.map(m => ({
          title: m.title,
          amount: m.amount,
          deadline: m.deadline,
          status: 'pending' // Initialize as pending
        }));
      } else {
        // Fallback: create a single default milestone based on bidAmount
        gig.milestones = [{
          title: 'Project Completion Milestone',
          amount: proposal.bidAmount,
          status: 'pending'
        }];
      }
      await gig.save();

      // Reject all other proposals for this gig
      await Proposal.updateMany(
        { gig: gig._id, _id: { $ne: proposal._id } },
        { status: 'rejected' }
      );
    }

    await proposal.save();
    res.status(200).json({ success: true, data: proposal, gig });
  } catch (err) {
    next(err);
  }
};
