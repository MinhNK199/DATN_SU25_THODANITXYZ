import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, message } from 'antd';
import { UserOutlined, LockOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useShipper } from '../../contexts/ShipperContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ShipperLogin: React.FC = () => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useShipper();
  const navigate = useNavigate();

  const handleSubmit = async (values: any) => {
    try {
      setIsLoading(true);
      await login(values.email, values.password);
      message.success('Đăng nhập thành công!');
      navigate('/shipper/dashboard');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-6">
          <Space direction="vertical" size="large" className="w-full">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <ShoppingCartOutlined className="text-2xl text-blue-600" />
            </div>
            <div>
              <Title level={2} className="!mb-2">Đăng nhập Shipper</Title>
              <Text type="secondary">Quản lý giao hàng của bạn</Text>
            </div>
          </Space>
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email address"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              className="w-full"
              size="large"
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </Form.Item>

          <div className="text-center mt-4">
            <Text type="secondary">
              Chưa có tài khoản?{' '}
              <Button
                type="link"
                onClick={() => navigate('/shipper/register')}
                className="p-0 h-auto"
              >
                Đăng ký ngay
              </Button>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ShipperLogin;
