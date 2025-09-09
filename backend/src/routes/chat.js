import express from 'express';
import {
  getConversations,
  getConversation,
  createConversation,
  getMessages,
  sendMessage,
  markAsRead,
  updateConversationStatus,
  getUnreadCount,
  getChatStats,
  getAdminConversations
} from '../controllers/chat.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Conversation routes
router.get('/conversations', getConversations);
router.get('/conversations/:conversationId', getConversation);
router.post('/conversations', createConversation);
router.put('/conversations/:conversationId/status', updateConversationStatus);

// Message routes
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', sendMessage);
router.put('/conversations/:conversationId/read', markAsRead);

// Utility routes
router.get('/unread-count', getUnreadCount);

// Admin routes
router.get('/stats', getChatStats);
router.get('/admin/conversations', getAdminConversations);

export default router;
