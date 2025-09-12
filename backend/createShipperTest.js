import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Schema cho Shipper
const shipperSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  avatar: { type: String, default: null },
  vehicleType: { type: String, enum: ['motorbike', 'car', 'truck'], default: 'motorbike' },
  vehicleNumber: { type: String, default: null },
  idCard: { type: String, required: true },
  address: { type: String, required: true },
  status: { type: String, enum: ['pending', 'active', 'inactive', 'suspended'], default: 'active' },
  isOnline: { type: Boolean, default: false },
  currentLocation: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    address: { type: String, default: null }
  },
  rating: { type: Number, default: 5.0 },
  totalDeliveries: { type: Number, default: 0 },
  successfulDeliveries: { type: Number, default: 0 },
  lastActiveAt: { type: Date, default: Date.now },
  joinedAt: { type: Date, default: Date.now }
});

const Shipper = mongoose.model('Shipper', shipperSchema);

async function createTestShipper() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/datn_su25_thodanitxyz');
    console.log('✅ Connected to MongoDB');

    // Kiểm tra shipper đã tồn tại chưa
    const existingShipper = await Shipper.findOne({ 
      $or: [
        { email: 'shipper@test.com' },
        { username: 'testshipper' }
      ]
    });

    if (existingShipper) {
      console.log('🚚 Test shipper already exists:');
      console.log('📧 Email: shipper@test.com');
      console.log('🔑 Password: 123456');
      console.log('👤 Username:', existingShipper.username);
      console.log('📱 Phone:', existingShipper.phone);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Tạo shipper mới
    const newShipper = new Shipper({
      username: 'testshipper',
      email: 'shipper@test.com',
      password: hashedPassword,
      fullName: 'Nguyễn Văn Shipper',
      phone: '0123456789',
      vehicleType: 'motorbike',
      vehicleNumber: '29A1-12345',
      idCard: '123456789012',
      address: '123 Đường Test, Quận 1, TP.HCM',
      status: 'active',
      isOnline: false,
      rating: 5.0,
      totalDeliveries: 0,
      successfulDeliveries: 0
    });

    await newShipper.save();

    console.log('🎉 Test shipper created successfully!');
    console.log('');
    console.log('📋 THÔNG TIN TÀI KHOẢN SHIPPER:');
    console.log('📧 Email: shipper@test.com');
    console.log('🔑 Password: 123456');
    console.log('👤 Username: testshipper');
    console.log('📱 Phone: 0123456789');
    console.log('🚚 Vehicle: motorbike (29A1-12345)');
    console.log('🏠 Address: 123 Đường Test, Quận 1, TP.HCM');
    console.log('');
    console.log('✅ Bây giờ bạn có thể đăng nhập với:');
    console.log('   Email: shipper@test.com');
    console.log('   Password: 123456');

  } catch (error) {
    console.error('❌ Error creating shipper:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createTestShipper();
