const axios = require('axios');
const crypto = require('crypto');

// ✅ Cấu hình MoMo Sandbox theo chuẩn chính thức
const config = {
  partnerCode: 'MOMO',
  accessKey: 'F8BBA842ECF85',
  secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
  endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create',
  ipnUrl: 'http://localhost:8000/api/payment/momo/webhook'
};

// ✅ Hàm tạo signature theo chuẩn MoMo chính thức
function createSignature(rawSignature, secretKey) {
  return crypto.createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');
}

// ✅ Test tạo thanh toán MoMo
async function testCreateMomoPayment() {
  console.log('🧪 Testing MoMo Payment Creation...');
  
  try {
    const requestId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const orderId = `TEST_ORDER_${Date.now()}`;
    const amount = 10000; // 10,000 VND
    const orderInfo = 'Test MoMo payment from official SDK';
    const redirectUrl = 'http://localhost:5173/checkout/success';
    const extraData = '';

    // ✅ Tạo raw signature theo đúng thứ tự MoMo
    const rawSignature = `accessKey=${config.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${config.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${config.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=captureWallet`;
    
    // ✅ Tạo signature
    const signature = createSignature(rawSignature, config.secretKey);

    // ✅ Tạo payload
    const payload = {
      partnerCode: config.partnerCode,
      accessKey: config.accessKey,
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: config.ipnUrl,
      extraData: extraData,
      requestType: 'captureWallet',
      signature: signature,
      lang: 'vi'
    };

    console.log('📤 MoMo Request Payload:', {
      partnerCode: payload.partnerCode,
      requestId: payload.requestId,
      amount: payload.amount,
      orderId: payload.orderId,
      orderInfo: payload.orderInfo,
      redirectUrl: payload.redirectUrl,
      ipnUrl: payload.ipnUrl,
      extraData: payload.extraData,
      requestType: payload.requestType,
      lang: payload.lang,
      // Không log signature vì bảo mật
    });

    // ✅ Gửi request
    const response = await axios.post(config.endpoint, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ MoMo Response:', response.data);

    if (response.data.resultCode === 0) {
      console.log('🎉 MoMo payment created successfully!');
      console.log('🔗 Payment URL:', response.data.payUrl);
      console.log('📱 Deep Link:', response.data.deeplink);
      console.log('📱 App Link:', response.data.applink);
      console.log('📱 Mini App Link:', response.data.deeplinkMiniApp);
      console.log('📱 QR Code URL:', response.data.qrCodeUrl);
      return {
        success: true,
        data: response.data,
        orderId: orderId,
        requestId: requestId
      };
    } else {
      console.error('❌ MoMo payment creation failed:', response.data);
      return {
        success: false,
        error: response.data.message,
        resultCode: response.data.resultCode
      };
    }

  } catch (error) {
    console.error('❌ MoMo payment test error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// ✅ Test webhook signature verification
function testWebhookSignature() {
  console.log('🧪 Testing MoMo Webhook Signature Verification...');
  
  try {
    // Simulate webhook data from MoMo
    const webhookData = {
      orderId: 'TEST_ORDER_123',
      resultCode: 0,
      message: 'Success',
      transId: '123456789',
      amount: 10000,
      extraData: '',
      payType: 'qr',
      orderType: 'momo_wallet',
      transType: 'momo_wallet',
      mSignature: 'test_signature'
    };

    // ✅ Tạo signature để verify
    const rawSignature = `accessKey=${config.accessKey}&amount=${webhookData.amount}&extraData=${webhookData.extraData}&message=${webhookData.message}&orderId=${webhookData.orderId}&orderInfo=&orderType=${webhookData.orderType}&partnerCode=${config.partnerCode}&payType=${webhookData.payType}&resultCode=${webhookData.resultCode}&transId=${webhookData.transId}&transType=${webhookData.transType}`;
    
    const expectedSignature = createSignature(rawSignature, config.secretKey);
    
    console.log('📝 Raw Signature String:', rawSignature);
    console.log('🔐 Expected Signature:', expectedSignature);
    console.log('📥 Received Signature:', webhookData.mSignature);
    console.log('✅ Signature Match:', expectedSignature === webhookData.mSignature);
    
    return {
      success: true,
      expectedSignature: expectedSignature,
      receivedSignature: webhookData.mSignature,
      match: expectedSignature === webhookData.mSignature
    };

  } catch (error) {
    console.error('❌ Webhook signature test error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// ✅ Test các trường hợp lỗi
async function testErrorCases() {
  console.log('🧪 Testing MoMo Error Cases...');
  
  const testCases = [
    {
      name: 'Invalid Amount (too small)',
      payload: {
        amount: 500, // Dưới 1000 VND
        orderId: 'TEST_ERROR_1',
        orderInfo: 'Test error case',
        redirectUrl: 'http://localhost:5173/checkout/success'
      }
    },
    {
      name: 'Missing Required Fields',
      payload: {
        amount: 10000,
        // Thiếu orderId, orderInfo, redirectUrl
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.name}`);
    
    try {
      const response = await axios.post('http://localhost:8000/api/payment/momo/create', testCase.payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Response:', response.data);
      
    } catch (error) {
      console.log('❌ Expected Error:', error.response?.data || error.message);
    }
  }
}

// ✅ Main test function
async function runAllTests() {
  console.log('🚀 Starting MoMo Payment Tests (Official SDK Standard)...\n');
  
  // Test 1: Tạo thanh toán thành công
  console.log('='.repeat(60));
  const paymentResult = await testCreateMomoPayment();
  console.log('='.repeat(60));
  
  // Test 2: Verify webhook signature
  console.log('\n' + '='.repeat(60));
  const signatureResult = testWebhookSignature();
  console.log('='.repeat(60));
  
  // Test 3: Error cases
  console.log('\n' + '='.repeat(60));
  await testErrorCases();
  console.log('='.repeat(60));
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('Payment Creation:', paymentResult.success ? '✅ PASS' : '❌ FAIL');
  console.log('Signature Verification:', signatureResult.success ? '✅ PASS' : '❌ FAIL');
  
  if (paymentResult.success) {
    console.log('\n🎉 MoMo integration is working correctly!');
    console.log('🔗 You can test the payment URL:', paymentResult.data.payUrl);
  } else {
    console.log('\n⚠️ Some tests failed. Check the logs above for details.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testCreateMomoPayment, testWebhookSignature, testErrorCases, runAllTests };
