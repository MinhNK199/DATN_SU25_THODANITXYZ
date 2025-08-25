import axios from 'axios';
import crypto from 'crypto';
import Order from '../models/Order.js';

// Thông tin tích hợp Momo Sandbox
const partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMO';
const accessKey = process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85';
const secretKey = process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
const endpoint = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';

// ✅ Hàm tạo signature theo chuẩn MoMo
function createSignature(rawSignature, secretKey) {
  return crypto.createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');
}

// ✅ Hàm validate request data
function validateMomoRequest(data) {
  const required = ['amount', 'orderId', 'orderInfo', 'redirectUrl'];
  const missing = required.filter(field => !data[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  if (data.amount < 1000) {
    throw new Error('Amount must be at least 1,000 VND');
  }
  
  if (data.amount > 50000000) {
    throw new Error('Amount cannot exceed 50,000,000 VND');
  }
}

export const createMomoPayment = async (req, res) => {
  try {
    const { amount, orderId, orderInfo, redirectUrl, ipnUrl, extraData } = req.body;
    
    // ✅ Validate input data
    try {
      validateMomoRequest({ amount, orderId, orderInfo, redirectUrl });
    } catch (validationError) {
      return res.status(400).json({ 
        message: 'Dữ liệu không hợp lệ', 
        error: validationError.message 
      });
    }

    // ✅ Tạo requestId và orderId theo chuẩn MoMo
    const requestId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const momoOrderId = orderId || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // ✅ Chuẩn bị raw signature theo đúng thứ tự MoMo
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData || ''}&ipnUrl=${ipnUrl || ''}&orderId=${momoOrderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=captureWallet`;
    
    // ✅ Tạo signature
    const signature = createSignature(rawSignature, secretKey);
    
    // ✅ Tạo payload gửi Momo theo chuẩn
    const payload = {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId: momoOrderId,
      orderInfo,
      redirectUrl,
      ipnUrl: ipnUrl || '',
      extraData: extraData || '',
      requestType: 'captureWallet',
      signature,
      lang: 'vi',
    };

    console.log('🔗 MoMo Payment Request:', {
      partnerCode,
      requestId,
      amount,
      orderId: momoOrderId,
      orderInfo,
      redirectUrl,
      ipnUrl: ipnUrl || '',
      extraData: extraData || '',
      requestType: 'captureWallet',
      lang: 'vi',
      // Không log signature vì lý do bảo mật
    });

    // ✅ Gửi request tới Momo
    const momoRes = await axios.post(endpoint, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000 // 30 seconds timeout
    });

    console.log('✅ MoMo Payment Response:', momoRes.data);

    // ✅ Validate response từ MoMo
    if (momoRes.data.resultCode !== 0) {
      console.error('❌ MoMo payment failed:', momoRes.data);
      return res.status(400).json({ 
        message: 'Không thể tạo thanh toán MoMo', 
        error: momoRes.data.message || 'Unknown error',
        resultCode: momoRes.data.resultCode
      });
    }

    // ✅ Trả về response thành công
    res.json({
      resultCode: momoRes.data.resultCode,
      message: momoRes.data.message,
      payUrl: momoRes.data.payUrl,
      deeplink: momoRes.data.deeplink,
      qrCodeUrl: momoRes.data.qrCodeUrl,
      applink: momoRes.data.applink,
      deeplinkMiniApp: momoRes.data.deeplinkMiniApp,
      orderId: momoOrderId,
      requestId: requestId
    });

  } catch (error) {
    console.error('❌ MoMo payment error:', error);
    
    if (error.response) {
      // Lỗi từ MoMo API
      console.error('MoMo API Error:', error.response.data);
      res.status(500).json({ 
        message: 'Lỗi từ MoMo API', 
        error: error.response.data.message || 'Unknown MoMo error',
        resultCode: error.response.data.resultCode
      });
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      res.status(408).json({ 
        message: 'Request timeout - MoMo server không phản hồi', 
        error: 'Connection timeout'
      });
    } else {
      // Network error
      res.status(500).json({ 
        message: 'Lỗi kết nối đến MoMo', 
        error: error.message 
      });
    }
  }
};

export const momoWebhook = async (req, res) => {
  try {
    console.log('🔔 MoMo Webhook Received:', {
      body: req.body,
      headers: req.headers,
      method: req.method,
      url: req.url
    });
    
    console.log('🔍 MoMo Webhook - Processing orderId:', req.body.orderId, 'resultCode:', req.body.resultCode);

    const { 
      orderId, 
      resultCode, 
      message, 
      transId, 
      amount,
      signature,
      extraData,
      payType,
      orderType,
      transType,
      mSignature
    } = req.body;

    // ✅ Validate webhook data
    if (!orderId || resultCode === undefined) {
      console.error('❌ Invalid webhook data:', req.body);
      return res.status(400).json({ 
        message: 'Invalid webhook data',
        returnCode: -1
      });
    }

    // ✅ Verify signature (optional but recommended)
    if (mSignature) {
      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData || ''}&message=${message}&orderId=${orderId}&orderInfo=${req.body.orderInfo || ''}&orderType=${orderType || ''}&partnerCode=${partnerCode}&payType=${payType || ''}&resultCode=${resultCode}&transId=${transId}&transType=${transType || ''}`;
      const expectedSignature = createSignature(rawSignature, secretKey);
      
      if (mSignature !== expectedSignature) {
        console.error('❌ Signature verification failed');
        return res.status(400).json({ 
          message: 'Invalid signature',
          returnCode: -1
        });
      }
    }

    // ✅ Import hàm helper
    const { confirmOrderAfterPayment, handlePaymentFailed } = await import('./order.js');
    
    if (resultCode === 0 && orderId) {
      // ✅ Thanh toán thành công
      console.log('✅ MoMo payment successful for order:', orderId);
      
      try {
        // ✅ Kiểm tra xem đơn hàng đã được xử lý chưa
        const existingOrder = await Order.findById(orderId);
        if (existingOrder && existingOrder.isPaid && existingOrder.paymentStatus === 'paid') {
          console.log('✅ Order already confirmed, skipping duplicate processing');
        } else {
          await confirmOrderAfterPayment(orderId, {
            id: transId,
            status: 'success',
            method: 'momo',
            update_time: new Date().toISOString(),
            amount: amount,
            extraData: extraData,
            payType: payType,
            orderType: orderType,
            transType: transType
          });
          
          console.log('✅ Order status updated successfully for MoMo payment:', orderId);
        }
      } catch (confirmError) {
        console.error('❌ Error confirming MoMo payment:', confirmError);
        // Vẫn trả về success cho MoMo để tránh retry
      }
    } else {
      // ✅ Thanh toán thất bại hoặc bị hủy
      console.log('❌ MoMo payment failed/cancelled for order:', orderId, 'Reason:', message, 'Code:', resultCode);
      
      try {
        // Cập nhật trạng thái đơn hàng thành failed
        const order = await Order.findById(orderId);
        if (order) {
          order.status = 'cancelled';
          order.paymentStatus = 'failed';
          order.isPaid = false;
          
          // Thêm vào lịch sử trạng thái
          if (!order.statusHistory) order.statusHistory = [];
          order.statusHistory.push({
            status: 'cancelled',
            note: `Thanh toán MoMo thất bại: ${message} (Code: ${resultCode})`,
            date: Date.now()
          });
          
          await order.save();
          console.log('✅ Order status updated for failed/cancelled MoMo payment:', orderId);
        }
      } catch (failedError) {
        console.error('❌ Error handling failed MoMo payment:', failedError);
      }
    }
    
    // ✅ Trả về response cho MoMo
    res.status(200).json({ 
      message: 'Webhook processed successfully',
      returnCode: 1
    });
    
  } catch (error) {
    console.error('❌ MoMo webhook processing error:', error);
    res.status(500).json({ 
      message: 'Webhook processing error', 
      error: error.message,
      returnCode: -1
    });
  }
};

// ✅ Hàm test webhook (chỉ dùng cho development)
export const testMomoWebhook = async (req, res) => {
  try {
    const { orderId, resultCode = 0, message = 'Test success' } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ message: 'OrderId is required' });
    }
    
    console.log('🧪 Test MoMo webhook for order:', orderId, 'resultCode:', resultCode);
    
    // Giả lập webhook data
    const webhookData = {
      orderId,
      resultCode,
      message,
      transId: 'test_trans_' + Date.now(),
      amount: 21600000,
      extraData: '',
      payType: 'qr',
      orderType: 'momo_wallet',
      transType: 'momo_wallet',
      signature: 'test_signature'
    };
    
    // Gọi webhook handler
    req.body = webhookData;
    await momoWebhook(req, res);
    
  } catch (error) {
    console.error('❌ Error in test webhook:', error);
    res.status(500).json({ message: 'Test webhook error', error: error.message });
  }
};

// ✅ Hàm kiểm tra trạng thái thanh toán MoMo
export const checkMomoPaymentStatus = async (req, res) => {
  console.log('🔍 checkMomoPaymentStatus called for orderId:', req.params.orderId);
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({ 
        message: 'Order ID is required' 
      });
    }

    // Tìm đơn hàng trong database
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        message: 'Order not found' 
      });
    }

    // Kiểm tra xem đơn hàng đã được thanh toán chưa
    if (order.isPaid && order.paymentStatus === 'paid') {
      return res.json({
        orderId: order._id,
        status: order.status,
        paymentStatus: 'paid',
        isPaid: true,
        paymentMethod: order.paymentMethod,
        paidAt: order.paidAt,
        amount: order.totalPrice,
        message: 'Order has been paid successfully'
      });
    }

    // Nếu thanh toán thất bại hoặc bị hủy
    if (order.paymentStatus === 'failed' || order.status === 'cancelled') {
      return res.json({
        orderId: order._id,
        status: order.status,
        paymentStatus: 'failed',
        isPaid: false,
        paymentMethod: order.paymentMethod,
        amount: order.totalPrice,
        message: 'Payment failed or cancelled'
      });
    }

    // Nếu chưa thanh toán hoặc đang chờ xử lý
    return res.json({
      orderId: order._id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      isPaid: order.isPaid,
      paymentMethod: order.paymentMethod,
      amount: order.totalPrice,
      message: 'Order payment status'
    });

  } catch (error) {
    console.error('❌ Error checking MoMo payment status:', error);
    res.status(500).json({ 
      message: 'Error checking payment status', 
      error: error.message 
    });
  }
};