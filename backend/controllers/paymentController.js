const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Gig = require('../models/Gig');
const Freelancer = require('../models/Freelancer');
const Client = require('../models/Client');
const { createNotification } = require('../services/notificationService');

let razorpayInstance;
if (process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes('mock')) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// @desc    Create Razorpay Order for Escrow Milestone Payment
// @route   POST /api/payments/order
// @access  Private (Client only)
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { gigId, milestoneId } = req.body;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    // Find milestone
    const milestone = gig.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    if (milestone.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Milestone is already in '${milestone.status}' state` });
    }

    const amountInPaise = milestone.amount * 100; // Razorpay expects amount in paise (1 INR = 100 paise)

    let order;
    if (!razorpayInstance) {
      // Mock order generation for developer testing
      const mockOrderId = `order_mock_${crypto.randomBytes(8).toString('hex')}`;
      order = {
        id: mockOrderId,
        entity: 'order',
        amount: amountInPaise,
        amount_paid: 0,
        amount_due: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${milestoneId.slice(0, 10)}`,
        status: 'created',
        created_at: Math.floor(Date.now() / 1000)
      };
    } else {
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${milestoneId.slice(0, 10)}`
      };
      order = await razorpayInstance.orders.create(options);
    }

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify Razorpay payment signature & deposit into Escrow
// @route   POST /api/payments/verify
// @access  Private (Client only)
exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { gigId, milestoneId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    const milestone = gig.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    // Verify signature
    let verified = false;
    if (!razorpayInstance || razorpayOrderId.startsWith('order_mock_')) {
      // Mock mode
      verified = true;
    } else {
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature === razorpaySignature) {
        verified = true;
      }
    }

    if (!verified) {
      return res.status(400).json({ success: false, message: 'Payment signature verification failed' });
    }

    // Update milestone status on gig
    milestone.status = 'escrow';
    await gig.save();

    // Create payment transaction log
    const payment = await Payment.create({
      client: req.user.id,
      freelancer: gig.freelancer,
      gig: gigId,
      milestoneId: milestoneId,
      amount: milestone.amount,
      razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId || `pay_mock_${crypto.randomBytes(8).toString('hex')}`,
      razorpaySignature: razorpaySignature || 'mock_signature',
      status: 'escrow'
    });

    // Notify Freelancer
    await createNotification({
      userId: gig.freelancer,
      title: 'Milestone Payment Funded',
      message: `Milestone "${milestone.title}" worth ₹${milestone.amount} has been funded and is in ESCROW. You can start working on this milestone now!`,
      type: 'payment_received',
      link: `/freelancer/applications`
    });

    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

// @desc    Release Escrow funds to Freelancer
// @route   POST /api/payments/release/:id
// @access  Private (Client only)
exports.releaseEscrow = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.client.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to release these funds' });
    }

    if (payment.status !== 'escrow') {
      return res.status(400).json({ success: false, message: `Payment is not in escrow (current status: ${payment.status})` });
    }

    const gig = await Gig.findById(payment.gig);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    const milestone = gig.milestones.id(payment.milestoneId);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    // Update statuses
    payment.status = 'released';
    payment.releasedAt = Date.now();
    await payment.save();

    milestone.status = 'released';
    
    // Check if all milestones are released, if so set gig completed
    const allReleased = gig.milestones.every(m => m.status === 'released');
    if (allReleased) {
      gig.status = 'completed';
      
      // Update Freelancer completion rate
      const freelancerProfile = await Freelancer.findOne({ user: gig.freelancer });
      if (freelancerProfile) {
        // Increment completion parameters
        freelancerProfile.completionRate = Math.min(100, freelancerProfile.completionRate + 1);
        await freelancerProfile.save();
      }
    }
    await gig.save();

    // Increment client total spent, increment freelancer profile revenue
    await Client.findOneAndUpdate({ user: payment.client }, { $inc: { spentAmount: payment.amount } });

    // Notify Freelancer
    await createNotification({
      userId: payment.freelancer,
      title: 'Payment Released',
      message: `Milestone "${milestone.title}" payment of ₹${payment.amount} has been released to your account!`,
      type: 'payment_received',
      link: `/freelancer/earnings`
    });

    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

// @desc    Refund Escrow funds to Client
// @route   POST /api/payments/refund/:id
// @access  Private (Admin only)
exports.refundPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.status !== 'escrow') {
      return res.status(400).json({ success: false, message: `Payment is not in escrow (current status: ${payment.status})` });
    }

    const gig = await Gig.findById(payment.gig);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    const milestone = gig.milestones.id(payment.milestoneId);
    if (milestone) {
      milestone.status = 'refunded';
      await gig.save();
    }

    payment.status = 'refunded';
    payment.refundedAt = Date.now();
    await payment.save();

    // Notify Client & Freelancer
    await createNotification({
      userId: payment.client,
      title: 'Payment Refunded',
      message: `Milestone payment of ₹${payment.amount} has been refunded to your account.`,
      type: 'system',
      link: '/client/payments'
    });

    await createNotification({
      userId: payment.freelancer,
      title: 'Milestone Refunded',
      message: `Milestone payment of ₹${payment.amount} has been refunded to the client.`,
      type: 'system',
      link: '/freelancer/applications'
    });

    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

// @desc    Get transaction history
// @route   GET /api/payments/history
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'client') {
      query.client = req.user.id;
    } else if (req.user.role === 'freelancer') {
      query.freelancer = req.user.id;
    } else if (req.user.role === 'admin') {
      // Admin sees everything
    }

    const payments = await Payment.find(query)
      .populate('client', 'name email')
      .populate('freelancer', 'name email')
      .populate('gig', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: payments });
  } catch (err) {
    next(err);
  }
};
