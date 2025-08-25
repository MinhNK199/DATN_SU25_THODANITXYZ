import axios from 'axios';
import crypto from 'crypto';
import moment from 'moment';
import CryptoJS from 'crypto-js';

// Test configuration
const BASE_URL = 'http://localhost:8000/api';
const TEST_AMOUNT = 10000; // 10,000 VND
const TEST_ORDER_ID = `test_${Date.now()}`;

// Test MoMo Payment
async function testMomoPayment() {
  console.log('🧪 Testing MoMo Payment...');
  
  try {
    const response = await axios.post(`${BASE_URL}/payment/momo/create`, {
      amount: TEST_AMOUNT,
      orderId: TEST_ORDER_ID,
      orderInfo: 'Test MoMo payment',
      redirectUrl: 'http://localhost:5173/checkout/success',
      ipnUrl: 'http://localhost:8000/api/payment/momo/webhook',
      extraData: ''
    });

    console.log('✅ MoMo Payment Response:', response.data);
    
    if (response.data.payUrl) {
      console.log('🔗 MoMo Payment URL:', response.data.payUrl);
      return true;
    } else {
      console.log('❌ MoMo Payment failed:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ MoMo Payment Error:', error.response?.data || error.message);
    return false;
  }
}

// Test VNPay Payment
async function testVnpayPayment() {
  console.log('🧪 Testing VNPay Payment...');
  
  try {
    const response = await axios.post(`${BASE_URL}/payment/vnpay/create`, {
      amount: TEST_AMOUNT,
      orderId: TEST_ORDER_ID,
      orderInfo: 'Test VNPay payment',
      redirectUrl: 'http://localhost:5173/checkout/success'
    });

    console.log('✅ VNPay Payment Response:', response.data);
    
    if (response.data.payUrl) {
      console.log('🔗 VNPay Payment URL:', response.data.payUrl);
      return true;
    } else {
      console.log('❌ VNPay Payment failed:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ VNPay Payment Error:', error.response?.data || error.message);
    return false;
  }
}

// Test ZaloPay Payment (requires authentication)
async function testZaloPayPayment() {
  console.log('🧪 Testing ZaloPay Payment...');
  
  try {
    // First, you need to login to get a token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'user@datn.com', // Replace with your test user
      password: 'user123'
    });

    const token = loginResponse.data.token;
    
    // Create an order first
    const orderResponse = await axios.post(`${BASE_URL}/order`, {
      orderItems: [{
        name: 'Test Product',
        quantity: 1,
        image: '',
        price: TEST_AMOUNT,
        product: '507f1f77bcf86cd799439011' // Replace with actual product ID
      }],
      shippingAddress: {
        fullName: 'Test User',
        address: '123 Test Street',
        city: 'Hà Nội',
        postalCode: '100000',
        phone: '0123456789'
      },
      paymentMethod: 'zalopay',
      itemsPrice: TEST_AMOUNT,
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: TEST_AMOUNT
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const orderId = orderResponse.data._id;
    
    // Create ZaloPay payment
    const zaloResponse = await axios.post(`${BASE_URL}/order/zalo-pay`, {
      orderId: orderId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ ZaloPay Payment Response:', zaloResponse.data);
    
    if (zaloResponse.data.data?.order_url) {
      console.log('🔗 ZaloPay Payment URL:', zaloResponse.data.data.order_url);
      return true;
    } else {
      console.log('❌ ZaloPay Payment failed:', zaloResponse.data);
      return false;
    }
  } catch (error) {
    console.error('❌ ZaloPay Payment Error:', error.response?.data || error.message);
    return false;
  }
}

// Test all payment methods
async function testAllPayments() {
  console.log('🚀 Starting Payment Sandbox Tests...\n');
  
  const results = {
    momo: false,
    vnpay: false,
    zalopay: false
  };

  // Test MoMo
  results.momo = await testMomoPayment();
  console.log('\n' + '='.repeat(50) + '\n');

  // Test VNPay
  results.vnpay = await testVnpayPayment();
  console.log('\n' + '='.repeat(50) + '\n');

  // Test ZaloPay
  results.zalopay = await testZaloPayPayment();
  console.log('\n' + '='.repeat(50) + '\n');

  // Summary
  console.log('📊 Test Results Summary:');
  console.log('MoMo Payment:', results.momo ? '✅ PASS' : '❌ FAIL');
  console.log('VNPay Payment:', results.vnpay ? '✅ PASS' : '❌ FAIL');
  console.log('ZaloPay Payment:', results.zalopay ? '✅ PASS' : '❌ FAIL');
  
  const passedCount = Object.values(results).filter(Boolean).length;
  console.log(`\n🎯 Overall: ${passedCount}/3 tests passed`);
  
  if (passedCount === 3) {
    console.log('🎉 All payment methods are working correctly!');
  } else {
    console.log('⚠️ Some payment methods need attention.');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAllPayments().catch(console.error);
}

export { testMomoPayment, testVnpayPayment, testZaloPayPayment, testAllPayments };
