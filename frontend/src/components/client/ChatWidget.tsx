import React, { useState, useEffect, useRef } from 'react';
import { Button, Avatar, Badge, message as antMessage } from 'antd';
import { MessageCircle, X, Send } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { chatApi } from '../../services/chatApi';
import { Conversation, Message } from '../../interfaces/Chat';

interface ChatWidgetProps {
  className?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ className = '' }) => {
  const { socket, isConnected, joinConversation, leaveConversation, sendMessage } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  // Persist conversation state
  useEffect(() => {
    if (conversation) {
      localStorage.setItem('chat_conversation_id', conversation._id);
    }
  }, [conversation]);

  // Load conversation from localStorage when widget opens
  useEffect(() => {
    if (isOpen && !conversation) {
      const savedConversationId = localStorage.getItem('chat_conversation_id');
      if (savedConversationId) {
        console.log('ChatWidget: Found saved conversation ID, loading...', savedConversationId);
        loadConversationById(savedConversationId);
      } else {
        console.log('ChatWidget: No saved conversation, will create new one');
        loadOrCreateConversation();
      }
    }
  }, [isOpen]);

  // Join conversation when it's created
  useEffect(() => {
    if (conversation) {
      joinConversation(conversation._id);
      loadMessages();
    }
    return () => {
      if (conversation) {
        leaveConversation(conversation._id);
      }
    };
  }, [conversation]);

  // Listen for new messages
  useEffect(() => {
    if (socket && conversation) {
      const handleNewMessage = (data: { message: Message; conversationId: string }) => {
        if (data.conversationId === conversation._id) {
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const exists = prev.some(msg => msg._id === data.message._id);
            if (!exists) {
              // Replace temp message if it exists
              const hasTemp = prev.some(msg => msg._id.startsWith('temp_'));
              if (hasTemp) {
                return prev.map(msg => 
                  msg._id.startsWith('temp_') && msg.content === data.message.content
                    ? data.message
                    : msg
                );
              }
              return [...prev, data.message];
            }
            return prev;
          });
        }
      };

      socket.on('new_message', handleNewMessage);
      return () => socket.off('new_message', handleNewMessage);
    }
  }, [socket, conversation]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadOrCreateConversation = async () => {
    try {
      setIsLoading(true);
      console.log('ChatWidget: Loading or creating conversation...');
      
      // Try to get existing conversation first
      const response = await chatApi.getConversations();
      console.log('ChatWidget: Got conversations response:', response);
      
      if (response.success && response.data.conversations.length > 0) {
        const existingConv = response.data.conversations.find(conv => conv.type === 'customer_support');
        if (existingConv) {
          console.log('ChatWidget: Found existing conversation:', existingConv._id);
          setConversation(existingConv);
          loadMessages(existingConv._id);
          return;
        }
      }

      // Create new conversation if none exists
      console.log('ChatWidget: Creating new conversation...');
      const createResponse = await chatApi.createConversation({
        participantId: 'admin', // This will be handled by backend to find an admin
        type: 'customer_support',
        subject: 'Hỗ trợ khách hàng'
      });

      console.log('ChatWidget: Create conversation response:', createResponse);
      if (createResponse.success) {
        setConversation(createResponse.data);
        console.log('ChatWidget: Created new conversation:', createResponse.data._id);
        // Load messages will be triggered by useEffect when conversation is set
      }
    } catch (error) {
      console.error('ChatWidget: Error loading/creating conversation:', error);
      antMessage.error('Không thể kết nối chat. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversationById = async (conversationId: string) => {
    try {
      console.log('ChatWidget: Attempting to load conversation:', conversationId);
      const response = await chatApi.getConversation(conversationId);
      if (response.success) {
        setConversation(response.data);
        console.log('ChatWidget: Successfully loaded conversation from localStorage', conversationId);
        // Load messages will be triggered by useEffect when conversation is set
      } else {
        // If conversation doesn't exist, remove from localStorage
        localStorage.removeItem('chat_conversation_id');
        console.log('ChatWidget: Conversation not found, removed from localStorage');
        // Create new conversation
        loadOrCreateConversation();
      }
    } catch (error) {
      console.error('ChatWidget: Error loading conversation:', error);
      localStorage.removeItem('chat_conversation_id');
      console.log('ChatWidget: Removed invalid conversation from localStorage');
      // Create new conversation
      loadOrCreateConversation();
    }
  };

  const loadMessages = async (conversationId?: string) => {
    const targetConversationId = conversationId || conversation?._id;
    if (!targetConversationId) return;
    
    try {
      console.log('ChatWidget: Loading messages for conversation:', targetConversationId);
      const response = await chatApi.getMessages(targetConversationId);
      if (response.success) {
        setMessages(response.data.messages);
        console.log('ChatWidget: Loaded messages:', response.data.messages.length);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !conversation) return;

    const messageContent = message.trim();
    const tempId = `temp_${Date.now()}`;
    setMessage('');

    try {
      // Optimistically add message to UI
      const tempMessage: Message = {
        _id: tempId,
        conversation: conversation._id,
        sender: {
          _id: 'current_user',
          name: 'Bạn',
          email: '',
          avatar: '',
          role: 'customer'
        },
        content: messageContent,
        type: 'text',
        attachments: [],
        readBy: [],
        status: 'sending',
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, tempMessage]);

      // Send message via socket
      await sendMessage({
        conversationId: conversation._id,
        content: messageContent,
        type: 'text'
      });

      // Update temp message status to sent
      setMessages(prev => prev.map(msg => 
        msg._id === tempId ? { ...msg, status: 'sent' } : msg
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      antMessage.error('Lỗi khi gửi tin nhắn');
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<MessageCircle size={24} />}
          onClick={() => setIsOpen(true)}
          className="shadow-lg hover:shadow-xl transition-all duration-300 bg-blue-600 hover:bg-blue-700"
          data-chat-trigger="true"
        />
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <div className={`bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 ${
        isMinimized ? 'w-80 h-12' : 'w-96 h-[500px]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <Avatar size="small" className="bg-white text-blue-600">
              CS
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">Hỗ trợ khách hàng</h3>
              <p className="text-xs text-blue-100">Đang hoạt động</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="text"
              size="small"
              icon={isMinimized ? <MessageCircle size={16} /> : <MessageCircle size={16} />}
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-blue-700"
            />
            <Button
              type="text"
              size="small"
              icon={<X size={16} />}
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700"
            />
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto h-[350px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>Chưa có tin nhắn nào</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex ${msg.sender.role === 'customer' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.sender.role === 'customer'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender.role === 'customer' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            {msg.status === 'sending' && (
                              <span className="ml-2 text-yellow-500">Đang gửi...</span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  type="primary"
                  icon={<Send size={16} />}
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;