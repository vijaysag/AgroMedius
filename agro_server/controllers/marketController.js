const { Op } = require('sequelize');
const { MarketPrice } = require('../models');

const CROPS = ['Wheat', 'Rice', 'Tomato', 'Onion', 'Potato', 'Soybean', 'Cotton', 'Sugarcane', 'Maize', 'Chilli'];
const MARKETS = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai'];
const STATES = ['Delhi', 'Maharashtra', 'Karnataka', 'Telangana', 'Tamil Nadu'];
const BASE_PRICES = { Wheat: 2200, Rice: 3100, Tomato: 1800, Onion: 1500, Potato: 1200, Soybean: 4500, Cotton: 6200, Sugarcane: 900, Maize: 1900, Chilli: 8000 };

// @desc    Get market prices (with filters)
// @route   GET /api/market
exports.getMarketPrices = async (req, res) => {
    try {
        const { cropName, state, market, days = 30 } = req.query;

        let where = {};
        if (cropName) where.cropName = { [Op.like]: `%${cropName}%` };
        if (state) where.state = { [Op.like]: `%${state}%` };
        if (market) where.market = { [Op.like]: `%${market}%` };

        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - Number(days));
        where.date = { [Op.gte]: sinceDate };

        const prices = await MarketPrice.findAll({
            where,
            order: [['date', 'DESC']],
            limit: 200
        });
        res.json(prices);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get price history for a crop (for charts)
// @route   GET /api/market/history/:cropName
exports.getPriceHistory = async (req, res) => {
    try {
        const { cropName } = req.params;
        const { days = 30 } = req.query;

        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - Number(days));

        const history = await MarketPrice.findAll({
            where: {
                cropName: { [Op.like]: `%${cropName}%` },
                date: { [Op.gte]: sinceDate }
            },
            order: [['date', 'ASC']]
        });

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Seed 90 days of sample market data
// @route   POST /api/market/seed
exports.seedMarketData = async (req, res) => {
    try {
        const data = [];
        for (let d = 0; d < 90; d++) {
            const date = new Date();
            date.setDate(date.getDate() - d);
            for (let i = 0; i < CROPS.length; i++) {
                const base = BASE_PRICES[CROPS[i]] || 2000;
                const price = Math.round(base + Math.sin(d / 7) * base * 0.12 + (Math.random() - 0.5) * base * 0.08);
                data.push({
                    cropName: CROPS[i],
                    category: ['grain', 'vegetable', 'oilseed', 'spice'][i % 4],
                    market: MARKETS[i % MARKETS.length],
                    state: STATES[i % STATES.length],
                    price,
                    minPrice: Math.round(price * 0.92),
                    maxPrice: Math.round(price * 1.08),
                    unit: CROPS[i] === 'Tomato' || CROPS[i] === 'Onion' || CROPS[i] === 'Potato' ? 'kg' : 'quintal',
                    date
                });
            }
        }
        await MarketPrice.destroy({ where: {}, truncate: true });
        await MarketPrice.bulkCreate(data);
        res.json({ message: `Seeded ${data.length} market price entries`, count: data.length });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Refresh today's prices (±5% random nudge to simulate live data)
// @route   POST /api/market/refresh
exports.refreshLivePrices = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Delete today's existing entries
        await MarketPrice.destroy({ where: { date: { [Op.gte]: today } } });

        const data = [];
        for (let i = 0; i < CROPS.length; i++) {
            const base = BASE_PRICES[CROPS[i]] || 2000;
            const price = Math.round(base + (Math.random() - 0.5) * base * 0.1);
            data.push({
                cropName: CROPS[i],
                category: ['grain', 'vegetable', 'oilseed', 'spice'][i % 4],
                market: MARKETS[i % MARKETS.length],
                state: STATES[i % STATES.length],
                price,
                minPrice: Math.round(price * 0.93),
                maxPrice: Math.round(price * 1.07),
                unit: CROPS[i] === 'Tomato' || CROPS[i] === 'Onion' || CROPS[i] === 'Potato' ? 'kg' : 'quintal',
                date: new Date()
            });
        }
        await MarketPrice.bulkCreate(data);
        res.json({ message: 'Live prices refreshed', prices: data });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
