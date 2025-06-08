const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Please add a coupon code'],
        unique: true,
        uppercase: true,
        trim: true,
    },
    description: {
        type: String,
    },
    type: {
        type: String,
        required: true,
        enum: ['percentage', 'fixed'],
    },
    value: {
        type: Number,
        required: true,
        min: 0,
    },
    minOrderValue: {
        type: Number,
        default: 0,
    },
    maxDiscountValue: {
        type: Number,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    usageLimit: {
        type: Number,
        default: 1,
    },
    usageCount: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }],
    applicableCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    }],
    userUsageLimit: {
        type: Number,
        default: 1,
    },
    usedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        count: {
            type: Number,
            default: 0,
        },
    }],
}, {
    timestamps: true,
});

// Check if coupon is valid
couponSchema.methods.isValid = function() {
    const now = new Date();
    return (
        this.isActive &&
        now >= this.startDate &&
        now <= this.endDate &&
        this.usageCount < this.usageLimit
    );
};

module.exports = mongoose.model('Coupon', couponSchema); 