const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendRealtimeNotification } = require('./socketService');
const sendEmail = require('../utils/sendEmail');

/**
 * Creates, saves, and dispatches a notification.
 */
exports.createNotification = async ({ userId, title, message, type, link }) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      link: link || ''
    });

    // Realtime broadcast via Socket
    sendRealtimeNotification(userId.toString(), notification);

    // Email dispatch (optional, only for important events)
    const importantTypes = ['proposal_accepted', 'payment_received', 'dispute_created'];
    if (importantTypes.includes(type)) {
      const user = await User.findById(userId);
      if (user) {
        await sendEmail({
          email: user.email,
          subject: `SkillSphere Notification: ${title}`,
          message: `${message}\n\nView details here: ${process.env.CLIENT_URL || 'http://localhost:5173'}${link}`
        });
      }
    }

    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
  }
};
