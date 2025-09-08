import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Vui lòng nhập mã giảm giá'],
        unique: true,
        uppercase: true,
        trim: true,
    },
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên mã giảm giá'],
        trim: true,
    },
    description: {
        type: String,
    },
    type: {
        type: String,
        required: [true, 'Vui lòng chọn loại giảm giá'],
        enum: {
            values: ['percentage', 'fixed'],
            message: 'Loại giảm giá không hợp lệ (percentage hoặc fixed)',
        },
    },
    discount: {
        type: Number,
        required: [true, 'Vui lòng nhập giá trị giảm giá'],
        min: [0, 'Giá trị giảm giá phải lớn hơn hoặc bằng 0'],
    },
    // Giữ lại field cũ để tương thích
    value: {
        type: Number,
        min: [0, 'Giá trị giảm giá phải lớn hơn hoặc bằng 0'],
    },
    minAmount: {
        type: Number,
        default: 0,
    },
    // Giữ lại field cũ để tương thích
    minOrderValue: {
        type: Number,
        default: 0,
    },
    maxDiscount: {
        type: Number,
    },
    // Giữ lại field cũ để tương thích
    maxDiscountValue: {
        type: Number,
    },
    startDate: {
        type: Date,
        required: [true, 'Vui lòng nhập ngày bắt đầu'],
    },
    endDate: {
        type: Date,
        required: [true, 'Vui lòng nhập ngày kết thúc'],
    },
    usageLimit: {
        type: Number,
        default: 1,
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    // Giữ lại field cũ để tương thích
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
    applyToAllProducts: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Kiểm tra coupon còn hiệu lực không
couponSchema.methods.isValid = function () {
    const now = new Date();
    return (
        this.isActive &&
        now >= this.startDate &&
        now <= this.endDate &&
        this.usedCount < this.usageLimit
    );
};

// Virtual để lấy giá trị discount (ưu tiên field mới)
couponSchema.virtual('discountValue').get(function () {
    return this.discount !== undefined ? this.discount : this.value;
});

// Virtual để lấy min amount (ưu tiên field mới)
couponSchema.virtual('minAmountValue').get(function () {
    return this.minAmount !== undefined ? this.minAmount : this.minOrderValue;
});

// Virtual để lấy max discount (ưu tiên field mới)
couponSchema.virtual('maxDiscountAmount').get(function () {
    return this.maxDiscount !== undefined ? this.maxDiscount : this.maxDiscountValue;
});

// Virtual để lấy used count (ưu tiên field mới)
couponSchema.virtual('usedCountValue').get(function () {
    return this.usedCount !== undefined ? this.usedCount : this.usageCount;
});

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;


