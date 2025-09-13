import React from 'react';
import { Button, Space, Typography, Card } from 'antd';
import { AlertTriangle, Bug, Database, Server } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

const { Title, Text } = Typography;

const ErrorNotificationTest: React.FC = () => {
  const { showNotification } = useNotification();

  const testErrorNotifications = [
    {
      title: 'Lỗi kết nối cơ sở dữ liệu',
      message: 'Không thể kết nối đến cơ sở dữ liệu. Vui lòng kiểm tra lại cấu hình.',
      type: 'error' as const,
      icon: <Database className="w-4 h-4" />
    },
    {
      title: 'Lỗi xử lý đơn hàng',
      message: 'Có lỗi xảy ra khi xử lý đơn hàng #12345. Vui lòng thử lại sau.',
      type: 'error' as const,
      icon: <Bug className="w-4 h-4" />
    },
    {
      title: 'Lỗi server',
      message: 'Server đang gặp sự cố. Hệ thống sẽ được khôi phục trong vài phút.',
      type: 'error' as const,
      icon: <Server className="w-4 h-4" />
    },
    {
      title: 'Lỗi xác thực',
      message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      type: 'error' as const,
      icon: <AlertTriangle className="w-4 h-4" />
    }
  ];

  const handleTestError = (notification: typeof testErrorNotifications[0]) => {
    showNotification(notification);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <Title level={3} className="text-red-600 mb-2">
          Test Thông Báo Lỗi
        </Title>
        <Text className="text-gray-600">
          Nhấn các nút bên dưới để test thông báo lỗi với âm thanh
        </Text>
      </div>

      <Space direction="vertical" size="middle" className="w-full">
        {testErrorNotifications.map((notification, index) => (
          <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="text-red-500">
                {notification.icon}
              </div>
              <div>
                <Text strong className="text-gray-900">
                  {notification.title}
                </Text>
                <br />
                <Text className="text-gray-600 text-sm">
                  {notification.message}
                </Text>
              </div>
            </div>
            <Button
              type="primary"
              danger
              onClick={() => handleTestError(notification)}
              className="ml-4"
            >
              Test
            </Button>
          </div>
        ))}
      </Space>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <Text className="text-yellow-800 text-sm">
          <strong>Lưu ý:</strong> Mỗi thông báo lỗi sẽ phát âm thanh từ file wrong_5.mp3. 
          Đảm bảo âm thanh đã được bật trong cài đặt thông báo.
        </Text>
      </div>
    </Card>
  );
};

export default ErrorNotificationTest;
