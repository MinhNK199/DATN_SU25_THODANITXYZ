import React, { useState, useEffect } from 'react';
import { List, Avatar, Badge, Tag, Typography, Space, Tooltip } from 'antd';
import { 
  MessageCircle, 
  Clock, 
  User
} from 'lucide-react';
// import { format, formatDistanceToNow } from 'date-fns';
import { useChat } from '../../contexts/ChatContext';
import { Conversation, ChatFilters } from '../../interfaces/Chat';

const { Text, Title } = Typography;

interface AdminConversationListProps {
  onConversationSelect: (conversation: Conversation) => void;
  selectedConversation: Conversation | null;
  filters: ChatFilters;
}

const AdminConversationList: React.FC<AdminConversationListProps> = ({
  onConversationSelect,
  selectedConversation,
  filters
}) => {
  const { socket } = useChat();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load admin conversations
  // Load conversations function
  const loadConversations = async () => {
    setIsLoading(true);
    try {
      // Use regular getConversations API since we fixed the controller
      const response = await chatApi.getConversations(filters);
      console.log('AdminConversationList: API Response:', response);
      if (response.success) {
        console.log('AdminConversationList: Conversations loaded:', response.data.conversations.length);
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error('Error loading admin conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load conversations when filters change
  useEffect(() => {
    loadConversations();
  }, [filters]);

  // Use ChatContext for real-time updates
  const { conversations: contextConversations } = useChat();
  
  // Update local conversations when context changes
  useEffect(() => {
    if (contextConversations.length > 0) {
      setConversations(prev => {
        // Check if conversations have actually changed (including lastMessage)
        const hasChanged = prev.length !== contextConversations.length || 
          !prev.every((conv, index) => {
            const newConv = contextConversations[index];
            if (!newConv) return false;
            
            // Check if lastMessage has changed
            const oldLastMessage = conv.lastMessage;
            const newLastMessage = newConv.lastMessage;
            
            if (oldLastMessage?._id !== newLastMessage?._id) {
              return false; // lastMessage changed
            }
            
            return conv._id === newConv._id;
          });
        
        if (hasChanged) {
          // Debug log removed to avoid console spam
          return contextConversations;
        }
        return prev;
      });
    }
  }, [contextConversations]); // Depend on the entire array to catch lastMessage changes

  // Filter conversations based on filters
  useEffect(() => {
    // Debounce filtering to avoid excessive re-renders
    const timeoutId = setTimeout(() => {
      let filtered = [...conversations];
      // Only log when there are actual changes
      if (conversations.length > 0) {
        console.log('AdminConversationList: Filtering conversations:', {
          total: conversations.length,
          filters: filters
        });
      }

    if (filters.status) {
      filtered = filtered.filter(conv => conv.status === filters.status);
      console.log('AdminConversationList: After status filter:', filtered.length);
    }

    if (filters.priority) {
      filtered = filtered.filter(conv => conv.priority === filters.priority);
      console.log('AdminConversationList: After priority filter:', filtered.length);
    }

    if (filters.assignedTo) {
      filtered = filtered.filter(conv => conv.assignedTo?._id === filters.assignedTo);
      console.log('AdminConversationList: After assignedTo filter:', filtered.length);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(conv => 
        conv.subject?.toLowerCase().includes(searchLower) ||
        conv.participants.some(p => 
          (p.name || p.fullName || '').toLowerCase().includes(searchLower) ||
          p.email.toLowerCase().includes(searchLower)
        )
      );
      console.log('AdminConversationList: After search filter:', filtered.length);
    }

    // Sort by last message time
    filtered.sort((a, b) => 
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );

      console.log('AdminConversationList: Final filtered conversations:', filtered.length);
      setFilteredConversations(filtered);
    }, 100); // 100ms debounce

    return () => clearTimeout(timeoutId);
  }, [conversations, filters]);

  // ChatContext handles all real-time updates, no need for duplicate listeners

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

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Vừa xong';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} giờ trước`;
    } else {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const getCustomer = (conversation: Conversation) => {
    return conversation.participants.find(p => p.role === 'customer');
  };



  const renderConversationItem = (conversation: Conversation) => {
    const customer = getCustomer(conversation);
    const isSelected = selectedConversation?._id === conversation._id;
    const hasUnread = conversation.lastMessage && 
      conversation.lastMessage.sender?.role === 'customer' &&
      conversation.lastMessage.readBy?.length === 0;

    return (
      <List.Item
        className={`cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors ${
          isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
        }`}
        onClick={() => onConversationSelect(conversation)}
      >
        <div className="flex items-start justify-between w-full">
          <div className="flex items-start space-x-3 flex-1">
            <Badge dot={hasUnread} color="red">
              <Avatar
                src={customer?.avatar}
                size="large"
                className="bg-blue-500"
              >
                {customer?.name?.charAt(0)}
              </Avatar>
            </Badge>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex-1 min-w-0">
                  <Title level={5} className="mb-0 truncate">
                    {customer?.name || 'Khách hàng'}
                  </Title>
                  {customer?.email && (
                    <Text className="text-xs text-gray-400 truncate block">
                      {customer.email}
                    </Text>
                  )}
                </div>
                <Text className="text-xs text-gray-500 ml-2">
                  {formatLastMessageTime(conversation.lastMessageAt)}
                </Text>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Tag color={getStatusColor(conversation.status)} size="small">
                  {getStatusText(conversation.status)}
                </Tag>
                <Tag color={getPriorityColor(conversation.priority)} size="small">
                  {getPriorityText(conversation.priority)}
                </Tag>
              </div>

              {conversation.subject && (
                <Text className="text-sm text-gray-600 block mb-1">
                  {conversation.subject}
                </Text>
              )}

              <div className="flex items-center justify-between">
                <Text className="text-sm text-gray-500 truncate flex-1">
                  {(() => {
                    if (conversation.lastMessage && conversation.lastMessage.content) {
                      const senderRole = conversation.lastMessage.sender?.role;
                      const isCustomer = senderRole === 'customer' || senderRole === 'user';
                      const prefix = isCustomer ? 'Khách hàng: ' : 'Bạn: ';
                      
                      // Debug log removed to avoid console spam
                      
                      return prefix + conversation.lastMessage.content;
                    } else {
                      return 'Chưa có tin nhắn';
                    }
                  })()}
                </Text>
                {hasUnread && (
                  <Badge count={1} size="small" className="ml-2" />
                )}
              </div>

              {conversation.assignedTo && (
                <div className="flex items-center space-x-1 mt-2">
                  <User size={12} className="text-gray-400 flex-shrink-0" />
                  <Text className="text-xs text-gray-500 truncate">
                    Gán cho: {conversation.assignedTo.name}
                  </Text>
                </div>
              )}
            </div>
          </div>

        </div>
      </List.Item>
    );
  };

  return (
    <div className="h-[500px] overflow-y-auto">
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredConversations.length > 0 ? (
        <List
          dataSource={filteredConversations}
          renderItem={renderConversationItem}
          split={false}
        />
      ) : (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
          <Text>Không có cuộc trò chuyện nào</Text>
        </div>
      )}
    </div>
  );
};

export default AdminConversationList;
