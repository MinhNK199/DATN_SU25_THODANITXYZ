import React, { useState } from 'react';
import { Button, Card, Space, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import UnsavedChangesWarning from './UnsavedChangesWarning';

const { Title, Paragraph } = Typography;

const UnsavedChangesDemo: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false);

  const handleShowWarning = () => {
    setShowWarning(true);
  };

  const handleConfirm = () => {
    console.log('Người dùng xác nhận rời khỏi trang');
    setShowWarning(false);
  };

  const handleCancel = () => {
    console.log('Người dùng hủy bỏ');
    setShowWarning(false);
  };

  const handleSave = () => {
    console.log('Người dùng chọn lưu và rời khỏi');
    setShowWarning(false);
  };

  const handleDiscard = () => {
    console.log('Người dùng chọn hủy thay đổi');
    setShowWarning(false);
  };

  return (
    <div className="p-6">
      <Card>
        <Title level={3}>Demo Hộp Thoại Cảnh Báo Thay Đổi Chưa Lưu</Title>
        <Paragraph>
          Nhấn nút bên dưới để xem hộp thoại cảnh báo khi có thay đổi chưa được lưu.
        </Paragraph>
        
        <Space>
          <Button 
            type="primary" 
            icon={<ExclamationCircleOutlined />}
            onClick={handleShowWarning}
          >
            Hiển thị hộp thoại cảnh báo
          </Button>
        </Space>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <Title level={5}>Tính năng:</Title>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Thông báo tiếng Việt hoàn toàn</li>
            <li>Giao diện đẹp mắt với animation</li>
            <li>Nhiều tùy chọn: Lưu và rời khỏi, Hủy thay đổi, Rời khỏi trang</li>
            <li>Thông tin hữu ích về auto-save</li>
            <li>Responsive design cho mobile</li>
            <li>Accessibility support</li>
          </ul>
        </div>
      </Card>

      <UnsavedChangesWarning
        visible={showWarning}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onSave={handleSave}
        onDiscard={handleDiscard}
        title="Có thay đổi chưa được lưu"
        content="Bạn có thay đổi chưa được lưu. Bạn có muốn lưu trước khi rời khỏi trang không?"
        showSaveOption={true}
      />
    </div>
  );
};

export default UnsavedChangesDemo;
