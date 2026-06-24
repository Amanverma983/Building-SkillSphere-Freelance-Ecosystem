const express = require('express');
const { createDispute, getDisputes, resolveDispute } = require('../controllers/disputeController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', createDispute);
router.get('/', authorize('admin'), getDisputes);
router.put('/:id/resolve', authorize('admin'), resolveDispute);

module.exports = router;
