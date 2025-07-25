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
import routerBanner from "./banner"
import routerRating from "./rating";
import routerVariant from "./variant";
import routerRecommendation from "./recommendation";
import paymentMethodRouter from "./paymentMethod";
import paymentMomoRouter from './paymentMomo.js';
import paymentVnpayRouter from './paymentVnpay.js';
import { runCleanupNow } from "../utils/cleanupJob";
import { getTaxConfig, updateTaxConfig } from '../controllers/taxConfig';
import { protect, checkAdmin } from '../middlewares/authMiddleware';
import routerBlog from "./blog.js";
const provinceController = require('../controllers/provinceController');

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
router.use("/banner", routerBanner);
router.use("/rating", routerRating);
router.use("/variant", routerVariant);
router.use("/recommendation", routerRecommendation);
router.use("/payment-methods", paymentMethodRouter);
router.use('/payment/momo', paymentMomoRouter);
router.use('/payment/vnpay', paymentVnpayRouter);
router.use("/blogs", routerBlog);
router.get('/provinces', provinceController.getProvinces);
router.get('/wards', provinceController.getWards);
router.get('/districts', provinceController.getDistricts);
router.get('/tax', getTaxConfig);
router.put('/tax', protect, checkAdmin(['Superadmin']), updateTaxConfig);

// Cleanup job route (chỉ admin mới được gọi)
router.get("/cleanup", protect, runCleanupNow);

export default router;