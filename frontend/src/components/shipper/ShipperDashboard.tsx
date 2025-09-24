import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Button, List, Tag, Space, Typography, Avatar, message, notification, Spin } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  ShoppingCartOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  StarOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { useShipper } from '../../contexts/ShipperContext';
import { useOrder } from '../../contexts/OrderContext';
import { shipperApi } from '../../services/shipperApi';
import { Order } from '../../interfaces/Order';
import { OrderTracking } from '../../interfaces/Shipper';

const { Title, Text } = Typography;

const ShipperDashboard: React.FC = () => {
  const { state, logout, updateOnlineStatus } = useShipper();
  const { orders: contextOrders, updateOrder } = useOrder();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    message.success('Đăng xuất thành công!');
    navigate('/login');
  };
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(() => {
    // Load online status from localStorage on init
    const savedStatus = localStorage.getItem('shipperOnlineStatus');
    return savedStatus ? JSON.parse(savedStatus) : (state.shipper?.isOnline || false);
  });

  useEffect(() => {
    fetchOrders();
    // Load online status from backend on mount
    loadOnlineStatus();
    
    // Clear any existing notifications on page load
    notification.destroy();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadOnlineStatus = async () => {
    try {
      const token = localStorage.getItem('shipperToken');
      if (!token) return;

      // Only load from backend if no saved status in localStorage
      const savedStatus = localStorage.getItem('shipperOnlineStatus');
      if (savedStatus) {
        const isOnline = JSON.parse(savedStatus);
        setOnlineStatus(isOnline);
        return; // Use saved status, don't override
      }

      const response = await fetch('http://localhost:8000/api/shipper/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const isOnline = data.shipper?.isOnline || false;
        setOnlineStatus(isOnline);
        localStorage.setItem('shipperOnlineStatus', JSON.stringify(isOnline));
      }
    } catch (error) {
      console.error('Error loading online status:', error);
    }
  };

  // Sync with context orders for realtime updates
  useEffect(() => {
    if (contextOrders.length > 0) {
      // Filter orders assigned to this shipper
      const shipperOrders = contextOrders.filter(order => 
        order.shipper && order.shipper._id === state.shipper?._id
      );
      
      // Always update orders to reflect current state
      setOrders(prevOrders => {
        // Check if orders are actually different to avoid unnecessary updates
        const currentIds = prevOrders.map(o => o._id).sort();
        const newIds = shipperOrders.map(o => o._id).sort();
        
        if (JSON.stringify(currentIds) !== JSON.stringify(newIds)) {
          // Check if there are new orders (more orders than before)
          if (newIds.length > currentIds.length) {
            // Count only pending orders (not completed)
            const pendingOrders = shipperOrders.filter(order => 
              !['delivered', 'delivered_success', 'completed', 'cancelled'].includes(order.status)
            );
            
            // Only show notification if there are actually pending orders
            if (pendingOrders.length > 0) {
              notification.success({
                message: 'Có đơn hàng mới được phân công!',
                description: `Bạn có ${pendingOrders.length} đơn hàng cần xử lý`,
                placement: 'topRight',
                duration: 5, // Auto close after 5 seconds
              });
            }
          }
          return shipperOrders;
        }
        return prevOrders;
      });
    } else {
      // If no orders in context, clear local orders
      setOrders([]);
    }
  }, [contextOrders, state.shipper?._id]);

  const fetchOrders = async () => {
    try {
      console.log('🔍 Fetching assigned orders...');
      
      // Đảm bảo token được set
      const token = localStorage.getItem('shipperToken');
      const shipperData = localStorage.getItem('shipper');
      
      console.log('🔑 Token exists:', !!token);
      console.log('👤 Shipper data:', shipperData);
      
      if (shipperData) {
        const shipper = JSON.parse(shipperData);
        console.log('🆔 Shipper ID:', shipper.id);
        console.log('📧 Shipper email:', shipper.email);
      }
      
      if (!token) {
        console.error('❌ No shipper token found');
        return;
      }
      
      // Dùng fetch trực tiếp thay vì shipperApi vì axiosInstance có vấn đề
      const response = await fetch('http://localhost:8000/api/shipper/orders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('📦 Orders response:', responseData);
      console.log('📦 Response structure:', JSON.stringify(responseData, null, 2));
      
      // API trả về: {success: true, data: {orders: [...], total: X}}
      let orders = [];
      if (responseData && responseData.data && responseData.data.orders) {
        orders = responseData.data.orders;
      } else if (responseData && responseData.orders) {
        orders = responseData.orders;
      } else if (Array.isArray(responseData)) {
        orders = responseData;
      }
      
      setOrders(orders);
      console.log('✅ Orders loaded:', orders.length);
      
      // Check if there are pending orders and show/hide notification accordingly
      const pendingOrders = orders.filter(order => 
        !['delivered', 'delivered_success', 'completed', 'cancelled'].includes(order.status)
      );
      
      if (pendingOrders.length === 0) {
        // Clear any existing notifications if no pending orders
        notification.destroy();
      }
    } catch (error: any) {
      console.error('❌ Error fetching orders:', error);
      console.error('❌ Error response:', error.response?.data);
      message.error('Lỗi tải đơn hàng: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleOnlineStatus = async () => {
    try {
      const token = localStorage.getItem('shipperToken');
      if (!token) {
        alert('Vui lòng đăng nhập lại.');
        return;
      }
      
      const newStatus = !onlineStatus;
      
      const response = await fetch('http://localhost:8000/api/shipper/online-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isOnline: newStatus })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setOnlineStatus(newStatus);
        // Save to localStorage for persistence
        localStorage.setItem('shipperOnlineStatus', JSON.stringify(newStatus));
        message.success(`Đã ${newStatus ? 'bật' : 'tắt'} trạng thái online`);
      } else {
        throw new Error(result.message || 'Cập nhật trạng thái thất bại');
      }
      
    } catch (error: any) {
      console.error('Error updating online status:', error);
      message.error('Lỗi cập nhật trạng thái: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      // OrderTracking statuses
      case 'assigned':
        return 'processing';
      case 'picked_up':
        return 'blue';
      case 'in_transit':
        return 'purple';
      case 'arrived':
        return 'orange';
      case 'delivered':
        return 'success';
      case 'failed':
        return 'error';
      case 'returning':
        return 'orange';
      case 'returned':
        return 'orange';
      case 'return_pending':
        return 'warning';
      case 'return_confirmed':
        return 'blue';
      case 'return_processing':
        return 'purple';
      case 'return_completed':
        return 'success';
      // Order statuses
      case 'delivered_failed':
        return 'error';
      case 'delivered_success':
        return 'success';
      case 'processing':
        return 'blue';
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      // OrderTracking statuses
      case 'assigned':
        return 'Đã phân công';
      case 'picked_up':
        return 'Đã nhận hàng';
      case 'in_transit':
        return 'Đang giao hàng';
      case 'arrived':
        return 'Đã đến điểm giao';
      case 'delivered':
        return 'Đã giao hàng';
      case 'failed':
        return 'Giao hàng thất bại';
      case 'returning':
        return 'Đang hoàn trả về shop';
      case 'returned':
        return 'Đã hoàn trả về shop';
      case 'return_pending':
        return 'Chờ admin xác nhận hoàn trả';
      case 'return_confirmed':
        return 'Admin đã xác nhận nhận hàng';
      case 'return_processing':
        return 'Đang xử lý hoàn trả';
      case 'return_completed':
        return 'Hoàn tất xử lý hoàn trả';
      // Order statuses
      case 'delivered_failed':
        return 'Giao hàng thất bại';
      case 'delivered_success':
        return 'Giao hàng thành công';
      case 'processing':
        return 'Đang xử lý';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
        return 'Chờ xử lý';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getActionButton = (order: Order) => {
    switch (order.status) {
      case 'assigned':
      case 'processing':
        return (
          <Button 
            type="primary" 
            icon={<PlayCircleOutlined />}
            onClick={() => navigate(`/shipper/order/${order._id}`)}
          >
            Bắt đầu giao
          </Button>
        );
      case 'picked_up':
        return (
          <Button 
            type="primary" 
            icon={<CheckCircleOutlined />}
            onClick={() => navigate(`/shipper/order/${order._id}`)}
          >
            Xác nhận giao hàng
          </Button>
        );
      case 'in_transit':
        return (
          <Button 
            type="primary" 
            icon={<EnvironmentOutlined />}
            onClick={() => navigate(`/shipper/order/${order._id}`)}
          >
            Cập nhật vị trí
          </Button>
        );
      default:
        return (
          <Button 
            icon={<EyeOutlined />}
            onClick={() => navigate(`/shipper/order/${order._id}`)}
          >
            Xem chi tiết
          </Button>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Card className="mb-6">
        <Row justify="space-between" align="middle">
          <Col>
            <Space align="center">
              <ShoppingCartOutlined className="text-2xl text-blue-600" />
              <Title level={2} className="!mb-0">Shipper Dashboard</Title>
            </Space>
          </Col>
          <Col>
            <Space>
              <Space align="center">
                <Text>Trạng thái:</Text>
                <Button
                  type={onlineStatus ? 'primary' : 'default'}
                  danger={!onlineStatus}
                  onClick={handleToggleOnlineStatus}
                  icon={onlineStatus ? <UserOutlined /> : <UserOutlined />}
                >
                  {onlineStatus ? '🟢 Online' : '🔴 Offline'}
                </Button>
              </Space>
              <Space align="center">
                <Avatar icon={<UserOutlined />} />
                <Text>Xin chào, {state.shipper?.fullName}</Text>
                <Button
                  type="primary"
                  danger
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                >
                  Đăng xuất
                </Button>
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={orders.length}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Cần xử lý"
              value={orders.filter(order => ['assigned', 'picked_up', 'in_transit', 'shipped'].includes(order.status)).length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã hoàn thành"
              value={orders.filter(order => ['delivered', 'delivered_success', 'completed'].includes(order.status)).length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đánh giá"
              value={state.shipper?.rating || 0}
              suffix="/5"
              prefix={<StarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Orders List */}
      <Card>
        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            <Title level={3} className="!mb-0">Đơn hàng được phân công</Title>
            <Text type="secondary">Danh sách các đơn hàng bạn cần giao ({orders.length} đơn)</Text>
          </Col>
          <Col>
            <Button 
              icon={<ClockCircleOutlined />} 
              onClick={fetchOrders}
              loading={isLoading}
            >
              Làm mới
            </Button>
          </Col>
        </Row>

        {isLoading ? (
          <div className="text-center py-12">
            <Spin size="large" />
            <div className="mt-4">
              <Text type="secondary">Đang tải danh sách đơn hàng...</Text>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCartOutlined className="text-6xl text-gray-400 mb-4" />
            <Text type="secondary" className="text-lg">Chưa có đơn hàng nào được phân công</Text>
          </div>
        ) : (
          <List
            dataSource={orders}
            renderItem={(order) => (
              <List.Item
                actions={[
                  getActionButton(order)
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>Đơn hàng #{order._id.slice(-8)}</Text>
                      <Tag color={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <div>
                        <Text strong>Khách hàng:</Text> {order.user?.fullName || 'N/A'} | 
                        <Text strong> SĐT:</Text> {order.user?.phone || 'N/A'}
                      </div>
                      <div>
                        <Text strong>Tổng tiền:</Text> {order.totalPrice?.toLocaleString('vi-VN') || 0} VNĐ
                        {order.paymentMethod === 'COD' && (
                          <Tag color="orange" style={{ marginLeft: 8 }}>
                            💰 COD
                          </Tag>
                        )}
                        {order.paymentMethod && order.paymentMethod !== 'COD' && (
                          <Tag color="blue" style={{ marginLeft: 8 }}>
                            {order.paymentMethod.toUpperCase()}
                          </Tag>
                        )}
                      </div>
                      <div>
                        <Text strong>Địa chỉ giao:</Text> {order.shippingAddress?.address || 'N/A'}, {order.shippingAddress?.city || 'N/A'}
                      </div>
                      <div>
                        <Text strong>Ngày tạo:</Text> {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                      </div>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default ShipperDashboard;
