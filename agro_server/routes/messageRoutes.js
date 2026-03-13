const express = require('express');
const router = express.Router();
const { sendMessage, getConversation, getConversations } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getConversations);
router.get('/:userId', protect, getConversation);
router.post('/', protect, sendMessage);

module.exports = router;
