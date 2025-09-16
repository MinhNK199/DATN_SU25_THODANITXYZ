import mongoose from "mongoose"

// Schema cho variant color - FIXED STRUCTURE
const colorSchema = new mongoose.Schema({
    code: {
        type: String,
        trim: true,
        default: "#000000",
        required: true,
    },
    name: {
        type: String,
        trim: true,
        default: "",
    },
}, { _id: false }, )

const productVariantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    sku: {
        type: String,
        trim: true,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    salePrice: {
        type: Number,
        min: 0,
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    color: {
        type: colorSchema,
        default: () => ({ code: "#000000", name: "" }),
    },
    size: {
        type: Number,
    },
    length: {
        type: Number,
    },
    width: {
        type: Number,
    },
    height: {
        type: Number,
    },
    weight: {
        type: Number,
        min: 0,
    },
    images: [{
        type: String,
    }, ],
    additionalImages: [{
        type: String,
    }, ],
    isActive: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
    specifications: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: true,
    versionKey: false,
}, )

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Vui lòng nhập tên sản phẩm"],
        trim: true,
        index: true,
    },
    slug: {
        type: String,
        unique: true,
    },
    description: {
        type: String,
        required: [true, "Vui lòng nhập mô tả sản phẩm"],
    },
    price: {
        type: Number,
        required: [true, "Vui lòng nhập giá sản phẩm"],
        min: [0, "Giá sản phẩm không được nhỏ hơn 0"],
        index: true,
    },
    salePrice: {
        type: Number,
        min: [0, "Giá khuyến mãi không được nhỏ hơn 0"],
    },
    images: [{
        type: String,
        required: [true, "Vui lòng thêm ảnh sản phẩm"],
    }, ],
    additionalImages: [{
        type: String,
    }, ],
    thumbnails: [{
        type: String,
    }, ],
    videos: [{
        type: String, // link YouTube, mp4, v.v.
    }, ],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Vui lòng chọn danh mục sản phẩm"],
        index: true,
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
        required: [true, "Vui lòng chọn thương hiệu"],
        index: true,
    },
    stock: {
        type: Number,
        required: [true, "Vui lòng nhập số lượng tồn kho"],
        min: [0, "Số lượng tồn kho không được nhỏ hơn 0"],
        default: 0,
        index: true,
    },
    variants: [productVariantSchema],
    specifications: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    features: [String],
    ratings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        rating: {
            type: Number,
            min: [1, "Đánh giá tối thiểu là 1"],
            max: [5, "Đánh giá tối đa là 5"],
        },
        review: String,
        date: {
            type: Date,
            default: Date.now,
        },
    }, ],
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
    }, ],
    meta: {
        metaTitle: String,
        metaDescription: String,
        metaImage: String,
    },
    questions: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        question: String,
        answer: String,
        createdAt: { type: Date, default: Date.now },
        answeredAt: Date,
    }, ],
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
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
    }, ],
    vouchers: [{
        code: { type: String, trim: true, required: true },
        discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
        value: { type: Number, default: 0 },
        startDate: { type: Date },
        endDate: { type: Date },
        usageLimit: { type: Number, default: 0 }, // 0 = không giới hạn
        usedCount: { type: Number, default: 0 },
        minOrderValue: { type: Number, default: 0 },
    }, ],
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
    },
}, {
    timestamps: true,
    versionKey: false,
}, )

// Pre-save middleware để validate và clean data - CRITICAL FIX
productSchema.pre("save", function(next) {
    // Tạo slug tự động từ tên sản phẩm
    if (this.name) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]/g, "-")
            .replace(/-+/g, "-")
    }

    // Validate và clean variants
    if (this.variants && Array.isArray(this.variants)) {
        this.variants = this.variants.map((variant, index) => {
            // Ensure color is always a proper object
            if (!variant.color || typeof variant.color !== "object") {
                variant.color = { code: "#000000", name: "" }
            } else {
                // Ensure color object has proper structure
                if (typeof variant.color.code !== "string") {
                    variant.color.code = "#000000"
                }
                if (typeof variant.color.name !== "string") {
                    variant.color.name = ""
                }
            }

            // Ensure specifications is always an object
            if (!variant.specifications || typeof variant.specifications !== "object") {
                variant.specifications = {}
            }

            return variant
        })
    }

    // Ensure main specifications is always an object
    if (!this.specifications || typeof this.specifications !== "object") {
        this.specifications = {}
    }

    next()
})

// Tạo compound index cho tìm kiếm nâng cao
productSchema.index({
    name: "text",
    description: "text",
    tags: "text",
})

// Additional indexes for better performance
productSchema.index({ category: 1, isActive: 1 })
productSchema.index({ brand: 1, isActive: 1 })
productSchema.index({ price: 1, isActive: 1 })
productSchema.index({ averageRating: -1 })
productSchema.index({ createdAt: -1 })
productSchema.index({ isFeatured: 1, isActive: 1 })

const Product = mongoose.model("Product", productSchema)
export default Product