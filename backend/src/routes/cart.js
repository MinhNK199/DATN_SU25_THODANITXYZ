import express from "express";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon,
    getProductAvailability
} from "../controllers/cart.js";
import { protect } from "../middlewares/authMiddleware.js";


const routerCart = express.Router();

routerCart.get("/", protect, getCart);
routerCart.post("/", protect, addToCart);
routerCart.put("/:productId", protect, updateCartItem);
routerCart.delete("/:productId", protect, removeFromCart);
routerCart.delete("/", protect, clearCart);
routerCart.post("/apply-coupon", protect, applyCoupon);
routerCart.get("/product-availability/:productId", getProductAvailability);

export default routerCart;