import { Router } from "express";
import routerAuth from "./auth.js";
import routerAddress from "./address.js";
import routerBrand from "./brand.js";
import routerCart from "./cart.js";
import routerCategory from "./category.js";
import routerCoupon from "./coupon.js";
import routerNotifi from "./notification.js";
import routerOrder from "./order.js";
import routerProduct from "./product.js";
import routerBill from "./bill.js";
import routerBanner from "./banner.js"
import routerRating from "./rating.js";
import routerVariant from "./variant.js";
import routerUpload from "./upload.js";
import routerRecommendation from "./recommendation.js";
import paymentMethodRouter from "./paymentMethod.js";
import paymentMomoRouter from './paymentMomo.js';
import paymentVnpayRouter from './paymentVnpay.js';
import paymentCreditCardRouter from './paymentCreditCard.js';
import { runCleanupNow } from "../utils/cleanupJob.js";
import { getTaxConfig, updateTaxConfig } from '../controllers/taxConfig.js';
import { protect, checkAdmin } from '../middlewares/authMiddleware.js';
import routerBlog from "./blog.js";
import { getProvinces, getWards, getDistricts } from '../controllers/provinceController.js';

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
router.use("/upload", routerUpload);
router.use("/recommendation", routerRecommendation);
router.use("/payment-methods", paymentMethodRouter);
router.use('/payment/momo', paymentMomoRouter);
router.use('/payment/vnpay', paymentVnpayRouter);
router.use('/payment/credit-card', paymentCreditCardRouter);
router.use("/blogs", routerBlog);
router.get('/provinces', getProvinces);
router.get('/wards', getWards);
router.get('/districts', getDistricts);
router.get('/tax', getTaxConfig);
router.put('/tax', protect, checkAdmin(['Superadmin']), updateTaxConfig);

// Cleanup job route (chỉ admin mới được gọi)
router.get("/cleanup", protect, runCleanupNow);

export default router;