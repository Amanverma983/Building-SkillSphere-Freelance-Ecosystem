const Payment = require('../models/Payment');
const Proposal = require('../models/Proposal');
const Gig = require('../models/Gig');
const Freelancer = require('../models/Freelancer');
const Client = require('../models/Client');
const User = require('../models/User');
const Dispute = require('../models/Dispute');
const mongoose = require('mongoose');

// @desc    Get Freelancer specific dashboard statistics & weekly earnings trend
// @route   GET /api/analytics/freelancer
// @access  Private (Freelancer only)
exports.getFreelancerAnalytics = async (req, res, next) => {
  try {
    const freelancerId = req.user.id;

    const freelancerProfile = await Freelancer.findOne({ user: freelancerId });
    if (!freelancerProfile) {
      return res.status(404).json({ success: false, message: 'Freelancer profile not found' });
    }

    // 1. Total Earnings
    const earningsResult = await Payment.aggregate([
      { $match: { freelancer: new mongoose.Types.ObjectId(freelancerId), status: 'released' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalEarnings = earningsResult[0]?.total || 0;

    // 2. Active Gigs Count
    const activeGigsCount = await Gig.countDocuments({ freelancer: freelancerId, status: 'in-progress' });

    // 3. Applications statistics
    const totalApplications = await Proposal.countDocuments({ freelancer: freelancerId });
    const acceptedApplications = await Proposal.countDocuments({ freelancer: freelancerId, status: 'accepted' });

    // 4. Monthly Earnings Graph Data (Group by month of current year)
    const monthlyEarnings = await Payment.aggregate([
      {
        $match: {
          freelancer: new mongoose.Types.ObjectId(freelancerId),
          status: 'released',
          createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          earnings: { $sum: '$amount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Format monthly earnings for React chart compatibility
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = months.map((month, idx) => {
      const monthData = monthlyEarnings.find((item) => item._id === idx + 1);
      return {
        month,
        earnings: monthData ? monthData.earnings : 0
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalEarnings,
        activeGigsCount,
        applications: {
          total: totalApplications,
          accepted: acceptedApplications,
          successRate: totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0
        },
        reputationScore: freelancerProfile.reputationScore,
        ratingAverage: freelancerProfile.ratingAverage,
        chartData
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Admin global analytics
// @route   GET /api/analytics/admin
// @access  Private (Admin only)
exports.getAdminAnalytics = async (req, res, next) => {
  try {
    // 1. Total platform users counts
    const totalUsers = await User.countDocuments();
    const freelancersCount = await User.countDocuments({ role: 'freelancer' });
    const clientsCount = await User.countDocuments({ role: 'client' });

    // 2. Active Gigs
    const activeGigs = await Gig.countDocuments({ status: 'in-progress' });
    const completedGigs = await Gig.countDocuments({ status: 'completed' });
    const totalGigs = await Gig.countDocuments();

    // 3. Financial Metrics (Total Platform volume, Escrow volume, Admin Revenue cut [assume 10%])
    const revenueResult = await Payment.aggregate([
      { $match: { status: 'released' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const escrowResult = await Payment.aggregate([
      { $match: { status: 'escrow' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalTransactionVolume = revenueResult[0]?.total || 0;
    const escrowVolume = escrowResult[0]?.total || 0;
    const platformCommission = Math.round(totalTransactionVolume * 0.10); // 10% Platform fee

    // 4. Disputes pending resolution
    const openDisputes = await Dispute.countDocuments({ status: 'open' });

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          freelancers: freelancersCount,
          clients: clientsCount
        },
        gigs: {
          total: totalGigs,
          active: activeGigs,
          completed: completedGigs,
          successRate: totalGigs > 0 ? Math.round((completedGigs / totalGigs) * 100) : 0
        },
        financials: {
          volume: totalTransactionVolume,
          escrow: escrowVolume,
          revenue: platformCommission
        },
        disputes: {
          open: openDisputes
        }
      }
    });
  } catch (err) {
    next(err);
  }
};
