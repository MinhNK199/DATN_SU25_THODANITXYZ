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

// Import users from old system
const importUsersFromOldSystem = async () => {
  console.log('\n📥 IMPORTING USERS FROM OLD SYSTEM...\n');

  try {
    // Example: Import users from old system
    // You need to modify this based on your old system's data structure
    
    const oldSystemUsers = [
      {
        name: 'Customer 1',
        email: 'customer1@example.com',
        password: '123456', // Will be hashed
        role: 'customer',
        phone: '0123456789'
      },
      {
        name: 'Customer 2', 
        email: 'customer2@example.com',
        password: '123456',
        role: 'customer',
        phone: '0987654321'
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        phone: '0555555555'
      }
    ];

    console.log(`Importing ${oldSystemUsers.length} users...`);

    for (const userData of oldSystemUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`⚠️  User already exists: ${userData.email}`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user
      const user = new User({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        phone: userData.phone,
        emailVerified: true,
        active: true
      });

      await user.save();
      console.log(`✅ Imported user: ${user.name} (${user.email})`);
    }

    console.log('\n🎉 USERS IMPORTED SUCCESSFULLY!');

  } catch (error) {
    console.error('❌ Error importing users:', error);
  }
};

// Run the script
const runScript = async () => {
  await connectDB();
  await importUsersFromOldSystem();
  process.exit(0);
};

runScript();
