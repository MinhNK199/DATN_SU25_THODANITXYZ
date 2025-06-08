const express = require('express');
const router = express.Router();
const {
    getCategories,
    getCategoryTree,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryProducts,
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/categories
router.route('/').get(getCategories).post(protect, admin, createCategory);

// @route   GET /api/categories/tree
router.get('/tree', getCategoryTree);

// @route   GET /api/categories/:id
router
    .route('/:id')
    .get(getCategoryById)
    .put(protect, admin, updateCategory)
    .delete(protect, admin, deleteCategory);

// @route   GET /api/categories/:id/products
router.get('/:id/products', getCategoryProducts);

module.exports = router; 