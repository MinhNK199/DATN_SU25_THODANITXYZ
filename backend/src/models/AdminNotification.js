import mongoose from "mongoose";

const adminNotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Vui lòng liên kết với admin'],
    },
    title: {
        type: String,
        required: [true, 'Vui lòng nhập tiêu đề thông báo'],
    },
    message: {
        type: String,
        required: [true, 'Vui lòng nhập nội dung thông báo'],
    },
    type: {
        type: String,
        enum: {
            values: ['message', 'info', 'success', 'warning', 'error'],
            message: 'Loại thông báo không hợp lệ',
        },
        default: 'info',
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    link: {
        type: String,
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
    },
    expiresAt: {
        type: Date,
    },
}, {
    timestamps: true,
    versionKey: false,
});

// Tạo index để tối ưu truy vấn
adminNotificationSchema.index({ user: 1, createdAt: -1 });
adminNotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AdminNotification = mongoose.model("AdminNotification", adminNotificationSchema);
export default AdminNotification;
