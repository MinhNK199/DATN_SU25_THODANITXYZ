import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';
import ProductReservation from './src/models/ProductReservation.js';
import Cart from './src/models/Cart.js';
import User from './src/models/User.js';

dotenv.config();

// Kết nối database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/datn_ecommerce');

const testStockManagement = async () => {
  try {
    console.log('🚀 Bắt đầu test logic quản lý kho...\n');

    // 1. Tạo test data
    console.log('1. Tạo test data...');
    
    // Tạo user test
    const testUser1 = await User.findOne({ email: 'test1@example.com' }) || 
      await User.create({
        name: 'Test User 1',
        email: 'test1@example.com',
        password: 'password123',
        role: 'customer'
      });
    
    const testUser2 = await User.findOne({ email: 'test2@example.com' }) || 
      await User.create({
        name: 'Test User 2',
        email: 'test2@example.com',
        password: 'password123',
        role: 'customer'
      });

    // Tạo product test với stock = 10
    const testProduct = await Product.findOne({ name: 'Test Product Stock' }) ||
      await Product.create({
        name: 'Test Product Stock',
        price: 100000,
        stock: 10,
        description: 'Sản phẩm test quản lý kho',
        category: '64f1a2b3c4d5e6f7g8h9i0j1', // Thay bằng category ID thực
        brand: '64f1a2b3c4d5e6f7g8h9i0j2', // Thay bằng brand ID thực
        images: ['https://via.placeholder.com/300x300'],
        isActive: true
      });

    console.log(`✅ Đã tạo product: ${testProduct.name} với stock: ${testProduct.stock}\n`);

    // 2. Test lấy số lượng có sẵn ban đầu
    console.log('2. Kiểm tra số lượng có sẵn ban đầu...');
    const initialAvailableStock = await ProductReservation.getReservedQuantity(testProduct._id);
    console.log(`📊 Tổng kho: ${testProduct.stock}`);
    console.log(`📊 Đã đặt trước: ${initialAvailableStock}`);
    console.log(`📊 Có sẵn: ${testProduct.stock - initialAvailableStock}\n`);

    // 3. Test thêm vào giỏ hàng - User 1
    console.log('3. User 1 thêm 3 sản phẩm vào giỏ hàng...');
    await ProductReservation.createReservation(testProduct._id, testUser1._id, 3);
    
    let availableStock = await ProductReservation.getReservedQuantity(testProduct._id);
    console.log(`📊 Đã đặt trước: ${availableStock}`);
    console.log(`📊 Có sẵn: ${testProduct.stock - availableStock}\n`);

    // 4. Test thêm vào giỏ hàng - User 2
    console.log('4. User 2 thêm 4 sản phẩm vào giỏ hàng...');
    await ProductReservation.createReservation(testProduct._id, testUser2._id, 4);
    
    availableStock = await ProductReservation.getReservedQuantity(testProduct._id);
    console.log(`📊 Đã đặt trước: ${availableStock}`);
    console.log(`📊 Có sẵn: ${testProduct.stock - availableStock}\n`);

    // 5. Test thêm vào giỏ hàng - User 1 cập nhật số lượng
    console.log('5. User 1 cập nhật số lượng từ 3 lên 5...');
    await ProductReservation.createReservation(testProduct._id, testUser1._id, 5);
    
    availableStock = await ProductReservation.getReservedQuantity(testProduct._id);
    console.log(`📊 Đã đặt trước: ${availableStock}`);
    console.log(`📊 Có sẵn: ${testProduct.stock - availableStock}\n`);

    // 6. Test thử thêm quá số lượng có sẵn
    console.log('6. Test thử thêm quá số lượng có sẵn...');
    try {
      await ProductReservation.createReservation(testProduct._id, testUser1._id, 10);
      console.log('❌ Lỗi: Đã thêm được quá số lượng có sẵn');
    } catch (error) {
      console.log('✅ Đúng: Không thể thêm quá số lượng có sẵn');
    }

    // 7. Test xóa reservation - User 2
    console.log('\n7. User 2 xóa sản phẩm khỏi giỏ hàng...');
    await ProductReservation.updateMany(
      {
        product: testProduct._id,
        user: testUser2._id,
        isActive: true
      },
      {
        isActive: false
      }
    );
    
    availableStock = await ProductReservation.getReservedQuantity(testProduct._id);
    console.log(`📊 Đã đặt trước: ${availableStock}`);
    console.log(`📊 Có sẵn: ${testProduct.stock - availableStock}\n`);

    // 8. Test cleanup expired reservations
    console.log('8. Test cleanup expired reservations...');
    const expiredReservations = await ProductReservation.cleanupExpiredReservations();
    console.log(`🧹 Đã cleanup ${expiredReservations.length} reservations hết hạn\n`);

    // 9. Test cleanup old carts
    console.log('9. Test cleanup old carts...');
    await Cart.cleanupOldCarts();
    console.log('🧹 Đã cleanup carts cũ\n');

    // 10. Hiển thị kết quả cuối cùng
    console.log('10. Kết quả cuối cùng:');
    const finalAvailableStock = await ProductReservation.getReservedQuantity(testProduct._id);
    console.log(`📊 Tổng kho: ${testProduct.stock}`);
    console.log(`📊 Đã đặt trước: ${finalAvailableStock}`);
    console.log(`📊 Có sẵn: ${testProduct.stock - finalAvailableStock}`);

    // Hiển thị tất cả reservations hiện tại
    const activeReservations = await ProductReservation.find({ isActive: true }).populate('user', 'name email');
    console.log('\n📋 Danh sách reservations hiện tại:');
    activeReservations.forEach(reservation => {
      console.log(`- ${reservation.user.name} (${reservation.user.email}): ${reservation.quantity} sản phẩm`);
    });

    console.log('\n✅ Test hoàn thành!');

  } catch (error) {
    console.error('❌ Lỗi trong quá trình test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Đã ngắt kết nối database');
  }
};

// Chạy test
testStockManagement(); 