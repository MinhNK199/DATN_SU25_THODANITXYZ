import mongoose from "mongoose";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Rating from "../models/Rating.js";
import { containsBadWords, filterBadWords } from "../utils/BadWords.js";
import Sentiment from "sentiment";

// Lấy danh sách đánh giá (có lọc, phân trang, sort)
export const getRatings = async (req, res) => {
  try {
    const { page = 1, limit = 10, productId, star, replyStatus, hasImage, sort } = req.query;

    const filter = {};
    if (productId) filter.productId = productId;
    if (star) filter.rating = Number(star);
    if (replyStatus === "replied") filter.reply = { $ne: "" };
    if (replyStatus === "not_replied") filter.reply = { $eq: "" };
    if (hasImage) filter.images = { $exists: true, $ne: [] };

    const sortOption = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    const ratings = await Rating.find(filter)
      .populate("userId", "name email") 
      .populate("productId", "name price images") // ✅ lấy product info
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Rating.countDocuments(filter);

    res.json({
      data: ratings,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getRatingDetail = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id)
      .populate("userId", "name email")
      .populate("productId", "name price image");

    if (!rating)
      return res.status(404).json({ message: "Không tìm thấy đánh giá" });

    res.json(rating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// Tạo đánh giá
export const createRating = async (req, res) => {
  try {
    const { productId, orderId, rating, comment, images } = req.body;
    const userId = req.user._id;

    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(orderId)
    ) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    // kiểm tra user có mua trong order này chưa
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
      "orderItems.product": productId,
      status: { $in: ["completed", "delivered"] },
    });
    if (!order) {
      return res
        .status(403)
        .json({ message: "Bạn chỉ có thể đánh giá sản phẩm trong đơn đã mua" });
    }

    // kiểm tra đã đánh giá trong order này chưa
    const existed = await Rating.findOne({ userId, productId, orderId });
    if (existed) {
      return res
        .status(400)
        .json({
          message: "Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi",
        });
    }

    const newRating = new Rating({
      userId,
      productId,
      orderId,
      rating,
      comment,
      images,
    });

    await newRating.save();

    res.status(201).json({
      data: newRating,
      message: "Tạo đánh giá thành công",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check user đã rating chưa
export const checkUserRating = async (req, res) => {
  try {
    const { productId, orderId } = req.query;
    const userId = req.user._id;

    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(orderId)
    ) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const rating = await Rating.findOne({ userId, productId, orderId });

    res.json({
      hasRated: !!rating,
      rating,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật đánh giá
export const updateRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, images } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: {
          code: "INVALID_RATING_ID",
          message: "ID đánh giá không hợp lệ",
        },
      });
    }

    const existingRating = await Rating.findById(id);
    if (!existingRating) {
      return res.status(404).json({
        error: {
          code: "RATING_NOT_FOUND",
          message: "Đánh giá không tồn tại",
        },
      });
    }

    if (existingRating.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Không có quyền cập nhật đánh giá này",
        },
      });
    }

    if (comment && containsBadWords(comment)) {
      return res.status(400).json({
        error: {
          code: "BAD_WORDS_DETECTED",
          message: "Comment chứa từ ngữ không phù hợp",
        },
      });
    }

    const filteredComment = comment ? filterBadWords(comment) : comment;

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        error: {
          code: "INVALID_RATING",
          message: "Rating phải từ 1 đến 5",
        },
      });
    }

    existingRating.rating =
      typeof rating !== "undefined" ? rating : existingRating.rating;
    existingRating.comment =
      typeof filteredComment !== "undefined"
        ? filteredComment
        : existingRating.comment;
    existingRating.images =
      typeof images !== "undefined" ? images : existingRating.images;
    await existingRating.save();

    const productRatings = await Rating.find({
      productId: existingRating.productId,
    });
    const avgRating =
      productRatings.reduce((acc, curr) => acc + curr.rating, 0) /
      productRatings.length;

    await Product.findByIdAndUpdate(existingRating.productId, {
      averageRating: avgRating,
      numReviews: productRatings.length,
    });

    res.status(200).json({
      data: existingRating,
      message: "Cập nhật đánh giá thành công",
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      },
    });
  }
};

// Xóa đánh giá
export const deleteRating = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: {
          code: "INVALID_RATING_ID",
          message: "ID đánh giá không hợp lệ",
        },
      });
    }

    const existingRating = await Rating.findById(id);
    if (!existingRating) {
      return res.status(404).json({
        error: {
          code: "RATING_NOT_FOUND",
          message: "Đánh giá không tồn tại",
        },
      });
    }

    if (existingRating.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Không có quyền xóa đánh giá này",
        },
      });
    }

    await Rating.findByIdAndDelete(id);

    const productRatings = await Rating.find({
      productId: existingRating.productId,
    });
    const avgRating =
      productRatings.length > 0
        ? productRatings.reduce((acc, curr) => acc + curr.rating, 0) /
          productRatings.length
        : 0;

    await Product.findByIdAndUpdate(existingRating.productId, {
      averageRating: avgRating,
      numReviews: productRatings.length,
    });

    res.status(200).json({
      message: "Xóa đánh giá thành công",
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      },
    });
  }
};

// Phân tích cảm xúc đánh giá
export const analyzeSentiment = async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment || typeof comment !== "string") {
      return res.status(400).json({
        error: {
          code: "INVALID_COMMENT",
          message: "Comment không hợp lệ",
        },
      });
    }
    const sentiment = new Sentiment();
    const result = sentiment.analyze(comment);
    // Xác định loại cảm xúc
    let sentimentType = "neutral";
    if (result.score > 0) sentimentType = "positive";
    else if (result.score < 0) sentimentType = "negative";
    res.status(200).json({
      sentiment: sentimentType,
      score: result.score,
      comparative: result.comparative,
      words: result.words,
      positive: result.positive,
      negative: result.negative,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      },
    });
  }
};

// Trả lời bình luận đánh giá (chỉ được trả lời 1 lần, không cho sửa)
export const replyRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: {
          code: "INVALID_RATING_ID",
          message: "ID đánh giá không hợp lệ",
        },
      });
    }

    const rating = await Rating.findById(id);
    if (!rating) {
      return res.status(404).json({
        error: {
          code: "RATING_NOT_FOUND",
          message: "Đánh giá không tồn tại",
        },
      });
    }

    // Nếu đã có trả lời thì không cho sửa
    if (rating.reply && rating.reply.trim() !== "") {
      return res.status(403).json({
        error: {
          code: "ALREADY_REPLIED",
          message: "Đánh giá này đã được trả lời và không thể sửa",
        },
      });
    }

    rating.reply = reply;
    await rating.save();

    res.status(200).json({
      data: rating,
      message: "Trả lời bình luận thành công",
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      },
    });
  }
};
