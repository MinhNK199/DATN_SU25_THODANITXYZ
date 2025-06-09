import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên thương hiệu'],
        trim: true,
        unique: true,
    },
    slug: {
        type: String,
        unique: true,
    },
    description: {
        type: String,
    },
    logo: {
        type: String,
    },
    website: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    order: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
    versionKey: false,
});

// Tạo slug từ tên
brandSchema.pre('save', function(next) {
    if (this.name) {
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')     // thay thế ký tự không hợp lệ
            .replace(/^-+|-+$/g, '');        // xóa dấu - ở đầu/cuối
    }
    next();
});

const Brand = mongoose.model("Brand", brandSchema);
export default Brand;
