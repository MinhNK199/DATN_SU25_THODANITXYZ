import mongoose from 'mongoose';
import Conversation from './src/models/Conversation.js';
import Message from './src/models/Message.js';
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

// Check real website data
const checkRealWebsiteData = async () => {
  console.log('\n🔍 CHECKING REAL WEBSITE DATA...\n');

  try {
    // 1. Check all users in database
    console.log('1️⃣ All users in database:');
    const allUsers = await User.find({}).select('name email role active createdAt');
    console.log(`Found ${allUsers.length} total users:`);
    
    allUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email})`);
      console.log(`     Role: ${user.role}`);
      console.log(`     Active: ${user.active}`);
      console.log(`     Created: ${user.createdAt}`);
      console.log('');
    });

    // 2. Check users by role
    console.log('2️⃣ Users by role:');
    const customers = await User.find({ role: 'customer' }).select('name email active');
    const admins = await User.find({ role: 'admin' }).select('name email active');
    const superadmins = await User.find({ role: 'superadmin' }).select('name email active');
    
    console.log(`Customers (${customers.length}):`);
    customers.forEach(user => console.log(`  - ${user.name} (${user.email}) - Active: ${user.active}`));
    
    console.log(`\nAdmins (${admins.length}):`);
    admins.forEach(user => console.log(`  - ${user.name} (${user.email}) - Active: ${user.active}`));
    
    console.log(`\nSuperadmins (${superadmins.length}):`);
    superadmins.forEach(user => console.log(`  - ${user.name} (${user.email}) - Active: ${user.active}`));

    // 3. Check conversations
    console.log('\n3️⃣ All conversations:');
    const conversations = await Conversation.find({})
      .populate('participants', 'name email role')
      .populate('lastMessage')
      .populate('assignedTo', 'name email role');
    
    console.log(`Found ${conversations.length} conversations:`);
    conversations.forEach((conv, index) => {
      console.log(`  ${index + 1}. ID: ${conv._id}`);
      console.log(`     Type: ${conv.type}`);
      console.log(`     Status: ${conv.status}`);
      console.log(`     Subject: ${conv.subject}`);
      console.log(`     Participants: ${conv.participants.map(p => `${p.name}(${p.role})`).join(', ')}`);
      console.log(`     Assigned To: ${conv.assignedTo ? conv.assignedTo.name : 'None'}`);
      console.log(`     Last Message: ${conv.lastMessage ? conv.lastMessage.content : 'None'}`);
      console.log(`     Created: ${conv.createdAt}`);
      console.log('');
    });

    // 4. Check messages
    console.log('4️⃣ All messages:');
    const messages = await Message.find({})
      .populate('sender', 'name email role')
      .populate('conversation', 'type status')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${messages.length} messages:`);
    messages.forEach((msg, index) => {
      console.log(`  ${index + 1}. ID: ${msg._id}`);
      console.log(`     Content: ${msg.content}`);
      console.log(`     Sender: ${msg.sender.name} (${msg.sender.role})`);
      console.log(`     Conversation: ${msg.conversation._id} (${msg.conversation.type})`);
      console.log(`     Type: ${msg.type}`);
      console.log(`     Created: ${msg.createdAt}`);
      console.log('');
    });

    // 5. Check for potential issues
    console.log('5️⃣ Potential issues:');
    
    // Check for conversations without admin participants
    const conversationsWithoutAdmin = conversations.filter(conv => 
      !conv.participants.some(p => p.role === 'admin' || p.role === 'superadmin')
    );
    
    if (conversationsWithoutAdmin.length > 0) {
      console.log(`❌ Found ${conversationsWithoutAdmin.length} conversations without admin participants:`);
      conversationsWithoutAdmin.forEach(conv => {
        console.log(`  - ${conv._id}: ${conv.participants.map(p => p.name).join(', ')}`);
      });
    } else {
      console.log('✅ All conversations have admin participants');
    }

    // Check for conversations with only one participant
    const singleParticipantConversations = conversations.filter(conv => 
      conv.participants.length < 2
    );
    
    if (singleParticipantConversations.length > 0) {
      console.log(`❌ Found ${singleParticipantConversations.length} conversations with only one participant:`);
      singleParticipantConversations.forEach(conv => {
        console.log(`  - ${conv._id}: ${conv.participants.map(p => p.name).join(', ')}`);
      });
    } else {
      console.log('✅ All conversations have multiple participants');
    }

    // Check for messages without proper sender
    const messagesWithoutSender = messages.filter(msg => !msg.sender);
    if (messagesWithoutSender.length > 0) {
      console.log(`❌ Found ${messagesWithoutSender.length} messages without sender`);
    } else {
      console.log('✅ All messages have proper sender');
    }

    console.log('\n✅ REAL WEBSITE DATA CHECK COMPLETED!');

  } catch (error) {
    console.error('❌ Error checking real website data:', error);
  }
};

// Run the check
const runCheck = async () => {
  await connectDB();
  await checkRealWebsiteData();
  process.exit(0);
};

runCheck();
