const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id })
        .populate('items.product', 'name price image stock')
        .populate('coupon', 'code value type');

    if (cart) {
        res.json(cart);
    } else {
        res.json({ items: [], totalItems: 0, totalPrice: 0 });
    }
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    if (product.stock < quantity) {
        res.status(400);
        throw new Error('Not enough stock');
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        // Cart exists for user
        const itemIndex = cart.items.findIndex(
            (p) => p.product.toString() === productId
        );

        if (itemIndex > -1) {
            // Product exists in cart, update quantity
            cart.items[itemIndex].quantity = quantity;
        } else {
            // Product does not exist in cart, add new item
            cart.items.push({
                product: productId,
                quantity,
                price: product.price,
            });
        }
    } else {
        // No cart exists, create new cart
        cart = new Cart({
            user: req.user._id,
            items: [
                {
                    product: productId,
                    quantity,
                    price: product.price,
                },
            ],
        });
    }

    await cart.save();
    res.status(201).json(cart);
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    if (product.stock < quantity) {
        res.status(400);
        throw new Error('Not enough stock');
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
        (p) => p.product.toString() === productId
    );

    if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        res.json(cart);
    } else {
        res.status(404);
        throw new Error('Item not found in cart');
    }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }

    cart.items = cart.items.filter(
        (item) => item.product.toString() !== req.params.productId
    );

    await cart.save();
    res.json(cart);
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
        cart.items = [];
        await cart.save();
    }
    res.json({ message: 'Cart cleared' });
});

// @desc    Apply coupon to cart
// @route   POST /api/cart/coupon
// @access  Private
const applyCoupon = asyncHandler(async (req, res) => {
    const { code } = req.body;
    const cart = await Cart.findOne({ user: req.user._id })
        .populate('items.product', 'price');

    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }

    const coupon = await Coupon.findOne({ code, isActive: true });
    if (!coupon) {
        res.status(404);
        throw new Error('Invalid coupon');
    }

    if (!coupon.isValid()) {
        res.status(400);
        throw new Error('Coupon has expired');
    }

    cart.coupon = coupon._id;
    await cart.save();

    res.json(cart);
});

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon,
}; 