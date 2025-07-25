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
} from "../controllers/order";
import { createZaloPayOrder, zaloPayCallback } from "../controllers/paymentZalopay.js";
import { protect } from "../middlewares/authMiddleware";
  
const routerOrder = express.Router();

routerOrder.post("/", protect, createOrder);
routerOrder.get("/myorders", protect, getMyOrders);
routerOrder.get("/admin/revenue-stats", protect, getRevenueStats);
routerOrder.get("/", protect, getOrders);
routerOrder.post("/zalo-pay", protect, createZaloPayOrder);
routerOrder.post("/zalo-pay/callback", zaloPayCallback);
routerOrder.get("/:id", protect, getOrderById);
routerOrder.put("/:id/pay", protect, updateOrderToPaid);
routerOrder.put("/:id/deliver", protect, updateOrderToDelivered);
routerOrder.put("/:id/status", protect, updateOrderStatus);
routerOrder.put("/:id/paid-cod", protect, updateOrderToPaidCOD);
routerOrder.put("/:id/refund-request", protect, requestRefund);
routerOrder.get("/:id/valid-status", protect, getValidOrderStatusOptions);

export default routerOrder;