import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatState, Conversation, Message, User, TypingUser } from '../interfaces/Chat';
import { chatApi } from '../services/chatApi';
import { useNotification } from './NotificationContext';

interface ChatContextType extends ChatState {
  socket: Socket | null;
  isConnected: boolean;
  // Actions
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (data: { conversationId: string; content: string; type?: string; replyTo?: string }) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  markAsRead: (conversationId: string) => void;
  // State updates
  setCurrentConversation: (conversation: Conversation | null) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  // Load functions
  loadConversations: () => Promise<void>;
  loadAdminConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  // Get user and token from localStorage temporarily
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [state, setState] = useState<ChatState>({
    conversations: [],
    currentConversation: null,
    messages: [],
    unreadCount: 0,
    onlineUsers: [],
    typingUsers: [],
    isLoading: false,
    error: null
  });

  const typingTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Load user and token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
        // console.log('ChatContext: Loaded user and token', { user: userData.name, hasToken: !!storedToken });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    } else {
      // console.log('ChatContext: No user or token found in localStorage');
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (user && token) {
      // console.log('ChatContext: Initializing socket connection', { user: user.name, hasToken: !!token });
      
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:8000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000
      });

      newSocket.on('connect', () => {
        // console.log('ChatContext: Connected to chat server', { socketId: newSocket.id, userRole: user.role });
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('ChatContext: Disconnected from chat server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('ChatContext: Socket connection error:', error);
        setState(prev => ({ ...prev, error: 'Lỗi kết nối chat server' }));
      });

      // Message events - update both conversations and messages
      newSocket.on('new_message', (data: { message: Message; conversationId: string }) => {
        console.log('ChatContext: Received new_message', {
          messageId: data.message._id,
          content: data.message.content,
          sender: data.message.sender?.name,
          role: data.message.sender?.role,
          conversationId: data.conversationId
        });
        
        // Show notification for new messages from customers
        if (data.message.sender?.role === 'customer') {
          // Dispatch custom event for notification
          const notificationEvent = new CustomEvent('chat-notification', {
            detail: {
              title: `Tin nhắn mới từ ${data.message.sender.name || 'Khách hàng'}`,
              message: data.message.content.length > 50 
                ? `${data.message.content.substring(0, 50)}...` 
                : data.message.content,
              type: 'message',
              conversationId: data.conversationId
            }
          });
          window.dispatchEvent(notificationEvent);
        }
        
        setState(prev => {
          // Check if message already exists to avoid duplicates
          const messageExists = prev.messages.some(msg => msg._id === data.message._id);
          
          if (messageExists) {
            console.log('ChatContext: Message already exists, skipping');
            return prev; // Don't update if message already exists
          }
          
          // Replace temp message if it exists (like client does)
          const hasTemp = prev.messages.some(msg => 
            msg._id.startsWith('temp_') && 
            msg.conversation === data.conversationId &&
            msg.content === data.message.content
          );
          
          let updatedMessages = prev.messages;
          if (hasTemp) {
            // Replace temp message with real message
            updatedMessages = prev.messages.map(msg => 
              msg._id.startsWith('temp_') && 
              msg.conversation === data.conversationId &&
              msg.content === data.message.content
                ? data.message
                : msg
            );
            console.log('ChatContext: Replaced temp message with real message');
          } else {
            // Add new message
            updatedMessages = [...prev.messages, data.message];
            console.log('ChatContext: Added new message to messages array');
          }
          
          return {
            ...prev,
            conversations: prev.conversations.map(conv => 
              conv._id === data.conversationId 
                ? { ...conv, lastMessage: data.message, lastMessageAt: data.message.createdAt }
                : conv
            ),
            messages: updatedMessages
          };
        });
      });

      newSocket.on('message_read', (data: { messageId: string; userId: string; readAt: string }) => {
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg._id === data.messageId
              ? {
                  ...msg,
                  readBy: [...msg.readBy, { user: data.userId, readAt: data.readAt }]
                }
              : msg
          )
        }));
      });

      // Admin support message events
      newSocket.on('new_support_message', (data: { message: Message; conversation: Conversation; isFromAdmin: boolean }) => {
        console.log('ChatContext: Received new support message', { 
          messageId: data.message._id, 
          conversationId: data.conversation._id,
          isFromAdmin: data.isFromAdmin 
        });
        
        setState(prev => ({
          ...prev,
          conversations: prev.conversations.map(conv => 
            conv._id === data.conversation._id 
              ? { ...conv, lastMessage: data.message, lastMessageAt: data.message.createdAt }
              : conv
          )
        }));
      });

      // Typing events
      newSocket.on('user_typing', (data: TypingUser) => {
        setState(prev => ({
          ...prev,
          typingUsers: prev.typingUsers.filter(t => 
            !(t.userId === data.userId && t.conversationId === data.conversationId)
          ).concat(data.isTyping ? [data] : [])
        }));
      });

      // User status events
      newSocket.on('user_online', (data: { userId: string; user: User }) => {
        setState(prev => ({
          ...prev,
          onlineUsers: [...prev.onlineUsers.filter(id => id !== data.userId), data.userId]
        }));
      });

      newSocket.on('user_offline', (data: { userId: string; user: User }) => {
        setState(prev => ({
          ...prev,
          onlineUsers: prev.onlineUsers.filter(id => id !== data.userId)
        }));
      });

      // Conversation events
      newSocket.on('conversation_updated', (data: { conversation: Conversation; updatedBy: User }) => {
        // Debug log removed to avoid console spam
        setState(prev => ({
          ...prev,
          conversations: prev.conversations.map(conv =>
            conv._id === data.conversation._id ? data.conversation : conv
          ),
          currentConversation: prev.currentConversation?._id === data.conversation._id 
            ? data.conversation 
            : prev.currentConversation
        }));
      });

      // New conversation events for admin
      newSocket.on('new_conversation', (data: { conversation: Conversation; message: string }) => {
        console.log('ChatContext: Received new_conversation event', {
          conversationId: data.conversation._id,
          participants: data.conversation.participants?.length,
          message: data.message
        });
        
        setState(prev => {
          // Check if conversation already exists
          const exists = prev.conversations.some(conv => conv._id === data.conversation._id);
          if (exists) {
            console.log('ChatContext: Conversation already exists, updating instead');
            return {
              ...prev,
              conversations: prev.conversations.map(conv =>
                conv._id === data.conversation._id ? data.conversation : conv
              )
            };
          }
          
          console.log('ChatContext: Adding new conversation to list');
          return {
            ...prev,
            conversations: [data.conversation, ...prev.conversations]
          };
        });
      });

      newSocket.on('admin_new_conversation', (data: { conversation: Conversation; message: string }) => {
        console.log('ChatContext: Received admin_new_conversation event', {
          conversationId: data.conversation._id,
          participants: data.conversation.participants?.length,
          message: data.message
        });
        
        setState(prev => {
          // Check if conversation already exists
          const exists = prev.conversations.some(conv => conv._id === data.conversation._id);
          if (exists) {
            console.log('ChatContext: Conversation already exists, updating instead');
            return {
              ...prev,
              conversations: prev.conversations.map(conv =>
                conv._id === data.conversation._id ? data.conversation : conv
              )
            };
          }
          
          console.log('ChatContext: Adding new conversation to admin list');
          return {
            ...prev,
            conversations: [data.conversation, ...prev.conversations]
          };
        });
      });

      // Error handling
      newSocket.on('error', (error: { message: string }) => {
        setState(prev => ({ ...prev, error: error.message }));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [user, token]);

  // Load conversations
  const loadConversations = async () => {
    try {
      const response = await chatApi.getConversations();
      if (response.success) {
        setState(prev => ({ ...prev, conversations: response.data.conversations }));
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadAdminConversations = async () => {
    try {
      const response = await chatApi.getConversations({ status: '', priority: '', assignedTo: '', search: '' });
      if (response.success) {
        setState(prev => ({ ...prev, conversations: response.data.conversations }));
      }
    } catch (error) {
      console.error('Error loading admin conversations:', error);
    }
  };

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      console.log('ChatContext: Loading messages for conversation', conversationId);
      const response = await chatApi.getMessages(conversationId);
      if (response.success) {
        setState(prev => {
          // Only update if messages are different to avoid unnecessary re-renders
          const currentMessages = prev.messages.filter(msg => msg.conversation === conversationId);
          const newMessages = response.data.messages;
          
          if (currentMessages.length === newMessages.length && 
              currentMessages.every((msg, index) => msg._id === newMessages[index]?._id)) {
            console.log('ChatContext: Messages unchanged, skipping update');
            return prev;
          }
          
          console.log('ChatContext: Updating messages', { 
            conversationId, 
            oldCount: currentMessages.length, 
            newCount: newMessages.length 
          });
          
          return { 
            ...prev, 
            messages: [
              ...prev.messages.filter(msg => msg.conversation !== conversationId),
              ...newMessages
            ],
            currentConversation: prev.conversations.find(conv => conv._id === conversationId) || null
          };
        });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, []);

  // Load conversations when user changes
  useEffect(() => {
    if (user && token) {
      if (user.role === 'admin' || user.role === 'superadmin') {
        loadAdminConversations();
      } else {
        loadConversations();
      }
    }
  }, [user, token]);

  // Actions
  const joinConversation = (conversationId: string) => {
    if (socket) {
      socket.emit('join_conversation', conversationId);
    }
  };

  const leaveConversation = (conversationId: string) => {
    if (socket) {
      socket.emit('leave_conversation', conversationId);
    }
  };

  const sendMessage = (data: { conversationId: string; content: string; type?: string; replyTo?: string }) => {
    if (socket) {
      socket.emit('send_message', {
        ...data,
        type: data.type || 'text'
      });
    }
  };

  const startTyping = (conversationId: string) => {
    if (socket) {
      socket.emit('typing_start', { conversationId });
      
      // Clear existing timeout
      if (typingTimeoutRef.current[conversationId]) {
        clearTimeout(typingTimeoutRef.current[conversationId]);
      }
      
      // Set timeout to stop typing
      typingTimeoutRef.current[conversationId] = setTimeout(() => {
        stopTyping(conversationId);
      }, 3000);
    }
  };

  const stopTyping = (conversationId: string) => {
    if (socket) {
      socket.emit('typing_stop', { conversationId });
      
      if (typingTimeoutRef.current[conversationId]) {
        clearTimeout(typingTimeoutRef.current[conversationId]);
        delete typingTimeoutRef.current[conversationId];
      }
    }
  };

  const markAsRead = (conversationId: string) => {
    if (socket) {
      socket.emit('mark_message_read', { conversationId });
    }
  };

  // State update functions
  const setCurrentConversation = (conversation: Conversation | null) => {
    setState(prev => ({ ...prev, currentConversation: conversation }));
  };

  const addMessage = (message: Message) => {
    setState(prev => ({ ...prev, messages: [...prev.messages, message] }));
  };

  const updateMessage = (messageId: string, updates: Partial<Message>) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg =>
        msg._id === messageId ? { ...msg, ...updates } : msg
      )
    }));
  };

  const addConversation = (conversation: Conversation) => {
    setState(prev => ({
      ...prev,
      conversations: [conversation, ...prev.conversations]
    }));
  };

  const updateConversation = (conversationId: string, updates: Partial<Conversation>) => {
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(conv =>
        conv._id === conversationId ? { ...conv, ...updates } : conv
      ),
      currentConversation: prev.currentConversation?._id === conversationId
        ? { ...prev.currentConversation, ...updates }
        : prev.currentConversation
    }));
  };

  const value: ChatContextType = {
    ...state,
    socket,
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    setCurrentConversation,
    addMessage,
    updateMessage,
    addConversation,
    updateConversation,
    loadConversations,
    loadAdminConversations,
    loadMessages
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};