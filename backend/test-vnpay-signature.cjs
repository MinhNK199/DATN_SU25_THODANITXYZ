const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:8000/api';

// Test VNPAY signature
async function testVnpaySignature() {
  console.log('🧪 Testing VNPAY Signature...');
  
  try {
    // Test parameters giống như VNPAY thực tế
    const testParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: 'DLWG4Y9A',
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: 'test_123456',
      vnp_OrderInfo: 'Test payment',
      vnp_OrderType: 'other',
      vnp_Amount: 1000000, // 10,000 VND
      vnp_ReturnUrl: 'http://localhost:8000/api/payment/vnpay/callback',
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: '20250824164251'
    };

    console.log('📋 Test Parameters:', testParams);
    
    const response = await axios.post(`${BASE_URL}/payment/vnpay/test-signature`, {
      params: testParams
    });

    console.log('✅ VNPAY Signature Test Response:');
    console.log('   📊 Success:', response.data.success);
    console.log('   🔄 Sorted Params:', response.data.sortedParams);
    console.log('   📝 Sign Data:', response.data.signData);
    console.log('   🔑 Secret Key:', response.data.secretKey.substring(0, 10) + '...');
    console.log('   ✍️ Generated Signature:', response.data.generatedSignature);
    
    return true;
  } catch (error) {
    console.error('❌ VNPAY Signature Test Error:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else if (error.request) {
      console.error('   Request error:', error.message);
    } else {
      console.error('   Error:', error.message);
    }
    return false;
  }
}

// Run test
console.log('🚀 Starting VNPAY Signature Test...\n');
testVnpaySignature()
  .then((result) => {
    console.log('\n🎯 Test completed:', result ? 'PASS' : 'FAIL');
    process.exit(result ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n💥 Test crashed:', error);
    process.exit(1);
  });
