import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

// Store active users
const activeUsers = new Map();

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.name} connected with socket ID: ${socket.id}`);

    // Store user as active
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user,
      lastSeen: new Date()
    });

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Join admin to admin room if user is admin
    if (socket.user.role === 'admin' || socket.user.role === 'superadmin') {
      socket.join('admin_room');
    }

    // Emit user online status to relevant users
    socket.broadcast.emit('user_online', {
      userId: socket.userId,
      user: socket.user
    });

    // Handle joining conversation room
    socket.on('join_conversation', async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        
        if (!conversation || !conversation.isParticipant(socket.userId)) {
          socket.emit('error', { message: 'Không có quyền truy cập cuộc trò chuyện này' });
          return;
        }

        socket.join(`conversation_${conversationId}`);
        socket.emit('joined_conversation', { conversationId });

        // Mark messages as read when joining
        await Message.updateMany(
          {
            conversation: conversationId,
            sender: { $ne: socket.userId },
            readBy: { $not: { $elemMatch: { user: socket.userId } } },
            isDeleted: false
          },
          {
            $push: {
              readBy: {
                user: socket.userId,
                readAt: new Date()
              }
            }
          }
        );

        // Notify other participants that user joined
        socket.to(`conversation_${conversationId}`).emit('user_joined_conversation', {
          userId: socket.userId,
          user: socket.user,
          conversationId
        });

      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('error', { message: 'Lỗi khi tham gia cuộc trò chuyện' });
      }
    });

    // Handle leaving conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      socket.emit('left_conversation', { conversationId });

      // Notify other participants
      socket.to(`conversation_${conversationId}`).emit('user_left_conversation', {
        userId: socket.userId,
        user: socket.user,
        conversationId
      });
    });

    // Handle sending message
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, type = 'text', replyTo, attachments = [] } = data;
        
        // Processing message

        // Verify user has access to conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit('error', { message: 'Cuộc trò chuyện không tồn tại' });
          return;
        }

        // Superadmin can send messages to any conversation
        if (socket.user.role !== 'superadmin' && !conversation.isParticipant(socket.userId)) {
          socket.emit('error', { message: 'Không có quyền gửi tin nhắn trong cuộc trò chuyện này' });
          return;
        }

        // Create message
        const message = new Message({
          conversation: conversationId,
          sender: socket.userId,
          content,
          type,
          replyTo,
          attachments
        });

        await message.save();
        
        await message.populate('sender', 'name email avatar role');
        await message.populate('replyTo');

        // Emit message to conversation room
        io.to(`conversation_${conversationId}`).emit('new_message', {
          message,
          conversationId
        });

        // Emit to admin room for all messages (not just customer_support type)
        console.log('📢 Emitting new_support_message to admin_room:', {
          messageId: message._id,
          senderRole: message.sender.role,
          conversationId: conversationId,
          isFromAdmin: socket.user.role === 'admin' || socket.user.role === 'superadmin'
        });
        
        // Populate the message for the response
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name email avatar role');
        
        // Emit new_message to admin room for real-time updates
        
        io.to('admin_room').emit('new_message', {
          message: populatedMessage,
          conversationId: conversationId
        });
        
        // Also emit new_support_message for backward compatibility
        io.to('admin_room').emit('new_support_message', {
          message: populatedMessage,
          conversation,
          isFromAdmin: socket.user.role === 'admin' || socket.user.role === 'superadmin'
        });

        // Update conversation last message
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          lastMessageAt: message.createdAt
        });

        // Get updated conversation with populated lastMessage
        const updatedConversation = await Conversation.findById(conversationId)
          .populate('participants', 'name email avatar role')
          .populate('lastMessage')
          .populate('assignedTo', 'name email avatar');

        // Auto update conversation status and priority for new customer messages
        if (message.sender.role === 'customer' || message.sender.role === 'user') {
          try {
            const updatedConversation = await Conversation.findByIdAndUpdate(
              conversationId,
              {
                priority: 'high',
                status: 'pending'
              },
              { new: true }
            ).populate('participants', 'name email avatar role')
             .populate({
               path: 'lastMessage',
               populate: {
                 path: 'sender',
                 select: 'name email avatar role'
               }
             })
             .populate('assignedTo', 'name email avatar');
            

            // Emit conversation update to all connected clients
            io.emit('conversation_updated', {
              conversation: updatedConversation
            });
          } catch (updateError) {
            console.error('Error updating conversation status:', updateError);
          }
        }

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Lỗi khi gửi tin nhắn' });
      }
    });

    // Handle typing indicator
    socket.on('typing_start', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        user: socket.user,
        conversationId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        user: socket.user,
        conversationId,
        isTyping: false
      });
    });

    // Handle message read status
    socket.on('mark_message_read', async (data) => {
      try {
        const { messageId, conversationId } = data;
        
        const message = await Message.findById(messageId);
        if (message && message.conversation.toString() === conversationId) {
          await message.markAsRead(socket.userId);
          
          // Emit read status to conversation
          io.to(`conversation_${conversationId}`).emit('message_read', {
            messageId,
            userId: socket.userId,
            readAt: new Date()
          });
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Handle conversation status update (admin only)
    socket.on('update_conversation_status', async (data) => {
      try {
        if (socket.user.role !== 'admin' && socket.user.role !== 'superadmin') {
          socket.emit('error', { message: 'Chỉ admin mới có quyền cập nhật trạng thái' });
          return;
        }

        const { conversationId, status, assignedTo } = data;
        
        const conversation = await Conversation.findByIdAndUpdate(
          conversationId,
          { status, assignedTo },
          { new: true }
        ).populate('participants', 'fullName email avatar role')
         .populate('assignedTo', 'fullName email avatar');

        if (conversation) {
          io.to(`conversation_${conversationId}`).emit('conversation_updated', {
            conversation,
            updatedBy: socket.user
          });
        }
      } catch (error) {
        console.error('Error updating conversation status:', error);
        socket.emit('error', { message: 'Lỗi khi cập nhật trạng thái cuộc trò chuyện' });
      }
    });

    // ===== REALTIME INVENTORY EVENTS =====
    
    // Handle joining product room for realtime stock updates
    socket.on('join_product_room', (productId) => {
      socket.join(`product_${productId}`);
      socket.emit('joined_product_room', { productId });
    });

    // Handle leaving product room
    socket.on('leave_product_room', (productId) => {
      socket.leave(`product_${productId}`);
      socket.emit('left_product_room', { productId });
    });

    // Handle joining inventory room for global stock updates
    socket.on('join_inventory_room', () => {
      socket.join('inventory_room');
      socket.emit('joined_inventory_room');
    });

    // Handle leaving inventory room
    socket.on('leave_inventory_room', () => {
      socket.leave('inventory_room');
      socket.emit('left_inventory_room');
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.name} disconnected`);
      
      // Remove user from active users
      activeUsers.delete(socket.userId);
      
      // Emit user offline status
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        user: socket.user
      });
    });
  });

  return io;
};

// Helper function to get active users
export const getActiveUsers = () => {
  return Array.from(activeUsers.values());
};

// Helper function to check if user is online
export const isUserOnline = (userId) => {
  return activeUsers.has(userId);
};

// Helper function to emit to specific user
export const emitToUser = (io, userId, event, data) => {
  const user = activeUsers.get(userId);
  if (user) {
    io.to(user.socketId).emit(event, data);
  }
};

// Helper function to emit to admin room
export const emitToAdmins = (io, event, data) => {
  io.to('admin_room').emit(event, data);
};

// ===== REALTIME INVENTORY HELPER FUNCTIONS =====

// Store io instance globally
let globalIo = null;

// Set io instance
export const setIoInstance = (io) => {
  globalIo = io;
};

// Helper function to emit stock update to specific product room
export const emitStockUpdate = (productId, stockData) => {
  if (globalIo) {
    globalIo.to(`product_${productId}`).emit('stock_updated', {
      productId,
      ...stockData,
      timestamp: new Date()
    });
  }
};

// Helper function to emit stock update to inventory room (global)
export const emitGlobalStockUpdate = (stockData) => {
  if (globalIo) {
    globalIo.to('inventory_room').emit('inventory_updated', {
      ...stockData,
      timestamp: new Date()
    });
  }
};

// Helper function to emit reservation update
export const emitReservationUpdate = (productId, reservationData) => {
  if (globalIo) {
    globalIo.to(`product_${productId}`).emit('reservation_updated', {
      productId,
      ...reservationData,
      timestamp: new Date()
    });
  }
};

// Helper function to emit cart sync update
export const emitCartSyncUpdate = (userId, cartData) => {
  if (globalIo) {
    globalIo.to(`user_${userId}`).emit('cart_sync', {
      ...cartData,
      timestamp: new Date()
    });
  }
};