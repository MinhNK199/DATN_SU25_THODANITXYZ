import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import { createRating, deleteRating, getRatings, replyRating, updateRating } from "../controllers/rating";

const router = Router();

// Lấy danh sách đánh giá
router.get("/", getRatings);

// Tạo đánh giá mới (yêu cầu đăng nhập)
router.post("/", protect, createRating);

// Cập nhật đánh giá (yêu cầu đăng nhập)
router.put("/:id", protect, updateRating);

// Xóa đánh giá (yêu cầu đăng nhập)
router.delete("/:id", protect, deleteRating);

router.post("/:id/reply", protect, replyRating);

export default router;
