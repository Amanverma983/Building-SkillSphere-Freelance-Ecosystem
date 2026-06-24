const express = require('express');
const {
  submitProposal,
  getGigProposals,
  getMyProposals,
  updateProposalStatus
} = require('../controllers/proposalController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('freelancer'), submitProposal);
router.get('/my', protect, authorize('freelancer'), getMyProposals);
router.get('/gig/:gigId', protect, getGigProposals);
router.put('/:id/status', protect, authorize('client'), updateProposalStatus);

module.exports = router;
