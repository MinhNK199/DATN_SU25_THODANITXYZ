export interface User {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin' | 'superadmin';
}

export interface Conversation {
  _id: string;
  participants: User[];
  type: 'customer_support' | 'general' | 'admin_broadcast';
  status: 'active' | 'closed' | 'pending' | 'resolved';
  lastMessage?: Message;
  lastMessageAt: string;
  subject?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: User;
  tags: string[];
  metadata?: {
    orderId?: string;
    productId?: string;
    customerInfo?: {
      name: string;
      email: string;
      phone: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: User;
  content: string;
  type: 'text' | 'image' | 'file' | 'system' | 'auto_reply';
  attachments?: Attachment[];
  replyTo?: Message;
  readBy: ReadStatus[];
  status: 'sent' | 'delivered' | 'read';
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  metadata?: {
    systemType?: 'conversation_started' | 'conversation_closed' | 'user_joined' | 'user_left' | 'admin_assigned';
    autoReplyTrigger?: string;
    fileInfo?: {
      originalName: string;
      size: number;
      mimeType: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface ReadStatus {
  user: string;
  readAt: string;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  unreadCount: number;
  onlineUsers: string[];
  typingUsers: TypingUser[];
  isLoading: boolean;
  error: string | null;
}

export interface TypingUser {
  userId: string;
  user: User;
  conversationId: string;
  isTyping: boolean;
}

export interface ChatMessage {
  conversationId: string;
  content: string;
  type?: 'text' | 'image' | 'file';
  replyTo?: string;
  attachments?: File[];
}

export interface ChatFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  search?: string;
}

export interface ChatStats {
  totalConversations: number;
  activeConversations: number;
  pendingConversations: number;
  resolvedConversations: number;
  averageResponseTime: number;
  totalMessages: number;
}
