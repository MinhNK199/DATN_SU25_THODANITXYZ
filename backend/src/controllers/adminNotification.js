import AdminNotification from "../models/AdminNotification.js";

// Lấy thông báo admin (phân trang)
export const getAdminNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        
        const notifications = await AdminNotification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await AdminNotification.countDocuments({ user: req.user._id });
        
        res.json({
            notifications,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy thông báo theo id
export const getAdminNotificationById = async (req, res) => {
    try {
        const notification = await AdminNotification.findOne({
            _id: req.params.id,
            user: req.user._id,
        });
        if (!notification) return res.status(404).json({ message: "Không tìm thấy thông báo" });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo thông báo admin mới
export const createAdminNotification = async (req, res) => {
    try {
        const { title, message, type, link, data, expiresAt } = req.body;
        const notification = new AdminNotification({
            user: req.user._id,
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
export const markAdminNotificationAsRead = async (req, res) => {
    try {
        const notification = await AdminNotification.findOne({
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
export const markAllAdminNotificationsAsRead = async (req, res) => {
    try {
        await AdminNotification.updateMany(
            { user: req.user._id, isRead: false },
            { isRead: true }
        );
        res.json({ message: "Đã đánh dấu tất cả thông báo là đã đọc" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa thông báo
export const deleteAdminNotification = async (req, res) => {
    try {
        const notification = await AdminNotification.findOne({
            _id: req.params.id,
            user: req.user._id,
        });
        if (!notification) return res.status(404).json({ message: "Không tìm thấy thông báo" });

        await AdminNotification.findByIdAndDelete(req.params.id);
        res.json({ message: "Đã xóa thông báo" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Đếm số lượng thông báo chưa đọc
export const getUnreadAdminNotificationCount = async (req, res) => {
    try {
        const count = await AdminNotification.countDocuments({
            user: req.user._id,
            isRead: false,
            $or: [
                { expiresAt: { $exists: false } },
                { expiresAt: { $gt: new Date() } }
            ]
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
