import Cart from "../models/Cart";
import ProductReservation from "../models/ProductReservation";
import Coupon from "../models/Coupon";
import Product from "../models/Product";

// Helper function để lấy số lượng có sẵn thực tế
const getAvailableStock = async (productId) => {
    const product = await Product.findById(productId);
    if (!product) return 0;
    
    const reservedQuantity = await ProductReservation.getReservedQuantity(productId);
    return Math.max(0, product.stock - reservedQuantity);
};

// Lấy giỏ hàng của user
export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product', 'name price salePrice images stock')
            .populate('coupon', 'code value type');
        
        if (cart) {
            // Cập nhật số lượng có sẵn cho từng sản phẩm
            for (let item of cart.items) {
                const availableStock = await getAvailableStock(item.product._id);
                item.product.availableStock = availableStock;
                
                // Nếu số lượng trong giỏ hàng vượt quá số lượng có sẵn, cập nhật lại
                if (item.quantity > availableStock) {
                    item.quantity = availableStock;
                }
            }
            
            // Lưu lại giỏ hàng nếu có thay đổi
            await cart.save();
            
            await cart.populate('items.product', 'name price salePrice images stock');
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
        
        // Kiểm tra sản phẩm tồn tại
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        
        // Lấy số lượng có sẵn thực tế
        const availableStock = await getAvailableStock(productId);
        
        // Kiểm tra số lượng có đủ không
        if (availableStock < quantity) {
            return res.status(400).json({ 
                message: `Chỉ còn ${availableStock} sản phẩm trong kho`,
                availableStock: availableStock
            });
        }
        
        // Tạo hoặc cập nhật reservation
        await ProductReservation.createReservation(productId, req.user._id, quantity);
        
        // Tìm hoặc tạo giỏ hàng
        let cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
            if (itemIndex > -1) {
                // Cập nhật số lượng và reservation
                cart.items[itemIndex].quantity = quantity;
                cart.items[itemIndex].reservedAt = new Date();
                // Cập nhật lại giá nếu có sale mới
                cart.items[itemIndex].price = (product.salePrice && product.salePrice < product.price) ? product.salePrice : product.price;
                await ProductReservation.createReservation(productId, req.user._id, quantity);
            } else {
                // Thêm sản phẩm mới
                cart.items.push({ 
                    product: productId, 
                    quantity, 
                    price: (product.salePrice && product.salePrice < product.price) ? product.salePrice : product.price,
                    reservedAt: new Date()
                });
            }
        } else {
            // Tạo giỏ hàng mới
            cart = new Cart({
                user: req.user._id,
                items: [{ 
                    product: productId, 
                    quantity, 
                    price: (product.salePrice && product.salePrice < product.price) ? product.salePrice : product.price,
                    reservedAt: new Date()
                }]
            });
        }
        
        await cart.save();
        
        // Populate thông tin sản phẩm để trả về
        await cart.populate('items.product', 'name price salePrice images stock');
        
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
        
        // Kiểm tra sản phẩm tồn tại
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        
        // Lấy số lượng có sẵn thực tế (trừ đi số lượng hiện tại trong giỏ hàng của user này)
        const currentReservation = await ProductReservation.findOne({
            product: productId,
            user: req.user._id,
            isActive: true
        });
        
        const currentQuantity = currentReservation ? currentReservation.quantity : 0;
        const otherReservedQuantity = await ProductReservation.getReservedQuantity(productId) - currentQuantity;
        const availableStock = Math.max(0, product.stock - otherReservedQuantity);
        
        // Kiểm tra số lượng mới có hợp lệ không
        if (availableStock < quantity) {
            return res.status(400).json({ 
                message: `Chỉ có thể đặt tối đa ${availableStock} sản phẩm`,
                availableStock: availableStock
            });
        }
        
        // Cập nhật reservation
        await ProductReservation.createReservation(productId, req.user._id, quantity);
        
        // Cập nhật giỏ hàng
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
        }
        
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
            cart.items[itemIndex].reservedAt = new Date();
            // Cập nhật lại giá nếu có sale mới
            cart.items[itemIndex].price = (product.salePrice && product.salePrice < product.price) ? product.salePrice : product.price;
            await cart.save();
            
            await cart.populate('items.product', 'name price salePrice images stock');
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
        const { productId } = req.params;
        
        // Xóa reservation
        await ProductReservation.updateMany(
            {
                product: productId,
                user: req.user._id,
                isActive: true
            },
            {
                isActive: false
            }
        );
        
        // Cập nhật giỏ hàng
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
        }
        
        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        await cart.save();
        
        await cart.populate('items.product', 'name price salePrice images stock');
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
            // Xóa tất cả reservations của user này
            await ProductReservation.updateMany(
                {
                    user: req.user._id,
                    isActive: true
                },
                {
                    isActive: false
                }
            );
            
            // Xóa tất cả items trong giỏ hàng
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
        const cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product', 'price');
        if (!cart) {
            return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
        }

        const coupon = await Coupon.findOne({ code, isActive: true });
        if (!coupon) {
            return res.status(404).json({ message: "Mã giảm giá không hợp lệ" });
        }

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

// API để lấy số lượng có sẵn của sản phẩm
export const getProductAvailability = async (req, res) => {
    try {
        const { productId } = req.params;
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        
        const reservedQuantity = await ProductReservation.getReservedQuantity(productId);
        const availableStock = Math.max(0, product.stock - reservedQuantity);
        
        res.json({
            productId,
            totalStock: product.stock,
            reservedQuantity,
            availableStock
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};