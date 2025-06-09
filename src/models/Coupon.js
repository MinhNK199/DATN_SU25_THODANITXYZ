import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Vui lòng nhập mã giảm giá'],
        unique: true,
        uppercase: true,
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
    value: {
        type: Number,
        required: [true, 'Vui lòng nhập giá trị giảm giá'],
        min: [0, 'Giá trị giảm giá phải lớn hơn hoặc bằng 0'],
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
    versionKey: false,
});

// Kiểm tra coupon còn hiệu lực không
couponSchema.methods.isValid = function() {
    const now = new Date();
    return (
        this.isActive &&
        now >= this.startDate &&
        now <= this.endDate &&
        this.usageCount < this.usageLimit
    );
};

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
