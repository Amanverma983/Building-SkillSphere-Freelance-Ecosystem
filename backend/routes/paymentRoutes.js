const express = require('express');
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  releaseEscrow,
  refundPayment,
  getTransactions
} = require('../controllers/paymentController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/order', authorize('client'), createRazorpayOrder);
router.post('/verify', authorize('client'), verifyRazorpayPayment);
router.post('/release/:id', authorize('client', 'admin'), releaseEscrow);
router.post('/refund/:id', authorize('admin'), refundPayment);
router.get('/history', getTransactions);

module.exports = router;
