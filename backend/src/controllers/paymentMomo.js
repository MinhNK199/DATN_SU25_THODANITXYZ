import axios from 'axios';
import crypto from 'crypto';
import Order from '../models/Order.js';

// Thông tin tích hợp Momo Sandbox
const partnerCode = 'MOMO';
const accessKey = 'F8BBA842ECF85';
const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
const endpoint = 'https://test-payment.momo.vn/v2/gateway/api/create';

export const createMomoPayment = async (req, res) => {
  try {
    const { amount, orderId, orderInfo, redirectUrl, ipnUrl, extraData } = req.body;
    // Tạo requestId và orderId nếu chưa có
    const requestId = orderId || Date.now().toString();
    const momoOrderId = orderId || Date.now().toString();
    // Chuẩn bị raw signature
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData || ''}&ipnUrl=${ipnUrl}&orderId=${momoOrderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=captureWallet`;
    // Ký HMAC SHA256 với secretKey (chuẩn Momo)
    const signature = crypto.createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');
    // Tạo payload gửi Momo
    const payload = {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId: momoOrderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData: extraData || '',
      requestType: 'captureWallet',
      signature,
      lang: 'vi',
    };
    // Gửi request tới Momo
    console.log('Payload gửi Momo:', payload);
    try {
      const momoRes = await axios.post(endpoint, payload);
      res.json(momoRes.data);
    } catch (momoErr) {
      if (momoErr.response) {
        console.error('Lỗi từ phía Momo:', momoErr.response.data);
        res.status(500).json({ message: 'Lỗi từ phía Momo', momoError: momoErr.response.data });
      } else {
        console.error('Lỗi gửi request tới Momo:', momoErr.message);
        res.status(500).json({ message: 'Lỗi gửi request tới Momo', error: momoErr.message });
      }
    }
  } catch (error) {
    console.error('Lỗi tạo thanh toán Momo:', error);
    res.status(500).json({ message: 'Lỗi tạo thanh toán Momo', error: error.message });
  }
};

export const momoWebhook = async (req, res) => {
  try {
    console.log('Momo webhook callback:', req.body);
    const { orderId, resultCode, message, transId, amount } = req.body;
    
    // Import hàm helper
    const { confirmOrderAfterPayment, handlePaymentFailed } = await import('./order.js');
    
    if (resultCode === 0 && orderId) {
      // Thanh toán thành công
      await confirmOrderAfterPayment(orderId, {
        id: transId,
        status: 'success',
        method: 'momo',
        update_time: new Date().toISOString(),
        amount: amount
      });
      console.log('✅ Đã cập nhật trạng thái đơn hàng Momo thành công:', orderId);
    } else {
      // Thanh toán thất bại
      await handlePaymentFailed(orderId, `Thanh toán Momo thất bại: ${message}`);
      console.log('❌ Thanh toán Momo thất bại cho đơn hàng:', orderId);
    }
    
    res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    console.error('Lỗi xử lý webhook Momo:', error);
    res.status(500).json({ message: 'Lỗi xử lý webhook Momo', error: error.message });
  }
};