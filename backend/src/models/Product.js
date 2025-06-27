import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên biến thể'],
        trim: true,
    },
    sku: {
        type: String,
        unique: true,
        sparse: true,
    },
    price: {
        type: Number,
        required: [true, 'Vui lòng nhập giá biến thể'],
        min: [0, 'Giá biến thể không được nhỏ hơn 0'],
    },
    salePrice: {
        type: Number,
        min: [0, 'Giá khuyến mãi không được nhỏ hơn 0'],
    },
    stock: {
        type: Number,
        required: [true, 'Vui lòng nhập số lượng tồn kho'],
        min: [0, 'Số lượng tồn kho không được nhỏ hơn 0'],
        default: 0,
    },
    color: {
        type: String,
        trim: true,
    },
    size: {
        type: String,
        trim: true,
    },
    weight: {
        type: Number,
        min: 0,
    },
    images: [{
        type: String,
    }],
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true,
    versionKey: false,
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên sản phẩm'],
        trim: true,
        index: true,
    },
    slug: {
        type: String,
        unique: true,
    },
    description: {
        type: String,
        required: [true, 'Vui lòng nhập mô tả sản phẩm'],
    },
    price: {
        type: Number,
        required: [true, 'Vui lòng nhập giá sản phẩm'],
        min: [0, 'Giá sản phẩm không được nhỏ hơn 0'],
        index: true,
    },
    salePrice: {
        type: Number,
        min: [0, 'Giá khuyến mãi không được nhỏ hơn 0'],
    },
    images: [{
        type: String,
        required: [true, 'Vui lòng thêm ảnh sản phẩm'],
    }],
    videos: [{
        type: String, // link YouTube, mp4, v.v.
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Vui lòng chọn danh mục sản phẩm'],
        index: true,
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: [true, 'Vui lòng chọn thương hiệu'],
        index: true,
    },
    stock: {
        type: Number,
        required: [true, 'Vui lòng nhập số lượng tồn kho'],
        min: [0, 'Số lượng tồn kho không được nhỏ hơn 0'],
        default: 0,
        index: true,
    },
    variants: [productVariantSchema],
    specifications: {
        type: Map,
        of: String,
    },
    features: [String],
    ratings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        rating: {
            type: Number,
            min: [1, 'Đánh giá tối thiểu là 1'],
            max: [5, 'Đánh giá tối đa là 5'],
        },
        review: String,
        date: {
            type: Date,
            default: Date.now,
        },
    }],
    averageRating: {
        type: Number,
        default: 0,
        index: true,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    tags: [{
        type: String,
        trim: true,
    }],
    meta: {
        metaTitle: String,
        metaDescription: String,
        metaImage: String,
    },
    questions: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        question: String,
        answer: String,
        createdAt: { type: Date, default: Date.now },
        answeredAt: Date,
    }],
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    flashSale: {
        price: Number,
        start: Date,
        end: Date,
    },
    discounts: [{
        type: {
            type: String, // percentage, fixed, voucher...
        },
        value: Number,
        description: String,
        start: Date,
        end: Date,
    }],
    sku: {
        type: String,
        unique: true,
        sparse: true,
    },
    weight: {
        type: Number,
        min: 0,
    },
    dimensions: {
        length: Number,
        width: Number,
        height: Number,
    },
    warranty: {
        type: Number,
        min: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true,
    versionKey: false,
});

// Tạo slug tự động từ tên sản phẩm
productSchema.pre('save', function(next) {
    this.slug = this.name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-');
    next();
});

// Tạo compound index cho tìm kiếm nâng cao
productSchema.index({ 
    name: 'text', 
    description: 'text',
    tags: 'text'
});

const Product = mongoose.model("Product", productSchema);
export default Product;
