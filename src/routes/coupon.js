import express from "express";
import {
    getCoupons,
    getCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon
} from "../controllers/coupon";
import { protect } from "../middlewares/authMiddleware";

const routerCoupon = express.Router();

routerCoupon.get("/", getCoupons);
routerCoupon.get("/:id", getCouponById);
routerCoupon.post("/", protect, createCoupon);
routerCoupon.put("/:id", protect, updateCoupon);
routerCoupon.delete("/:id", protect, deleteCoupon);
routerCoupon.post("/validate", validateCoupon);

export default routerCoupon;