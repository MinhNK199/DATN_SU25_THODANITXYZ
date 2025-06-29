import Cart from "../models/Cart";
import Coupon from "../models/Coupon";
import Product from "../models/Product";

// Lấy giỏ hàng của user
export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product', 'name price image stock')
            .populate('coupon', 'code value type');
        if (cart) {
            res.json(cart);
        } else {
            res.json({ items: [], totalItems: 0, totalPrice: 0 });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        if (product.stock < quantity) return res.status(400).json({ message: "Không đủ hàng" });

        let cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity = quantity;
            } else {
                cart.items.push({ product: productId, quantity, price: product.price });
            }
        } else {
            cart = new Cart({
                user: req.user._id,
                items: [{ product: productId, quantity, price: product.price }]
            });
        }
        await cart.save();
        res.status(201).json(cart);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
export const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { productId } = req.params;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        if (product.stock < quantity) return res.status(400).json({ message: "Không đủ hàng" });

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
            await cart.save();
            res.json(cart);
        } else {
            res.status(404).json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

        cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa toàn bộ giỏ hàng
export const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.json({ message: "Đã xóa toàn bộ giỏ hàng" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Áp dụng mã giảm giá vào giỏ hàng
export const applyCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'price');
        if (!cart) return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

        const coupon = await Coupon.findOne({ code, isActive: true });
        if (!coupon) return res.status(404).json({ message: "Mã giảm giá không hợp lệ" });

        if (typeof coupon.isValid === "function" && !coupon.isValid()) {
            return res.status(400).json({ message: "Mã giảm giá đã hết hạn" });
        }

        cart.coupon = coupon._id;
        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};