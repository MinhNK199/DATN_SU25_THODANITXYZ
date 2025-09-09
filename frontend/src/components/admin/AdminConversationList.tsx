import React, { useState, useEffect } from 'react';
import { List, Avatar, Badge, Tag, Typography, Space, Tooltip, Button, Dropdown, Menu } from 'antd';
import { 
  MessageCircle, 
  Clock, 
  User, 
  MoreVertical,
  Archive,
  CheckCircle
} from 'lucide-react';
// import { format, formatDistanceToNow } from 'date-fns';
import { useChat } from '../../contexts/ChatContext';
import { chatApi } from '../../services/chatApi';
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
  useEffect(() => {
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

    loadConversations();
  }, [filters]);

  // Filter conversations based on filters
  useEffect(() => {
    let filtered = [...conversations];
    console.log('AdminConversationList: Filtering conversations:', {
      total: conversations.length,
      filters: filters
    });

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
  }, [conversations, filters]);

  // Listen for new messages and conversation updates
  useEffect(() => {
    if (socket) {
      const handleNewMessage = (data: { message: any; conversationId: string }) => {
        // Update conversation list when new message arrives
        setConversations(prev => 
          prev.map(conv => 
            conv._id === data.conversationId 
              ? { ...conv, lastMessage: data.message, lastMessageAt: data.message.createdAt }
              : conv
          )
        );
      };

      const handleNewSupportMessage = (data: { message: any; conversation: Conversation }) => {
        // Add new conversation if it doesn't exist
        setConversations(prev => {
          const exists = prev.some(conv => conv._id === data.conversation._id);
          if (!exists) {
            return [data.conversation, ...prev];
          }
          return prev.map(conv => 
            conv._id === data.conversation._id 
              ? { ...conv, lastMessage: data.message, lastMessageAt: data.message.createdAt }
              : conv
          );
        });
      };

      socket.on('new_message', handleNewMessage);
      socket.on('new_support_message', handleNewSupportMessage);

      return () => {
        socket.off('new_message', handleNewMessage);
        socket.off('new_support_message', handleNewSupportMessage);
      };
    }
  }, [socket]);

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

  const handleConversationAction = async (action: string, conversation: Conversation) => {
    try {
      switch (action) {
        case 'assign':
          // Handle assign to admin
          break;
        case 'archive':
          await chatApi.updateConversationStatus(conversation._id, { status: 'closed' });
          break;
        case 'close':
          await chatApi.updateConversationStatus(conversation._id, { status: 'resolved' });
          break;
      }
    } catch (error) {
      console.error('Error handling conversation action:', error);
    }
  };

  const conversationMenu = (conversation: Conversation) => (
    <Menu onClick={({ key }) => handleConversationAction(key, conversation)}>
      <Menu.Item key="assign" icon={<User size={14} />}>
        Gán cho admin
      </Menu.Item>
      <Menu.Item key="archive" icon={<Archive size={14} />}>
        Lưu trữ
      </Menu.Item>
      <Menu.Item key="close" icon={<CheckCircle size={14} />}>
        Đóng cuộc trò chuyện
      </Menu.Item>
    </Menu>
  );

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

              <div className="flex items-center space-x-2 mb-2">
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

              {conversation.lastMessage && (
                <div className="flex items-center justify-between">
                  <Text className="text-sm text-gray-500 truncate flex-1">
                    {conversation.lastMessage.sender?.role === 'customer' ? 'Khách hàng: ' : 'Bạn: '}
                    {conversation.lastMessage.content}
                  </Text>
                  {hasUnread && (
                    <Badge count={1} size="small" className="ml-2" />
                  )}
                </div>
              )}

              {conversation.assignedTo && (
                <div className="flex items-center space-x-1 mt-2">
                  <User size={12} className="text-gray-400" />
                  <Text className="text-xs text-gray-500">
                    Gán cho: {conversation.assignedTo.name}
                  </Text>
                </div>
              )}
            </div>
          </div>

          <Dropdown overlay={conversationMenu(conversation)} trigger={['click']}>
            <Button
              type="text"
              size="small"
              icon={<MoreVertical size={14} />}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
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
