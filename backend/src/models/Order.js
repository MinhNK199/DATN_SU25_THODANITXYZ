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
      cardLast4: String,
      cardType: String,
      bankCode: String,
      payType: String,
      orderType: String,
      transType: String,
      extraData: String,
      app_trans_id: String,
      zp_trans_id: String,
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
        "draft",
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered_success",
        "delivered_failed",
        "partially_delivered",
        "returned",
        "on_hold",
        "completed",
        "cancelled",
        "refund_requested",
        "refunded",
        "payment_failed",
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
    reviews: [
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    note: { type: String, maxlength: 200 },
    images: [String],
    createdAt: { type: Date, default: Date.now },
    adminReply: {
      note: { type: String, maxlength: 500 },
      repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      repliedAt: { type: Date },
    },
  },
],

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
