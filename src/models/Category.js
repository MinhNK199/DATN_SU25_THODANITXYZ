import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên danh mục'],
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
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
    level: {
        type: Number,
        default: 1,
    },
    image: {
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

// Tạo slug từ tên danh mục
categorySchema.pre('save', function(next) {
    this.slug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // chỉ cho phép a-z, số và dấu '-'
        .replace(/^-+|-+$/g, '')     // bỏ dấu '-' đầu cuối
        .replace(/-+/g, '-');        // gom nhiều '-' thành 1
    next();
});

// Cập nhật level dựa trên parent
categorySchema.pre('save', async function(next) {
    if (this.parent) {
        const parentCategory = await this.constructor.findById(this.parent);
        if (parentCategory) {
            this.level = parentCategory.level + 1;
        }
    }
    next();
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
