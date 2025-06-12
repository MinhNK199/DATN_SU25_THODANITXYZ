import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên sản phẩm'],
        trim: true,
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
    },
    salePrice: {
        type: Number,
        min: [0, 'Giá khuyến mãi không được nhỏ hơn 0'],
    },
    images: [{
        type: String,
        required: [true, 'Vui lòng thêm ảnh sản phẩm'],
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Vui lòng chọn danh mục sản phẩm'],
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: [true, 'Vui lòng chọn thương hiệu'],
    },
    stock: {
        type: Number,
        required: [true, 'Vui lòng nhập số lượng tồn kho'],
        min: [0, 'Số lượng tồn kho không được nhỏ hơn 0'],
        default: 0,
    },
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
    },
    numReviews: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
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

const Product = mongoose.model("Product", productSchema);
export default Product;
