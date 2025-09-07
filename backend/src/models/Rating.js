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
  orderId: {   // thêm trường này
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
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
  reply: {
    type: String,
    default: "",
  }
}, {
  timestamps: true
});

ratingSchema.index({ userId: 1, productId: 1, orderId: 1 });
ratingSchema.index({ productId: 1, createdAt: -1 });

const Rating = mongoose.model('Rating', ratingSchema);
export default Rating;
