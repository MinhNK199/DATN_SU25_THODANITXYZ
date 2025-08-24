import Notification from "../models/Notification.js";

// Lấy thông báo của user (phân trang)
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({}).sort({ date: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Lấy thông báo theo id
export const getNotificationById = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            user: req.user._id,
        });
        if (!notification) return res.status(404).json({ message: "Không tìm thấy thông báo" });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo thông báo mới
export const createNotification = async (req, res) => {
    try {
        const { user, title, message, type, link, data, expiresAt } = req.body;
        const notification = new Notification({
            user,
            title,
            message,
            type,
            link,
            data,
            expiresAt,
        });
        const createdNotification = await notification.save();
        res.status(201).json(createdNotification);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Đánh dấu đã đọc 1 thông báo
export const markNotificationAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            user: req.user._id,
        });
        if (!notification) return res.status(404).json({ message: "Không tìm thấy thông báo" });

        notification.isRead = true;
        const updatedNotification = await notification.save();
        res.json(updatedNotification);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Đánh dấu tất cả thông báo đã đọc
export const markAllNotificationsAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { isRead: true }
        );
        res.json({ message: "Đã đánh dấu tất cả thông báo là đã đọc" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa thông báo
export const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            user: req.user._id,
        });
        if (!notification) return res.status(404).json({ message: "Không tìm thấy thông báo" });

        await notification.remove();
        res.json({ message: "Đã xóa thông báo" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Đếm số lượng thông báo chưa đọc
export const getUnreadNotificationCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            user: req.user._id,
            isRead: false,
            expiresAt: { $gt: new Date() },
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};