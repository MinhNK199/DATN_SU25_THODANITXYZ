import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { analyzeSentiment, createRating, deleteRating, getRatings, replyRating, updateRating } from "../controllers/rating.js";

const router = Router();

// Lấy danh sách đánh giá
router.get("/", getRatings);

// Tạo đánh giá mới (yêu cầu đăng nhập)
router.post("/", protect, createRating);

// Cập nhật đánh giá (yêu cầu đăng nhập)
router.put("/:id", protect, updateRating);

// Xóa đánh giá (yêu cầu đăng nhập)
router.delete("/:id", protect, deleteRating);

// Phân tích cảm xúc đánh giá
router.post("/analyze-sentiment", analyzeSentiment);

router.post("/:id/reply", protect, replyRating);

export default router;