import express from "express";
import {
    getNotifications,
    getNotificationById,
    createNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadNotificationCount
} from "../controllers/notification";
import { protect } from "../middlewares/authMiddleware";

const routerNotifi = express.Router();

routerNotifi.get("/", protect, getNotifications);
routerNotifi.get("/unread-count", protect, getUnreadNotificationCount);
routerNotifi.get("/:id", protect, getNotificationById);
routerNotifi.post("/", protect, createNotification);
routerNotifi.put("/:id/read", protect, markNotificationAsRead);
routerNotifi.put("/read-all", protect, markAllNotificationsAsRead);
routerNotifi.delete("/:id", protect, deleteNotification);

export default routerNotifi;