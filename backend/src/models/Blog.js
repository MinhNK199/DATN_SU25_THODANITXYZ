import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Vui lòng nhập tiêu đề bài viết'],
        trim: true,
        unique: true,
    },
    slug: {
        type: String,
        unique: true,
        required: [true, 'Vui lòng nhập slug'],
        match: [/^[a-z0-9-]+$/, 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang'],
    },
    content: {
        type: String,
        required: [true, 'Vui lòng nhập nội dung bài viết'],
    },
    summary: {
        type: String,
        maxlength: [300, 'Tóm tắt không quá 300 ký tự'],
    },
    coverImage: {
        type: String,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    tags: [{
        type: String,
        trim: true,
    }],
    isPublished: {
        type: Boolean,
        default: false,
    },
    publishedAt: {
        type: Date,
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

// Tạo slug tự động nếu chưa có
blogSchema.pre('save', function(next) {
    if (!this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/-+/g, '-');
    }
    next();
});

export default mongoose.model('Blog', blogSchema); 