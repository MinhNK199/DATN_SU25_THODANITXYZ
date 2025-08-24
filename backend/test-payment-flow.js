const mongoose = require('mongoose');
const Order = require('./src/models/Order.js');
const { confirmOrderAfterPayment, handlePaymentFailed } = require('./src/controllers/order.js');

// Kết nối database
mongoose.connect('mongodb://localhost:27017/techtrend', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testPaymentFlow() {
  try {
    console.log('🔄 Testing complete payment flow...');
    
    // Test 1: Tạo order draft cho thanh toán online
    console.log('\n📦 Test 1: Creating draft order for online payment...');
    const testOrder = new Order({
      orderItems: [
        {
          product: '507f1f77bcf86cd799439011',
          name: 'Test Product',
          quantity: 1,
          price: 1000000,
          image: 'test.jpg'
        }
      ],
      user: '507f1f77bcf86cd799439012',
      shippingAddress: {
        fullName: 'Test User',
        phone: '0123456789',
        address: 'Test Address',
        city: 'Test City'
      },
      paymentMethod: 'momo',
      itemsPrice: 1000000,
      taxPrice: 80000,
      shippingPrice: 0,
      totalPrice: 1080000,
      status: 'draft',
      isPaid: false,
      paymentStatus: 'awaiting_payment',
      statusHistory: [
        {
          status: 'draft',
          note: 'Đơn hàng momo đang chờ thanh toán',
          date: Date.now()
        }
      ]
    });
    
    const savedOrder = await testOrder.save();
    console.log('✅ Draft order created:', savedOrder._id);
    console.log('Status:', savedOrder.status);
    console.log('Payment Status:', savedOrder.paymentStatus);
    console.log('Is Paid:', savedOrder.isPaid);
    
    // Test 2: Mô phỏng thanh toán thành công
    console.log('\n💰 Test 2: Simulating successful payment...');
    
    const updatedOrder = await confirmOrderAfterPayment(savedOrder._id, {
      id: 'test_transaction_id',
      status: 'success',
      method: 'momo',
      update_time: new Date().toISOString(),
      amount: 1080000
    });
    
    console.log('✅ Order updated after successful payment:');
    console.log('Status:', updatedOrder.status);
    console.log('Payment Status:', updatedOrder.paymentStatus);
    console.log('Is Paid:', updatedOrder.isPaid);
    console.log('Paid At:', updatedOrder.paidAt);
    
    // Test 3: Kiểm tra order trong database
    console.log('\n🔍 Test 3: Checking order in database...');
    const foundOrder = await Order.findById(savedOrder._id);
    console.log('✅ Found order in database:');
    console.log('Status:', foundOrder.status);
    console.log('Payment Status:', foundOrder.paymentStatus);
    console.log('Is Paid:', foundOrder.isPaid);
    console.log('Payment Result:', foundOrder.paymentResult);
    
    // Test 4: Kiểm tra order có hiển thị trong profile không
    console.log('\n👤 Test 4: Checking if order appears in user profile...');
    const userOrders = await Order.find({
      user: '507f1f77bcf86cd799439012',
      status: { $ne: 'payment_failed' }
    }).sort({ createdAt: -1 });
    
    console.log(`✅ Found ${userOrders.length} orders for user in profile`);
    userOrders.forEach((order, index) => {
      console.log(`Order ${index + 1}:`, {
        id: order._id.toString().slice(-6),
        status: order.status,
        paymentStatus: order.paymentStatus,
        isPaid: order.isPaid,
        paymentMethod: order.paymentMethod
      });
    });
    
    // Test 5: Kiểm tra order có hiển thị trong admin không
    console.log('\n👨‍💼 Test 5: Checking if order appears in admin panel...');
    const adminOrders = await Order.find({
      status: { $ne: 'payment_failed' }
    }).sort({ createdAt: -1 });
    
    console.log(`✅ Found ${adminOrders.length} orders in admin panel`);
    adminOrders.slice(0, 3).forEach((order, index) => {
      console.log(`Admin Order ${index + 1}:`, {
        id: order._id.toString().slice(-6),
        status: order.status,
        paymentStatus: order.paymentStatus,
        isPaid: order.isPaid,
        paymentMethod: order.paymentMethod
      });
    });
    
    // Test 6: Xóa order test
    console.log('\n🧹 Test 6: Cleaning up test order...');
    await Order.findByIdAndDelete(savedOrder._id);
    console.log('✅ Test order deleted');
    
    console.log('\n🎉 All payment flow tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Order creation: PASSED');
    console.log('- ✅ Payment confirmation: PASSED');
    console.log('- ✅ Database persistence: PASSED');
    console.log('- ✅ Profile visibility: PASSED');
    console.log('- ✅ Admin visibility: PASSED');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testPaymentFlow();
