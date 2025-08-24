const axios = require('axios');

// Test MoMo payment flow
async function testMomoPaymentFlow() {
  console.log('🧪 Testing MoMo Payment Flow...\n');

  try {
    // 1. Tạo đơn hàng
    console.log('1️⃣ Creating order...');
    const orderResponse = await axios.post('http://localhost:8000/api/order', {
      orderItems: [
        {
          name: "iPhone 14 Pro Max",
          quantity: 1,
          image: "iphone.jpg",
          price: 20000000,
          product: "507f1f77bcf86cd799439011"
        }
      ],
      shippingAddress: {
        fullName: "Test User",
        address: "123 Test Street",
        city: "01",
        ward: "001",
        postalCode: "10000",
        phone: "0123456789"
      },
      paymentMethod: "momo",
      itemsPrice: 20000000,
      taxPrice: 1600000,
      shippingPrice: 0,
      totalPrice: 21600000
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE',
        'Content-Type': 'application/json'
      }
    });

    const orderId = orderResponse.data._id;
    console.log(`✅ Order created: ${orderId}`);

    // 2. Tạo thanh toán MoMo
    console.log('\n2️⃣ Creating MoMo payment...');
    const momoResponse = await axios.post('http://localhost:8000/api/payment/momo/create', {
      amount: 21600000,
      orderId: orderId,
      orderInfo: `Thanh toán đơn hàng ${orderId}`,
      redirectUrl: "http://localhost:5173/checkout/success",
      ipnUrl: "http://localhost:8000/api/payment/momo/webhook",
      extraData: ""
    });

    console.log('✅ MoMo payment created');
    console.log('📋 Payment URL:', momoResponse.data.payUrl);

    // 3. Kiểm tra trạng thái đơn hàng (trước khi thanh toán)
    console.log('\n3️⃣ Checking order status (before payment)...');
    const statusBefore = await axios.get(`http://localhost:8000/api/payment/momo/status/${orderId}`);
    console.log('📊 Status before payment:', statusBefore.data);

    // 4. Giả lập webhook thất bại
    console.log('\n4️⃣ Simulating failed payment webhook...');
    const failedWebhook = await axios.post('http://localhost:8000/api/payment/momo/webhook', {
      orderId: orderId,
      resultCode: 1006, // User cancelled
      message: "User cancelled payment",
      transId: "test_trans_id",
      amount: 21600000,
      extraData: "",
      payType: "qr",
      orderType: "momo_wallet",
      transType: "momo_wallet",
      mSignature: "test_signature"
    });

    console.log('✅ Failed webhook sent');

    // 5. Kiểm tra trạng thái đơn hàng (sau khi thất bại)
    console.log('\n5️⃣ Checking order status (after failure)...');
    const statusAfter = await axios.get(`http://localhost:8000/api/payment/momo/status/${orderId}`);
    console.log('📊 Status after failure:', statusAfter.data);

    // 6. Kiểm tra đơn hàng trong database
    console.log('\n6️⃣ Checking order in database...');
    const orderResponse2 = await axios.get(`http://localhost:8000/api/order/${orderId}`, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });

    console.log('📋 Order details:', {
      id: orderResponse2.data._id,
      status: orderResponse2.data.status,
      paymentStatus: orderResponse2.data.paymentStatus,
      isPaid: orderResponse2.data.isPaid,
      paymentMethod: orderResponse2.data.paymentMethod
    });

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Chạy test
testMomoPaymentFlow();
