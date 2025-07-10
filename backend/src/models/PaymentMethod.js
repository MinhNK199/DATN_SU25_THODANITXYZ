import mongoose from "mongoose";

const paymentMethodSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["credit_card", "e_wallet", "bank_account"], required: true },
    provider: { type: String, required: true }, // Visa, MasterCard, Momo, ZaloPay, v.v.
    name: { type: String }, // Tên chủ thẻ
    last4: { type: String, required: true }, // 4 số cuối thẻ
    expired: { type: String }, // MM/YY nếu là thẻ
    token: { type: String }, // Token mã hoá nếu dùng cổng thanh toán
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const PaymentMethod = mongoose.model("PaymentMethod", paymentMethodSchema);
export default PaymentMethod; 