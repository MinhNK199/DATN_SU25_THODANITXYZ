import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Vui lòng liên kết với người dùng'],
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: [true, 'Sản phẩm không được để trống'],
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
        }
    ],
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
}, {
    timestamps: true,
    versionKey: false,
});

// Tính tổng số lượng và giá tiền trước khi lưu
cartSchema.pre('save', function (next) {
    this.totalItems = this.items.reduce((acc, item) => acc + item.quantity, 0);
    this.totalPrice = this.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    next();
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
