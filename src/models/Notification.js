const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['order', 'promotion', 'system', 'other'],
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
});

// Index for efficient querying
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema); 