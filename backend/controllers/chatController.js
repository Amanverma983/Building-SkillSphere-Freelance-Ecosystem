const Message = require('../models/Message');
const User = require('../models/User');
const { uploadFile } = require('../utils/cloudinary');
const { sendRealtimeMessage } = require('../services/socketService');

// @desc    Send Message
// @route   POST /api/chat
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, message, file, fileName, fileType, gigId } = req.body;

    let fileUrl = '';
    if (file) {
      const buffer = Buffer.from(file.replace(/^data:image\/\w+;base64,/, '').replace(/^data:application\/\w+;base64,/, ''), 'base64');
      fileUrl = await uploadFile(buffer, 'chat_attachments');
    }

    const newMessage = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      message: message || '',
      fileUrl,
      fileName: fileName || '',
      fileType: fileType || '',
      gig: gigId
    });

    // Populate sender details for Socket emission
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    // Emit via Socket.IO
    // A room can be formatted as: senderId-receiverId sorted alphabetically
    const roomId = [req.user.id, receiverId].sort().join('-');
    sendRealtimeMessage(roomId, populatedMessage);
    
    // Also emit to the receiver's personal room for notification badge incrementing
    sendRealtimeMessage(receiverId, { type: 'new_message', data: populatedMessage });

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Chat History / Messages between two users
// @route   GET /api/chat/history/:receiverId
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.receiverId;

    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar');

    // Mark these messages as read
    await Message.updateMany(
      { sender: receiverId, receiver: senderId, read: false },
      { read: true, readAt: Date.now() }
    );

    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Conversation List
// @route   GET /api/chat/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Aggregation pipeline to group messages by conversation partners
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new require('mongoose').Types.ObjectId(userId) },
            { receiver: new require('mongoose').Types.ObjectId(userId) }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", new require('mongoose').Types.ObjectId(userId)] },
              "$receiver",
              "$sender"
            ]
          },
          lastMessage: { $first: "$$ROOT" }
        }
      }
    ]);

    // Populate user details manually on aggregated results
    const conversations = await Promise.all(messages.map(async (c) => {
      const partner = await User.findById(c._id).select('name avatar role');
      const unreadCount = await Message.countDocuments({
        sender: c._id,
        receiver: userId,
        read: false
      });

      return {
        partner,
        lastMessage: c.lastMessage,
        unreadCount
      };
    }));

    // Sort by last message date descending
    conversations.sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt);

    res.status(200).json({ success: true, data: conversations });
  } catch (err) {
    next(err);
  }
};
