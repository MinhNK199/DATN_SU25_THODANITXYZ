import express from "express";
import { createOrder, updateOrderStatus, refundOrder, cancelOrder } from "../controllers/order.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/", protect, createOrder);

router.put("/:id/status", protect, updateOrderStatus);
router.put("/:id/refund", protect, refundOrder);
router.put("/:id/cancel", protect, cancelOrder);

export default router;