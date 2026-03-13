const express = require('express');
const router = express.Router();
const { getMarketPrices, getPriceHistory, seedMarketData, refreshLivePrices } = require('../controllers/marketController');

router.get('/', getMarketPrices);
router.get('/history/:cropName', getPriceHistory);
router.post('/seed', seedMarketData);           // public so UI button works without admin login
router.post('/refresh', refreshLivePrices);     // simulate live price update

module.exports = router;
