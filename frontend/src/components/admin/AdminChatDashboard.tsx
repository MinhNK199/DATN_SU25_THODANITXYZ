import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  List, 
  Avatar, 
  Badge, 
  Button, 
  Input, 
  Select, 
  Tag, 
  Space,
  Typography,
  Tabs,
  Tooltip,
  Dropdown,
  Menu
} from 'antd';
import { 
  MessageCircle, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  Phone,
  Video,
  UserPlus,
  Archive
} from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { chatApi } from '../../services/chatApi';
import { Conversation, ChatStats, ChatFilters } from '../../interfaces/Chat';
import AdminConversationList from './AdminConversationList';
import AdminChatWindow from './AdminChatWindow';

const { Title, Text } = Typography;
const { Search: AntSearch } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const AdminChatDashboard: React.FC = () => {
  const { isConnected } = useChat();
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [filters, setFilters] = useState<ChatFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load chat statistics and unread count
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await chatApi.getChatStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Error loading chat stats:', error);
      }
    };

    const loadUnreadCount = async () => {
      try {
        const response = await chatApi.getUnreadCount();
        if (response.success) {
          setUnreadCount(response.data.totalUnread);
        }
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    loadStats();
    loadUnreadCount();
  }, []);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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

  const conversationMenu = (conversation: Conversation) => (
    <Menu>
      <Menu.Item key="assign" icon={<UserPlus size={14} />}>
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Title level={2} className="mb-2">
          Quản lý Chat Hỗ trợ
        </Title>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <Text className="text-gray-600">
            {isConnected ? 'Đang hoạt động' : 'Mất kết nối'}
          </Text>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng cuộc trò chuyện"
                value={stats.totalConversations}
                prefix={<MessageCircle className="text-blue-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Đang hoạt động"
                value={stats.activeConversations}
                prefix={<Users className="text-green-500" />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Chờ xử lý"
                value={stats.pendingConversations}
                prefix={<Clock className="text-orange-500" />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Thời gian phản hồi TB"
                value={stats.averageResponseTime}
                suffix="phút"
                prefix={<CheckCircle className="text-purple-500" />}
                precision={1}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]}>
        {/* Left Panel - Conversation List */}
        <Col xs={24} lg={8}>
          <Card 
            title="Danh sách cuộc trò chuyện" 
            extra={
              <Badge count={unreadCount} size="small">
                <MessageCircle size={16} />
              </Badge>
            }
            className="h-[600px]"
          >
            {/* Filters */}
            <div className="mb-4 space-y-3">
              <AntSearch
                placeholder="Tìm kiếm cuộc trò chuyện..."
                onSearch={(value) => handleFilterChange('search', value)}
                allowClear
              />
              
              <div className="flex space-x-2">
                <Select
                  placeholder="Trạng thái"
                  style={{ width: 120 }}
                  allowClear
                  onChange={(value) => handleFilterChange('status', value)}
                >
                  <Option value="active">Hoạt động</Option>
                  <Option value="pending">Chờ xử lý</Option>
                  <Option value="closed">Đã đóng</Option>
                  <Option value="resolved">Đã giải quyết</Option>
                </Select>
                
                <Select
                  placeholder="Độ ưu tiên"
                  style={{ width: 120 }}
                  allowClear
                  onChange={(value) => handleFilterChange('priority', value)}
                >
                  <Option value="urgent">Khẩn cấp</Option>
                  <Option value="high">Cao</Option>
                  <Option value="medium">Trung bình</Option>
                  <Option value="low">Thấp</Option>
                </Select>
              </div>
            </div>

            {/* Conversation List */}
            <AdminConversationList
              onConversationSelect={handleConversationSelect}
              selectedConversation={selectedConversation}
              filters={filters}
            />
          </Card>
        </Col>

        {/* Right Panel - Chat Window */}
        <Col xs={24} lg={16}>
          {selectedConversation ? (
            <AdminChatWindow
              conversation={selectedConversation}
              onConversationUpdate={(updated) => {
                setSelectedConversation(updated);
              }}
            />
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle size={64} className="mx-auto mb-4 text-gray-300" />
                <Title level={4} className="text-gray-400">
                  Chọn cuộc trò chuyện để bắt đầu
                </Title>
                <Text className="text-gray-400">
                  Chọn một cuộc trò chuyện từ danh sách bên trái để xem và trả lời tin nhắn
                </Text>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default AdminChatDashboard;
