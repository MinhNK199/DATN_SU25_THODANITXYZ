import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Conversation from './src/models/Conversation.js';
import User from './src/models/User.js';

dotenv.config();

const checkSuperAdminConversation = async () => {
  try {
    console.log('🔍 Checking SuperAdmin Conversation Access...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find superadmin user
    const superAdmin = await User.findOne({ 
      email: 'admindatn@gmail.com',
      role: 'superadmin'
    });
    
    if (!superAdmin) {
      console.log('❌ SuperAdmin not found!');
      return;
    }

    console.log('👤 SuperAdmin found:');
    console.log(`  Name: ${superAdmin.name}`);
    console.log(`  Email: ${superAdmin.email}`);
    console.log(`  Role: ${superAdmin.role}`);
    console.log(`  ID: ${superAdmin._id}`);
    console.log('');

    // Check conversations that superadmin can access
    const conversations = await Conversation.find({
      participants: superAdmin._id
    }).populate('participants', 'name email role');

    console.log('💬 Conversations where SuperAdmin is participant:');
    if (conversations.length === 0) {
      console.log('  ❌ SuperAdmin is not a participant in any conversation!');
    } else {
      conversations.forEach((conv, index) => {
        console.log(`  ${index + 1}. Conversation ID: ${conv._id}`);
        console.log(`     Type: ${conv.type}`);
        console.log(`     Status: ${conv.status}`);
        console.log(`     Participants: ${conv.participants.map(p => `${p.name} (${p.role})`).join(', ')}`);
        console.log('');
      });
    }

    // Check all conversations in database
    const allConversations = await Conversation.find({})
      .populate('participants', 'name email role');
    
    console.log('💬 All conversations in database:');
    allConversations.forEach((conv, index) => {
      const isSuperAdminParticipant = conv.participants.some(p => p._id.toString() === superAdmin._id.toString());
      console.log(`  ${index + 1}. Conversation ID: ${conv._id}`);
      console.log(`     Type: ${conv.type}`);
      console.log(`     Status: ${conv.status}`);
      console.log(`     Participants: ${conv.participants.map(p => `${p.name} (${p.role})`).join(', ')}`);
      console.log(`     SuperAdmin is participant: ${isSuperAdminParticipant ? '✅' : '❌'}`);
      console.log('');
    });

    // Add superadmin to the main conversation if not already there
    const mainConversation = await Conversation.findById('68bd203c4b077f605f62e995')
      .populate('participants', 'name email role');
    
    if (mainConversation) {
      const isSuperAdminParticipant = mainConversation.participants.some(p => p._id.toString() === superAdmin._id.toString());
      
      if (!isSuperAdminParticipant) {
        console.log('🔧 Adding SuperAdmin to main conversation...');
        mainConversation.participants.push(superAdmin._id);
        await mainConversation.save();
        console.log('✅ SuperAdmin added to main conversation');
        
        // Verify
        const updatedConversation = await Conversation.findById(mainConversation._id)
          .populate('participants', 'name email role');
        console.log(`📋 Updated participants: ${updatedConversation.participants.map(p => `${p.name} (${p.role})`).join(', ')}`);
      } else {
        console.log('✅ SuperAdmin is already a participant in main conversation');
      }
    }

  } catch (error) {
    console.error('❌ Error checking SuperAdmin conversation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
};

checkSuperAdminConversation();
