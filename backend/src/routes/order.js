import express from "express";
import {
    createOrder,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    getMyOrders,
    getOrders,
    updateOrderStatus,
    getRevenueStats,
    updateOrderToPaidCOD,
    requestRefund,
    getValidOrderStatusOptions,
    handlePaymentFailed,
    confirmOrderAfterPayment
} from "../controllers/order.js";
import {
    createZaloPayOrder,
    checkZaloPayStatus,
    checkZaloPayStatusByOrderId,
    cancelZaloPayPayment,
    zalopayCallback
} from "../controllers/paymentZalopay.js";
import { protect } from "../middlewares/authMiddleware.js";

const routerOrder = express.Router();

// ========== BASIC ORDER ROUTES ==========
routerOrder.post("/", protect, createOrder);
routerOrder.get("/myorders", protect, getMyOrders);
routerOrder.get("/admin/revenue-stats", protect, getRevenueStats);
routerOrder.get("/", protect, getOrders);

// ========== ZALOPAY PAYMENT ROUTES ==========
routerOrder.post("/zalo-pay", protect, createZaloPayOrder);
routerOrder.post("/zalo-pay/callback", zalopayCallback);
routerOrder.get("/zalo-pay/status/:app_trans_id", checkZaloPayStatus);
routerOrder.get("/zalo-pay/status-by-order/:orderId", protect, checkZaloPayStatusByOrderId);
routerOrder.post("/zalo-pay/cancel", protect, cancelZaloPayPayment);

// ========== ORDER DETAIL & ACTIONS ==========
routerOrder.get("/:id", protect, getOrderById);
routerOrder.put("/:id/pay", protect, updateOrderToPaid);
routerOrder.put("/:id/deliver", protect, updateOrderToDelivered);
routerOrder.put("/:id/status", protect, updateOrderStatus);
routerOrder.put("/:id/paid-cod", protect, updateOrderToPaidCOD);
routerOrder.put("/:id/refund-request", protect, requestRefund);
routerOrder.get("/:id/valid-status", protect, getValidOrderStatusOptions);
routerOrder.put("/:id/cancel", protect, handlePaymentFailed);

// ========== PAYMENT STATUS MANAGEMENT ==========
// Route để cập nhật thanh toán thất bại
routerOrder.put("/:id/payment-failed", protect, async(req, res) => {
    try {
        const order = await handlePaymentFailed(req.params.id, req.body.reason);
        res.json({
            message: 'Đã cập nhật trạng thái thanh toán thất bại',
            order
        });
    } catch (error) {
        console.error("Lỗi cập nhật thanh toán thất bại:", error);
        res.status(500).json({ message: error.message });
    }
});

// Route để xác nhận đơn hàng sau thanh toán thành công (dành cho manual confirmation nếu cần)
routerOrder.put("/:id/confirm-payment", protect, async(req, res) => {
    try {
        const { paymentInfo } = req.body;
        const order = await confirmOrderAfterPayment(req.params.id, paymentInfo);
        res.json({
            message: 'Đã xác nhận thanh toán thành công',
            order
        });
    } catch (error) {
        console.error("Lỗi xác nhận thanh toán:", error);
        res.status(500).json({ message: error.message });
    }
});

// ========== ADMIN UTILITIES ==========
// Route để admin force update trạng thái đơn hàng (emergency cases)
routerOrder.put("/:id/admin/force-status", protect, async(req, res) => {
    try {
        // Kiểm tra quyền admin (thêm middleware admin nếu cần)
        const { status, reason } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        order.status = status;
        order.statusHistory.push({
            status,
            note: `Admin force update: ${reason || 'Không có lý do'}`,
            date: Date.now()
        });

        await order.save();
        res.json({
            message: 'Đã cập nhật trạng thái đơn hàng (Admin)',
            order
        });
    } catch (error) {
        console.error("Lỗi force update status:", error);
        res.status(500).json({ message: error.message });
    }
});

// Route để lấy thống kê đơn hàng theo trạng thái
routerOrder.get("/admin/stats/status", protect, async(req, res) => {
    try {
        const Order = (await
            import ("../models/Order.js")).default;

        const stats = await Order.aggregate([{
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$totalPrice" }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        const paymentStats = await Order.aggregate([{
            $group: {
                _id: "$paymentStatus",
                count: { $sum: 1 },
                totalAmount: { $sum: "$totalPrice" }
            }
        }]);

        res.json({
            orderStatusStats: stats,
            paymentStatusStats: paymentStats,
            message: "Thống kê trạng thái đơn hàng"
        });
    } catch (error) {
        console.error("Lỗi lấy thống kê:", error);
        res.status(500).json({ message: error.message });
    }
});

export default routerOrder;