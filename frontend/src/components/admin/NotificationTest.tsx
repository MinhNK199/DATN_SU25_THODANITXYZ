import React from 'react';
import { Button, Card, Space, Typography } from 'antd';
import { useNotification } from '../../hooks/useNotification';
import { Bell, CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

const { Title, Text } = Typography;

const NotificationTest: React.FC = () => {
  const { success, error, warning, info: showInfo, playNotificationSound } = useNotification();

  const testSuccess = () => {
    success('Thông báo thành công!', 'Test Success');
  };

  const testError = () => {
    error('Thông báo lỗi!', 'Test Error');
  };

  const testWarning = () => {
    warning('Thông báo cảnh báo!', 'Test Warning');
  };

  const testInfo = () => {
    showInfo('Thông báo thông tin!', 'Test Info');
  };

  const testSound = () => {
    playNotificationSound();
  };

  const testChatNotification = () => {
    // Simulate chat notification
    const event = new CustomEvent('chat-notification', {
      detail: {
        title: 'Tin nhắn mới từ Nguyễn Văn A',
        message: 'Xin chào admin, tôi cần hỗ trợ về sản phẩm',
        type: 'message'
      }
    });
    window.dispatchEvent(event);
  };

  return (
    <Card title="Test Thông báo" className="max-w-2xl">
      <Space direction="vertical" size="large" className="w-full">
        <div>
          <Title level={4}>Test Các Loại Thông báo</Title>
          <Space wrap>
            <Button 
              type="primary" 
              icon={<CheckCircle size={16} />}
              onClick={testSuccess}
            >
              Test Success
            </Button>
            <Button 
              danger 
              icon={<XCircle size={16} />}
              onClick={testError}
            >
              Test Error
            </Button>
            <Button 
              type="default" 
              icon={<AlertCircle size={16} />}
              onClick={testWarning}
            >
              Test Warning
            </Button>
            <Button 
              type="default" 
              icon={<Info size={16} />}
              onClick={testInfo}
            >
              Test Info
            </Button>
          </Space>
        </div>

        <div>
          <Title level={4}>Test Âm thanh</Title>
          <Space wrap>
            <Button 
              icon={<Bell size={16} />}
              onClick={testSound}
            >
              Test Âm thanh
            </Button>
            <Button 
              icon={<Bell size={16} />}
              onClick={testChatNotification}
            >
              Test Chat Notification
            </Button>
          </Space>
        </div>

        <div>
          <Text type="secondary">
            💡 Sử dụng các nút trên để test hệ thống thông báo mới. 
            Thông báo sẽ xuất hiện ở góc trên bên phải và có âm thanh.
          </Text>
        </div>
      </Space>
    </Card>
  );
};

export default NotificationTest;
