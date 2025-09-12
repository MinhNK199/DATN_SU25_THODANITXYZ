import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/techtrend');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create real users for your website
const createRealUsers = async () => {
  console.log('\n🔧 CREATING REAL USERS FOR YOUR WEBSITE...\n');

  try {
    // Check if users already exist
    const existingUsers = await User.find({});
    console.log(`Found ${existingUsers.length} existing users in database`);

    // Create your real customer account
    const customerEmail = 'your-email@example.com'; // Thay bằng email thực tế của bạn
    const customerPassword = await bcrypt.hash('your-password', 12); // Thay bằng password thực tế
    
    const customer = new User({
      name: 'Your Real Name', // Thay bằng tên thực tế
      email: customerEmail,
      password: customerPassword,
      role: 'customer',
      phone: '0123456789', // Thay bằng số điện thoại thực tế
      emailVerified: true,
      active: true
    });
    
    await customer.save();
    console.log('✅ Created real customer:', customer.name, customer.email);

    // Create your real admin account
    const adminEmail = 'admin@yourwebsite.com'; // Thay bằng email admin thực tế
    const adminPassword = await bcrypt.hash('admin-password', 12); // Thay bằng password admin thực tế
    
    const admin = new User({
      name: 'Admin Account', // Thay bằng tên admin thực tế
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      phone: '0987654321', // Thay bằng số điện thoại admin thực tế
      emailVerified: true,
      active: true
    });
    
    await admin.save();
    console.log('✅ Created real admin:', admin.name, admin.email);

    // Create your real superadmin account
    const superadminEmail = 'superadmin@yourwebsite.com'; // Thay bằng email superadmin thực tế
    const superadminPassword = await bcrypt.hash('superadmin-password', 12); // Thay bằng password superadmin thực tế
    
    const superadmin = new User({
      name: 'Super Admin', // Thay bằng tên superadmin thực tế
      email: superadminEmail,
      password: superadminPassword,
      role: 'superadmin',
      phone: '0555555555', // Thay bằng số điện thoại superadmin thực tế
      emailVerified: true,
      active: true
    });
    
    await superadmin.save();
    console.log('✅ Created real superadmin:', superadmin.name, superadmin.email);

    console.log('\n🎉 REAL USERS CREATED SUCCESSFULLY!');
    console.log('\n📋 YOUR REAL LOGIN CREDENTIALS:');
    console.log(`Customer: ${customerEmail} / your-password`);
    console.log(`Admin: ${adminEmail} / admin-password`);
    console.log(`Superadmin: ${superadminEmail} / superadmin-password`);
    
    console.log('\n⚠️  IMPORTANT: Please update the email addresses and passwords in this script to match your real information!');

  } catch (error) {
    console.error('❌ Error creating real users:', error);
  }
};

// Run the script
const runScript = async () => {
  await connectDB();
  await createRealUsers();
  process.exit(0);
};

runScript();
