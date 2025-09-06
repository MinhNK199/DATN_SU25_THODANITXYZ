import express from "express";
import {
    getCoupons,
    getCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
    getAvailableCoupons,
    getUsedCoupons,
    applyCoupon,
    removeCoupon
} from "../controllers/coupon.js";
import { protect } from "../middlewares/authMiddleware.js";

const routerCoupon = express.Router();

// API mới cho frontend - đặt trước các route có parameter
routerCoupon.get("/available", getAvailableCoupons);
routerCoupon.get("/used", protect, getUsedCoupons);
routerCoupon.post("/apply", protect, applyCoupon);
routerCoupon.post("/remove", protect, removeCoupon);
routerCoupon.post("/validate", validateCoupon);

// Admin routes
routerCoupon.get("/", getCoupons);
routerCoupon.get("/:id", getCouponById);
routerCoupon.post("/", protect, createCoupon);
routerCoupon.put("/:id", protect, updateCoupon);
routerCoupon.delete("/:id", protect, deleteCoupon);

export default routerCoupon;