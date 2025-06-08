const express = require('express');
const router = express.Router();
const {
    getCoupons,
    getCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
} = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/coupons
router.route('/').get(protect, admin, getCoupons).post(protect, admin, createCoupon);

// @route   GET /api/coupons/:id
router
    .route('/:id')
    .get(protect, admin, getCouponById)
    .put(protect, admin, updateCoupon)
    .delete(protect, admin, deleteCoupon);

// @route   POST /api/coupons/validate
router.post('/validate', validateCoupon);

module.exports = router; 