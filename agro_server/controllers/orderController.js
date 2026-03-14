const { Order, Crop, Notification, User } = require('../models');

// @desc    Create a new order (Book a crop)
// @route   POST /api/orders
exports.createOrder = async (req, res) => {
    try {
        const { cropId, quantity } = req.body;

        if (!cropId || !quantity) return res.status(400).json({ message: 'cropId and quantity are required' });

        const parsedQty = Number(quantity);
        if (!Number.isFinite(parsedQty) || parsedQty <= 0) return res.status(400).json({ message: 'quantity must be a positive number' });

        const crop = await Crop.findByPk(cropId);
        if (!crop) return res.status(404).json({ message: 'Crop not found' });

        if (crop.quantity < parsedQty) return res.status(400).json({ message: `Only ${crop.quantity} ${crop.unit} available` });

        // Prevent farmers from booking their own crop
        if (crop.farmerId === req.user.id) return res.status(400).json({ message: 'Farmers cannot book their own crop' });

        const totalPrice = crop.pricePerUnit * parsedQty;

        const order = await Order.create({
            cropId: cropId,
            farmerId: crop.farmerId,
            wholesalerId: req.user.id,
            quantity: parsedQty,
            totalPrice
        });

        // Update crop availability
        crop.quantity -= parsedQty;
        if (crop.quantity <= 0) {
            crop.quantity = 0;
            crop.growthStatus = 'sold';
            crop.isActive = false;
        }
        await crop.save();

        // Notify farmer
        await Notification.create({
            recipientId: crop.farmerId,
            type: 'system',
            title: 'New Booking!',
            message: `A buyer has booked ${parsedQty} ${crop.unit || 'kg'} of your ${crop.name}.`
        });

        res.status(201).json(order);
    } catch (error) {
        console.error('createOrder error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user orders (Buyer or Farmer)
// @route   GET /api/orders/my
exports.getMyOrders = async (req, res) => {
    try {
        const where = req.user.role === 'farmer' ? { farmerId: req.user.id } : { wholesalerId: req.user.id };
        const orders = await Order.findAll({
            where,
            include: [
                { model: Crop, as: 'crop', attributes: ['name', 'unit', 'pricePerUnit'] },
                { model: User, as: 'farmer', attributes: ['name', 'email', 'phone'] },
                { model: User, as: 'wholesaler', attributes: ['name', 'email', 'phone'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Map fields for frontend compatibility if needed
        const formattedOrders = orders.map(o => {
            const json = o.toJSON();
            // Frontend might expect 'buyer' instead of 'wholesaler' or vice-versa
            json.buyer = json.wholesaler;
            return json;
        });

        res.json(formattedOrders);
    } catch (error) {
        console.error('getMyOrders error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Status-change notification messages sent to the other party
const STATUS_MESSAGES = {
    accepted: (crop) => ({ title: '✅ Order Accepted!', message: `A farmer accepted your order for ${crop}.` }),
    rejected: (crop) => ({ title: '❌ Order Rejected', message: `A farmer rejected your order for ${crop}.` }),
    cancelled: (crop) => ({ title: '🚫 Order Cancelled', message: `The order for ${crop} was cancelled.` }),
};

// @desc    Update order status
// @route   PUT /api/orders/:id
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByPk(req.params.id, {
            include: [{ model: Crop, as: 'crop' }]
        });

        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Ensure user is authorized to update the order
        if (order.farmerId !== req.user.id && order.wholesalerId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this order' });
        }

        const prevStatus = order.status;
        if (status) order.status = status;

        console.log(`Updating order ${req.params.id}. Status: ${prevStatus} -> ${status}`);

        await order.save();

        // Handle quantity return if cancelled/rejected
        if ((status === 'cancelled' || status === 'rejected') && 
            (prevStatus !== 'cancelled' && prevStatus !== 'rejected') && 
            order.crop) {
            order.crop.quantity += order.quantity;
            await order.crop.save();
        }

        const cropName = order.crop?.name || 'your crop';

        // Notify other party when status changes
        if (status && status !== prevStatus && STATUS_MESSAGES[status]) {
            try {
                const targetUserId = order.farmerId === req.user.id ? order.wholesalerId : order.farmerId;
                const { title, message } = STATUS_MESSAGES[status](cropName);
                await Notification.create({
                    recipientId: targetUserId,
                    type: 'system',
                    title,
                    message,
                    link: '/orders'
                });
            } catch (notifErr) {
                console.error('Notification failed:', notifErr.message);
            }
        }

        res.json(order);
    } catch (error) {
        console.error('updateOrderStatus error:', error.message);
        res.status(500).json({ message: `Server error: ${error.message}`, error: error.message });
    }
};
