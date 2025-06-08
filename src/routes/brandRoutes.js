const express = require('express');
const router = express.Router();
const {
    getBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand,
    getBrandProducts,
} = require('../controllers/brandController');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/brands
router.route('/').get(getBrands).post(protect, admin, createBrand);

// @route   GET /api/brands/:id
router
    .route('/:id')
    .get(getBrandById)
    .put(protect, admin, updateBrand)
    .delete(protect, admin, deleteBrand);

// @route   GET /api/brands/:id/products
router.get('/:id/products', getBrandProducts);

module.exports = router; 