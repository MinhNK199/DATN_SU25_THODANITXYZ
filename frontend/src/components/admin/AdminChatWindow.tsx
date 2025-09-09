import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Card, 
  Avatar, 
  Typography, 
  Space, 
  Tag, 
  Button, 
  Input, 
  Tooltip,
  Dropdown,
  Menu,
  Modal,
  Select,
  message as antMessage
} from 'antd';
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  User,
  Clock,
  CheckCircle,
  Archive,
  AlertCircle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
// import { format } from 'date-fns';
import { useChat } from '../../contexts/ChatContext';
import { chatApi } from '../../services/chatApi';
import { Conversation, Message } from '../../interfaces/Chat';
import './AdminChatWindow.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface AdminChatWindowProps {
  conversation: Conversation;
  onConversationUpdate: (conversation: Conversation) => void;
}

const AdminChatWindow: React.FC<AdminChatWindowProps> = ({
  conversation,
  onConversationUpdate
}) => {
  const { joinConversation, leaveConversation, sendMessage, isConnected, socket } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const customer = conversation.participants.find(p => p.role === 'customer');

  // Load messages when conversation changes
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await chatApi.getMessages(conversation._id);
        if (response.success) {
          setMessages(response.data.messages);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, [conversation._id]);

  useEffect(() => {
    // Join conversation when component mounts
    joinConversation(conversation._id);

    return () => {
      // Leave conversation when component unmounts
      leaveConversation(conversation._id);
    };
  }, [conversation._id, joinConversation, leaveConversation]);

  // Use ChatContext for real-time updates
  const { messages: contextMessages, loadMessages } = useChat();
  
  // Load messages when conversation changes
  useEffect(() => {
    if (conversation._id) {
      console.log('AdminChatWindow: Loading messages for conversation', conversation._id);
      loadMessages(conversation._id);
    }
  }, [conversation._id, loadMessages]); // Now safe to include loadMessages with useCallback
  
  // Filter messages for current conversation
  const conversationMessages = contextMessages.filter(msg => msg.conversation === conversation._id);
  
  // Debug logs
  useEffect(() => {
    console.log('AdminChatWindow: Debug messages', {
      conversationId: conversation._id,
      totalContextMessages: contextMessages.length,
      filteredMessages: conversationMessages.length,
      localMessages: messages.length
    });
  }, [conversation._id, contextMessages.length, conversationMessages.length, messages.length]);
  
  // Update local messages when context changes
  useEffect(() => {
    if (conversationMessages.length > 0) {
      console.log('AdminChatWindow: Updating messages from ChatContext', {
        conversationId: conversation._id,
        messageCount: conversationMessages.length,
        lastMessage: conversationMessages[conversationMessages.length - 1],
        allMessages: conversationMessages.map(m => ({ id: m._id, content: m.content, sender: m.sender?.name, role: m.sender?.role }))
      });
      setMessages(conversationMessages);
    }
  }, [conversationMessages.length, conversation._id]); // Only depend on length and conversation ID

  // Auto update priority and status for new customer messages
  const handleAutoUpdateForNewCustomerMessage = async () => {
    try {
      // Only update if conversation is not already resolved or closed
      if (conversation.status === 'resolved' || conversation.status === 'closed') {
        console.log('Conversation is already resolved/closed, updating to pending');
        
        // Set priority to high and status to pending for new customer messages
        await chatApi.updateConversationStatus(conversation._id, {
          priority: 'high',
          status: 'pending'
        });
        
        // Update local conversation state
        onConversationUpdate({
          ...conversation,
          priority: 'high',
          status: 'pending'
        });
      } else {
        console.log('Conversation status is:', conversation.status, '- no auto update needed');
      }
    } catch (error) {
      console.error('Error auto-updating conversation status:', error);
    }
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for new messages from socket
  useEffect(() => {
    if (socket) {
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

      const handleNewSupportMessage = (data: { message: Message; conversation: Conversation }) => {
        // This is just for notifications, don't add to messages
        // The actual message will be handled by new_message event
        console.log('New support message notification:', data.message._id);
      };

      socket.on('new_message', handleNewMessage);
      socket.on('new_support_message', handleNewSupportMessage);

      return () => {
        socket.off('new_message', handleNewMessage);
        socket.off('new_support_message', handleNewSupportMessage);
      };
    }
  }, [conversation._id, socket]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    const tempId = `temp_${Date.now()}`;
    setNewMessage('');

    try {
      // Optimistically add message to UI
      const tempMessage: Message = {
        _id: tempId,
        conversation: conversation._id,
        sender: {
          _id: 'current_admin',
          name: 'Admin',
          email: 'admin@example.com',
          avatar: '',
          role: 'admin'
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

      // Auto update status to active when admin responds
      if (conversation.status === 'pending') {
        await chatApi.updateConversationStatus(conversation._id, {
          status: 'active'
        });
        
        onConversationUpdate({
          ...conversation,
          status: 'active'
        });
      }

      // Note: Real message will replace temp message via socket event
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

  const handleAssignToAdmin = async () => {
    if (!selectedAdmin) return;

    try {
      setIsLoading(true);
      const response = await chatApi.updateConversationStatus(conversation._id, {
        assignedTo: selectedAdmin
      });

      if (response.success) {
        onConversationUpdate(response.data);
        setIsAssignModalVisible(false);
        setSelectedAdmin('');
        antMessage.success('Gán cuộc trò chuyện thành công');
      }
    } catch (error) {
      console.error('Error assigning conversation:', error);
      antMessage.error('Lỗi khi gán cuộc trò chuyện');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await chatApi.markAsRead(conversation._id);
      
      // Update local messages to show as read
      setMessages(prev => prev.map(msg => ({
        ...msg,
        readBy: [...msg.readBy, 'current_admin']
      })));
      
      antMessage.success('Đã đánh dấu tất cả tin nhắn là đã đọc');
    } catch (error) {
      console.error('Error marking as read:', error);
      antMessage.error('Lỗi khi đánh dấu đã đọc');
    }
  };

  const scrollToTop = () => {
    if (messagesContainerRef.current) {
      setIsUserScrolling(true);
      setShouldAutoScroll(false);
      messagesContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      setIsUserScrolling(false);
      setShouldAutoScroll(true);
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // State to track if user is manually scrolling
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Auto scroll to bottom only when appropriate
  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current && !isUserScrolling) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldAutoScroll, isUserScrolling]);

  // Handle scroll events for better UX
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      
      // Update auto scroll preference based on user position
      setShouldAutoScroll(isNearBottom);
      
      // Detect if user is manually scrolling up
      if (scrollTop < scrollHeight - clientHeight - 100) {
        setIsUserScrolling(true);
        setShouldAutoScroll(false);
      } else {
        setIsUserScrolling(false);
        setShouldAutoScroll(true);
      }
    }
  };

  // Debounced scroll handler to prevent too many state updates
  const debouncedHandleScroll = useCallback(() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };
  }, []);

  // Use debounced scroll handler
  useEffect(() => {
    const debouncedScroll = debouncedHandleScroll();
    return debouncedScroll;
  }, [debouncedHandleScroll]);

  // Reset scroll state when conversation changes
  useEffect(() => {
    setIsUserScrolling(false);
    setShouldAutoScroll(true);
  }, [conversation._id]);

  const handleStatusChange = async (status: string) => {
    try {
      // Kiểm tra logic chuyển trạng thái hợp lệ
      const currentStatus = conversation.status;
      const validTransitions = {
        'pending': ['active', 'closed'],
        'active': ['resolved', 'closed', 'pending'],
        'resolved': ['active', 'closed'],
        'closed': ['active', 'pending']
      };

      if (!validTransitions[currentStatus]?.includes(status)) {
        antMessage.warning(`Không thể chuyển từ "${getStatusText(currentStatus)}" sang "${getStatusText(status)}"`);
        return;
      }

      const response = await chatApi.updateConversationStatus(conversation._id, {
        status
      });

      if (response.success) {
        onConversationUpdate(response.data);
        antMessage.success(`Đã chuyển trạng thái thành "${getStatusText(status)}"`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      antMessage.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'pending': return 'orange';
      case 'closed': return 'gray';
      case 'resolved': return 'blue';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'blue';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'pending': return 'Chờ xử lý';
      case 'closed': return 'Đã đóng';
      case 'resolved': return 'Đã giải quyết';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Khẩn cấp';
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return priority;
    }
  };

  const handlePriorityChange = async (priority: string) => {
    try {
      const response = await chatApi.updateConversationStatus(conversation._id, {
        priority
      });

      if (response.success) {
        onConversationUpdate(response.data);
        antMessage.success('Cập nhật mức độ ưu tiên thành công');
      }
    } catch (error) {
      console.error('Error updating priority:', error);
      antMessage.error('Lỗi khi cập nhật mức độ ưu tiên');
    }
  };

  const conversationMenu = (
    <Menu>
      <Menu.SubMenu key="priority" title="Thay đổi ưu tiên" icon={<AlertCircle size={14} />}>
        <Menu.Item key="urgent" onClick={() => handlePriorityChange('urgent')}>
          🔴 Khẩn cấp
        </Menu.Item>
        <Menu.Item key="high" onClick={() => handlePriorityChange('high')}>
          🟠 Cao
        </Menu.Item>
        <Menu.Item key="medium" onClick={() => handlePriorityChange('medium')}>
          🔵 Trung bình
        </Menu.Item>
        <Menu.Item key="low" onClick={() => handlePriorityChange('low')}>
          🟢 Thấp
        </Menu.Item>
      </Menu.SubMenu>
      
      <Menu.Divider />
      
      <Menu.SubMenu key="status" title="Thay đổi trạng thái" icon={<CheckCircle size={14} />}>
        <Menu.Item key="active" onClick={() => handleStatusChange('active')}>
          🟢 Hoạt động
        </Menu.Item>
        <Menu.Item key="pending" onClick={() => handleStatusChange('pending')}>
          🟡 Chờ xử lý
        </Menu.Item>
        <Menu.Item key="resolved" onClick={() => handleStatusChange('resolved')}>
          ✅ Đã giải quyết
        </Menu.Item>
        <Menu.Item key="closed" onClick={() => handleStatusChange('closed')}>
          🔴 Đã đóng
        </Menu.Item>
      </Menu.SubMenu>
      
      <Menu.Divider />
      
      <Menu.Item key="assign" icon={<User size={14} />} onClick={() => setIsAssignModalVisible(true)}>
        Gán cho admin
      </Menu.Item>
      <Menu.Item key="mark-read" icon={<CheckCircle size={14} />} onClick={handleMarkAsRead}>
        Đánh dấu đã đọc
      </Menu.Item>
      <Menu.Item key="close-conversation" icon={<Archive size={14} />} onClick={() => handleStatusChange('closed')}>
        Đóng cuộc trò chuyện
      </Menu.Item>
    </Menu>
  );

  return (
    <Card className="h-[600px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar
            src={customer?.avatar}
            size="large"
            className="bg-blue-500"
          >
            {customer?.name?.charAt(0)}
          </Avatar>
          
          <div>
            <Title level={5} className="mb-0">
              {customer?.name || 'Khách hàng'}
            </Title>
            <div className="flex items-center space-x-2">
              <Text className="text-sm text-gray-500">
                {customer?.email}
              </Text>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-400' : 'bg-red-400'
              }`} />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Space>
            <Tag color={getStatusColor(conversation.status)}>
              {getStatusText(conversation.status)}
            </Tag>
            <Tag color={getPriorityColor(conversation.priority)}>
              {getPriorityText(conversation.priority)}
            </Tag>
            {conversation.status === 'resolved' && (
              <Tag color="green">
                ✅ Đã đọc
              </Tag>
            )}
          </Space>

          <Space>
            <Dropdown overlay={conversationMenu} trigger={['click']}>
              <Button type="text" icon={<MoreVertical size={16} />} />
            </Dropdown>
          </Space>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto p-4 min-w-0 relative chat-messages-container" 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        style={{
          scrollBehavior: 'smooth',
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db #f3f4f6',
          maxHeight: '400px',
          overflowY: 'scroll'
        }}
      >
        {/* Scroll Buttons */}
        <div className="absolute right-4 top-4 z-10 flex flex-col space-y-2">
          <Tooltip title="Cuộn lên đầu">
            <Button
              type="text"
              size="small"
              icon={<ChevronUp size={16} />}
              onClick={scrollToTop}
              className="bg-white shadow-md hover:bg-gray-50 border border-gray-200"
            />
          </Tooltip>
          <Tooltip title="Cuộn xuống cuối">
            <Button
              type="text"
              size="small"
              icon={<ChevronDown size={16} />}
              onClick={scrollToBottom}
              className="bg-white shadow-md hover:bg-gray-50 border border-gray-200"
            />
          </Tooltip>
        </div>
        
        <div className="space-y-4 max-w-full">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`flex min-w-0 ${message.sender.role === 'admin' || message.sender.role === 'superadmin' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[280px] px-4 py-2 rounded-lg ${
                message.sender.role === 'admin' || message.sender.role === 'superadmin'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}>
                <div className="text-sm whitespace-pre-wrap break-words" style={{ 
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  maxWidth: '100%',
                  lineHeight: '1.4'
                }}>
                  {message.content}
                </div>
                <div className={`text-xs mt-1 ${
                  message.sender.role === 'admin' || message.sender.role === 'superadmin'
                    ? 'text-blue-100'
                    : 'text-gray-500'
                }`}>
                  {new Date(message.createdAt).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <TextArea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            disabled={!isConnected}
            autoSize={{ minRows: 1, maxRows: 4 }}
            className="flex-1"
          />
          <Button
            type="primary"
            icon={<Send size={16} />}
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected}
          >
            Gửi
          </Button>
        </div>
      </div>

      {/* Assign Modal */}
      <Modal
        title="Gán cuộc trò chuyện cho admin"
        open={isAssignModalVisible}
        onOk={handleAssignToAdmin}
        onCancel={() => setIsAssignModalVisible(false)}
        confirmLoading={isLoading}
      >
        <div className="space-y-4">
          <div>
            <Text className="block mb-2">Chọn admin:</Text>
            <Select
              style={{ width: '100%' }}
              placeholder="Chọn admin"
              value={selectedAdmin}
              onChange={setSelectedAdmin}
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              <Option value="superadmin">Super Admin</Option>
              <Option value="admin1">Admin 1</Option>
              <Option value="admin2">Admin 2</Option>
              <Option value="admin3">Admin 3</Option>
            </Select>
          </div>
          <div>
            <Text className="text-sm text-gray-500">
              Cuộc trò chuyện sẽ được chuyển cho admin được chọn để xử lý.
            </Text>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default AdminChatWindow;
