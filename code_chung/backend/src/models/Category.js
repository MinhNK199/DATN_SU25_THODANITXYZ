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
        required: [true, 'Vui lòng nhập slug'],
        match: [/^[a-z0-9-]+$/, 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang'],
    },
    description: {
        type: String,
    },
    image: {
        type: String,
        required: [true, 'Vui lòng nhập URL hình ảnh'],
    },
    icon: {
        type: String,
    },
    color: {
        type: String,
        default: '#1890ff',
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
    isActive: {
        type: Boolean,
        default: true,
    },
    order: {
        type: Number,
        default: 0,
    },
    metaTitle: {
        type: String,
        maxlength: [60, 'Meta title không được quá 60 ký tự'],
    },
    metaDescription: {
        type: String,
        maxlength: [160, 'Meta description không được quá 160 ký tự'],
    },
    deletedAt: {
        type: Date,
        default: null,
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
}, {
    timestamps: true,
    versionKey: false,
});

// Tạo slug từ tên danh mục nếu không được cung cấp
categorySchema.pre('save', function(next) {
    if (!this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // chỉ cho phép a-z, số và dấu '-'
            .replace(/^-+|-+$/g, '')     // bỏ dấu '-' đầu cuối
            .replace(/-+/g, '-');        // gom nhiều '-' thành 1
    }
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
