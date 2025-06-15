import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true
    },
    images: [{
        type: String,
        trim: true
    }],
    date: {
        type: Date,
        default: Date.now,
    },
    reply: { // Thêm trường trả lời
        type: String,
        default: "",
    }
}, {
    timestamps: true
});

// Index để tối ưu query
ratingSchema.index({ userId: 1, productId: 1 });
ratingSchema.index({ productId: 1, createdAt: -1 });

export const Rating = mongoose.model('Rating', ratingSchema);

