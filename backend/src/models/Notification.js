import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Vui lòng liên kết với người dùng'],
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
            values: ['order', 'promotion', 'system', 'other'],
            message: 'Loại thông báo không hợp lệ',
        },
        default: 'system',
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
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
