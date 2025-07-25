import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Vui lòng liên kết với người dùng'],
    },
    orderItems: [{
        name: { type: String, required: [true, 'Vui lòng nhập tên sản phẩm'] },
        quantity: { type: Number, required: [true, 'Vui lòng nhập số lượng'] },
        image: { type: String, required: [true, 'Vui lòng nhập ảnh sản phẩm'] },
        price: { type: Number, required: [true, 'Vui lòng nhập giá sản phẩm'] },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Vui lòng liên kết với sản phẩm'],
        },
    }],
    shippingAddress: {
        fullName: { type: String, required: [true, 'Vui lòng nhập họ và tên người nhận'] },
        address: { type: String, required: [true, 'Vui lòng nhập địa chỉ giao hàng'] },
        city: { type: String, required: [true, 'Vui lòng nhập tỉnh/thành phố'] },
        postalCode: { type: String, required: [true, 'Vui lòng nhập mã bưu chính'] },
        phone: { type: String, required: [true, 'Vui lòng nhập số điện thoại người nhận'] },
    },
    paymentMethod: {
        type: String,
        required: [true, 'Vui lòng chọn phương thức thanh toán'],
        enum: {
            values: [
                'COD',
                'BANKING',
                'E-WALLET',
                'credit-card',
                'e-wallet',
                'credit_card',
                'e_wallet',
                'VNPAY',

            ],
            message: 'Phương thức thanh toán không hợp lệ',
        },
    },
    paymentResult: {
        id: String,
        status: String,
        update_time: String,
        email_address: String,
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
    },
    discountAmount: {
        type: Number,
        default: 0.0,
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false,
    },
    paidAt: {
        type: Date,
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false,
    },
    deliveredAt: {
        type: Date,
    },
    // Số lần giao lại khi giao hàng thất bại
    retryDeliveryCount: {
        type: Number,
        default: 0,
    },
    zalopayTransId: { type: String },
    status: {
        type: String,
        required: true,
        enum: {
            values: [
                'pending', // Chờ xác nhận
                'confirmed', // Đã xác nhận
                'processing', // Đang xử lý
                'shipped', // Đang giao hàng
                'delivered_success', // Giao hàng thành công
                'delivered_failed', // Giao hàng thất bại
                'completed', // Thành công
                'cancelled', // Đã hủy
                'returned', // Hoàn hàng
                'refund_requested', // Yêu cầu hoàn tiền
                'refunded', // Hoàn tiền thành công
                'paid_cod', // Đã thanh toán COD
                'paid_online' // Đã thanh toán Online
            ],
            message: 'Trạng thái đơn hàng không hợp lệ',
        },
        default: 'pending',
    },
    statusHistory: [{
        status: {
            type: String,
            required: [true, 'Vui lòng nhập trạng thái'],
            enum: [
                'pending',
                'confirmed',
                'processing',
                'shipped',
                'delivered_success',
                'delivered_failed',
                'completed',
                'cancelled',
                'returned',
                'refund_requested',
                'refunded',
                'paid_cod',
                'paid_online'
            ]
        },
        date: {
            type: Date,
            default: Date.now,
        },
        note: String,
    }],
}, {
    timestamps: true,
    versionKey: false,
});

const Order = mongoose.model("Order", orderSchema);
export default Order;