import axios from 'axios';

// Test script để debug MoMo payment flow
const testMomoPaymentFlow = async () => {
  const orderId = '68a60d4553cbc9246e1b07e1'; // Thay bằng orderId thực tế
  
  console.log('🧪 Testing MoMo payment flow for order:', orderId);
  
  try {
    // 1. Kiểm tra trạng thái đơn hàng ban đầu
    console.log('\n1️⃣ Checking initial order status...');
    const initialStatus = await axios.get(`http://localhost:8000/api/order/${orderId}`);
    console.log('Initial order status:', {
      status: initialStatus.data.status,
      isPaid: initialStatus.data.isPaid,
      paymentStatus: initialStatus.data.paymentStatus
    });
    
    // 2. Kiểm tra trạng thái thanh toán MoMo
    console.log('\n2️⃣ Checking MoMo payment status...');
    const momoStatus = await axios.get(`http://localhost:8000/api/payment/momo/status/${orderId}`);
    console.log('MoMo payment status:', momoStatus.data);
    
    // 3. Giả lập webhook thành công
    console.log('\n3️⃣ Simulating successful MoMo webhook...');
    const webhookData = {
      orderId: orderId,
      resultCode: 0,
      message: 'Success',
      transId: 'test_trans_' + Date.now(),
      amount: 21600000,
      extraData: '',
      payType: 'qr',
      orderType: 'momo_wallet',
      transType: 'momo_wallet',
      signature: 'test_signature'
    };
    
    const webhookResponse = await axios.post('http://localhost:8000/api/payment/momo/webhook', webhookData);
    console.log('Webhook response:', webhookResponse.data);
    
    // 4. Đợi 2 giây rồi kiểm tra lại
    console.log('\n4️⃣ Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 5. Kiểm tra trạng thái sau webhook
    console.log('\n5️⃣ Checking order status after webhook...');
    const finalStatus = await axios.get(`http://localhost:8000/api/order/${orderId}`);
    console.log('Final order status:', {
      status: finalStatus.data.status,
      isPaid: finalStatus.data.isPaid,
      paymentStatus: finalStatus.data.paymentStatus
    });
    
    // 6. Kiểm tra lại MoMo payment status
    console.log('\n6️⃣ Checking MoMo payment status after webhook...');
    const finalMomoStatus = await axios.get(`http://localhost:8000/api/payment/momo/status/${orderId}`);
    console.log('Final MoMo payment status:', finalMomoStatus.data);
    
  } catch (error) {
    console.error('❌ Error in test:', error.response?.data || error.message);
  }
};

// Chạy test
testMomoPaymentFlow();
