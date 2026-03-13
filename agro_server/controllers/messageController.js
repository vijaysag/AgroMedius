const { Op } = require('sequelize');
const { Message, User } = require('../models');

// @desc    Send a message
// @route   POST /api/messages
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body; // Adjusted field name
        const message = await Message.create({
            senderId: req.user.id,
            recipientId: receiverId,
            content
        });
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get conversation with a user
// @route   GET /api/messages/:userId
exports.getConversation = async (req, res) => {
    try {
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId: req.user.id, recipientId: req.params.userId },
                    { senderId: req.params.userId, recipientId: req.user.id }
                ]
            },
            include: [
                { model: User, as: 'sender', attributes: ['id', 'name'] },
                { model: User, as: 'recipient', attributes: ['id', 'name'] }
            ],
            order: [['createdAt', 'ASC']]
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all conversations (unique users)
// @route   GET /api/messages
exports.getConversations = async (req, res) => {
    try {
        // Simpler implementation for SQLite without complex aggregation
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId: req.user.id },
                    { recipientId: req.user.id }
                ]
            },
            include: [
                { model: User, as: 'sender', attributes: ['id', 'name'] },
                { model: User, as: 'recipient', attributes: ['id', 'name'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Group in memory
        const groups = {};
        messages.forEach(m => {
            const otherUser = m.senderId === req.user.id ? m.recipient : m.sender;
            const otherId = otherUser.id;
            if (!groups[otherId]) {
                groups[otherId] = {
                    id: otherId,
                    name: otherUser.name,
                    lastMessage: m.content,
                    lastDate: m.createdAt,
                    unread: (m.recipientId === req.user.id && !m.isRead) ? 1 : 0
                };
            } else if (m.recipientId === req.user.id && !m.isRead) {
                groups[otherId].unread++;
            }
        });

        res.json(Object.values(groups));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
