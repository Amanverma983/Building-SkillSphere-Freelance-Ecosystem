const Freelancer = require('../models/Freelancer');
const { createNotification } = require('../services/notificationService');

// @desc    Book a slot / Block a date on freelancer's calendar
// @route   POST /api/scheduler/book
// @access  Private (Client only)
exports.bookSlot = async (req, res, next) => {
  try {
    const { freelancerId, date } = req.body;

    if (!freelancerId || !date) {
      return res.status(400).json({ success: false, message: 'Please provide freelancerId and date' });
    }

    const freelancer = await Freelancer.findOne({ user: freelancerId });
    if (!freelancer) {
      return res.status(404).json({ success: false, message: 'Freelancer not found' });
    }

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    // Check if already booked
    const isAlreadyBooked = freelancer.availability.bookedDates.some(
      (d) => new Date(d).getTime() === targetDate.getTime()
    );

    if (isAlreadyBooked) {
      return res.status(400).json({ success: false, message: 'Freelancer is already booked on this date' });
    }

    // Book the date
    freelancer.availability.bookedDates.push(targetDate);
    await freelancer.save();

    // Send notification
    await createNotification({
      userId: freelancerId,
      title: 'New Calendar Booking',
      message: `A client has booked/blocked your calendar slot on ${targetDate.toLocaleDateString()}`,
      type: 'system',
      link: '/freelancer/profile'
    });

    res.status(200).json({ success: true, message: 'Slot booked successfully', data: freelancer.availability.bookedDates });
  } catch (err) {
    next(err);
  }
};

// @desc    Get currently logged in Freelancer's schedule/bookings
// @route   GET /api/scheduler/my-schedule
// @access  Private (Freelancer only)
exports.getMySchedule = async (req, res, next) => {
  try {
    const freelancer = await Freelancer.findOne({ user: req.user.id });
    if (!freelancer) {
      return res.status(404).json({ success: false, message: 'Freelancer not found' });
    }

    res.status(200).json({ success: true, bookedDates: freelancer.availability.bookedDates });
  } catch (err) {
    next(err);
  }
};
