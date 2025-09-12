import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Vui lòng liên kết với người dùng'],
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Sản phẩm không được để trống'],
        },
        variantId: {
            type: String, // hoặc ObjectId nếu variant có _id riêng
        },
        variantInfo: {
            _id: String,
            name: String,
            color: {
                name: String,
                code: String,
                hex: String
            },
            size: String,
            sku: String,
            images: [String],
            price: Number,
            salePrice: Number,
            stock: Number
        },
        specifications: {
            type: Map,
            of: String,
        },
        quantity: {
            type: Number,
            required: [true, 'Vui lòng nhập số lượng'],
            min: [1, 'Số lượng tối thiểu là 1'],
        },
        price: {
            type: Number,
            required: [true, 'Vui lòng nhập giá sản phẩm'],
        },
        reservedAt: {
            type: Date,
            default: Date.now,
        },
    }],
    totalItems: {
        type: Number,
        default: 0,
    },
    totalPrice: {
        type: Number,
        default: 0,
    },
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
    },
    discountAmount: {
        type: Number,
        default: 0,
    },
    lastActivity: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
    versionKey: false,
});

// Tính tổng số lượng và giá tiền trước khi lưu
cartSchema.pre('save', function(next) {
    this.totalItems = this.items.reduce((acc, item) => acc + item.quantity, 0);
    this.totalPrice = this.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    this.lastActivity = new Date();
    next();
});

// Middleware để tự động xóa giỏ hàng cũ (sau 3 ngày)
cartSchema.pre('save', async function(next) {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    // Xóa các giỏ hàng cũ hơn 3 ngày
    await this.constructor.deleteMany({
        lastActivity: { $lt: threeDaysAgo }
    });

    next();
});

// Static method để cleanup giỏ hàng cũ
cartSchema.statics.cleanupOldCarts = async function() {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    // Tìm tất cả giỏ hàng cũ
    const oldCarts = await this.find({
        lastActivity: { $lt: threeDaysAgo }
    });

    // Trả lại số lượng cho kho
    for (const cart of oldCarts) {
        for (const item of cart.items) {
            await mongoose.model('Product').findByIdAndUpdate(
                item.product, { $inc: { stock: item.quantity } }
            );
        }
    }

    // Xóa giỏ hàng cũ
    await this.deleteMany({
        lastActivity: { $lt: threeDaysAgo }
    });

    console.log(`Cleaned up ${oldCarts.length} old carts`);
};

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;