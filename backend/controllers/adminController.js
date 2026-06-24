const User = require('../models/User');
const Freelancer = require('../models/Freelancer');
const Gig = require('../models/Gig');
const AdminLog = require('../models/AdminLog');

// Helper to log admin actions
const logAdminAction = async (adminId, action, details, targetUser = null, targetGig = null) => {
  try {
    await AdminLog.create({ admin: adminId, action, details, targetUser, targetGig });
  } catch (err) {
    console.error('Admin log error:', err);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// @desc    Suspend a user account
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (Admin only)
exports.suspendUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Using email verification flag as suspension proxy (isEmailVerified = false means blocked)
    user.isEmailVerified = false;
    await user.save();

    await logAdminAction(req.user.id, 'SUSPEND_USER', `Suspended user account: ${user.email}`, user._id);

    res.status(200).json({ success: true, message: `User ${user.email} has been suspended.` });
  } catch (err) {
    next(err);
  }
};

// @desc    Activate a user account
// @route   PUT /api/admin/users/:id/activate
// @access  Private (Admin only)
exports.activateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isEmailVerified = true;
    await user.save();

    await logAdminAction(req.user.id, 'ACTIVATE_USER', `Activated user account: ${user.email}`, user._id);

    res.status(200).json({ success: true, message: `User ${user.email} has been activated.` });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify a Freelancer profile (grant verification badge)
// @route   PUT /api/admin/freelancers/:userId/verify
// @access  Private (Admin only)
exports.verifyFreelancer = async (req, res, next) => {
  try {
    const freelancer = await Freelancer.findOne({ user: req.params.userId });
    if (!freelancer) return res.status(404).json({ success: false, message: 'Freelancer profile not found' });

    freelancer.isVerified = true;
    await freelancer.save();

    await logAdminAction(req.user.id, 'VERIFY_FREELANCER', `Verified freelancer profile for user: ${req.params.userId}`, req.params.userId);

    res.status(200).json({ success: true, message: 'Freelancer verified successfully.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all admin action logs
// @route   GET /api/admin/logs
// @access  Private (Admin only)
exports.getAdminLogs = async (req, res, next) => {
  try {
    const logs = await AdminLog.find()
      .populate('admin', 'name email')
      .populate('targetUser', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a Gig (Admin enforcement)
// @route   DELETE /api/admin/gigs/:id
// @access  Private (Admin only)
exports.deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });

    await logAdminAction(req.user.id, 'DELETE_GIG', `Removed gig: ${gig.title}`, gig.client, gig._id);
    await gig.deleteOne();

    res.status(200).json({ success: true, message: 'Gig removed by admin.' });
  } catch (err) {
    next(err);
  }
};
