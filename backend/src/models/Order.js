import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Vui lòng liên kết với người dùng"],
    },
    orderItems: [
      {
        name: { type: String, required: [true, "Vui lòng nhập tên sản phẩm"] },
        quantity: { type: Number, required: [true, "Vui lòng nhập số lượng"] },
        image: { type: String, required: [true, "Vui lòng nhập ảnh sản phẩm"] },
        price: { type: Number, required: [true, "Vui lòng nhập giá sản phẩm"] },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Vui lòng liên kết với sản phẩm"],
        },
      },
    ],
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
        "zalopay", 
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
      cardLast4: String, // Credit card
      cardType: String, // VISA, MASTERCARD, etc.
      bankCode: String, // VNPay, MoMo
      payType: String, // MoMo
      orderType: String, // MoMo
      transType: String, // MoMo
      extraData: String, // MoMo, ZaloPay
      app_trans_id: String, // ZaloPay
      zp_trans_id: String, // ZaloPay
      vnp_TransactionNo: String, // VNPay
      vnp_BankCode: String, // VNPay
      vnp_PayDate: String, // VNPay
      failure_reason: String, // Khi thanh toán thất bại
      failure_time: String, // Thời gian thất bại
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
        "draft", // Đơn hàng tạm (chưa thanh toán online)
        "pending", // Chờ xác nhận từ admin
        "confirmed", // Đã xác nhận từ admin
        "processing", // Đang xử lý và đóng gói
        "shipped", // Đang giao hàng
        "delivered_success", // Giao hàng thành công
        "delivered_failed", // Giao hàng thất bại
        "partially_delivered", // Giao hàng một phần
        "returned", // Hoàn hàng
        "on_hold", // Tạm dừng xử lý
        "completed", // Hoàn thành
        "cancelled", // Đã hủy
        "refund_requested", // Yêu cầu hoàn tiền
        "refunded", // Đã hoàn tiền
        "payment_failed", // Thanh toán thất bại
      ],
      default: "draft",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "awaiting_payment", "paid", "failed", "cancelled"],
      default: "pending",
    },
    // Thêm fields mới cho delivery tracking
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
    // Số lần giao lại khi giao hàng thất bại
    retryDeliveryCount: {
      type: Number,
      default: 0,
    },
    zalopayTransId: { type: String },
    vnpayTransId: { type: String },
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        note: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
