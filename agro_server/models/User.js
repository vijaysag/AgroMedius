const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('farmer', 'wholesaler', 'admin'),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING
    },
    location: {
        type: DataTypes.JSON, // Stores as TEXT in SQLite
        defaultValue: {}
    },
    profileImage: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    preferences: {
        type: DataTypes.JSON,
        defaultValue: {}
    }
}, {
    timestamps: true,
    hooks: {
        beforeSave: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

// Instance method for password matching
User.prototype.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;
