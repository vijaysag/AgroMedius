const express = require('express');
const router = express.Router();
const { createCrop, getCrops, getCropById, updateCrop, deleteCrop, getMyCrops, analyzeHealth } = require('../controllers/cropController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getCrops);
// Static routes MUST come before /:id
router.get('/my', protect, authorize('farmer'), getMyCrops);
router.post('/ai-analyze-health', protect, authorize('farmer'), analyzeHealth);
router.post('/', protect, authorize('farmer'), createCrop);
router.get('/:id', getCropById);
router.put('/:id', protect, authorize('farmer'), updateCrop);
router.delete('/:id', protect, deleteCrop);

module.exports = router;
