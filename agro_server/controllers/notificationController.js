const { Notification } = require('../models');

// @desc    Get user notifications
// @route   GET /api/notifications
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { recipientId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 50
        });
        res.json(notifications);
    } catch (error) {
        console.error('getNotifications error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByPk(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Not found' });

        if (notification.recipientId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        notification.isRead = true;
        await notification.save();
        res.json(notification);
    } catch (error) {
        console.error('markAsRead error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.update(
            { isRead: true },
            { where: { recipientId: req.user.id, isRead: false } }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('markAllAsRead error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
    try {
        const result = await Notification.destroy({
            where: {
                id: req.params.id,
                recipientId: req.user.id
            }
        });
        if (!result) return res.status(404).json({ message: 'Not found or not authorized' });
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('deleteNotification error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
