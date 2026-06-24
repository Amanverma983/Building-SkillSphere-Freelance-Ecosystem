const express = require('express');
const { submitReview, getUserReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/user/:userId', getUserReviews);
router.post('/', protect, submitReview);

module.exports = router;
