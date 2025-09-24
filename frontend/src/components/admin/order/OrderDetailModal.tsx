import React, { useEffect, useState } from 'react';
import { Order } from '../../../interfaces/Order';
import { Card, Spin, Descriptions, Table, Tag, Timeline, Button, Image, Row, Col, Divider, Space, Typography, Form, Select, Input } from 'antd';
import { 
  FaUser, 
  FaTruck, 
  FaBox, 
  FaMoneyBillWave, 
  FaInfoCircle,
  FaRegCheckCircle,
  FaRegClock,
  FaShippingFast,
  FaBan,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';
import axiosInstance from '../../../api/axiosInstance';
import { updateOrderStatus } from '../../../services/orderApi';
import { useNotification } from '../../../contexts/NotificationContext';

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface OrderDetailModalProps {
  orderId: string;
  onClose?: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ orderId, onClose }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [updating, setUpdating] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/order/${orderId}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (values: { status: string; note: string }) => {
    if (!orderId) return;
    
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, values.status, values.note);
      showNotification({
        title: 'Cập nhật trạng thái thành công',
        message: 'Cập nhật trạng thái đơn hàng thành công!',
        type: 'success',
        actionUrl: `/admin/orders/${orderId}`
      });
      form.resetFields();
      
      // Đóng modal sau khi cập nhật thành công
      if (onClose) {
        onClose();
      }
      
      // Refresh data
      await fetchOrderDetail();
    } catch (error) {
      console.error('Error updating order status:', error);
      showNotification({
        title: 'Cập nhật trạng thái thất bại',
        message: 'Có lỗi xảy ra khi cập nhật trạng thái',
        type: 'error',
        actionUrl: `/admin/orders/${orderId}`
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "draft": return "gray";
      case "pending": return "orange";
      case "confirmed": return "blue";
      case "processing": return "purple";
      case "assigned": return "cyan";
      case "picked_up": return "blue";
      case "in_transit": return "purple";
      case "arrived": return "orange";
      case "shipped": return "cyan";
      case "delivered": return "green";
      case "delivered_success": return "green";
      case "delivered_failed": return "red";
      case "partially_delivered": return "orange";
      case "returned": return "volcano";
      case "return_requested": return "orange";
      case "on_hold": return "gray";
      case "completed": return "green";
      case "cancelled": return "red";
      case "refund_requested": return "gold";
      case "refunded": return "lime";
      case "payment_failed": return "red";
      default: return "gray";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "draft": return "Đang tạo";
      case "pending": return "Chờ xác nhận";
      case "confirmed": return "Đã xác nhận";
      case "processing": return "Đang xử lý";
      case "assigned": return "Đã phân công";
      case "picked_up": return "Đã nhận hàng";
      case "in_transit": return "Đang giao hàng";
      case "arrived": return "Đã đến điểm giao";
      case "shipped": return "Đang giao hàng";
      case "delivered": return "Đã giao";
      case "delivered_success": return "Giao hàng thành công";
      case "delivered_failed": return "Giao hàng thất bại";
      case "partially_delivered": return "Giao hàng một phần";
      case "returned": return "Hoàn hàng";
      case "return_requested": return "Yêu cầu hoàn hàng";
      case "on_hold": return "Tạm dừng";
      case "completed": return "Thành công";
      case "cancelled": return "Đã hủy";
      case "refund_requested": return "Yêu cầu hoàn tiền";
      case "refunded": return "Hoàn tiền thành công";
      case "payment_failed": return "Thanh toán thất bại";
      default: return "Không xác định";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const itemColumns = [
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      width: 80,
      render: (image: string) => (
        <Image 
          width={60} 
          height={60}
          src={image} 
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
        />
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <div>
          <Text strong>{text}</Text>
          {(record.variantInfo && record.variantInfo.name) || (record.variant && record.variant.name) ? (
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              Chi tiết: {record.variantInfo?.name || record.variant?.name}
            </div>
          ) : null}
        </div>
      ),
    },
    { 
      title: "Số lượng", 
      dataIndex: "quantity", 
      key: "quantity",
      align: 'center' as const,
      width: 80
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      align: 'right' as const,
      render: (price: number) => (
        <Text strong style={{ color: '#1890ff' }}>
          {price.toLocaleString()}₫
        </Text>
      ),
    },
    {
      title: "Thành tiền",
      key: "total",
      align: 'right' as const,
      render: (_: any, record: any) => (
        <Text strong style={{ color: '#52c41a' }}>
          {(record.quantity * record.price).toLocaleString()}₫
        </Text>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text type="danger">Không thể tải thông tin đơn hàng</Text>
      </div>
    );
  }

  return (
    <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
      {/* Header */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              Đơn hàng #{order._id.slice(-8).toUpperCase()}
            </Title>
            <Text type="secondary">
              Tạo lúc: {formatDate(order.createdAt)}
            </Text>
          </Col>
          <Col>
            <Space>
              <Tag color={getStatusColor(order.status)} style={{ fontSize: 14, padding: '4px 12px' }}>
                {getStatusText(order.status)}
              </Tag>
              <Tag color={order.isPaid ? 'green' : 'red'} style={{ fontSize: 14, padding: '4px 12px' }}>
                {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </Tag>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        {/* Thông tin khách hàng */}
        <Col span={12}>
          <Card title={
            <Space>
              <FaUser style={{ color: '#1890ff' }} />
              <span>Thông tin khách hàng</span>
            </Space>
          } size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Tên">
                <Text strong>{order.user?.name || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <Text>{order.user?.email || 'N/A'}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Thông tin giao hàng */}
        <Col span={12}>
          <Card title={
            <Space>
              <FaMapMarkerAlt style={{ color: '#52c41a' }} />
              <span>Địa chỉ giao hàng</span>
            </Space>
          } size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Người nhận">
                <Text strong>{order.shippingAddress?.fullName || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                <Text>{order.shippingAddress?.phone || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                <Text>{order.shippingAddress?.address || 'N/A'}</Text>
              </Descriptions.Item>
              {order.shippingAddress?.wardName && (
                <Descriptions.Item label="Phường/Xã">
                  <Text>{order.shippingAddress.wardName}</Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Thành phố">
                <Text>{order.shippingAddress?.cityName || order.shippingAddress?.city || 'N/A'}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Danh sách sản phẩm */}
      <Card title={
        <Space>
          <FaBox style={{ color: '#722ed1' }} />
          <span>Danh sách sản phẩm</span>
        </Space>
      } size="small">
        <Table
          dataSource={order.orderItems}
          columns={itemColumns}
          pagination={false}
          size="small"
          rowKey={(record, index) => `${record.product}-${index}`}
        />
      </Card>

      <Divider />

      {/* Thông tin thanh toán */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title={
            <Space>
              <FaMoneyBillWave style={{ color: '#fa8c16' }} />
              <span>Thông tin thanh toán</span>
            </Space>
          } size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Phương thức">
                <Tag color="blue">
                  {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 
                   order.paymentMethod === 'BANKING' ? 'Chuyển khoản ngân hàng' : 
                   order.paymentMethod === 'E-WALLET' ? 'Ví điện tử' : order.paymentMethod}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={order.isPaid ? 'green' : 'red'}>
                  {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </Tag>
              </Descriptions.Item>
              {order.paidAt && (
                <Descriptions.Item label="Thời gian thanh toán">
                  <Text>{formatDate(order.paidAt)}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        <Col span={12}>
          <Card title={
            <Space>
              <FaTruck style={{ color: '#13c2c2' }} />
              <span>Thông tin giao hàng</span>
            </Space>
          } size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Trạng thái giao hàng">
                <Tag color={order.isDelivered ? 'green' : 'orange'}>
                  {order.isDelivered ? 'Đã giao hàng' : 'Chưa giao hàng'}
                </Tag>
              </Descriptions.Item>
              {order.shipper && (
                <Descriptions.Item label="Shipper">
                  <Text strong>{order.shipper.fullName}</Text>
                  <br />
                  <Text type="secondary">{order.shipper.phone}</Text>
                </Descriptions.Item>
              )}
              {order.deliveredAt && (
                <Descriptions.Item label="Thời gian giao hàng">
                  <Text>{formatDate(order.deliveredAt)}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Tổng kết đơn hàng */}
      <Card title={
        <Space>
          <FaInfoCircle style={{ color: '#eb2f96' }} />
          <span>Tổng kết đơn hàng</span>
        </Space>
      } size="small">
        <Row justify="end">
          <Col span={8}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Tạm tính">
                <Text>{order.itemsPrice?.toLocaleString() || 0}₫</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Phí vận chuyển">
                <Text>{order.shippingPrice?.toLocaleString() || 0}₫</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Thuế">
                <Text>{order.taxPrice?.toLocaleString() || 0}₫</Text>
              </Descriptions.Item>
              {order.discountAmount > 0 && (
                <Descriptions.Item label="Giảm giá">
                  <Text style={{ color: '#52c41a' }}>
                    -{order.discountAmount.toLocaleString()}₫
                  </Text>
                </Descriptions.Item>
              )}
              <Divider style={{ margin: '8px 0' }} />
              <Descriptions.Item label="Tổng cộng">
                <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                  {order.totalPrice?.toLocaleString() || 0}₫
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* Lịch sử trạng thái */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <>
          <Divider />
          <Card title={
            <Space>
              <FaRegClock style={{ color: '#722ed1' }} />
              <span>Lịch sử trạng thái</span>
            </Space>
          } size="small">
            <Timeline
              items={order.statusHistory.map((history, index) => ({
                color: getStatusColor(history.status),
                children: (
                  <div>
                    <Text strong>{getStatusText(history.status)}</Text>
                    <br />
                    <Text type="secondary">{formatDate(history.date)}</Text>
                    {history.note && (
                      <>
                        <br />
                        <Text type="secondary" italic>Ghi chú: {history.note}</Text>
                      </>
                    )}
                  </div>
                ),
              }))}
            />
          </Card>
        </>
      )}

      {/* Form chuyển trạng thái */}
      <Divider />
      <Card title="Cập nhật trạng thái" size="small">
        <Form form={form} onFinish={handleStatusUpdate} layout="vertical">
          <Form.Item
            name="status"
            label="Trạng thái mới"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select placeholder="Chọn trạng thái mới">
              <Option value="pending">Chờ xác nhận</Option>
              <Option value="confirmed">Đã xác nhận</Option>
              <Option value="processing">Đang xử lý</Option>
              <Option value="shipped">Đang giao hàng</Option>
              <Option value="delivered_success">Giao hàng thành công</Option>
              <Option value="delivered_failed">Giao hàng thất bại</Option>
              <Option value="completed">Thành công</Option>
              <Option value="cancelled">Đã hủy</Option>
              <Option value="refunded">Đã hoàn tiền</Option>
            </Select>
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <TextArea
              rows={3}
              placeholder="Thêm ghi chú cho lần cập nhật này..."
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={updating}
              block
              className="admin-primary-button"
            >
              Cập nhật trạng thái
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default OrderDetailModal;
