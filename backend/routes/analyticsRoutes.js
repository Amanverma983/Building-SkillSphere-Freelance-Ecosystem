const express = require('express');
const { getFreelancerAnalytics, getAdminAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/freelancer', authorize('freelancer'), getFreelancerAnalytics);
router.get('/admin', authorize('admin'), getAdminAnalytics);

module.exports = router;
