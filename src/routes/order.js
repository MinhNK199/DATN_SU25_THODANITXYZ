import express from "express";
import {
    createOrder,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    getMyOrders,
    getOrders,
    updateOrderStatus
} from "../controllers/order";
import { protect } from "../middlewares/authMiddleware";

const routerOrder = express.Router();

routerOrder.post("/", protect, createOrder);
routerOrder.get("/my", protect, getMyOrders);
routerOrder.get("/", protect, getOrders);
routerOrder.get("/:id", protect, getOrderById);
routerOrder.put("/:id/pay", protect, updateOrderToPaid);
routerOrder.put("/:id/deliver", protect, updateOrderToDelivered);
routerOrder.put("/:id/status", protect, updateOrderStatus);

export default routerOrder;