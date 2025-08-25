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
import routerRecommendation from "./recommendation.js";
import paymentMethodRouter from "./paymentMethod.js";
import paymentMomoRouter from './paymentMomo.js';
import paymentVnpayRouter from './paymentVnpay.js';
import { runCleanupNow } from "../utils/cleanupJob.js";
import { getTaxConfig, updateTaxConfig } from '../controllers/taxConfig.js';
import { protect, checkAdmin } from '../middlewares/authMiddleware.js';
import routerBlog from "./blog.js";
<<<<<<< HEAD
import routerUpload from "./upload.js";
const provinceController = require('../controllers/provinceController');
=======
import { getProvinces, getWards, getDistricts } from '../controllers/provinceController.js';
>>>>>>> f02c39049ad512ebf3b7dfa5f69c0d7abaf47e53

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
<<<<<<< HEAD
router.use("/blog", routerBlog);
router.use("/upload", routerUpload);
router.get('/provinces', provinceController.getProvinces);
router.get('/wards', provinceController.getWards);
router.get('/districts', provinceController.getDistricts);
=======
router.use("/blogs", routerBlog);
router.get('/provinces', getProvinces);
router.get('/wards', getWards);
router.get('/districts', getDistricts);
>>>>>>> f02c39049ad512ebf3b7dfa5f69c0d7abaf47e53
router.get('/tax', getTaxConfig);
router.put('/tax', protect, checkAdmin(['Superadmin']), updateTaxConfig);

// Cleanup job route (chỉ admin mới được gọi)
router.get("/cleanup", protect, runCleanupNow);

export default router;