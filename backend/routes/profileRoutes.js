const express = require('express');
const {
  getMyProfile,
  getFreelancerProfile,
  getFreelancers,
  updateFreelancer,
  updateClient,
  uploadProfileFile
} = require('../controllers/profileController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/freelancers', getFreelancers);
router.get('/freelancer/:id', getFreelancerProfile);

// Private Routes
router.get('/me', protect, getMyProfile);
router.put('/freelancer', protect, authorize('freelancer'), updateFreelancer);
router.put('/client', protect, authorize('client'), updateClient);
router.post('/upload', protect, uploadProfileFile);

module.exports = router;
