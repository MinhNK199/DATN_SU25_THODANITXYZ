import Cart from "../models/Cart.js";
import ProductReservation from "../models/ProductReservation.js";
import Coupon from "../models/Coupon.js";
import Product from "../models/Product.js";
import VariantStockService from "../services/variantStockService.js";

// Helper function để lấy số lượng có sẵn thực tế
const getAvailableStock = async(productId) => {
    const product = await Product.findById(productId);
    if (!product) return 0;

    const reservedQuantity = await ProductReservation.getReservedQuantity(productId);
    return Math.max(0, product.stock - reservedQuantity);
};

// Lấy giỏ hàng của user
export const getCart = async(req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id })
            .populate({
                path: 'items.product',
                select: 'name price salePrice images stock variants'
            })
            .populate('coupon', 'code value type');

        if (cart) {
            // Lọc bỏ các item mà product bị null (sản phẩm đã bị xóa khỏi DB)
            cart.items = cart.items.filter(item => item.product);
            // ✅ SỬ DỤNG VARIANT STOCK SERVICE ĐỂ LẤY STOCK CHÍNH XÁC
            console.log(`🔍 Đang cập nhật stock cho ${cart.items.length} items trong giỏ hàng`);

            for (let item of cart.items) {
                if (!item.product) continue;

                let availableStock = 0;
                let variantStock = 0;

                if (item.variantId) {
                    // ✅ XỬ LÝ SẢN PHẨM CÓ BIẾN THỂ - LẤY STOCK TỪ VARIANT
                    console.log(`📦 Xử lý sản phẩm có biến thể: ${item.product.name} - Variant: ${item.variantId}`);

                    // Tìm variant trong product.variants
                    const variant = item.product.variants.find(v => v._id.toString() === item.variantId.toString());

                    // Nếu chưa có variantInfo hoặc variantInfo rỗng, populate từ product.variants
                    if (!item.variantInfo && variant) {
                        item.variantInfo = {
                            _id: variant._id,
                            name: variant.name,
                            color: variant.color,
                            size: variant.size,
                            sku: variant.sku,
                            images: variant.images,
                            price: variant.price,
                            salePrice: variant.salePrice,
                            stock: variant.stock
                        };
                        // Lưu lại để cập nhật database
                        await cart.save();
                    }

                    // Lấy stock thực tế của biến thể
                    variantStock = await VariantStockService.getVariantStock(item.product._id, item.variantId);

                    // Lấy stock có sẵn (trừ đi reservation)
                    availableStock = await VariantStockService.getAvailableVariantStock(
                        item.product._id,
                        item.variantId,
                        req.user._id
                    );

                    console.log(`📊 Stock biến thể: ${variantStock}, Stock có sẵn: ${availableStock}`);

                } else {
                    // ✅ XỬ LÝ SẢN PHẨM KHÔNG CÓ BIẾN THỂ - LẤY STOCK TỪ PRODUCT
                    console.log(`📦 Xử lý sản phẩm không có biến thể: ${item.product.name}`);

                    variantStock = item.product.stock || 0;
                    availableStock = await getAvailableStock(item.product._id);

                    console.log(`📊 Stock sản phẩm: ${variantStock}, Stock có sẵn: ${availableStock}`);
                }

                // ✅ CẬP NHẬT AVAILABLE STOCK CHO PRODUCT (SỬ DỤNG STOCK CỦA VARIANT)
                item.product.availableStock = variantStock;

                // ✅ ĐIỀU CHỈNH SỐ LƯỢNG NẾU VƯỢT QUÁ STOCK
                if (item.quantity > variantStock) {
                    console.log(`⚠️ Điều chỉnh số lượng từ ${item.quantity} xuống ${variantStock} do vượt quá stock`);
                    item.quantity = variantStock;
                }

                // ✅ BỔ SUNG VARIANTINFO VỚI STOCK CHÍNH XÁC
                if (item.variantId && item.product.variants) {
                    const variant = item.product.variants.find(v => v._id.toString() === item.variantId.toString());
                    if (variant && typeof variant === 'object') {
                        item.variantInfo = {
                            _id: variant._id,
                            name: variant.name || '',
                            images: Array.isArray(variant.images) ? variant.images : [],
                            price: typeof variant.price === 'number' ? variant.price : 0,
                            salePrice: typeof variant.salePrice === 'number' ? variant.salePrice : 0,
                            stock: variantStock, // ✅ SỬ DỤNG STOCK CHÍNH XÁC TỪ DATABASE
                            availableStock: variantStock, // ✅ SỬ DỤNG STOCK CỦA VARIANT
                            color: (variant.color && typeof variant.color === 'object') ? variant.color : { code: '', name: '' },
                            size: typeof variant.size === 'number' ? variant.size : 0,
                            weight: typeof variant.weight === 'number' ? variant.weight : 0,
                            sku: variant.sku || '',
                            specifications: (variant.specifications && typeof variant.specifications === 'object') ? Object.fromEntries(Object.entries(variant.specifications)) : {},
                        };
                    }
                } else {
                    // ✅ THÊM AVAILABLE STOCK CHO SẢN PHẨM KHÔNG CÓ BIẾN THỂ
                    item.product.availableStock = availableStock;
                }
            }
            // Lưu lại giỏ hàng nếu có thay đổi
            await cart.save();
            // Populate lại để đảm bảo có variants với đầy đủ thông tin
            await cart.populate({
                path: 'items.product',
                select: 'name price salePrice images stock variants'
            });
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
export const addToCart = async(req, res) => {
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
            // Tìm variant bằng cách so sánh _id
            variant = product.variants.find(v => v._id.toString() === variantId.toString());

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
                if (variantId) {
                    cart.items[itemIndex].variantId = variantId;
                    cart.items[itemIndex].variantInfo = {
                        _id: variant._id,
                        name: variant.name,
                        color: variant.color,
                        size: variant.size,
                        sku: variant.sku,
                        images: variant.images,
                        price: variant.price,
                        salePrice: variant.salePrice,
                        stock: variant.stock
                    };
                }
            } else {
                cart.items.push({
                    product: productId,
                    variantId: variantId || undefined,
                    variantInfo: variant ? {
                        _id: variant._id,
                        name: variant.name,
                        color: variant.color,
                        size: variant.size,
                        sku: variant.sku,
                        images: variant.images,
                        price: variant.price,
                        salePrice: variant.salePrice,
                        stock: variant.stock
                    } : undefined,
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
                    variantInfo: variant ? {
                        _id: variant._id,
                        name: variant.name,
                        color: variant.color,
                        size: variant.size,
                        sku: variant.sku,
                        images: variant.images,
                        price: variant.price,
                        salePrice: variant.salePrice,
                        stock: variant.stock
                    } : undefined,
                    specifications,
                    quantity,
                    price,
                    reservedAt: new Date()
                }]
            });
        }

        await cart.save();

        // Populate thông tin sản phẩm để trả về
        await cart.populate({
            path: 'items.product',
            select: 'name price salePrice images stock variants'
        });

        // Sau khi populate product, bổ sung variantInfo cho từng item nếu có variantId
        for (let item of cart.items) {
            if (item.variantId && item.product.variants) {
                const variant = item.product.variants.find(v => v._id.toString() === item.variantId.toString());
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

        // Populate product data
        await cart.populate({
            path: 'items.product',
            select: 'name price salePrice images stock variants'
        });

        // Tạo variantInfo cho tất cả items
        for (let item of cart.items) {
            if (item.variantId && item.product.variants) {
                const variant = item.product.variants.find(v => v._id.toString() === item.variantId.toString());
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
export const updateCartItem = async(req, res) => {
    try {
        const { quantity, variantId } = req.body;
        const { productId } = req.params;

        console.log(`🔄 Cập nhật số lượng sản phẩm ${productId}, variant: ${variantId}, quantity: ${quantity}`);

        // Kiểm tra sản phẩm tồn tại
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }

        // ✅ SỬ DỤNG VARIANT STOCK SERVICE ĐỂ VALIDATE STOCK
        let availableStock = 0;
        let stockValidation = null;

        if (variantId) {
            // ✅ XỬ LÝ SẢN PHẨM CÓ BIẾN THỂ - VALIDATE STOCK CỦA VARIANT
            console.log(`📦 Kiểm tra stock cho biến thể: ${variantId}`);

            stockValidation = await VariantStockService.canUpdateQuantity(
                productId,
                variantId,
                quantity,
                req.user._id
            );

            availableStock = stockValidation.availableStock;

            if (!stockValidation.canUpdate) {
                console.log(`❌ Không thể cập nhật: ${stockValidation.message}`);
                return res.status(400).json({
                    message: stockValidation.message,
                    availableStock: availableStock,
                    requestedQuantity: quantity
                });
            }

        } else {
            // ✅ XỬ LÝ SẢN PHẨM KHÔNG CÓ BIẾN THỂ - VALIDATE STOCK CỦA PRODUCT
            console.log(`📦 Kiểm tra stock cho sản phẩm: ${productId}`);

            // Lấy số lượng có sẵn thực tế (trừ đi số lượng hiện tại trong giỏ hàng của user này)
            const currentReservation = await ProductReservation.findOne({
                product: productId,
                user: req.user._id,
                isActive: true
            });

            const currentQuantity = currentReservation ? currentReservation.quantity : 0;
            const otherReservedQuantity = await ProductReservation.getReservedQuantity(productId) - currentQuantity;
            availableStock = Math.max(0, product.stock - otherReservedQuantity);

            // Kiểm tra số lượng mới có hợp lệ không
            if (availableStock < quantity) {
                console.log(`❌ Không đủ stock: cần ${quantity}, có ${availableStock}`);
                return res.status(400).json({
                    message: `Chỉ có thể đặt tối đa ${availableStock} sản phẩm`,
                    availableStock: availableStock,
                    requestedQuantity: quantity
                });
            }
        }

        console.log(`✅ Stock validation thành công: có thể cập nhật ${quantity} sản phẩm`);

        // Cập nhật reservation
        await ProductReservation.createReservation(productId, req.user._id, quantity);

        // Cập nhật giỏ hàng
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
        }

        // Tìm item theo productId và variantId (nếu có)
        const itemIndex = cart.items.findIndex(item =>
            item.product.toString() === productId &&
            String(item.variantId || '') === String(variantId || '')
        );

        if (itemIndex > -1) {
            const item = cart.items[itemIndex];
            item.quantity = quantity;
            item.reservedAt = new Date();

            // Nếu có variantId, cập nhật thông tin biến thể
            if (item.variantId) {
                const variant = product.variants.find(v => v._id.toString() === item.variantId.toString());
                if (variant) {
                    // Cập nhật variantInfo với thông tin mới nhất
                    item.variantInfo = {
                        _id: variant._id,
                        name: variant.name,
                        color: variant.color,
                        size: variant.size,
                        sku: variant.sku,
                        images: variant.images,
                        price: variant.price,
                        salePrice: variant.salePrice,
                        stock: variant.stock
                    };
                    // Cập nhật giá nếu có thay đổi
                    item.price = (variant.salePrice && variant.salePrice < variant.price) ? variant.salePrice : variant.price;
                }
            } else {
                // Nếu không có variantId, cập nhật giá sản phẩm
                item.price = (product.salePrice && product.salePrice < product.price) ? product.salePrice : product.price;
            }

            await cart.save();

            // Populate lại với variants để có thể tính toán variantInfo
            await cart.populate({
                path: 'items.product',
                select: 'name price salePrice images stock variants'
            });

            // ✅ BỔ SUNG VARIANTINFO VỚI STOCK CHÍNH XÁC
            if (item.variantId && item.product.variants) {
                const variant = item.product.variants.find(v => v._id.toString() === item.variantId.toString());
                if (variant && typeof variant === 'object') {
                    // Lấy stock chính xác từ database
                    const variantStock = await VariantStockService.getVariantStock(productId, item.variantId);

                    item.variantInfo = {
                        _id: variant._id,
                        name: variant.name || '',
                        images: Array.isArray(variant.images) ? variant.images : [],
                        price: typeof variant.price === 'number' ? variant.price : 0,
                        salePrice: typeof variant.salePrice === 'number' ? variant.salePrice : 0,
                        stock: variantStock, // ✅ SỬ DỤNG STOCK CHÍNH XÁC TỪ DATABASE
                        availableStock: variantStock, // ✅ SỬ DỤNG STOCK CỦA VARIANT
                        color: (variant.color && typeof variant.color === 'object') ? variant.color : { code: '', name: '' },
                        size: typeof variant.size === 'number' ? variant.size : 0,
                        weight: typeof variant.weight === 'number' ? variant.weight : 0,
                        sku: variant.sku || '',
                        specifications: (variant.specifications && typeof variant.specifications === 'object') ? Object.fromEntries(Object.entries(variant.specifications)) : {},
                    };
                }
            } else {
                // ✅ CẬN NHẬT AVAILABLE STOCK CHO SẢN PHẨM KHÔNG CÓ BIẾN THỂ
                item.product.availableStock = availableStock;
            }

            res.json(cart);
        } else {
            res.status(404).json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = async(req, res) => {
    try {
        const { productId } = req.params;
        const { variantId } = req.body;

        // Xóa reservation
        await ProductReservation.updateMany({
            product: productId,
            user: req.user._id,
            isActive: true
        }, {
            isActive: false
        });

        // Cập nhật giỏ hàng
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
        }

        // Lọc item theo productId và variantId (nếu có)
        cart.items = cart.items.filter(item => {
            const productMatch = item.product.toString() === productId;
            const variantMatch = variantId ? String(item.variantId || '') === String(variantId) : true;
            return !(productMatch && variantMatch);
        });

        await cart.save();

        await cart.populate('items.product', 'name price salePrice images stock');
        res.json(cart);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa toàn bộ giỏ hàng
export const clearCart = async(req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            // Xóa tất cả reservations của user này
            await ProductReservation.updateMany({
                user: req.user._id,
                isActive: true
            }, {
                isActive: false
            });

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
export const applyCoupon = async(req, res) => {
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
export const getProductAvailability = async(req, res) => {
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