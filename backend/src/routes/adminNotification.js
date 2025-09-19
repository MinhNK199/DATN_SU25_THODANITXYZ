import express from "express";
import {
    getAdminNotifications,
    getAdminNotificationById,
    createAdminNotification,
    markAdminNotificationAsRead,
    markAllAdminNotificationsAsRead,
    deleteAdminNotification,
    getUnreadAdminNotificationCount
} from "../controllers/adminNotification.js";
import { protect, checkAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Tất cả routes đều yêu cầu admin
router.use(protect, checkAdmin(['view_user']));

router.get("/", getAdminNotifications);
router.get("/unread-count", getUnreadAdminNotificationCount);
router.get("/:id", getAdminNotificationById);
router.post("/", createAdminNotification);
router.put("/:id/read", markAdminNotificationAsRead);
router.put("/read-all", markAllAdminNotificationsAsRead);
router.delete("/:id", deleteAdminNotification);

export default router;
