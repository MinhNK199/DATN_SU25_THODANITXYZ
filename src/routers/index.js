import { Router } from "express";
import routerAuth from "./auth";
import routerAddress from "./address";
import routerBrand from "./brand";
import orderRouter from "./order.js";

const router = Router();
router.use("/auth", routerAuth);
router.use("/address", routerAddress);
router.use("/brand", routerBrand);
router.use("/orders", orderRouter);

export default router;