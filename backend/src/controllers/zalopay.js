import crypto from "crypto";
import axios from "axios";
import Order from "../models/Order";

// Tạo đơn thanh toán ZaloPay
export const createZaloPayOrder = async (req, res) => {
  try {
    // Lấy thông tin từ đơn hàng
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    // Thông tin dùng thử từ ZaloPay Sandbox
    const app_id = "2554";
    const key1 = "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn";
    const key2 = "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf";
    const endpoint = "https://sb-openapi.zalopay.vn/v2/create"; // sandbox endpoint

    // Chuẩn bị dữ liệu gửi lên ZaloPay
    const embed_data = {};
    const items = [];
    const transID = Date.now(); // Mã giao dịch duy nhất

    const orderData = {
      app_id,
      app_trans_id: transID, // Mã giao dịch của bạn
      app_user: req.user._id.toString(),
      app_time: Date.now(),
      amount: order.totalPrice,
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      description: `Thanh toán đơn hàng #${order._id}`,
      bank_code: "", // Để trống nếu không chọn ngân hàng
      callback_url: "https://yourdomain.com/api/zalopay/callback", // comment: cấu hình callback trên ZaloPay dashboard
    };

    // Tạo chữ ký
    const dataStr = `${app_id}|${orderData.app_trans_id}|${orderData.app_user}|${orderData.amount}|${orderData.app_time}|${orderData.embed_data}|${orderData.item}`;
    orderData.mac = crypto
      .createHmac("sha256", key1)
      .update(dataStr)
      .digest("hex");

    // Gửi request tới ZaloPay
    const zaloRes = await axios.post(endpoint, orderData);

    // Lưu app_trans_id vào đơn hàng để đối chiếu khi nhận callback
    order.zalopayTransId = transID;
    await order.save();

    // Trả về link thanh toán cho frontend
    res.json({
      order_url: zaloRes.data.order_url,
      zaloTransId: orderData.app_trans_id,
      zaloRes: zaloRes.data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Nhận callback từ ZaloPay (cấu hình trên dashboard ZaloPay)
export const zaloPayCallback = async (req, res) => {
  try {
    // ZaloPay sẽ gửi thông tin giao dịch về đây
    const { app_trans_id, zp_trans_id, status } = req.body;

    // TODO: xác thực chữ ký callback (tham khảo tài liệu ZaloPay)
    // comment: cần xác thực chữ ký callback với key2 từ ZaloPay

    // Nếu status == 1 là thanh toán thành công
    if (status == 1) {
      // Tìm đơn hàng theo app_trans_id đã lưu
      const order = await Order.findOne({ zalopayTransId: app_trans_id });
      if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: zp_trans_id,
          status: "paid_zalopay",
          update_time: Date.now(),
        };
        await order.save();
      }
    }
    res.json({ return_code: 1, return_message: "OK" });
  } catch (error) {
    res.status(500).json({ return_code: -1, return_message: error.message });
  }
};