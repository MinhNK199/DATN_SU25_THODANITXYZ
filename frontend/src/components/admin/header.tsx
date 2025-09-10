import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Settings, 
  Search, 
  Bell, 
  MessageCircle, 
  User, 
  Home,
  ChevronDown,
  LogOut,
  Volume2,
  VolumeX
} from "lucide-react";
import { Badge, Dropdown, Menu, Avatar, Typography } from "antd";
import { useNotification } from "../../contexts/NotificationContext";
import PushNotification from "./PushNotification";
import NotificationModal from "./NotificationModal";

const { Text } = Typography;

const AdminHeader = () => {
  const navigate = useNavigate();
  const { 
    currentNotification, 
    hideNotification, 
    showNotification,
    unreadCount,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    audioEnabled,
    setAudioEnabled,
    playNotificationSound
  } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role?.toUpperCase() || "";
  const name = user?.name || "";
  const email = user?.email || "";

  const { notifications, total, totalPages } = getNotifications(currentPage, 5);

  // Listen for chat notifications
  useEffect(() => {
    const handleChatNotification = (event: CustomEvent) => {
      showNotification({
        title: event.detail.title,
        message: event.detail.message,
        type: event.detail.type,
        metadata: {
          conversationId: event.detail.conversationId
        }
      });
    };

    window.addEventListener('chat-notification', handleChatNotification as EventListener);
    
    return () => {
      window.removeEventListener('chat-notification', handleChatNotification as EventListener);
    };
  }, [showNotification]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleNotificationClick = () => {
    setNotificationModalVisible(true);
  };

  const handleNotificationModalClose = () => {
    setNotificationModalVisible(false);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDeleteNotification = (id: string) => {
    deleteNotification(id);
  };

  const handleToggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };

  const handleTestSound = () => {
    playNotificationSound();
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<User size={16} />}>
        Hồ sơ cá nhân
      </Menu.Item>
      <Menu.Item key="settings" icon={<Settings size={16} />}>
        Cài đặt
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogOut size={16} />} onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <header className="bg-white w-full shadow-lg border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Logo & Search */}
            <div className="flex items-center space-x-6 flex-1">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-xl font-bold text-gray-800">Admin Panel</span>
              </div>

              {/* Search Bar */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm, đơn hàng, khách hàng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Right side - Actions & User */}
            <div className="flex items-center space-x-4">
              {/* Chat Button */}
              <button
                onClick={() => navigate("/admin/chat")}
                className="relative p-2.5 text-gray-600 hover:admin-text-blue hover:admin-bg-blue-light rounded-lg transition-all"
                title="Tin nhắn"
              >
                <MessageCircle className="w-5 h-5" />
                <Badge count={0} size="small" className="absolute -top-1 -right-1" />
              </button>

              {/* Audio Toggle */}
              <button
                onClick={handleToggleAudio}
                className={`p-2.5 rounded-lg transition-all ${
                  audioEnabled 
                    ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
                title={audioEnabled ? 'Tắt âm thanh thông báo' : 'Bật âm thanh thông báo'}
              >
                {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              {/* Test Sound */}
              <button
                onClick={handleTestSound}
                className="p-2.5 admin-text-blue hover:admin-text-blue hover:admin-bg-blue-light rounded-lg transition-all"
                title="Thử âm thanh thông báo"
              >
                <Volume2 className="w-5 h-5" />
              </button>

              {/* Notifications */}
              <button
                onClick={handleNotificationClick}
                className="relative p-2.5 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all"
                title="Thông báo"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge count={unreadCount} size="small" className="absolute -top-1 -right-1" />
                )}
              </button>

              {/* Settings */}
              <button
                onClick={() => navigate("/admin/settings")}
                className="p-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                title="Cài đặt"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Home Button */}
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                <Home className="w-4 h-4 inline mr-2" />
                Trang chủ
              </button>

              {/* User Menu */}
              <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
                <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-all">
                  <Avatar 
                    size={36} 
                    className="bg-gradient-to-r from-blue-500 to-purple-600"
                  >
                    {name.charAt(0).toUpperCase()}
                  </Avatar>
                  <div className="hidden md:block">
                    <Text className="text-sm font-semibold text-gray-800 block">
                      {name}
                    </Text>
                    <Text className="text-xs text-gray-500 block">
                      {role}
                    </Text>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </Dropdown>
            </div>
          </div>
        </div>
      </header>

      {/* Push Notification */}
      <PushNotification 
        notification={currentNotification} 
        onClose={hideNotification} 
      />

      {/* Notification Modal */}
      <NotificationModal
        visible={notificationModalVisible}
        onClose={handleNotificationModalClose}
        notifications={notifications}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={total}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDelete={handleDeleteNotification}
        onPageChange={handlePageChange}
      />
    </>
  );
};

export default AdminHeader;
