import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    images: [{ type: String, required: true }],
    category: { type: String, required: true }, // Đổi từ ObjectId sang String
    brand: { type: String, required: true }, // Đổi từ ObjectId sang String
    stock: { type: Number, required: true, min: 0, default: 0 },
    specifications: { type: Map, of: String },
    features: [String],
    ratings: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        review: String,
        date: { type: Date, default: Date.now },
    }, ],
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
}, {
    timestamps: true,
    versionKey: false,
});

export default mongoose.model("Product", productSchema);