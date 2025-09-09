import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Conversation from './src/models/Conversation.js';
import User from './src/models/User.js';

dotenv.config();

const fixConversation = async () => {
  try {
    console.log('🔧 Fixing Conversation Data...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the problematic conversation
    const conversation = await Conversation.findById('68bd203c4b077f605f62e995')
      .populate('participants', 'name email role');
    
    if (!conversation) {
      console.log('❌ Conversation not found!');
      return;
    }

    console.log('📋 Current conversation:');
    console.log(`  ID: ${conversation._id}`);
    console.log(`  Participants: ${conversation.participants.map(p => `${p.name} (${p.role})`).join(', ')}`);
    console.log(`  Type: ${conversation.type}`);
    console.log(`  Status: ${conversation.status}`);
    console.log('');

    // Find an admin to add
    const admin = await User.findOne({ 
      role: { $in: ['admin', 'superadmin'] }
    });

    if (!admin) {
      console.log('❌ No admin found!');
      return;
    }

    console.log(`👤 Found admin: ${admin.name} (${admin.email}) - Role: ${admin.role}`);
    console.log('');

    // Check if admin is already a participant
    const isAdminParticipant = conversation.participants.some(p => p._id.toString() === admin._id.toString());
    
    if (isAdminParticipant) {
      console.log('✅ Admin is already a participant');
    } else {
      // Add admin to participants
      conversation.participants.push(admin._id);
      await conversation.save();
      console.log('✅ Added admin to conversation participants');
    }

    // Verify the fix
    const updatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name email role');
    
    console.log('\n📋 Updated conversation:');
    console.log(`  ID: ${updatedConversation._id}`);
    console.log(`  Participants: ${updatedConversation.participants.map(p => `${p.name} (${p.role})`).join(', ')}`);
    console.log(`  Type: ${updatedConversation.type}`);
    console.log(`  Status: ${updatedConversation.status}`);

    console.log('\n✅ Conversation fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing conversation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
};

fixConversation();
