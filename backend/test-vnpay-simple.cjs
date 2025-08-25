const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:8000/api';
const TEST_AMOUNT = 10000; // 10,000 VND
const TEST_ORDER_ID = `test_${Date.now()}`;

// Test VNPay Payment
async function testVnpayPayment() {
  console.log('🧪 Testing VNPay Payment...');
  console.log('📋 Test Order ID:', TEST_ORDER_ID);
  console.log('💰 Test Amount:', TEST_AMOUNT);
  
  try {
    console.log('📤 Sending request to:', `${BASE_URL}/payment/vnpay/create`);
    
    const response = await axios.post(`${BASE_URL}/payment/vnpay/create`, {
      amount: TEST_AMOUNT,
      orderId: TEST_ORDER_ID,
      orderInfo: 'Test VNPay payment',
      redirectUrl: 'http://localhost:5173/checkout/success'
    });

    console.log('✅ VNPay Payment Response:', response.data);
    
    if (response.data.payUrl) {
      console.log('🔗 VNPay Payment URL:', response.data.payUrl);
      console.log('✅ VNPay Payment test PASSED');
      return true;
    } else {
      console.log('❌ VNPay Payment failed:', response.data);
      console.log('❌ VNPay Payment test FAILED');
      return false;
    }
  } catch (error) {
    console.error('❌ VNPay Payment Error:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else if (error.request) {
      console.error('   Request error:', error.message);
    } else {
      console.error('   Error:', error.message);
    }
    console.log('❌ VNPay Payment test FAILED');
    return false;
  }
}

// Run test
console.log('🚀 Starting VNPay Payment Test...\n');
testVnpayPayment()
  .then((result) => {
    console.log('\n🎯 Test completed:', result ? 'PASS' : 'FAIL');
    process.exit(result ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n💥 Test crashed:', error);
    process.exit(1);
  });
