const express = require('express');
const router = express.Router();
const {
    createOrder,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    getMyOrders,
    getOrders,
    updateOrderStatus,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   POST /api/orders
router.route('/').post(protect, createOrder).get(protect, admin, getOrders);

// @route   GET /api/orders/myorders
router.route('/myorders').get(protect, getMyOrders);

// @route   GET /api/orders/:id
router.route('/:id').get(protect, getOrderById);

// @route   PUT /api/orders/:id/pay
router.route('/:id/pay').put(protect, updateOrderToPaid);

// @route   PUT /api/orders/:id/deliver
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);

// @route   PUT /api/orders/:id/status
router.route('/:id/status').put(protect, admin, updateOrderStatus);

module.exports = router; 