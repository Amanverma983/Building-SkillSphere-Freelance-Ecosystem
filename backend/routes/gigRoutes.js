const express = require('express');
const {
  createGig,
  getGigs,
  getGigById,
  updateGig,
  deleteGig,
  getPersonalizedGigs,
  getMatchingFreelancers
} = require('../controllers/gigController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getGigs);
router.get('/recommendations/freelancer', protect, authorize('freelancer'), getPersonalizedGigs);

router.get('/:id', getGigById);
router.post('/', protect, authorize('client'), createGig);
router.put('/:id', protect, updateGig);
router.delete('/:id', protect, deleteGig);
router.get('/:id/recommendations/freelancers', protect, authorize('client'), getMatchingFreelancers);

module.exports = router;
