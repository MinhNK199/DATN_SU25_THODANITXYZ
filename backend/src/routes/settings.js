import express from "express";
import { getSettings, updateSettings, resetSettings } from "../controllers/settings.js";
import { protect } from "../middlewares/authMiddleware.js";

const routerSettings = express.Router();

// Tất cả routes đều cần authentication
routerSettings.use(protect);

// Lấy cài đặt
routerSettings.get("/", getSettings);

// Cập nhật cài đặt
routerSettings.put("/", updateSettings);

// Reset cài đặt về mặc định
routerSettings.post("/reset", resetSettings);

export default routerSettings;
