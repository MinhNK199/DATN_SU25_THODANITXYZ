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
    getValidOrderStatusOptions
} from "../controllers/order";
import { protect } from "../middlewares/authMiddleware";

const routerOrder = express.Router();

routerOrder.post("/", protect, createOrder);
routerOrder.get("/myorders", protect, getMyOrders);
routerOrder.get("/admin/revenue-stats", protect, getRevenueStats);
routerOrder.get("/", protect, getOrders);
routerOrder.get("/:id", protect, getOrderById);
routerOrder.put("/:id/pay", protect, updateOrderToPaid);
routerOrder.put("/:id/deliver", protect, updateOrderToDelivered);
routerOrder.put("/:id/status", protect, updateOrderStatus);
routerOrder.put("/:id/paid-cod", protect, updateOrderToPaidCOD);
routerOrder.put("/:id/refund-request", protect, requestRefund);
routerOrder.get("/:id/valid-status", protect, getValidOrderStatusOptions);

export default routerOrder;