import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { analyzeSentiment, createRating, deleteRating, getRatings, replyRating, checkUserRating, updateRating, getRatingDetail } from "../controllers/rating.js";

const routerRating = Router();

// Lấy danh sách đánh giá
routerRating.get("/", getRatings);

// Tạo đánh giá mới (yêu cầu đăng nhập)
routerRating.post("/", protect, createRating);

// Cập nhật đánh giá (yêu cầu đăng nhập)
routerRating.put("/:id", protect, updateRating);

routerRating.get('/check', protect, checkUserRating);

routerRating.get("/:id", protect, getRatingDetail);

// Xóa đánh giá (yêu cầu đăng nhập)
routerRating.delete("/:id", protect, deleteRating);

// Phân tích cảm xúc đánh giá
routerRating.post("/analyze-sentiment", analyzeSentiment);

routerRating.post("/:id/reply", protect, replyRating);

export default routerRating;