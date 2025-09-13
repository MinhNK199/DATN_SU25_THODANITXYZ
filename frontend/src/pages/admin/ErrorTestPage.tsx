import React from 'react';
import { Layout, Typography } from 'antd';
import ErrorNotificationTest from '../../components/admin/ErrorNotificationTest';

const { Content } = Layout;
const { Title } = Typography;

const ErrorTestPage: React.FC = () => {
  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Title level={2} className="text-center text-gray-800 mb-2">
              Test Thông Báo Lỗi với Âm Thanh
            </Title>
            <p className="text-center text-gray-600">
              Trang này cho phép bạn test các loại thông báo lỗi khác nhau với âm thanh
            </p>
          </div>
          
          <ErrorNotificationTest />
        </div>
      </Content>
    </Layout>
  );
};

export default ErrorTestPage;
