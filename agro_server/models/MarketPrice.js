const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MarketPrice = sequelize.define('MarketPrice', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    cropName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    market: {
        type: DataTypes.STRING
    },
    state: {
        type: DataTypes.STRING
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    minPrice: {
        type: DataTypes.FLOAT
    },
    maxPrice: {
        type: DataTypes.FLOAT
    },
    unit: {
        type: DataTypes.STRING,
        defaultValue: 'kg'
    },
    trend: {
        type: DataTypes.ENUM('up', 'down', 'stable'),
        defaultValue: 'stable'
    },
    location: {
        type: DataTypes.STRING
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true
});

module.exports = MarketPrice;
