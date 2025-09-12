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
  requestReturn,
  confirmSatisfaction,
  confirmDelivery,
  cancelOrder,
  getValidOrderStatusOptions,
  handlePaymentFailed,
  confirmOrderAfterPayment,
  confirmOrder
} from "../controllers/order.js";
import { protect } from "../middlewares/authMiddleware.js";
import Order from "../models/Order.js";

const routerOrder = express.Router();

// ========== BASIC ORDER ROUTES ==========
routerOrder.post("/", protect, createOrder);
routerOrder.get("/myorders", protect, getMyOrders);
routerOrder.get("/admin/revenue-stats", protect, getRevenueStats);
routerOrder.get("/", protect, getOrders);


// ========== ORDER DETAIL & ACTIONS ==========
routerOrder.get("/:id", protect, getOrderById);
routerOrder.put("/:id/pay", protect, updateOrderToPaid);
routerOrder.put("/:id/deliver", protect, updateOrderToDelivered);
routerOrder.put("/:id/status", protect, updateOrderStatus);
routerOrder.put("/:id/paid-cod", protect, updateOrderToPaidCOD);
routerOrder.put("/:id/refund-request", protect, requestRefund);
routerOrder.put("/:id/return-request", protect, requestReturn);
routerOrder.put("/:id/confirm-satisfaction", protect, confirmSatisfaction);
routerOrder.put("/:id/confirm-delivery", protect, confirmDelivery);
routerOrder.put("/:id/cancel", protect, cancelOrder);
routerOrder.put("/:id/confirm", protect, confirmOrder);
routerOrder.get("/:id/valid-status", protect, getValidOrderStatusOptions);

// ========== PAYMENT STATUS MANAGEMENT ==========
// Route để cập nhật thanh toán thành công
routerOrder.put("/:id/payment-success", protect, async (req, res) => {
  try {
    const { paymentMethod, resultCode, message } = req.body;
    const orderId = req.params.id;
    
    console.log(`🔄 Updating order ${orderId} to payment success via API`);
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Cập nhật trạng thái thanh toán thành công
    order.status = 'pending';
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentStatus = 'paid';
    order.paymentResult = {
      method: paymentMethod,
      resultCode: resultCode,
      message: message,
      timestamp: Date.now()
    };
    
    // Thêm vào lịch sử trạng thái
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: 'pending',
      note: `Thanh toán ${paymentMethod} thành công - Đơn hàng chờ xác nhận từ admin`,
      date: Date.now()
    });
    order.statusHistory.push({
      status: 'payment_success',
      note: `Thanh toán ${paymentMethod} thành công - Số tiền: ${order.totalPrice}đ - Result Code: ${resultCode}`,
      date: Date.now()
    });
    
    await order.save();
    
    console.log(`✅ Order ${orderId} updated to payment success successfully`);
    res.json({ message: "Order payment status updated to success", order });
    
  } catch (error) {
    console.error("❌ Error updating order payment success:", error);
    res.status(500).json({ message: "Error updating order payment status", error: error.message });
  }
});

// Route để cập nhật thanh toán thất bại
routerOrder.put("/:id/payment-failed", protect, async (req, res) => {
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
routerOrder.put("/:id/confirm-payment", protect, async (req, res) => {
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
routerOrder.put("/:id/admin/force-status", protect, async (req, res) => {
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
routerOrder.get("/admin/stats/status", protect, async (req, res) => {
  try {
    const Order = (await import("../models/Order.js")).default;
    
    const stats = await Order.aggregate([
      {
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

    const paymentStats = await Order.aggregate([
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalPrice" }
        }
      }
    ]);

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