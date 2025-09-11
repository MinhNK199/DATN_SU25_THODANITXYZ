import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

// Get all conversations for a user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { page = 1, limit = 20, status } = req.query;

    // Get conversations

    // Build filter based on user role
    let filter = {};
    
    // For regular users, only show their conversations
    if (userRole === 'customer') {
      filter.participants = new mongoose.Types.ObjectId(userId);
      if (status) {
        filter.status = status;
      } else {
        filter.status = { $in: ['active', 'pending'] };
      }
    }
    // For superadmin, show ALL conversations
    else if (userRole === 'superadmin') {
      // No participant filter - superadmin sees everything
      if (status) {
        filter.status = status;
      }
    }
    // For regular admins, show conversations they're part of
    else if (userRole === 'admin') {
      filter.participants = new mongoose.Types.ObjectId(userId);
      if (status) {
        filter.status = status;
      }
    }

    // Apply filter

    const conversations = await Conversation.find(filter)
      .populate('participants', 'name email avatar role')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'name email avatar role'
        }
      })
      .populate('assignedTo', 'name email avatar')
      .sort({ lastMessageAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Conversation.countDocuments(filter);

    // Return conversations

    res.json({
      success: true,
      data: {
        conversations,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách cuộc trò chuyện'
    });
  }
};

// Get conversation by ID
export const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    
    console.log('Getting conversation:', { conversationId, userId });

    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'name email avatar role')
      .populate('assignedTo', 'name email avatar');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cuộc trò chuyện'
      });
    }

    // Check if user is participant or superadmin
    if (req.user.role !== 'superadmin') {
      const isParticipant = conversation.participants.some(p => {
        const participantId = typeof p === 'object' ? p._id.toString() : p.toString();
        return participantId === userId.toString();
      });
      
      if (!isParticipant) {
        console.log('Permission denied:', { userId, participants: conversation.participants });
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập cuộc trò chuyện này'
        });
      }
    }

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin cuộc trò chuyện'
    });
  }
};

// Create new conversation
export const createConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { participantId, type = 'customer_support', subject = '' } = req.body;
    
    console.log('Creating conversation:', { userId, participantId, type, subject });

    let adminId = participantId;

    // If no specific admin provided, find an available admin
    if (!adminId || adminId === 'admin' || typeof adminId === 'string') {
      const admin = await User.findOne({ 
        role: { $in: ['admin', 'superadmin'] }
      }).sort({ createdAt: 1 }); // Get the first admin

      if (!admin) {
        return res.status(400).json({
          success: false,
          message: 'Không có admin nào khả dụng'
        });
      }
      adminId = admin._id;
      console.log('Found admin for conversation:', admin.name, admin.email);
    }

    // Check if conversation already exists for customer support
    if (type === 'customer_support') {
      const existingConversation = await Conversation.findOne({
        participants: userId,
        type: 'customer_support',
        status: { $in: ['active', 'pending'] }
      }).populate('participants', 'name email avatar role');

      if (existingConversation) {
        console.log('Found existing conversation:', existingConversation._id);
        return res.json({
          success: true,
          data: existingConversation,
          message: 'Cuộc trò chuyện đã tồn tại'
        });
      }
    } else {
      // For other types, check if conversation exists between specific users
      const existingConversation = await Conversation.findOne({
        participants: { $all: [userId, adminId] },
        type,
        status: { $in: ['active', 'pending'] }
      });

      if (existingConversation) {
        return res.json({
          success: true,
          data: existingConversation,
          message: 'Cuộc trò chuyện đã tồn tại'
        });
      }
    }

    const conversation = new Conversation({
      participants: [userId, adminId],
      type,
      subject,
      status: 'active'
    });

    await conversation.save();
    await conversation.populate('participants', 'name email avatar role');

    // Emit socket event to notify admin about new conversation
    const io = req.app.get('io');
    if (io) {
      console.log('Emitting new_conversation event to admin:', adminId);
      io.to(`user_${adminId}`).emit('new_conversation', {
        conversation: conversation,
        message: 'Có cuộc trò chuyện mới từ khách hàng'
      });
      
      // Also emit to all admins in case the specific admin is not online
      io.emit('admin_new_conversation', {
        conversation: conversation,
        message: 'Có cuộc trò chuyện mới từ khách hàng'
      });
    }

    res.status(201).json({
      success: true,
      data: conversation,
      message: 'Tạo cuộc trò chuyện thành công'
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo cuộc trò chuyện'
    });
  }
};

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    // Check if user has access to conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cuộc trò chuyện'
      });
    }

    // Check if user is participant or superadmin
    console.log('Checking message access:', { 
      userId, 
      userRole: req.user.role,
      userIdType: typeof userId,
      participants: conversation.participants.map(p => ({
        id: typeof p === 'object' ? p._id.toString() : p.toString(),
        type: typeof p,
        raw: p
      }))
    });
    
    // Superadmin can access all conversations
    if (req.user.role === 'superadmin') {
      console.log('Superadmin access granted');
    } else {
      // Regular users must be participants
      const isParticipant = conversation.participants.some(p => {
        const participantId = typeof p === 'object' ? p._id.toString() : p.toString();
        const isMatch = participantId === userId.toString();
        console.log('Participant check:', { participantId, userId: userId.toString(), isMatch });
        return isMatch;
      });
      
      console.log('Final isParticipant result:', isParticipant);
      
      if (!isParticipant) {
        console.log('Permission denied for messages:', { userId, participants: conversation.participants });
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập cuộc trò chuyện này'
        });
      }
    }

    const messages = await Message.find({
      conversation: conversationId,
      isDeleted: false
    })
    .populate('sender', 'name email avatar role')
    .populate('replyTo')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Message.countDocuments({
      conversation: conversationId,
      isDeleted: false
    });

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to get chronological order
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy tin nhắn'
    });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const { content, type = 'text', replyTo, attachments = [] } = req.body;

    // Send message

    // Check if user has access to conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cuộc trò chuyện'
      });
    }

    // Superadmin can send messages to any conversation
    if (req.user.role !== 'superadmin') {
      if (!conversation.isParticipant(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này'
        });
      }
    }

    const message = new Message({
      conversation: conversationId,
      sender: userId,
      content,
      type,
      replyTo,
      attachments
    });

    await message.save();
    
    await message.populate('sender', 'name email avatar role');
    await message.populate('replyTo');

    // Auto update conversation status and priority for new customer messages
    if (message.sender.role === 'customer' || message.sender.role === 'user') {
      try {
        await Conversation.findByIdAndUpdate(
          conversationId,
          {
            priority: 'high',
            status: 'pending'
          }
        );
        console.log('Conversation status updated via API');
      } catch (updateError) {
        console.error('Error updating conversation status via API:', updateError);
      }
    }

    res.status(201).json({
      success: true,
      data: message,
      message: 'Gửi tin nhắn thành công'
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi gửi tin nhắn'
    });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Check if user has access to conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cuộc trò chuyện'
      });
    }

    // Superadmin can mark messages as read in any conversation
    if (req.user.role !== 'superadmin') {
      if (!conversation.isParticipant(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập cuộc trò chuyện này'
        });
      }
    }

    // Mark all unread messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        readBy: { $not: { $elemMatch: { user: userId } } },
        isDeleted: false
      },
      {
        $push: {
          readBy: {
            user: userId,
            readAt: new Date()
          }
        }
      }
    );

    res.json({
      success: true,
      message: 'Đã đánh dấu tin nhắn là đã đọc'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đánh dấu tin nhắn'
    });
  }
};

// Update conversation status (for admins)
export const updateConversationStatus = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const { status, assignedTo, priority, tags } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có quyền cập nhật trạng thái cuộc trò chuyện'
      });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cuộc trò chuyện'
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (priority) updateData.priority = priority;
    if (tags) updateData.tags = tags;

    const updatedConversation = await Conversation.findByIdAndUpdate(
      conversationId,
      updateData,
      { new: true }
    ).populate('participants', 'fullName email avatar role')
     .populate('assignedTo', 'fullName email avatar');

    res.json({
      success: true,
      data: updatedConversation,
      message: 'Cập nhật trạng thái cuộc trò chuyện thành công'
    });
  } catch (error) {
    console.error('Error updating conversation status:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái cuộc trò chuyện'
    });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participants: userId,
      status: { $in: ['active', 'pending'] }
    });

    let totalUnread = 0;
    for (const conversation of conversations) {
      const unreadCount = await Message.getUnreadCount(conversation._id, userId);
      totalUnread += unreadCount;
    }

    res.json({
      success: true,
      data: {
        totalUnread
      }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy số tin nhắn chưa đọc'
    });
  }
};

// Get chat statistics (admin only)
export const getChatStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có quyền xem thống kê chat'
      });
    }

    const totalConversations = await Conversation.countDocuments();
    const activeConversations = await Conversation.countDocuments({ status: 'active' });
    const pendingConversations = await Conversation.countDocuments({ status: 'pending' });
    const closedConversations = await Conversation.countDocuments({ status: 'closed' });

    // Calculate average response time (simplified)
    const messages = await Message.find({ type: 'text' })
      .populate('conversation')
      .sort({ createdAt: -1 })
      .limit(100);

    let totalResponseTime = 0;
    let responseCount = 0;

    for (let i = 1; i < messages.length; i++) {
      const current = messages[i];
      const previous = messages[i - 1];
      
      if (current.conversation._id.toString() === previous.conversation._id.toString() &&
          current.sender.toString() !== previous.sender.toString()) {
        const responseTime = (current.createdAt - previous.createdAt) / (1000 * 60); // minutes
        totalResponseTime += responseTime;
        responseCount++;
      }
    }

    const averageResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0;

    res.json({
      success: true,
      data: {
        totalConversations,
        activeConversations,
        pendingConversations,
        closedConversations,
        averageResponseTime: Math.round(averageResponseTime * 10) / 10
      }
    });
  } catch (error) {
    console.error('Error getting chat stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê chat'
    });
  }
};

// Get admin conversations (admin only)
export const getAdminConversations = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có quyền xem danh sách cuộc trò chuyện'
      });
    }

    const { status, priority, assignedTo, search, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { type: 'customer_support' };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { 'participants.fullName': { $regex: search, $options: 'i' } }
      ];
    }

    const conversations = await Conversation.find(filter)
      .populate('participants', 'fullName email avatar role')
      .populate('assignedTo', 'fullName email avatar')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Conversation.countDocuments(filter);

    res.json({
      success: true,
      data: {
        conversations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting admin conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách cuộc trò chuyện'
    });
  }
};