// Debug script để kiểm tra lỗi API total-product-quantity-by-name
import mongoose from 'mongoose';
import Product from './src/models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const debugProductQuantity = async () => {
  console.log('🔍 Debugging Product Quantity API...\n');

  try {
    // Test 1: Kiểm tra kết nối database
    console.log('1️⃣ Testing database connection...');
    await connectDB();

    // Test 2: Kiểm tra Product model
    console.log('\n2️⃣ Testing Product model...');
    const productCount = await Product.countDocuments();
    console.log(`   Total products: ${productCount}`);

    // Test 3: Kiểm tra field stock
    console.log('\n3️⃣ Testing stock field...');
    const sampleProduct = await Product.findOne().select('name stock isActive');
    console.log('   Sample product:', sampleProduct);

    // Test 4: Kiểm tra aggregation query
    console.log('\n4️⃣ Testing aggregation query...');
    const result = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalQuantity: { $sum: '$stock' } } }
    ]);
    console.log('   Aggregation result:', result);

    // Test 5: Kiểm tra products có isActive = true
    console.log('\n5️⃣ Testing active products...');
    const activeProducts = await Product.find({ isActive: true }).select('name stock isActive').limit(5);
    console.log('   Active products sample:', activeProducts);

    // Test 6: Kiểm tra products có stock > 0
    console.log('\n6️⃣ Testing products with stock...');
    const productsWithStock = await Product.find({ 
      isActive: true, 
      stock: { $gt: 0 } 
    }).select('name stock isActive').limit(5);
    console.log('   Products with stock sample:', productsWithStock);

    // Test 7: Kiểm tra tổng stock thực tế
    console.log('\n7️⃣ Testing total stock calculation...');
    const totalStock = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalQuantity: { $sum: '$stock' } } }
    ]);
    
    const totalProductQuantityByName = totalStock.length > 0 ? totalStock[0].totalQuantity : 0;
    console.log('   Total quantity:', totalProductQuantityByName);

    console.log('\n✅ Debug completed successfully!');

  } catch (error) {
    console.error('\n❌ Debug error:', error);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

// Chạy debug
debugProductQuantity().catch(console.error);
