import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getMyPaymentMethods, addPaymentMethod, deletePaymentMethod, updatePaymentMethod } from "../controllers/paymentMethod.js";

const router = express.Router();

router.get("/", protect, getMyPaymentMethods);
router.post("/", protect, addPaymentMethod);
router.delete("/:id", protect, deletePaymentMethod);
router.put("/:id", protect, updatePaymentMethod);

export default router; 