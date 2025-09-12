import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    console.log('👤 Creating Admin User...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'testadmin@test.com' });
    
    if (existingAdmin) {
      console.log('👤 Admin already exists:');
      console.log(`  Name: ${existingAdmin.name}`);
      console.log(`  Email: ${existingAdmin.email}`);
      console.log(`  Role: ${existingAdmin.role}`);
      console.log(`  ID: ${existingAdmin._id}`);
      console.log(`  Active: ${existingAdmin.isActive}`);
    } else {
      // Create new admin
      const admin = new User({
        name: 'Test Admin',
        email: 'testadmin@test.com',
        password: 'password123',
        role: 'admin',
        isActive: true
      });

      await admin.save();
      console.log('✅ Created new admin:');
      console.log(`  Name: ${admin.name}`);
      console.log(`  Email: ${admin.email}`);
      console.log(`  Role: ${admin.role}`);
      console.log(`  ID: ${admin._id}`);
    }

    // List all admins
    const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } });
    console.log('\n👥 All admins in database:');
    admins.forEach((admin, index) => {
      console.log(`  ${index + 1}. ${admin.name} (${admin.email}) - Role: ${admin.role} - Active: ${admin.isActive}`);
    });

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
};

createAdmin();
