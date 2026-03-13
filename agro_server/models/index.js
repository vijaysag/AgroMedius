const User = require('./User');
const Crop = require('./Crop');
const Order = require('./Order');
const MarketPrice = require('./MarketPrice');
const Notification = require('./Notification');
const Message = require('./Message');

// Associations
// User <-> Crop
User.hasMany(Crop, { foreignKey: 'farmerId', as: 'crops' });
Crop.belongsTo(User, { foreignKey: 'farmerId', as: 'farmer' });

// User <-> Order
User.hasMany(Order, { foreignKey: 'wholesalerId', as: 'buyerOrders' });
User.hasMany(Order, { foreignKey: 'farmerId', as: 'sellerOrders' });
Order.belongsTo(User, { foreignKey: 'wholesalerId', as: 'wholesaler' });
Order.belongsTo(User, { foreignKey: 'farmerId', as: 'farmer' });

// Crop <-> Order
Crop.hasMany(Order, { foreignKey: 'cropId', as: 'orders' });
Order.belongsTo(Crop, { foreignKey: 'cropId', as: 'crop' });

// User <-> Notification
User.hasMany(Notification, { foreignKey: 'recipientId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });

// User <-> Message (Sender and Recipient)
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'recipientId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });

module.exports = {
    User,
    Crop,
    Order,
    MarketPrice,
    Notification,
    Message
};
