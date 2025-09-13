import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Vui lòng liên kết với người dùng"],
    },
    orderItems: [{
        name: { type: String, required: [true, "Vui lòng nhập tên sản phẩm"] },
        quantity: { type: Number, required: [true, "Vui lòng nhập số lượng"] },
        image: { type: String, required: [true, "Vui lòng nhập ảnh sản phẩm"] },
        price: { type: Number, required: [true, "Vui lòng nhập giá sản phẩm"] },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Vui lòng liên kết với sản phẩm"],
        },
        // Thông tin biến thể sản phẩm
        variantId: { type: String },
        variantInfo: {
            _id: { type: String },
            name: { type: String },
            price: { type: Number },
            salePrice: { type: Number },
            stock: { type: Number },
            images: [{ type: String }],
            sku: { type: String },
            color: {
                name: { type: String },
                code: { type: String }
            },
            size: { type: Number },
            specifications: { type: mongoose.Schema.Types.Mixed }
        }
    }],
    shippingAddress: {
        fullName: {
            type: String,
            required: [true, "Vui lòng nhập họ và tên người nhận"],
        },
        address: {
            type: String,
            required: [true, "Vui lòng nhập địa chỉ giao hàng"],
        },
        city: { type: String, required: [true, "Vui lòng nhập tỉnh/thành phố"] },
        postalCode: {
            type: String,
            required: [true, "Vui lòng nhập mã bưu chính"],
        },
        phone: {
            type: String,
            required: [true, "Vui lòng nhập số điện thoại người nhận"],
        },
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: [
            "COD",
            "credit-card",
            "momo",
            "vnpay",
            "BANKING",
            "paid_online",
        ],
        default: "COD",
    },
    paymentResult: {
        id: String,
        status: String,
        update_time: String,
        email_address: String,
        method: String,
        amount: Number,
        // Thông tin đặc biệt cho từng phương thức thanh toán
        cardLast4: String,
        cardType: String,
        bankCode: String,
        payType: String,
        orderType: String,
        transType: String,
        extraData: String,
        vnp_TransactionNo: String,
        vnp_BankCode: String,
        vnp_PayDate: String,
        failure_reason: String,
        failure_time: String,
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
        ref: "Coupon",
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
    status: {
        type: String,
        enum: [
            "draft",              // Đơn hàng tạm (chưa thanh toán online)
            "pending",            // Chờ xác nhận từ admin
            "confirmed",          // Đã xác nhận từ admin
            "processing",         // Đang xử lý và đóng gói
            "assigned",           // Đã phân công cho shipper
            "picked_up",          // Shipper đã nhận hàng từ shop
            "shipped",            // Đang giao hàng (legacy)
            "in_transit",         // Đang trên đường giao
            "arrived",            // Đã đến điểm giao
            "delivered_success",  // Giao hàng thành công
            "delivered_failed",   // Giao hàng thất bại
            "partially_delivered",// Giao hàng một phần
            "returned",           // Hoàn hàng
            "on_hold",            // Tạm dừng xử lý
            "completed",          // Hoàn thành
            "cancelled",          // Đã hủy
            "refund_requested",   // Yêu cầu hoàn tiền
            "refunded",           // Đã hoàn tiền
            "payment_failed",     // Thanh toán thất bại
        ],
        default: "draft",
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "awaiting_payment", "paid", "failed", "cancelled"],
        default: "pending",
    },
    estimatedDeliveryDate: {
        type: Date,
    },
    actualDeliveryDate: {
        type: Date,
    },
    deliveryPerson: {
        name: String,
        phone: String,
        id: String,
    },
    deliveryNotes: String,
    customerRating: {
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        comment: String,
        date: {
            type: Date,
            default: Date.now,
        },
    },
    retryDeliveryCount: {
        type: Number,
        default: 0,
    },
    shipper: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shipper",
        default: null,
    },
    orderTracking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrderTracking",
        default: null,
    },
    autoConfirmAt: {
        type: Date,
        default: null,
    },
    zalopayTransId: { type: String },
    vnpayTransId: { type: String },
    statusHistory: [{
        status: {
            type: String,
            required: true,
        },
        note: String,
        date: {
            type: Date,
            default: Date.now,
        },
    }],
    inventoryStatus: {
        deducted: {
            type: Boolean,
            default: false,
        },
        deductedAt: {
            type: Date,
        },
        restored: {
            type: Boolean,
            default: false,
        },
        restoredAt: {
            type: Date,
        },
    },
}, {
    timestamps: true,
    versionKey: false,
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
