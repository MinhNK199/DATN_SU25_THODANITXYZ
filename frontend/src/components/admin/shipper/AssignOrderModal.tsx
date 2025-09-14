import React, { useState, useEffect } from 'react';
import { Modal, Radio, Card, List, Typography, Space, Button, Spin, Tag, message } from 'antd';
import { UserOutlined, PhoneOutlined, EnvironmentOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Order } from '../../../interfaces/Order';
import { Shipper } from '../../../interfaces/Shipper';

interface AssignOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (orderId: string) => void;
  shipper: Shipper | null;
}

const { Title, Text } = Typography;

const AssignOrderModal: React.FC<AssignOrderModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  shipper
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableOrders();
    }
  }, [isOpen]);

  const fetchAvailableOrders = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Fetching available orders for assignment...');
      
      const response = await fetch('http://localhost:8000/api/order?status=confirmed&unassigned=true', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Available orders response:', data);
        console.log('📋 Orders found:', data.data?.orders?.length || 0);
        
        setOrders(data.data?.orders || []);
      } else {
        console.error('❌ Failed to fetch orders:', response.status);
        message.error('Không thể tải danh sách đơn hàng');
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      message.error('Có lỗi xảy ra khi tải danh sách đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async () => {
    if (selectedOrder) {
      try {
        setAssigning(true);
        await onAssign(selectedOrder);
        onClose();
        setSelectedOrder('');
      } catch (error) {
        console.error('Error assigning order:', error);
      } finally {
        setAssigning(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <Modal
      title={
        <Space align="center">
          <UserOutlined className="text-blue-600" />
          <span>Phân công đơn hàng cho: {shipper?.fullName}</span>
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="assign"
          type="primary"
          onClick={handleAssign}
          disabled={!selectedOrder || isLoading}
          loading={assigning}
        >
          Phân công
        </Button>,
      ]}
    >
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Spin size="large" />
        </div>
      ) : (
        <div>
          <Title level={5} className="mb-4">
            Chọn đơn hàng cần phân công:
          </Title>
          
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCartOutlined className="text-6xl text-gray-400 mb-4" />
              <Text type="secondary">Không có đơn hàng nào cần phân công</Text>
            </div>
          ) : (
            <Radio.Group
              value={selectedOrder}
              onChange={(e) => setSelectedOrder(e.target.value)}
              className="w-full"
            >
              <List
                dataSource={orders}
                renderItem={(order) => (
                  <List.Item className="!px-0">
                    <Card
                      className={`w-full cursor-pointer transition-all ${
                        selectedOrder === order._id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'hover:border-gray-400'
                      }`}
                      onClick={() => setSelectedOrder(order._id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Radio value={order._id} className="mr-3" />
                            <Title level={5} className="!mb-0">
                              Đơn hàng #{order._id.slice(-8)}
                            </Title>
                          </div>
                          
                          <Space direction="vertical" size="small" className="w-full">
                            <div className="flex items-center">
                              <UserOutlined className="mr-2 text-gray-500" />
                              <Text strong>Khách hàng:</Text>
                              <Text className="ml-1">{order.shippingAddress?.fullName || 'N/A'}</Text>
                            </div>
                            
                            <div className="flex items-center">
                              <PhoneOutlined className="mr-2 text-gray-500" />
                              <Text strong>SĐT:</Text>
                              <Text className="ml-1">{order.shippingAddress?.phone || 'N/A'}</Text>
                            </div>
                            
                            <div className="flex items-start">
                              <EnvironmentOutlined className="mr-2 text-gray-500 mt-1" />
                              <div>
                                <Text strong>Địa chỉ:</Text>
                                <Text className="ml-1">
                                  {order.shippingAddress?.address}, {order.shippingAddress?.ward}, {order.shippingAddress?.district}, {order.shippingAddress?.province}
                                </Text>
                              </div>
                            </div>
                            
                            {order.items && order.items.length > 0 && (
                              <div className="flex items-start">
                                <ShoppingCartOutlined className="mr-2 text-gray-500 mt-1" />
                                <div>
                                  <Text strong>Sản phẩm:</Text>
                                  <Text className="ml-1">
                                    {order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}
                                  </Text>
                                </div>
                              </div>
                            )}
                          </Space>
                        </div>
                        
                        <div className="text-right ml-4">
                          <div className="mb-2">
                            <Text strong className="text-lg text-green-600">
                              {formatPrice(order.totalAmount)}
                            </Text>
                          </div>
                          <div className="mb-2">
                            <Text type="secondary" className="text-sm">
                              {formatDate(order.createdAt)}
                            </Text>
                          </div>
                          <Tag color="processing">
                            {order.status === 'confirmed' ? 'Đã xác nhận' : order.status}
                          </Tag>
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            </Radio.Group>
          )}
        </div>
      )}
    </Modal>
  );
};

export default AssignOrderModal;
