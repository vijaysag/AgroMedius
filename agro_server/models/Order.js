const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    wholesalerId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    farmerId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    cropId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    quantity: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    totalPrice: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'processing', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending'
    },
    deliveryAddress: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    paymentStatus: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
        defaultValue: 'pending'
    },
    paymentMethod: {
        type: DataTypes.STRING,
        defaultValue: 'cash'
    }
}, {
    timestamps: true
});

module.exports = Order;
