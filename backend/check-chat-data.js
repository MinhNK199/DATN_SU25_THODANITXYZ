import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Conversation from './src/models/Conversation.js';
import Message from './src/models/Message.js';
import User from './src/models/User.js';

dotenv.config();

const checkChatData = async () => {
  try {
    console.log('🔍 Checking Chat Data in Database...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check Users
    const users = await User.find({ email: { $in: ['testcustomer@test.com', 'testadmin@test.com'] } });
    console.log('👥 Users in database:');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Role: ${user.role} - ID: ${user._id}`);
    });
    console.log('');

    // Check Conversations
    const conversations = await Conversation.find({})
      .populate('participants', 'name email role')
      .populate('lastMessage')
      .populate('assignedTo', 'name email');
    
    console.log('💬 Conversations in database:');
    if (conversations.length === 0) {
      console.log('  ❌ No conversations found!');
    } else {
      conversations.forEach((conv, index) => {
        console.log(`  ${index + 1}. Conversation ID: ${conv._id}`);
        console.log(`     Type: ${conv.type}`);
        console.log(`     Status: ${conv.status}`);
        console.log(`     Participants: ${conv.participants.map(p => `${p.name} (${p.role})`).join(', ')}`);
        console.log(`     Last Message: ${conv.lastMessage ? conv.lastMessage.content : 'None'}`);
        console.log(`     Created: ${conv.createdAt}`);
        console.log('');
      });
    }

    // Check Messages
    const messages = await Message.find({})
      .populate('sender', 'name email role')
      .populate('conversation');
    
    console.log('📝 Messages in database:');
    if (messages.length === 0) {
      console.log('  ❌ No messages found!');
    } else {
      messages.forEach((msg, index) => {
        console.log(`  ${index + 1}. Message ID: ${msg._id}`);
        console.log(`     Content: ${msg.content}`);
        console.log(`     Sender: ${msg.sender.name} (${msg.sender.role})`);
        console.log(`     Conversation: ${msg.conversation._id}`);
        console.log(`     Type: ${msg.type}`);
        console.log(`     Status: ${msg.status}`);
        console.log(`     Created: ${msg.createdAt}`);
        console.log('');
      });
    }

    // Check for orphaned data
    console.log('🔍 Checking for data consistency...');
    
    // Check if there are messages without conversations
    const orphanedMessages = await Message.find({ conversation: { $exists: false } });
    if (orphanedMessages.length > 0) {
      console.log(`  ⚠️ Found ${orphanedMessages.length} orphaned messages`);
    } else {
      console.log('  ✅ No orphaned messages found');
    }

    // Check if there are conversations without participants
    const emptyConversations = await Conversation.find({ participants: { $size: 0 } });
    if (emptyConversations.length > 0) {
      console.log(`  ⚠️ Found ${emptyConversations.length} conversations without participants`);
    } else {
      console.log('  ✅ All conversations have participants');
    }

    console.log('\n📊 Summary:');
    console.log(`  - Users: ${users.length}`);
    console.log(`  - Conversations: ${conversations.length}`);
    console.log(`  - Messages: ${messages.length}`);

  } catch (error) {
    console.error('❌ Error checking chat data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
};

checkChatData();
