const express = require('express');
const router = express.Router();
const {
    getUserNotifications,
    getNotificationById,
    createNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadNotificationCount,
} = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/notifications
router.route('/').get(protect, getUserNotifications).post(protect, admin, createNotification);

// @route   GET /api/notifications/:id
router
    .route('/:id')
    .get(protect, getNotificationById)
    .delete(protect, deleteNotification);

// @route   PUT /api/notifications/:id/read
router.put('/:id/read', protect, markNotificationAsRead);

// @route   PUT /api/notifications/read-all
router.put('/read-all', protect, markAllNotificationsAsRead);

// @route   GET /api/notifications/unread/count
router.get('/unread/count', protect, getUnreadNotificationCount);

module.exports = router; 