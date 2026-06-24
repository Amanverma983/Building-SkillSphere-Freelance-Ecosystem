const express = require('express');
const { bookSlot, getMySchedule } = require('../controllers/schedulerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/book', authorize('client'), bookSlot);
router.get('/my-schedule', authorize('freelancer'), getMySchedule);

module.exports = router;
