import React, { useState, useEffect } from 'react';
import { Modal, List, Avatar, Badge, Button, Pagination, Empty, Spin, Typography, Tag, Space } from 'antd';
import { 
  MessageCircle, 
  Bell, 
  AlertCircle, 
  CheckCircle, 
  X, 
  MoreVertical,
  Trash2,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const { Text, Title } = Typography;

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'message' | 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  isRead: boolean;
  icon?: React.ReactNode;
  actionUrl?: string;
  metadata?: {
    conversationId?: string;
    userId?: string;
    orderId?: string;
  };
}

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  loading?: boolean;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
  onPageChange?: (page: number) => void;
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
  notifications,
  loading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onPageChange,
  currentPage = 1,
  totalPages = 1,
  totalCount = 0
}) => {
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-4 h-4 admin-text-blue" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'blue';
      case 'success':
        return 'green';
      case 'warning':
        return 'orange';
      case 'error':
        return 'red';
      default:
        return 'default';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'message':
        return 'Tin nhắn';
      case 'success':
        return 'Thành công';
      case 'warning':
        return 'Cảnh báo';
      case 'error':
        return 'Lỗi';
      default:
        return 'Thông báo';
    }
  };

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };

  const handleBulkAction = (action: 'read' | 'delete') => {
    selectedNotifications.forEach(id => {
      if (action === 'read' && onMarkAsRead) {
        onMarkAsRead(id);
      } else if (action === 'delete' && onDelete) {
        onDelete(id);
      }
    });
    setSelectedNotifications([]);
  };

  const renderNotificationItem = (notification: NotificationItem) => (
    <div
      key={notification.id}
      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        !notification.isRead ? 'admin-bg-blue-light border-l-4 admin-border-blue' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={selectedNotifications.includes(notification.id)}
          onChange={() => handleSelectNotification(notification.id)}
          className="w-4 h-4 admin-text-blue rounded focus:ring-blue-500 mt-1"
        />
        
        {/* Avatar */}
        <Avatar 
          size={40} 
          className={`${
            notification.isRead ? 'bg-gray-200' : 'admin-bg-blue-light'
          }`}
          icon={getIcon(notification.type)}
        />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Type Tag */}
          <div className="flex items-center space-x-2 mb-1">
            <Title level={5} className={`mb-0 ${!notification.isRead ? 'font-semibold' : 'font-normal'}`}>
              {notification.title}
            </Title>
            <Tag color={getTypeColor(notification.type)} size="small">
              {getTypeText(notification.type)}
            </Tag>
            {!notification.isRead && (
              <Badge dot color="blue" />
            )}
          </div>
          
          {/* Message */}
          <Text className={`${!notification.isRead ? 'font-medium' : ''}`}>
            {notification.message}
          </Text>
          
          {/* Time and Actions */}
          <div className="flex items-center justify-between mt-2">
            <Text type="secondary" className="text-xs">
              {formatDistanceToNow(notification.timestamp, { 
                addSuffix: true, 
                locale: vi 
              })} • {notification.timestamp.toLocaleString('vi-VN')}
            </Text>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                type="text"
                size="small"
                icon={<Eye size={14} />}
                onClick={() => onMarkAsRead?.(notification.id)}
                disabled={notification.isRead}
                className="text-xs"
              >
                {notification.isRead ? 'Đã đọc' : 'Đánh dấu đã đọc'}
              </Button>
              <Button
                type="text"
                size="small"
                danger
                icon={<Trash2 size={14} />}
                onClick={() => onDelete?.(notification.id)}
                className="text-xs"
              >
                Xóa
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      title={
        <div className="flex items-center justify-between w-full pr-8">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 admin-text-blue" />
            <Title level={4} className="mb-0">
              Thông báo ({totalCount})
            </Title>
          </div>
          <div className="flex items-center space-x-2">
            {selectedNotifications.length > 0 && (
              <Space>
                <Button
                  size="small"
                  onClick={() => handleBulkAction('read')}
                  icon={<Eye size={14} />}
                >
                  Đánh dấu đã đọc ({selectedNotifications.length})
                </Button>
                <Button
                  size="small"
                  danger
                  onClick={() => handleBulkAction('delete')}
                  icon={<Trash2 size={14} />}
                >
                  Xóa ({selectedNotifications.length})
                </Button>
              </Space>
            )}
            <Button
              size="small"
              onClick={handleSelectAll}
            >
              {selectedNotifications.length === notifications.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </Button>
            {notifications.some(n => !n.isRead) && (
              <Button
                size="small"
                type="primary"
                className="admin-primary-button"
                onClick={onMarkAllAsRead}
                icon={<CheckCircle size={14} />}
              >
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
      className="notification-modal"
    >
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Spin size="large" />
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có thông báo nào"
            className="py-8"
          />
        ) : (
          <div className="notification-list">
            {notifications.map(renderNotificationItem)}
          </div>
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 pt-4 border-t border-gray-200">
          <Pagination
            current={currentPage}
            total={totalCount}
            pageSize={5}
            onChange={onPageChange}
            showSizeChanger={false}
            showQuickJumper
            showTotal={(total, range) => 
              `${range[0]}-${range[1]} của ${total} thông báo`
            }
          />
        </div>
      )}
    </Modal>
  );
};

export default NotificationModal;
