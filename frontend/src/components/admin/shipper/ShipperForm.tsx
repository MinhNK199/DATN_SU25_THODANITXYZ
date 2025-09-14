import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Card, Row, Col, Typography, Space, message } from 'antd';
import { UserOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { Shipper } from '../../../interfaces/Shipper';

interface ShipperFormProps {
  shipper?: Shipper | null;
  onSave: (shipper: Partial<Shipper>) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const { Option } = Select;
const { Title } = Typography;

const ShipperForm: React.FC<ShipperFormProps> = ({ shipper, onSave, onCancel, isEdit = false }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (shipper && isEdit) {
      form.setFieldsValue({
        username: shipper.username,
        email: shipper.email,
        fullName: shipper.fullName,
        phone: shipper.phone,
        address: shipper.address,
        idCard: shipper.idCard,
        licensePlate: shipper.licensePlate,
        vehicleType: shipper.vehicleType,
        status: shipper.status,
      });
    }
  }, [shipper, isEdit, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const submitData = { ...values };
      if (isEdit && !submitData.password) {
        delete submitData.password; // Không gửi mật khẩu nếu không thay đổi
      }
      
      await onSave(submitData);
    } catch (error) {
      console.error('Error saving shipper:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card className="shadow-md rounded-lg">
        <Row justify="space-between" align="middle" className="mb-6">
          <Col>
            <Space align="center">
              <UserOutlined className="text-2xl text-blue-600" />
              <Title level={2} className="!mb-0">
                {isEdit ? 'Chỉnh sửa Shipper' : 'Thêm Shipper mới'}
              </Title>
            </Space>
          </Col>
        </Row>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="max-w-4xl"
        >
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Tên đăng nhập"
                name="username"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên đăng nhập' },
                  { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự' }
                ]}
              >
                <Input placeholder="Tên đăng nhập" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input placeholder="Email" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label={isEdit ? 'Mật khẩu mới (để trống nếu không thay đổi)' : 'Mật khẩu'}
                name="password"
                rules={[
                  { required: !isEdit, message: 'Vui lòng nhập mật khẩu' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                ]}
              >
                <Input.Password placeholder={isEdit ? 'Mật khẩu mới' : 'Mật khẩu'} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Họ và tên"
                name="fullName"
                rules={[
                  { required: true, message: 'Vui lòng nhập họ và tên' },
                  { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự' }
                ]}
              >
                <Input placeholder="Họ và tên" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại' },
                  { pattern: /^[0-9+\-\s()]+$/, message: 'Số điện thoại không hợp lệ' }
                ]}
              >
                <Input placeholder="Số điện thoại" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Địa chỉ"
                name="address"
                rules={[
                  { required: true, message: 'Vui lòng nhập địa chỉ' }
                ]}
              >
                <Input placeholder="Địa chỉ" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Số CMND/CCCD"
                name="idCard"
                rules={[
                  { required: true, message: 'Vui lòng nhập số CMND/CCCD' },
                  { min: 9, message: 'Số CMND/CCCD không hợp lệ' }
                ]}
              >
                <Input placeholder="Số CMND/CCCD" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Biển số xe"
                name="licensePlate"
                rules={[
                  { required: true, message: 'Vui lòng nhập biển số xe' }
                ]}
              >
                <Input placeholder="Biển số xe" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Loại phương tiện"
                name="vehicleType"
                rules={[
                  { required: true, message: 'Vui lòng chọn loại phương tiện' }
                ]}
              >
                <Select placeholder="Chọn loại phương tiện">
                  <Option value="motorbike">Xe máy</Option>
                  <Option value="car">Ô tô</Option>
                  <Option value="bicycle">Xe đạp</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[
                  { required: true, message: 'Vui lòng chọn trạng thái' }
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="active">Hoạt động</Option>
                  <Option value="inactive">Không hoạt động</Option>
                  <Option value="suspended">Tạm khóa</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row justify="end" className="mt-6">
            <Space>
              <Button
                icon={<CloseOutlined />}
                onClick={onCancel}
                size="large"
              >
                Hủy
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                htmlType="submit"
                loading={loading}
                size="large"
              >
                {isEdit ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default ShipperForm;
