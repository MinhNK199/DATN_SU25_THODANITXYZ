import Cart from "../models/Cart.js";
import ProductReservation from "../models/ProductReservation.js";
import Coupon from "../models/Coupon.js";
import Product from "../models/Product.js";

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
            .populate('items.product', 'name price salePrice images stock variants')
            .populate('coupon', 'code value type');
        
        if (cart) {
            // Lọc bỏ các item mà product bị null (sản phẩm đã bị xóa khỏi DB)
            cart.items = cart.items.filter(item => item.product);
            // Cập nhật số lượng có sẵn cho từng sản phẩm
            for (let item of cart.items) {
                if (!item.product) continue;
                const availableStock = await getAvailableStock(item.product._id);
                item.product.availableStock = availableStock;
                
                // Nếu số lượng trong giỏ hàng vượt quá số lượng có sẵn, cập nhật lại
                if (item.quantity > availableStock) {
                    item.quantity = availableStock;
                }
                // Bổ sung variantInfo nếu có variantId
                if (item.variantId && item.product.variants) {
                    const variant = item.product.variants.id(item.variantId);
                    if (variant && typeof variant === 'object') {
                        item.variantInfo = {
                            _id: variant._id,
                            name: variant.name || '',
                            images: Array.isArray(variant.images) ? variant.images : [],
                            price: typeof variant.price === 'number' ? variant.price : 0,
                            salePrice: typeof variant.salePrice === 'number' ? variant.salePrice : 0,
                            stock: typeof variant.stock === 'number' ? variant.stock : 0,
                            color: (variant.color && typeof variant.color === 'object') ? variant.color : { code: '', name: '' },
                            size: typeof variant.size === 'number' ? variant.size : 0,
                            weight: typeof variant.weight === 'number' ? variant.weight : 0,
                            sku: variant.sku || '',
                            specifications: (variant.specifications && typeof variant.specifications === 'object') ? Object.fromEntries(Object.entries(variant.specifications)) : {},
                        };
                    } else {
                        // Nếu không tìm thấy variant, trả về object rỗng để tránh lỗi frontend
                        item.variantInfo = {
                            _id: '',
                            name: '',
                            images: [],
                            price: 0,
                            salePrice: 0,
                            stock: 0,
                            color: { code: '', name: '' },
                            size: 0,
                            weight: 0,
                            sku: '',
                            specifications: {},
                        };
                    }
                }
            }
            // Lưu lại giỏ hàng nếu có thay đổi
            await cart.save();
            // Populate lại để đảm bảo có variants
            await cart.populate('items.product', 'name price salePrice images stock variants');
            res.json(cart);
        } else {
            res.json({ items: [], totalItems: 0, totalPrice: 0 });
        }
    } catch (error) {
        console.error('❌ Cart API error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity, variantId } = req.body;
        
        // Kiểm tra sản phẩm tồn tại
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        let variant = null;
        let specifications = {};
        let price = (product.salePrice && product.salePrice < product.price) ? product.salePrice : product.price;
        if (variantId) {
            variant = product.variants.id(variantId);
            if (!variant) {
                return res.status(404).json({ message: "Không tìm thấy biến thể" });
            }
            specifications = variant.specifications || {};
            price = (variant.salePrice && variant.salePrice < variant.price) ? variant.salePrice : variant.price;
        }
        
        // Lấy số lượng có sẵn thực tế
        const availableStock = await getAvailableStock(productId);
        
        // Tìm hoặc tạo giỏ hàng
        let cart = await Cart.findOne({ user: req.user._id });
        let totalQuantity = quantity;
        let itemIndex = -1;
        if (cart) {
            // Tìm item theo productId và variantId
            itemIndex = cart.items.findIndex(item => item.product.toString() === productId && String(item.variantId || '') === String(variantId || ''));
            if (itemIndex > -1) {
                totalQuantity = cart.items[itemIndex].quantity + quantity;
            }
        }
        // Kiểm tra số lượng có đủ không (tổng số lượng cũ + mới)
        if (availableStock < totalQuantity) {
            return res.status(400).json({ 
                message: `Chỉ còn ${availableStock} sản phẩm trong kho`,
                availableStock: availableStock
            });
        }
        // Tạo hoặc cập nhật reservation
        await ProductReservation.createReservation(productId, req.user._id, totalQuantity);
        if (cart) {
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity = totalQuantity;
                cart.items[itemIndex].reservedAt = new Date();
                cart.items[itemIndex].price = price;
                cart.items[itemIndex].specifications = specifications;
            } else {
                cart.items.push({ 
                    product: productId, 
                    variantId: variantId || undefined,
                    specifications,
                    quantity, 
                    price,
                    reservedAt: new Date()
                });
            }
        } else {
            cart = new Cart({
                user: req.user._id,
                items: [{ 
                    product: productId, 
                    variantId: variantId || undefined,
                    specifications,
                    quantity, 
                    price,
                    reservedAt: new Date()
                }]
            });
        }
        
        await cart.save();
        
        // Populate thông tin sản phẩm để trả về
        await cart.populate('items.product', 'name price salePrice images stock variants');
        
        // Sau khi populate product, bổ sung variantInfo cho từng item nếu có variantId
        for (let item of cart.items) {
            if (item.variantId && item.product.variants) {
                const variant = item.product.variants.id(item.variantId);
                if (variant && typeof variant === 'object') {
                    item.variantInfo = {
                        _id: variant._id,
                        name: variant.name || '',
                        images: Array.isArray(variant.images) ? variant.images : [],
                        price: typeof variant.price === 'number' ? variant.price : 0,
                        salePrice: typeof variant.salePrice === 'number' ? variant.salePrice : 0,
                        stock: typeof variant.stock === 'number' ? variant.stock : 0,
                        color: (variant.color && typeof variant.color === 'object') ? variant.color : { code: '', name: '' },
                        size: typeof variant.size === 'number' ? variant.size : 0,
                        weight: typeof variant.weight === 'number' ? variant.weight : 0,
                        sku: variant.sku || '',
                        specifications: (variant.specifications && typeof variant.specifications === 'object') ? Object.fromEntries(Object.entries(variant.specifications)) : {},
                    };
                } else {
                    // Nếu không tìm thấy variant, trả về object rỗng để tránh lỗi frontend
                    item.variantInfo = {
                        _id: '',
                        name: '',
                        images: [],
                        price: 0,
                        salePrice: 0,
                        stock: 0,
                        color: { code: '', name: '' },
                        size: 0,
                        weight: 0,
                        sku: '',
                        specifications: {},
                    };
                }
            }
        }
        
        res.status(201).json(cart);
    } catch (error) {
        console.error('❌ Cart API error:', error);
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