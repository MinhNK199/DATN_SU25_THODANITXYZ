import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Conversation from './src/models/Conversation.js';
import User from './src/models/User.js';

dotenv.config();

const checkConversationStatus = async () => {
  try {
    console.log('🔍 Checking Conversation Status...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find customer user
    const customer = await User.findOne({ 
      email: 'testcustomer@test.com',
      role: 'customer'
    });
    
    if (!customer) {
      console.log('❌ Customer not found!');
      return;
    }

    console.log('👤 Customer found:');
    console.log(`  Name: ${customer.name}`);
    console.log(`  Email: ${customer.email}`);
    console.log(`  Role: ${customer.role}`);
    console.log(`  ID: ${customer._id}`);
    console.log('');

    // Check all conversations for this customer
    const allConversations = await Conversation.find({
      participants: customer._id
    }).populate('participants', 'name email role');

    console.log('💬 All conversations for customer:');
    allConversations.forEach((conv, index) => {
      console.log(`  ${index + 1}. Conversation ID: ${conv._id}`);
      console.log(`     Type: ${conv.type}`);
      console.log(`     Status: ${conv.status}`);
      console.log(`     Participants: ${conv.participants.map(p => `${p.name} (${p.role})`).join(', ')}`);
      console.log(`     Created: ${conv.createdAt}`);
      console.log('');
    });

    // Check for active/pending conversations
    const activeConversations = await Conversation.find({
      participants: customer._id,
      type: 'customer_support',
      status: { $in: ['active', 'pending'] }
    }).populate('participants', 'name email role');

    console.log('💬 Active/Pending conversations for customer:');
    if (activeConversations.length === 0) {
      console.log('  ❌ No active/pending conversations found!');
    } else {
      activeConversations.forEach((conv, index) => {
        console.log(`  ${index + 1}. Conversation ID: ${conv._id}`);
        console.log(`     Type: ${conv.type}`);
        console.log(`     Status: ${conv.status}`);
        console.log(`     Participants: ${conv.participants.map(p => `${p.name} (${p.role})`).join(', ')}`);
        console.log('');
      });
    }

    // Update conversation status to active if needed
    const mainConversation = await Conversation.findById('68bd203c4b077f605f62e995');
    if (mainConversation && mainConversation.status !== 'active') {
      console.log(`🔧 Updating conversation status from ${mainConversation.status} to active...`);
      mainConversation.status = 'active';
      await mainConversation.save();
      console.log('✅ Conversation status updated to active');
    }

  } catch (error) {
    console.error('❌ Error checking conversation status:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
};

checkConversationStatus();
