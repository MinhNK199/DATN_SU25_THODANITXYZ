import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  Eye, 
  EyeOff, 
  Circle,
  CheckCircle,
  Mail,
  MailOpen,
  Filter,
  Search,
  ShoppingBag,
  CreditCard,
  Truck,
  Package,
  AlertTriangle,
  Info,
  Clock,
  Star
} from 'lucide-react';
import { useModernNotification } from '../../../components/client/ModernNotification';
import axiosInstance from '../../../api/axiosInstance';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'system' | 'payment' | 'shipping' | 'other';
  isRead: boolean;
  createdAt: string;
  data?: any;
  link?: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const { showSuccess, showError } = useModernNotification();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/notification');
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error: any) {
      showError('Lỗi tải thông báo', error.response?.data?.message || 'Không thể tải thông báo');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await axiosInstance.put(`/notification/${notificationId}/read`);
      if (response.data.success) {
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        showSuccess('Thành công', 'Đã đánh dấu là đã đọc');
      }
    } catch (error: any) {
      showError('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const markAsUnread = async (notificationId: string) => {
    try {
      const response = await axiosInstance.put(`/notification/${notificationId}/unread`);
      if (response.data.success) {
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId ? { ...notif, isRead: false } : notif
          )
        );
        showSuccess('Thành công', 'Đã đánh dấu là chưa đọc');
      }
    } catch (error: any) {
      showError('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await axiosInstance.put('/notification/mark-all-read');
      if (response.data.success) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        showSuccess('Thành công', 'Đã đánh dấu tất cả là đã đọc');
      }
    } catch (error: any) {
      showError('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await axiosInstance.delete(`/notification/${notificationId}`);
      if (response.data.success) {
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        showSuccess('Thành công', 'Đã xóa thông báo');
      }
    } catch (error: any) {
      showError('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const deleteSelected = async () => {
    if (selectedNotifications.length === 0) {
      showError('Lỗi', 'Vui lòng chọn thông báo để xóa');
      return;
    }

    try {
      const response = await axiosInstance.delete('/notification/delete-multiple', {
        data: { notificationIds: selectedNotifications }
      });
      if (response.data.success) {
        setNotifications(prev => prev.filter(notif => !selectedNotifications.includes(notif._id)));
        setSelectedNotifications([]);
        showSuccess('Thành công', `Đã xóa ${selectedNotifications.length} thông báo`);
      }
    } catch (error: any) {
      showError('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-5 h-5 text-blue-500" />;
      case 'payment':
        return <CreditCard className="w-5 h-5 text-green-500" />;
      case 'shipping':
        return <Truck className="w-5 h-5 text-orange-500" />;
      case 'promotion':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'system':
        return <Info className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'border-l-blue-500 bg-blue-50 hover:bg-blue-100';
      case 'payment':
        return 'border-l-green-500 bg-green-50 hover:bg-green-100';
      case 'shipping':
        return 'border-l-orange-500 bg-orange-50 hover:bg-orange-100';
      case 'promotion':
        return 'border-l-yellow-500 bg-yellow-50 hover:bg-yellow-100';
      case 'system':
        return 'border-l-purple-500 bg-purple-50 hover:bg-purple-100';
      default:
        return 'border-l-gray-500 bg-gray-50 hover:bg-gray-100';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'order':
        return 'Đơn hàng';
      case 'payment':
        return 'Thanh toán';
      case 'shipping':
        return 'Vận chuyển';
      case 'promotion':
        return 'Khuyến mãi';
      case 'system':
        return 'Hệ thống';
      default:
        return 'Khác';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'unread' && !notification.isRead) ||
      (filter === 'read' && notification.isRead);
    
    return matchesSearch && matchesFilter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Vừa xong';
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n._id));
    }
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Đang tải thông báo...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả thông báo đã đọc'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {selectedNotifications.length > 0 && (
            <button
              onClick={deleteSelected}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa ({selectedNotifications.length})
            </button>
          )}
          
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Check className="w-4 h-4 mr-2" />
            Đánh dấu tất cả đã đọc
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm thông báo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="unread">Chưa đọc</option>
              <option value="read">Đã đọc</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filter !== 'all' ? 'Không tìm thấy thông báo' : 'Chưa có thông báo nào'}
          </h3>
          <p className="text-gray-500">
            {searchTerm || filter !== 'all' 
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              : 'Bạn sẽ nhận được thông báo khi có hoạt động mới'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Select All */}
          <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border p-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Chọn tất cả ({filteredNotifications.length})
              </span>
            </label>
          </div>

          {/* Notifications */}
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`
                ${getTypeColor(notification.type)}
                border-l-4 rounded-xl shadow-sm p-4 transition-all duration-200
                ${!notification.isRead ? 'ring-2 ring-blue-200' : ''}
              `}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedNotifications.includes(notification._id)}
                  onChange={() => handleSelectNotification(notification._id)}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                
                <div className="flex-shrink-0 mt-0.5">
                  {getTypeIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`text-sm font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {getTypeLabel(notification.type)}
                        </span>
                        {!notification.isRead && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Mới
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(notification.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  {notification.isRead ? (
                    <button
                      onClick={() => markAsUnread(notification._id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                      title="Đánh dấu chưa đọc"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="p-2 text-blue-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-100"
                      title="Đánh dấu đã đọc"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-100"
                    title="Xóa thông báo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;