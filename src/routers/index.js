import { Router } from "express";
import routerAuth from "./auth";
import routerAddress from "./address";
import routerBrand from "./brand";

const router = Router();
router.use("/auth", routerAuth);
router.use("/address", routerAddress);
router.use("/brand", routerBrand);
export default router;