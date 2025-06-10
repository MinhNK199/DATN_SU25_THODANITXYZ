import { Router } from "express";
import routerAuth from "./auth";
import routerAddress from "./address";
import routerBrand from "./brand";
import orderRouter from "./order.js";
import routerProduct from "./product.js"; // Thêm dòng này

const router = Router();
router.use("/auth", routerAuth);
router.use("/address", routerAddress);
router.use("/brand", routerBrand);
router.use("/orders", orderRouter);
router.use("/products", routerProduct); // Thêm dòng này

export default router;