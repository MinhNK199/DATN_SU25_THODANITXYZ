import Order from '../models/Order.js';
import { confirmOrderAfterPayment, handlePaymentFailed } from './order.js';

// ✅ Hàm tạo thanh toán credit card (giả lập cho demo)
export const createCreditCardPayment = async (req, res) => {
  try {
    const { orderId, cardInfo, amount } = req.body;
    
    console.log('💳 Creating Credit Card payment for order:', orderId);
    
    // Validate input
    if (!orderId || !cardInfo || !amount) {
      return res.status(400).json({ 
        message: 'Thiếu thông tin thanh toán' 
      });
    }

    // Validate card info
    if (!cardInfo.number || !cardInfo.name || !cardInfo.expiry || !cardInfo.cvv) {
      return res.status(400).json({ 
        message: 'Thông tin thẻ không đầy đủ' 
      });
    }

    // Tìm đơn hàng
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        message: 'Không tìm thấy đơn hàng' 
      });
    }

    // Kiểm tra trạng thái đơn hàng
    if (order.status !== 'draft' && order.status !== 'pending') {
      return res.status(400).json({ 
        message: `Đơn hàng không phù hợp cho thanh toán. Status: ${order.status}` 
      });
    }

    // Cập nhật phương thức thanh toán nếu cần
    if (order.paymentMethod !== 'credit-card') {
      order.paymentMethod = 'credit-card';
      order.paymentStatus = 'awaiting_payment';
      order.status = 'draft';
      await order.save();
      console.log("✅ Updated order payment method to credit-card");
    }

    // ✅ Giả lập xử lý thanh toán thẻ tín dụng
    // Trong thực tế, đây sẽ là tích hợp với Stripe, PayPal, hoặc cổng thanh toán khác
    
    // Simulate payment processing
    const paymentResult = await simulateCreditCardPayment(cardInfo, amount);
    
    if (paymentResult.success) {
      // ✅ Thanh toán thành công
      console.log('✅ Credit card payment successful for order:', orderId);
      
      await confirmOrderAfterPayment(orderId, {
        id: paymentResult.transactionId,
        status: 'success',
        method: 'credit-card',
        update_time: new Date().toISOString(),
        amount: amount,
        cardLast4: cardInfo.number.slice(-4),
        cardType: getCardType(cardInfo.number)
      });
      
      res.json({
        success: true,
        message: 'Thanh toán thẻ tín dụng thành công',
        transactionId: paymentResult.transactionId,
        orderId: orderId
      });
    } else {
      // ✅ Thanh toán thất bại
      console.log('❌ Credit card payment failed for order:', orderId, 'Reason:', paymentResult.error);
      
      await handlePaymentFailed(orderId, paymentResult.error);
      
      res.status(400).json({
        success: false,
        message: 'Thanh toán thẻ tín dụng thất bại',
        error: paymentResult.error
      });
    }

  } catch (error) {
    console.error('❌ Credit card payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xử lý thanh toán thẻ tín dụng',
      error: error.message
    });
  }
};

// ✅ Hàm giả lập xử lý thanh toán thẻ tín dụng
async function simulateCreditCardPayment(cardInfo, amount) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // ✅ Logic kiểm tra thẻ hợp lệ
      const cardNumber = cardInfo.number.replace(/\s/g, '');
      
      // Kiểm tra số thẻ hợp lệ (Luhn algorithm)
      if (!isValidCardNumber(cardNumber)) {
        resolve({
          success: false,
          error: 'Số thẻ không hợp lệ'
        });
        return;
      }
      
      // Kiểm tra thẻ hết hạn
      if (isCardExpired(cardInfo.expiry)) {
        resolve({
          success: false,
          error: 'Thẻ đã hết hạn'
        });
        return;
      }
      
      // Kiểm tra CVV
      if (cardInfo.cvv.length < 3 || cardInfo.cvv.length > 4) {
        resolve({
          success: false,
          error: 'Mã CVV không hợp lệ'
        });
        return;
      }
      
      // ✅ Giả lập tỷ lệ thành công 95%
      const isSuccess = Math.random() > 0.05;
      
      if (isSuccess) {
        resolve({
          success: true,
          transactionId: `cc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount: amount
        });
      } else {
        resolve({
          success: false,
          error: 'Giao dịch bị từ chối bởi ngân hàng'
        });
      }
    }, 2000); // Simulate 2 seconds processing time
  });
}

// ✅ Hàm kiểm tra số thẻ hợp lệ (Luhn algorithm)
function isValidCardNumber(cardNumber) {
  if (!/^\d{13,19}$/.test(cardNumber)) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

// ✅ Hàm kiểm tra thẻ hết hạn
function isCardExpired(expiry) {
  const [month, year] = expiry.split('/');
  const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1, 1);
  const currentDate = new Date();
  
  return expiryDate < currentDate;
}

// ✅ Hàm xác định loại thẻ
function getCardType(cardNumber) {
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/
  };
  
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cardNumber)) {
      return type.toUpperCase();
    }
  }
  
  return 'UNKNOWN';
}

// ✅ Hàm kiểm tra trạng thái thanh toán credit card
export const checkCreditCardStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        message: 'Order not found' 
      });
    }

    res.json({
      orderId: order._id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      isPaid: order.isPaid,
      paymentMethod: order.paymentMethod,
      paidAt: order.paidAt,
      amount: order.totalPrice,
      message: 'Credit card payment status'
    });

  } catch (error) {
    console.error('❌ Error checking credit card status:', error);
    res.status(500).json({ 
      message: 'Error checking payment status',
      error: error.message 
    });
  }
};
