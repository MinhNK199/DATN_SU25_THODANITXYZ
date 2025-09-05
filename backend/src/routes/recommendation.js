import express from "express";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import ProductView from "../models/ProductView.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/recommendations
router.get("/", protect, async(req, res) => {
    try {
        const userId = req.user._id;
        // Lấy sản phẩm user đã mua
        const orders = await Order.find({ user: userId });
        const boughtProductIds = orders.flatMap(order => order.orderItems.map(i => i.product.toString()));
        // Lấy sản phẩm user đã xem
        const views = await ProductView.find({ user: userId }).sort({ viewedAt: -1 }).limit(10);
        const viewedProductIds = views.map(v => v.product.toString());
        // Lấy danh mục sản phẩm đã xem/mua
        const allProductIds = [...new Set([...boughtProductIds, ...viewedProductIds])];
        const products = await Product.find({ _id: { $in: allProductIds } });
        const categories = [...new Set(products.map(p => p.category.toString()))];
        // Gợi ý sản phẩm cùng danh mục, loại trừ sản phẩm đã mua/xem
        let recommendations = await Product.find({
            category: { $in: categories },
            _id: { $nin: allProductIds },
            isActive: true
        }).limit(10);
        // Nếu chưa có lịch sử, gợi ý sản phẩm nổi bật
        if (recommendations.length === 0) {
            recommendations = await Product.find({ isActive: true }).sort({ sold: -1 }).limit(10);
        }
        res.json(recommendations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;