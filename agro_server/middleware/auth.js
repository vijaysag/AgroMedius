const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });

            if (!req.user) {
                // Check if it's a mock user from token (legacy support)
                if (String(decoded.id).startsWith('mockuser')) {
                    req.user = { 
                        id: decoded.id, 
                        _id: decoded.id, 
                        name: 'Demo User', 
                        role: String(decoded.id).includes('wholesaler') ? 'wholesaler' : 'farmer' 
                    };
                } else {
                    return res.status(401).json({ message: 'User not found or invalid session' });
                }
            } else {
                // Ensure compatibility with code expecting _id
                req.user = req.user.get({ plain: true });
                req.user._id = req.user.id;
            }

            next();
        } catch (error) {
            console.error('Auth Error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Role-based access control
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Role '${req.user.role}' is not authorized` });
        }
        next();
    };
};

module.exports = { protect, authorize };
