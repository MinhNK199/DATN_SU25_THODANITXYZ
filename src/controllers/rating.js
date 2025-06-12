import mongoose from 'mongoose';
import Product from '../models/product';
import { Rating } from '../models/Rating';
import { containsBadWords, filterBadWords } from '../utils/BadWords';

// Lấy danh sách đánh giá
export const getRatings = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    const ratings = await Rating.find()
      .populate('userId', 'name email')
      .populate('productId', 'name price')
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Rating.countDocuments();

    res.status(200).json({
      data: ratings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
};

// Tạo đánh giá mới
export const createRating = async (req, res) => {
  try {
    const { productId, rating, comment, images } = req.body;
    const userId = req.user._id;

    // Kiểm tra ObjectId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_PRODUCT_ID',
          message: 'ID sản phẩm không hợp lệ'
        }
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Sản phẩm không tồn tại'
        }
      });
    }

    const existed = await Rating.findOne({ userId, productId });
    if (existed) {
      return res.status(400).json({
        error: {
          code: 'ALREADY_RATED',
          message: 'Bạn đã đánh giá sản phẩm này rồi'
        }
      });
    }

    if (comment && containsBadWords(comment)) {
      return res.status(400).json({
        error: {
          code: 'BAD_WORDS_DETECTED',
          message: 'Comment chứa từ ngữ không phù hợp'
        }
      });
    }

    const filteredComment = comment ? filterBadWords(comment) : comment;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        error: {
          code: 'INVALID_RATING',
          message: 'Rating phải từ 1 đến 5'
        }
      });
    }

    const newRating = new Rating({
      userId,
      productId,
      rating,
      comment: filteredComment,
      images
    });

    await newRating.save();

    const productRatings = await Rating.find({ productId });
    const avgRating = productRatings.reduce((acc, curr) => acc + curr.rating, 0) / productRatings.length;

    await Product.findByIdAndUpdate(productId, {
      averageRating: avgRating,
      numReviews: productRatings.length
    });

    res.status(201).json({
      data: newRating,
      message: 'Tạo đánh giá thành công'
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
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
          code: 'INVALID_RATING_ID',
          message: 'ID đánh giá không hợp lệ'
        }
      });
    }

    const existingRating = await Rating.findById(id);
    if (!existingRating) {
      return res.status(404).json({
        error: {
          code: 'RATING_NOT_FOUND',
          message: 'Đánh giá không tồn tại'
        }
      });
    }

    if (existingRating.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Không có quyền cập nhật đánh giá này'
        }
      });
    }

    if (comment && containsBadWords(comment)) {
      return res.status(400).json({
        error: {
          code: 'BAD_WORDS_DETECTED',
          message: 'Comment chứa từ ngữ không phù hợp'
        }
      });
    }

    const filteredComment = comment ? filterBadWords(comment) : comment;

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_RATING',
          message: 'Rating phải từ 1 đến 5'
        }
      });
    }

    existingRating.rating = rating ?? existingRating.rating;
    existingRating.comment = filteredComment ?? existingRating.comment;
    existingRating.images = images ?? existingRating.images;
    await existingRating.save();

    const productRatings = await Rating.find({ productId: existingRating.productId });
    const avgRating = productRatings.reduce((acc, curr) => acc + curr.rating, 0) / productRatings.length;

    await Product.findByIdAndUpdate(existingRating.productId, {
      averageRating: avgRating,
      numReviews: productRatings.length
    });

    res.status(200).json({
      data: existingRating,
      message: 'Cập nhật đánh giá thành công'
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
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
          code: 'INVALID_RATING_ID',
          message: 'ID đánh giá không hợp lệ'
        }
      });
    }

    const existingRating = await Rating.findById(id);
    if (!existingRating) {
      return res.status(404).json({
        error: {
          code: 'RATING_NOT_FOUND',
          message: 'Đánh giá không tồn tại'
        }
      });
    }

    if (existingRating.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Không có quyền xóa đánh giá này'
        }
      });
    }

    await Rating.findByIdAndDelete(id);

    const productRatings = await Rating.find({ productId: existingRating.productId });
    const avgRating = productRatings.length > 0
      ? productRatings.reduce((acc, curr) => acc + curr.rating, 0) / productRatings.length
      : 0;

    await Product.findByIdAndUpdate(existingRating.productId, {
      averageRating: avgRating,
      numReviews: productRatings.length
    });

    res.status(200).json({
      message: 'Xóa đánh giá thành công'
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      }
    });
  }
};