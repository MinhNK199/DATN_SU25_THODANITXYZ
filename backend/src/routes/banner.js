import express from "express";
import {
    createBanner,
    getBannerById,
    getAllBanners,
    updateBanner,
    deleteBanner,
} from "../controllers/banner.js";
import { protect } from "../middlewares/authMiddleware.js";
import { uploadBanner } from "../middlewares/updateMiddleware.js";

const routerBanner = express.Router();

// Lấy tất cả banner
routerBanner.get("/", getAllBanners);

// Lấy banner theo ID
routerBanner.get("/:id", getBannerById);

// Tạo banner mới (có upload ảnh)
routerBanner.post(
    "/",
    uploadBanner.single("image"),
    createBanner
);


// Cập nhật banner (có thể upload ảnh mới)
routerBanner.put(
    "/:id",
    protect,
    uploadBanner.single("image"),
    updateBanner
);

// Xóa banner
routerBanner.delete("/:id", protect, deleteBanner);

export default routerBanner;