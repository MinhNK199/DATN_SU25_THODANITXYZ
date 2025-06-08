const Coupon = require('../models/Coupon');
const asyncHandler = require('express-async-handler');

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = asyncHandler(async (req, res) => {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;

    const count = await Coupon.countDocuments({});
    const coupons = await Coupon.find({})
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({
        coupons,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
    });
});

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private/Admin
const getCouponById = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
        res.json(coupon);
    } else {
        res.status(404);
        throw new Error('Coupon not found');
    }
});

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
    const {
        code,
        description,
        type,
        value,
        minOrderValue,
        maxDiscountValue,
        startDate,
        endDate,
        usageLimit,
        isActive,
        applicableProducts,
        applicableCategories,
        userUsageLimit,
    } = req.body;

    const coupon = new Coupon({
        code,
        description,
        type,
        value,
        minOrderValue,
        maxDiscountValue,
        startDate,
        endDate,
        usageLimit,
        isActive,
        applicableProducts,
        applicableCategories,
        userUsageLimit,
    });

    const createdCoupon = await coupon.save();
    res.status(201).json(createdCoupon);
});

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = asyncHandler(async (req, res) => {
    const {
        code,
        description,
        type,
        value,
        minOrderValue,
        maxDiscountValue,
        startDate,
        endDate,
        usageLimit,
        isActive,
        applicableProducts,
        applicableCategories,
        userUsageLimit,
    } = req.body;

    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
        coupon.code = code;
        coupon.description = description;
        coupon.type = type;
        coupon.value = value;
        coupon.minOrderValue = minOrderValue;
        coupon.maxDiscountValue = maxDiscountValue;
        coupon.startDate = startDate;
        coupon.endDate = endDate;
        coupon.usageLimit = usageLimit;
        coupon.isActive = isActive;
        coupon.applicableProducts = applicableProducts;
        coupon.applicableCategories = applicableCategories;
        coupon.userUsageLimit = userUsageLimit;

        const updatedCoupon = await coupon.save();
        res.json(updatedCoupon);
    } else {
        res.status(404);
        throw new Error('Coupon not found');
    }
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
        await coupon.remove();
        res.json({ message: 'Coupon removed' });
    } else {
        res.status(404);
        throw new Error('Coupon not found');
    }
});

// @desc    Validate a coupon
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = asyncHandler(async (req, res) => {
    const { code, orderValue } = req.body;

    const coupon = await Coupon.findOne({ code });

    if (!coupon) {
        res.status(404);
        throw new Error('Invalid coupon code');
    }

    if (!coupon.isValid()) {
        res.status(400);
        throw new Error('Coupon is not valid');
    }

    if (orderValue < coupon.minOrderValue) {
        res.status(400);
        throw new Error(`Minimum order value is ${coupon.minOrderValue}`);
    }

    let discountAmount = 0;
    if (coupon.type === 'percentage') {
        discountAmount = (orderValue * coupon.value) / 100;
        if (coupon.maxDiscountValue) {
            discountAmount = Math.min(discountAmount, coupon.maxDiscountValue);
        }
    } else {
        discountAmount = coupon.value;
    }

    res.json({
        coupon,
        discountAmount,
    });
});

module.exports = {
    getCoupons,
    getCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
}; 