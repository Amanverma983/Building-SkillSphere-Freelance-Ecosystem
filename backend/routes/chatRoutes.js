const express = require('express');
const { sendMessage, getMessages, getConversations } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/history/:receiverId', getMessages);

module.exports = router;
