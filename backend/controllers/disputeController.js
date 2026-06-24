const Dispute = require('../models/Dispute');
const Gig = require('../models/Gig');
const Payment = require('../models/Payment');
const { uploadFile } = require('../utils/cloudinary');
const { createNotification } = require('../services/notificationService');

// @desc    Raise a Dispute on a Gig contract
// @route   POST /api/disputes
// @access  Private
exports.createDispute = async (req, res, next) => {
  try {
    const { gigId, reason, evidenceBase64 } = req.body;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    // Identify dispute target
    let against;
    if (req.user.role === 'client') {
      if (gig.client.toString() !== req.user.id) {
        return res.status(401).json({ success: false, message: 'Not authorized for this gig' });
      }
      against = gig.freelancer;
    } else if (req.user.role === 'freelancer') {
      if (gig.freelancer.toString() !== req.user.id) {
        return res.status(401).json({ success: false, message: 'Not authorized for this gig' });
      }
      against = gig.client;
    }

    let evidenceUrl = '';
    if (evidenceBase64) {
      const buffer = Buffer.from(evidenceBase64.replace(/^data:image\/\w+;base64,/, '').replace(/^data:application\/\w+;base64,/, ''), 'base64');
      evidenceUrl = await uploadFile(buffer, 'dispute_evidence');
    }

    const dispute = await Dispute.create({
      gig: gigId,
      raisedBy: req.user.id,
      against,
      reason,
      evidence: evidenceUrl ? [evidenceUrl] : []
    });

    res.status(201).json({ success: true, data: dispute });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all disputes
// @route   GET /api/disputes
// @access  Private (Admin only)
exports.getDisputes = async (req, res, next) => {
  try {
    const disputes = await Dispute.find()
      .populate('gig', 'title')
      .populate('raisedBy', 'name email role')
      .populate('against', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: disputes.length, data: disputes });
  } catch (err) {
    next(err);
  }
};

// @desc    Resolve or reject dispute (Admin decision)
// @route   PUT /api/disputes/:id/resolve
// @access  Private (Admin only)
exports.resolveDispute = async (req, res, next) => {
  try {
    const { status, adminDecision, refundAction } = req.body; // status: 'resolved' / 'rejected', refundAction: 'refund_to_client' / 'release_to_freelancer'

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }

    dispute.status = status;
    dispute.adminDecision = adminDecision;
    dispute.resolvedAt = Date.now();
    await dispute.save();

    // Perform financial operations based on decision
    const payment = await Payment.findOne({ gig: dispute.gig, status: 'escrow' });
    
    if (payment) {
      if (refundAction === 'refund_to_client') {
        payment.status = 'refunded';
        payment.refundedAt = Date.now();
        await payment.save();

        const gig = await Gig.findById(dispute.gig);
        if (gig) {
          gig.status = 'cancelled';
          // Mark all milestones as refunded
          gig.milestones.forEach(m => {
            if (m.status === 'escrow') m.status = 'refunded';
          });
          await gig.save();
        }
      } else if (refundAction === 'release_to_freelancer') {
        payment.status = 'released';
        payment.releasedAt = Date.now();
        await payment.save();

        const gig = await Gig.findById(dispute.gig);
        if (gig) {
          gig.status = 'completed';
          gig.milestones.forEach(m => {
            if (m.status === 'escrow') m.status = 'released';
          });
          await gig.save();
        }
      }
    }

    // Notify users
    await createNotification({
      userId: dispute.raisedBy,
      title: 'Dispute Resolved',
      message: `Your dispute for Gig has been updated to "${status}" by the admin: ${adminDecision}`,
      type: 'dispute_resolved',
      link: '/client/dashboard'
    });

    await createNotification({
      userId: dispute.against,
      title: 'Dispute Resolved',
      message: `A dispute against you has been updated to "${status}" by the admin: ${adminDecision}`,
      type: 'dispute_resolved',
      link: '/freelancer/dashboard'
    });

    res.status(200).json({ success: true, data: dispute });
  } catch (err) {
    next(err);
  }
};
