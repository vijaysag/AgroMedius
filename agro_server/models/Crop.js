const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Crop = sequelize.define('Crop', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    farmerId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM('vegetable', 'fruit', 'grain', 'pulse', 'spice', 'oilseed', 'other'),
        allowNull: false
    },
    quantity: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    unit: {
        type: DataTypes.ENUM('kg', 'quintal', 'ton'),
        defaultValue: 'kg'
    },
    pricePerUnit: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    growthStatus: {
        type: DataTypes.ENUM('sowing', 'growing', 'harvesting', 'ready', 'sold'),
        defaultValue: 'sowing'
    },
    images: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    location: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    harvestDate: {
        type: DataTypes.DATE
    },
    soilType: {
        type: DataTypes.ENUM('clay', 'sandy', 'loamy', 'silt', 'peat', 'chalk', 'other')
    },
    irrigationType: {
        type: DataTypes.ENUM('rainfed', 'drip', 'sprinkler', 'canal', 'other')
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    ratings: {
        type: DataTypes.JSON,
        defaultValue: []
    }
}, {
    timestamps: true
});

// Associations will be defined in a central file or after all models are loaded
module.exports = Crop;
