const mongoose = require('mongoose');
const Order = require('./src/models/Order.js');

// Kết nối database
mongoose.connect('mongodb://localhost:27017/techtrend', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testOrderFlow() {
  try {
    console.log('🔄 Testing order flow...');
    
    // Test 1: Tạo order mới
    console.log('\n📦 Test 1: Creating new order...');
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
    console.log('✅ Order created:', savedOrder._id);
    console.log('Status:', savedOrder.status);
    console.log('Payment Status:', savedOrder.paymentStatus);
    console.log('Is Paid:', savedOrder.isPaid);
    
    // Test 2: Cập nhật order sau khi thanh toán thành công
    console.log('\n💰 Test 2: Updating order after successful payment...');
    
    const { confirmOrderAfterPayment } = require('./src/controllers/order.js');
    
    const updatedOrder = await confirmOrderAfterPayment(savedOrder._id, {
      id: 'test_transaction_id',
      status: 'success',
      method: 'momo',
      update_time: new Date().toISOString(),
      amount: 1080000
    });
    
    console.log('✅ Order updated after payment:');
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
    
    // Test 4: Xóa order test
    console.log('\n🧹 Test 4: Cleaning up test order...');
    await Order.findByIdAndDelete(savedOrder._id);
    console.log('✅ Test order deleted');
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testOrderFlow();
