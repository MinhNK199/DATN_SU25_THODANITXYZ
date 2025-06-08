const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a category name'],
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
});

// Create slug from name
categorySchema.pre('save', function(next) {
    this.slug = this.name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-');
    next();
});

// Update level based on parent
categorySchema.pre('save', async function(next) {
    if (this.parent) {
        const parentCategory = await this.constructor.findById(this.parent);
        if (parentCategory) {
            this.level = parentCategory.level + 1;
        }
    }
    next();
});

module.exports = mongoose.model('Category', categorySchema); 