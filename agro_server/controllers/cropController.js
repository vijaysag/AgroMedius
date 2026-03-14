const { Op } = require('sequelize');
const { Crop, User } = require('../models');

// @desc    Create a crop listing (Farmer only)
// @route   POST /api/crops
exports.createCrop = async (req, res) => {
    try {
        const cropData = { ...req.body, farmerId: req.user.id };
        if (!cropData.location && req.user.location) {
            cropData.location = req.user.location;
        }
        if (!cropData.farmerPhone && req.user.phone) {
            cropData.farmerPhone = req.user.phone;
        }
        // Handle empty strings for optional date/numeric fields
        if (cropData.harvestDate === '') delete cropData.harvestDate;
        
        const crop = await Crop.create(cropData);
        res.status(201).json(crop);
    } catch (error) {
        console.error('CRITICAL createCrop error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        });
    }
};

// @desc    Get all crops (with search & filters)
// @route   GET /api/crops
exports.getCrops = async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, minQty, maxQty, city, state, status, sort, page = 1, limit = 12 } = req.query;
        let where = { isActive: true };

        if (search) where.name = { [Op.like]: `%${search}%` };
        if (category) where.category = category;
        if (status) where.growthStatus = status;

        if (minPrice || maxPrice) {
            where.pricePerUnit = {};
            if (minPrice) where.pricePerUnit[Op.gte] = Number(minPrice);
            if (maxPrice) where.pricePerUnit[Op.lte] = Number(maxPrice);
        }

        if (minQty || maxQty) {
            where.quantity = {};
            if (minQty) where.quantity[Op.gte] = Number(minQty);
            if (maxQty) where.quantity[Op.lte] = Number(maxQty);
        }

        // Note: location filtering is harder with JSON in SQLite via Sequelize Op
        // For city/state, if they are in a JSON field, it's dialect specific.
        // For simplicity in this demo, we'll filter city/state in-memory or skip
        // but let's try a basic JSON path string if sqlite supports it or just skip.
        // Given complexity, let's skip city/state filtering in the SQL where for now
        // or just use Op.like on the whole location string if needed.

        let order = [['createdAt', 'DESC']];
        if (sort === 'price_asc') order = [['pricePerUnit', 'ASC']];
        if (sort === 'price_desc') order = [['pricePerUnit', 'DESC']];
        if (sort === 'newest') order = [['createdAt', 'DESC']];

        const offset = (Number(page) - 1) * Number(limit);
        const { count, rows: crops } = await Crop.findAndCountAll({
            where,
            include: [{ model: User, as: 'farmer', attributes: ['name', 'email', 'phone', 'location'] }],
            order,
            limit: Number(limit),
            offset: offset
        });

        res.json({
            crops,
            page: Number(page),
            pages: Math.ceil(count / Number(limit)),
            total: count
        });
    } catch (error) {
        console.error('getCrops error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// @desc    Get single crop
// @route   GET /api/crops/:id
exports.getCropById = async (req, res) => {
    try {
        const crop = await Crop.findByPk(req.params.id, {
            include: [{ model: User, as: 'farmer', attributes: ['name', 'email', 'phone', 'location'] }]
        });
        if (crop) {
            crop.views += 1;
            await crop.save();
            res.json(crop);
        } else {
            res.status(404).json({ message: 'Crop not found' });
        }
    } catch (error) {
        console.error('getCropById error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update a crop (Farmer owner only)
// @route   PUT /api/crops/:id
exports.updateCrop = async (req, res) => {
    try {
        const crop = await Crop.findByPk(req.params.id);
        if (!crop) return res.status(404).json({ message: 'Crop not found' });

        if (crop.farmerId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this crop' });
        }
        
        await crop.update(req.body);
        res.json(crop);
    } catch (error) {
        console.error('updateCrop error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a crop
// @route   DELETE /api/crops/:id
exports.deleteCrop = async (req, res) => {
    try {
        const crop = await Crop.findByPk(req.params.id);
        if (!crop) return res.status(404).json({ message: 'Crop not found' });

        if (crop.farmerId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await crop.destroy();
        res.json({ message: 'Crop removed' });
    } catch (error) {
        console.error('deleteCrop error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// @desc    Get crops by current farmer
// @route   GET /api/crops/my
exports.getMyCrops = async (req, res) => {
    try {
        const crops = await Crop.findAll({ 
            where: { farmerId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(crops);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Mock AI Crop Health Analysis
// @route   POST /api/crops/ai-analyze-health
exports.analyzeHealth = async (req, res) => {
    try {
        const results = [
            { health: 'Good', status: 'Healthy', recommendation: 'Your crop shows excellent health. Continue current irrigation and monitoring.', riskLevel: 'low' },
            { health: 'Fair', status: 'Potential Nutrient Deficiency', recommendation: 'Yellowing of leaves suggests nitrogen deficiency. Consider applying organic compost.', riskLevel: 'medium' },
            { health: 'Alarming', status: 'Fungal Infection (Early Stage)', recommendation: 'Early signs of rust detected. Apply approved organic fungicide within 48 hours.', riskLevel: 'high' }
        ];

        const randomResult = results[Math.floor(Math.random() * results.length)];

        res.json({
            success: true,
            diagnosis: randomResult.status,
            recommendation: randomResult.recommendation,
            risk: randomResult.riskLevel,
            analyzedAt: new Date(),
            confidence: (Math.random() * (98 - 75) + 75).toFixed(2)
        });
    } catch (error) {
        console.error('Error in analyzeHealth:', error);
        res.status(500).json({ message: 'ML Analysis failed', error: error.message });
    }
};
