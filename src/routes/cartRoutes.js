const express = require('express');
const router = express.Router();
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/cart
router.route('/').get(protect, getCart);

// @route   POST /api/cart
router.route('/').post(protect, addToCart);

// @route   PUT /api/cart/:productId
router.route('/:productId').put(protect, updateCartItem);

// @route   DELETE /api/cart/:productId
router.route('/:productId').delete(protect, removeFromCart);

// @route   DELETE /api/cart
router.route('/').delete(protect, clearCart);

// @route   POST /api/cart/coupon
router.route('/coupon').post(protect, applyCoupon);

module.exports = router; 