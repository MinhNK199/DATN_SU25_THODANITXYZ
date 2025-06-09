import { Router } from "express";
import routerAuth from "./auth";
import routerAddress from "./address";
import routerBrand from "./brand";
import routerCart from "./cart";
import routerCategory from "./category";
import routerCoupon from "./coupon";
import routerNotifi from "./notification";
import routerOrder from "./order";
import routerProduct from "./product";
import routerBill from "./bill";


const router = Router();
router.use("/auth", routerAuth);
router.use("/address", routerAddress);
router.use("/brand", routerBrand);
router.use("/cart", routerCart);
router.use("/category", routerCategory);
router.use("/coupon", routerCoupon);
router.use("/notification", routerNotifi);
router.use("/order", routerOrder);
router.use("/product", routerProduct);
router.use("/bill", routerBill);
export default router;