import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Button, Space, Avatar, Image, Modal, Spin, Switch, Tabs, Statistic, Row, Col, Timeline, Descriptions, Badge, Tooltip, Collapse, List, Pagination } from 'antd';
import { EyeOutlined, UserOutlined, BarChartOutlined, TruckOutlined, CheckCircleOutlined, ClockCircleOutlined, DollarOutlined, StarOutlined, CameraOutlined, FileImageOutlined } from '@ant-design/icons';
import { Shipper } from '../../../interfaces/Shipper';
import { useNotification } from '../../../hooks/useNotification';

const { Panel } = Collapse;

interface ShipperListProps {
  onViewPerformance: (shipper: Shipper) => void;
  onToggleStatus: (id: string, status: string) => void;
}

const ShipperList: React.FC<ShipperListProps> = ({ onViewPerformance, onToggleStatus }) => {
  const [shippers, setShippers] = useState<Shipper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [performanceModalVisible, setPerformanceModalVisible] = useState(false);
  const [selectedShipper, setSelectedShipper] = useState<Shipper | null>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [performancePage, setPerformancePage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [orderDetailModalVisible, setOrderDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { success, error } = useNotification();

  useEffect(() => {
    fetchShippers();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchShippers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:8000/api/admin/shipper?page=${currentPage}&search=${searchTerm}&status=${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setShippers(data.data.shippers);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Error fetching shippers:', err);
      error('Có lỗi xảy ra khi tải danh sách shipper', 'Lỗi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (shipperId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/shipper/${shipperId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        success('Cập nhật trạng thái thành công!');
        fetchShippers();
        onToggleStatus(shipperId, newStatus);
      } else {
        error('Có lỗi xảy ra khi cập nhật trạng thái', 'Lỗi cập nhật');
      }
    } catch (err) {
      console.error('Error updating shipper status:', err);
      error('Có lỗi xảy ra khi cập nhật trạng thái', 'Lỗi cập nhật');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Hoạt động';
      case 'inactive':
        return 'Không hoạt động';
      case 'suspended':
        return 'Tạm khóa';
      default:
        return status;
    }
  };

  const getVehicleTypeText = (type: string) => {
    switch (type) {
      case 'motorbike':
        return 'Xe máy';
      case 'car':
        return 'Ô tô';
      case 'bicycle':
        return 'Xe đạp';
      default:
        return type;
    }
  };

  const handlePreviewImage = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setPreviewVisible(true);
  };

  const handleViewPerformance = async (shipper: Shipper) => {
    try {
      setSelectedShipper(shipper);
      setPerformanceModalVisible(true);
      setPerformancePage(1);
      
      // Fetch performance data
      const response = await fetch(`http://localhost:8000/api/admin/shipper/${shipper._id}/performance`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Performance data received:', data);
        console.log('📊 Sample order:', data.data?.allOrders?.[0]);
        console.log('📊 Sample order details:', {
          orderNumber: data.data?.allOrders?.[0]?.orderNumber,
          totalAmount: data.data?.allOrders?.[0]?.totalAmount,
          status: data.data?.allOrders?.[0]?.status,
          shippingAddress: data.data?.allOrders?.[0]?.shippingAddress,
          orderTracking: data.data?.allOrders?.[0]?.orderTracking,
          orderItems: data.data?.allOrders?.[0]?.orderItems
        });
        setPerformanceData(data.data || data);
      } else {
        error('Không thể tải dữ liệu hiệu suất', 'Lỗi tải dữ liệu');
      }
    } catch (err) {
      console.error('Error fetching performance data:', err);
      error('Có lỗi xảy ra khi tải dữ liệu hiệu suất', 'Lỗi tải dữ liệu');
    }
  };

  const handleViewOrderDetail = (order: any) => {
    setSelectedOrder(order);
    setOrderDetailModalVisible(true);
  };

  // Tính toán phân trang cho danh sách đơn hàng
  const getPaginatedOrders = (orders: any[]) => {
    const startIndex = (performancePage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return orders.slice(startIndex, endIndex);
  };

  const getTotalPages = (orders: any[]) => {
    return Math.ceil(orders.length / pageSize);
  };

  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 80,
      render: (avatar: string, record: Shipper) => (
        <Avatar
          size={50}
          src={avatar ? `http://localhost:8000/${avatar}` : undefined}
          icon={<UserOutlined />}
          onClick={() => avatar && handlePreviewImage(`http://localhost:8000/${avatar}`)}
          style={{ cursor: avatar ? 'pointer' : 'default' }}
        />
      ),
    },
    {
      title: 'Thông tin',
      key: 'info',
      render: (record: Shipper) => (
        <div>
          <div className="font-medium text-gray-900">{record.fullName}</div>
          <div className="text-sm text-gray-500">{record.email}</div>
          <div className="text-sm text-gray-500">{record.phone}</div>
        </div>
      ),
    },
    {
      title: 'Phương tiện',
      key: 'vehicle',
      render: (record: Shipper) => (
        <div>
          <div className="text-sm">{getVehicleTypeText(record.vehicleType)}</div>
          <div className="text-sm text-gray-500">{record.licensePlate}</div>
        </div>
      ),
    },
    {
      title: 'Giao hàng',
      dataIndex: 'totalDeliveries',
      key: 'totalDeliveries',
      render: (count: number) => (
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{count}</div>
          <div className="text-sm text-gray-500">đơn</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Shipper) => (
        <div className="space-y-1">
          <Tag color={getStatusColor(status)}>
            {getStatusText(status)}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Online/Offline',
      dataIndex: 'isOnline',
      key: 'isOnline',
      render: (isOnline: boolean, record: Shipper) => (
        <div className="text-center">
          {record.status === 'active' ? (
            <Tag color={isOnline ? 'green' : 'red'}>
              {isOnline ? '🟢 Online' : '🔴 Offline'}
            </Tag>
          ) : (
            <span className="text-gray-400 text-sm">-</span>
          )}
        </div>
      ),
    },
    {
      title: 'Tài liệu',
      key: 'documents',
      render: (record: Shipper) => (
        <div className="space-y-1">
          {record.documents && record.documents.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {record.documents.slice(0, 3).map((doc, index) => (
                <Button
                  key={index}
                  type="link"
                  size="small"
                  onClick={() => handlePreviewImage(`http://localhost:8000/${doc.url}`)}
                >
                  {doc.type === 'id_card' ? 'CCCD' : 
                   doc.type === 'driver_license' ? 'GPLX' :
                   doc.type === 'vehicle_registration' ? 'Đăng ký xe' : 'Bảo hiểm'}
                </Button>
              ))}
              {record.documents.length > 3 && (
                <span className="text-xs text-gray-500">+{record.documents.length - 3}</span>
              )}
            </div>
          ) : (
            <span className="text-gray-400 text-sm">Chưa có</span>
          )}
        </div>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (record: Shipper) => (
        <Space>
          <Button
            type="primary"
            className="admin-primary-button"
            icon={<BarChartOutlined />}
            size="small"
            onClick={() => handleViewPerformance(record)}
          >
            Xem hiệu suất
          </Button>
          <Switch
            checked={record.status === 'active'}
            onChange={(checked) => handleToggleStatus(record._id, checked ? 'active' : 'inactive')}
            checkedChildren="Hoạt động"
            unCheckedChildren="Vô hiệu hóa"
          />
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Table
        columns={columns}
        dataSource={shippers}
        rowKey="_id"
        pagination={{
          current: currentPage,
          total: totalPages * 10, // Assuming 10 items per page
          pageSize: 10,
          onChange: (page) => setCurrentPage(page),
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} của ${total} shipper`,
        }}
        scroll={{ x: 1200 }}
      />

      <Modal
        open={previewVisible}
        title="Xem ảnh"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
      >
        <Image
          alt="Preview"
          style={{ width: '100%' }}
          src={previewImage}
        />
      </Modal>

      {/* Performance Modal */}
      <Modal
        open={performanceModalVisible}
        title={
          <div className="flex items-center space-x-3">
            <Avatar size={40} icon={<UserOutlined />} />
            <div>
              <div className="text-lg font-semibold">{selectedShipper?.fullName || ''}</div>
              <div className="text-sm text-gray-500">{selectedShipper?.phone || ''}</div>
            </div>
          </div>
        }
        footer={null}
        onCancel={() => {
          setPerformanceModalVisible(false);
          setSelectedShipper(null);
          setPerformanceData(null);
        }}
        width={1200}
        className="performance-modal"
      >
        {performanceData ? (
          <div className="space-y-6">
            {/* Thông tin cơ bản */}
            <Card size="small">
              <Descriptions column={4} size="small">
                <Descriptions.Item label="Trạng thái">
                  <Badge 
                    status={performanceData.shipper?.isOnline ? "success" : "default"} 
                    text={performanceData.shipper?.isOnline ? "Đang online" : "Offline"} 
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Đánh giá">
                  <div className="flex items-center">
                    <StarOutlined className="text-yellow-500 mr-1" />
                    {performanceData.avgRating || performanceData.shipper?.rating || 0}/5
                    {performanceData.ordersWithRatingCount > 0 && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({performanceData.ordersWithRatingCount} đánh giá)
                      </span>
                    )}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {new Date(performanceData.shipper?.createdAt).toLocaleDateString('vi-VN')}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {performanceData.shipper?.email || 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Thống kê đơn giản */}
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Tổng đơn hàng"
                    value={performanceData.totalOrders || 0}
                    prefix={<TruckOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Đã giao thành công"
                    value={performanceData.deliveredOrdersCount || 0}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Tỷ lệ thành công"
                    value={performanceData.successRate || 0}
                    suffix="%"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Giá trị đã giao"
                    value={performanceData.totalDeliveredValue || 0}
                    prefix="₫"
                    valueStyle={{ color: '#722ed1' }}
                    formatter={(value) => `${value?.toLocaleString('vi-VN')}đ`}
                  />
                </Card>
              </Col>
            </Row>

            {/* Tabs cho các thông tin chi tiết */}
            <Tabs
              defaultActiveKey="current"
              items={[
                 {
                   key: 'current',
                   label: (
                     <span>
                       <ClockCircleOutlined />
                       Đơn đang đi ({performanceData.currentOrdersCount || 0})
                     </span>
                   ),
                   children: (
                     <div className="space-y-4">
                       {performanceData.currentOrders && performanceData.currentOrders.length > 0 ? (
                         <>
                           <div className="space-y-3">
                             {getPaginatedOrders(performanceData.currentOrders).map((order: any, index: number) => (
                            <Card key={index} size="small" className="border-l-4 border-l-blue-500">
                              <div className="space-y-3">
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className="font-medium">#{order.orderNumber}</span>
                                      <Tag color={order.statusInfo?.color || 'default'}>
                                        {order.statusInfo?.label || order.status}
                                      </Tag>
                                      {order.orderTracking?.status && (
                                        <Tag color="cyan">{order.orderTracking.status}</Tag>
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-1">
                                      <strong>Khách hàng:</strong> {order.user?.name || order.user?.fullName || 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-1">
                                      <strong>Email:</strong> {order.user?.email || 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-1">
                                      <strong>Địa chỉ:</strong> {order.shippingAddress ? 
                                        `${order.shippingAddress.fullName || ''} - ${order.shippingAddress.address || ''}${order.shippingAddress.ward ? `, ${order.shippingAddress.ward}` : ''}${order.shippingAddress.district ? `, ${order.shippingAddress.district}` : ''}${order.shippingAddress.province ? `, ${order.shippingAddress.province}` : ''}`.replace(/^[,\s-]+|[,\s-]+$/g, '') : 
                                        order.deliveryAddress || 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-1">
                                      <strong>Giá trị:</strong> {order.totalPrice ? `${order.totalPrice.toLocaleString('vi-VN')}đ` : 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      <strong>Thanh toán:</strong> {order.displayPaymentStatus || order.paymentStatus || 'N/A'}
                                    </div>
                                  </div>
                                  <div className="text-right text-sm text-gray-500">
                                    <div>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                                    <Button 
                                      type="link" 
                                      size="small" 
                                      onClick={() => handleViewOrderDetail(order)}
                                      className="p-0 h-auto"
                                    >
                                      Xem chi tiết
                                    </Button>
                                  </div>
                                </div>

                                {/* Chi tiết sản phẩm */}
                                {order.orderItems && order.orderItems.length > 0 && (
                                  <Collapse size="small">
                                    <Panel header="Chi tiết sản phẩm" key="products">
                                      <List
                                        size="small"
                                        dataSource={order.orderItems}
                                        renderItem={(item: any) => (
                                          <List.Item>
                                            <div className="flex items-center space-x-3 w-full">
                                              {item.product?.images?.[0] && (
                                                <Image
                                                  width={40}
                                                  height={40}
                                                  src={item.product.images[0]}
                                                  className="rounded"
                                                />
                                              )}
                                              <div className="flex-1">
                                                <div className="font-medium">{item.product?.name || 'N/A'}</div>
                                                <div className="text-sm text-gray-500">
                                                  Số lượng: {item.quantity} x {item.price?.toLocaleString('vi-VN')}đ
                                                </div>
                                              </div>
                                              <div className="text-sm font-medium">
                                                {(item.quantity * item.price)?.toLocaleString('vi-VN')}đ
                                              </div>
                                            </div>
                                          </List.Item>
                                        )}
                                      />
                                    </Panel>
                                  </Collapse>
                                )}

                                {/* Ảnh minh chứng */}
                                {(order.orderTracking?.pickupImages?.length > 0 || order.orderTracking?.deliveryImages?.length > 0) && (
                                  <Collapse size="small">
                                    <Panel header="Ảnh minh chứng" key="images">
                                      <div className="space-y-3">
                                        {order.orderTracking?.pickupImages?.length > 0 && (
                                          <div>
                                            <div className="text-sm font-medium mb-2 flex items-center">
                                              <CameraOutlined className="mr-1" />
                                              Ảnh nhận hàng ({order.orderTracking.pickupImages.length})
                                            </div>
                                            <div className="flex space-x-2">
                                              {order.orderTracking.pickupImages.map((img: any, imgIndex: number) => (
                                                <Image
                                                  key={imgIndex}
                                                  width={80}
                                                  height={80}
                                                  src={img.url?.startsWith('http') ? img.url : `http://localhost:8000/${img.url}`}
                                                  className="rounded cursor-pointer"
                                                  preview={{
                                                    mask: <FileImageOutlined />
                                                  }}
                                                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        {order.orderTracking?.deliveryImages?.length > 0 && (
                                          <div>
                                            <div className="text-sm font-medium mb-2 flex items-center">
                                              <CheckCircleOutlined className="mr-1" />
                                              Ảnh giao hàng ({order.orderTracking.deliveryImages.length})
                                            </div>
                                            <div className="flex space-x-2">
                                              {order.orderTracking.deliveryImages.map((img: any, imgIndex: number) => (
                                                <Image
                                                  key={imgIndex}
                                                  width={80}
                                                  height={80}
                                                  src={img.url?.startsWith('http') ? img.url : `http://localhost:8000/${img.url}`}
                                                  className="rounded cursor-pointer"
                                                  preview={{
                                                    mask: <FileImageOutlined />
                                                  }}
                                                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </Panel>
                                  </Collapse>
                                )}

                                {/* Ghi chú */}
                                {order.orderTracking?.notes && (
                                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                    <strong>Ghi chú:</strong> {order.orderTracking.notes}
                                  </div>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                        {/* Phân trang */}
                        {performanceData.currentOrders.length > pageSize && (
                          <div className="flex justify-center mt-4">
                            <Pagination
                              current={performancePage}
                              total={performanceData.currentOrders.length}
                              pageSize={pageSize}
                              onChange={(page) => setPerformancePage(page)}
                              showSizeChanger={false}
                              showQuickJumper
                            />
                          </div>
                        )}
                      </>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <TruckOutlined className="text-4xl mb-2" />
                          <div>Không có đơn hàng đang đi</div>
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'delivered',
                  label: (
                    <span>
                      <CheckCircleOutlined />
                      Đã giao ({performanceData.deliveredOrdersCount || 0})
                    </span>
                  ),
                  children: (
                    <div className="space-y-4">
                      {performanceData.deliveredOrders && performanceData.deliveredOrders.length > 0 ? (
                        <>
                          <div className="space-y-3">
                            {getPaginatedOrders(performanceData.deliveredOrders).map((order: any, index: number) => (
                            <Card key={index} size="small" className="border-l-4 border-l-green-500">
                              <div className="space-y-3">
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className="font-medium">#{order.orderNumber}</span>
                                      <Tag color={order.statusInfo?.color || 'green'}>
                                        {order.statusInfo?.label || 'Đã giao'}
                                      </Tag>
                                      {order.orderTracking?.status && (
                                        <Tag color="cyan">{order.orderTracking.status}</Tag>
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-1">
                                      <strong>Khách hàng:</strong> {order.user?.name || order.user?.fullName || 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-1">
                                      <strong>Email:</strong> {order.user?.email || 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-1">
                                      <strong>Địa chỉ:</strong> {order.shippingAddress ? 
                                        `${order.shippingAddress.fullName || ''} - ${order.shippingAddress.address || ''}${order.shippingAddress.ward ? `, ${order.shippingAddress.ward}` : ''}${order.shippingAddress.district ? `, ${order.shippingAddress.district}` : ''}${order.shippingAddress.province ? `, ${order.shippingAddress.province}` : ''}`.replace(/^[,\s-]+|[,\s-]+$/g, '') : 
                                        order.deliveryAddress || 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-1">
                                      <strong>Giá trị:</strong> {order.totalPrice ? `${order.totalPrice.toLocaleString('vi-VN')}đ` : 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-1">
                                      <strong>Thanh toán:</strong> {order.displayPaymentStatus || order.paymentStatus || 'N/A'}
                                    </div>
                                    {order.orderTracking?.deliveryTime && (
                                      <div className="text-sm text-gray-600">
                                        <strong>Hoàn thành:</strong> {new Date(order.orderTracking.deliveryTime).toLocaleString('vi-VN')}
                                      </div>
                                    )}
                                    {order.deliveredAt && (
                                      <div className="text-sm text-gray-600">
                                        <strong>Giao hàng:</strong> {new Date(order.deliveredAt).toLocaleString('vi-VN')}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right text-sm text-gray-500">
                                    <div>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                                    <Button 
                                      type="link" 
                                      size="small" 
                                      onClick={() => handleViewOrderDetail(order)}
                                      className="p-0 h-auto"
                                    >
                                      Xem chi tiết
                                    </Button>
                                  </div>
                                </div>

                                {/* Chi tiết sản phẩm */}
                                {order.orderItems && order.orderItems.length > 0 && (
                                  <Collapse size="small">
                                    <Panel header="Chi tiết sản phẩm" key="products">
                                      <List
                                        size="small"
                                        dataSource={order.orderItems}
                                        renderItem={(item: any) => (
                                          <List.Item>
                                            <div className="flex items-center space-x-3 w-full">
                                              {item.product?.images?.[0] && (
                                                <Image
                                                  width={40}
                                                  height={40}
                                                  src={item.product.images[0]}
                                                  className="rounded"
                                                />
                                              )}
                                              <div className="flex-1">
                                                <div className="font-medium">{item.product?.name || 'N/A'}</div>
                                                <div className="text-sm text-gray-500">
                                                  Số lượng: {item.quantity} x {item.price?.toLocaleString('vi-VN')}đ
                                                </div>
                                              </div>
                                              <div className="text-sm font-medium">
                                                {(item.quantity * item.price)?.toLocaleString('vi-VN')}đ
                                              </div>
                                            </div>
                                          </List.Item>
                                        )}
                                      />
                                    </Panel>
                                  </Collapse>
                                )}

                                {/* Ảnh minh chứng */}
                                {(order.orderTracking?.pickupImages?.length > 0 || order.orderTracking?.deliveryImages?.length > 0) && (
                                  <Collapse size="small">
                                    <Panel header="Ảnh minh chứng" key="images">
                                      <div className="space-y-3">
                                        {order.orderTracking?.pickupImages?.length > 0 && (
                                          <div>
                                            <div className="text-sm font-medium mb-2 flex items-center">
                                              <CameraOutlined className="mr-1" />
                                              Ảnh nhận hàng ({order.orderTracking.pickupImages.length})
                                            </div>
                                            <div className="flex space-x-2">
                                              {order.orderTracking.pickupImages.map((img: any, imgIndex: number) => (
                                                <Image
                                                  key={imgIndex}
                                                  width={80}
                                                  height={80}
                                                  src={img.url?.startsWith('http') ? img.url : `http://localhost:8000/${img.url}`}
                                                  className="rounded cursor-pointer"
                                                  preview={{
                                                    mask: <FileImageOutlined />
                                                  }}
                                                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        {order.orderTracking?.deliveryImages?.length > 0 && (
                                          <div>
                                            <div className="text-sm font-medium mb-2 flex items-center">
                                              <CheckCircleOutlined className="mr-1" />
                                              Ảnh giao hàng ({order.orderTracking.deliveryImages.length})
                                            </div>
                                            <div className="flex space-x-2">
                                              {order.orderTracking.deliveryImages.map((img: any, imgIndex: number) => (
                                                <Image
                                                  key={imgIndex}
                                                  width={80}
                                                  height={80}
                                                  src={img.url?.startsWith('http') ? img.url : `http://localhost:8000/${img.url}`}
                                                  className="rounded cursor-pointer"
                                                  preview={{
                                                    mask: <FileImageOutlined />
                                                  }}
                                                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </Panel>
                                  </Collapse>
                                )}

                                {/* Ghi chú */}
                                {order.orderTracking?.notes && (
                                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                    <strong>Ghi chú:</strong> {order.orderTracking.notes}
                                  </div>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                        {/* Phân trang */}
                        {performanceData.deliveredOrders.length > pageSize && (
                          <div className="flex justify-center mt-4">
                            <Pagination
                              current={performancePage}
                              total={performanceData.deliveredOrders.length}
                              pageSize={pageSize}
                              onChange={(page) => setPerformancePage(page)}
                              showSizeChanger={false}
                              showQuickJumper
                            />
                          </div>
                        )}
                      </>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <CheckCircleOutlined className="text-4xl mb-2" />
                          <div>Chưa có đơn hàng nào được giao</div>
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'all',
                  label: (
                    <span>
                      <BarChartOutlined />
                      Tất cả đơn hàng ({performanceData.totalOrders || 0})
                    </span>
                  ),
                  children: (
                    <div className="space-y-4">
                      {performanceData.allOrders && performanceData.allOrders.length > 0 ? (
                        <>
                          <div className="space-y-3">
                            {getPaginatedOrders(performanceData.allOrders).map((order: any, index: number) => (
                            <Card key={index} size="small" className="border-l-4 border-l-gray-500">
                              <div className="space-y-3">
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className="font-medium">#{order.orderNumber}</span>
                                      <Tag color={order.statusInfo?.color || 'default'}>
                                        {order.statusInfo?.label || order.status}
                                      </Tag>
                                      {order.orderTracking?.status && (
                                        <Tag color="cyan">{order.orderTracking.status}</Tag>
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-1">
                                      <strong>Khách hàng:</strong> {order.user?.name || order.user?.fullName || 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-1">
                                      <strong>Email:</strong> {order.user?.email || 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-1">
                                      <strong>Địa chỉ:</strong> {order.shippingAddress ? 
                                        `${order.shippingAddress.fullName || ''} - ${order.shippingAddress.address || ''}${order.shippingAddress.ward ? `, ${order.shippingAddress.ward}` : ''}${order.shippingAddress.district ? `, ${order.shippingAddress.district}` : ''}${order.shippingAddress.province ? `, ${order.shippingAddress.province}` : ''}`.replace(/^[,\s-]+|[,\s-]+$/g, '') : 
                                        order.deliveryAddress || 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-1">
                                      <strong>Giá trị:</strong> {order.totalPrice ? `${order.totalPrice.toLocaleString('vi-VN')}đ` : 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      <strong>Thanh toán:</strong> {order.displayPaymentStatus || order.paymentStatus || 'N/A'}
                                    </div>
                                  </div>
                                  <div className="text-right text-sm text-gray-500">
                                    <div>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                                    <Button 
                                      type="link" 
                                      size="small" 
                                      onClick={() => handleViewOrderDetail(order)}
                                      className="p-0 h-auto"
                                    >
                                      Xem chi tiết
                                    </Button>
                                  </div>
                                </div>

                                {/* Chi tiết sản phẩm */}
                                {order.orderItems && order.orderItems.length > 0 && (
                                  <Collapse size="small">
                                    <Panel header="Chi tiết sản phẩm" key="products">
                                      <List
                                        size="small"
                                        dataSource={order.orderItems}
                                        renderItem={(item: any) => (
                                          <List.Item>
                                            <div className="flex items-center space-x-3 w-full">
                                              {item.product?.images?.[0] && (
                                                <Image
                                                  width={40}
                                                  height={40}
                                                  src={item.product.images[0]}
                                                  className="rounded"
                                                />
                                              )}
                                              <div className="flex-1">
                                                <div className="font-medium">{item.product?.name || 'N/A'}</div>
                                                <div className="text-sm text-gray-500">
                                                  Số lượng: {item.quantity} x {item.price?.toLocaleString('vi-VN')}đ
                                                </div>
                                              </div>
                                              <div className="text-sm font-medium">
                                                {(item.quantity * item.price)?.toLocaleString('vi-VN')}đ
                                              </div>
                                            </div>
                                          </List.Item>
                                        )}
                                      />
                                    </Panel>
                                  </Collapse>
                                )}

                                {/* Ảnh minh chứng */}
                                {(order.orderTracking?.pickupImages?.length > 0 || order.orderTracking?.deliveryImages?.length > 0) && (
                                  <Collapse size="small">
                                    <Panel header="Ảnh minh chứng" key="images">
                                      <div className="space-y-3">
                                        {order.orderTracking?.pickupImages?.length > 0 && (
                                          <div>
                                            <div className="text-sm font-medium mb-2 flex items-center">
                                              <CameraOutlined className="mr-1" />
                                              Ảnh nhận hàng ({order.orderTracking.pickupImages.length})
                                            </div>
                                            <div className="flex space-x-2">
                                              {order.orderTracking.pickupImages.map((img: any, imgIndex: number) => (
                                                <Image
                                                  key={imgIndex}
                                                  width={80}
                                                  height={80}
                                                  src={img.url?.startsWith('http') ? img.url : `http://localhost:8000/${img.url}`}
                                                  className="rounded cursor-pointer"
                                                  preview={{
                                                    mask: <FileImageOutlined />
                                                  }}
                                                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        {order.orderTracking?.deliveryImages?.length > 0 && (
                                          <div>
                                            <div className="text-sm font-medium mb-2 flex items-center">
                                              <CheckCircleOutlined className="mr-1" />
                                              Ảnh giao hàng ({order.orderTracking.deliveryImages.length})
                                            </div>
                                            <div className="flex space-x-2">
                                              {order.orderTracking.deliveryImages.map((img: any, imgIndex: number) => (
                                                <Image
                                                  key={imgIndex}
                                                  width={80}
                                                  height={80}
                                                  src={img.url?.startsWith('http') ? img.url : `http://localhost:8000/${img.url}`}
                                                  className="rounded cursor-pointer"
                                                  preview={{
                                                    mask: <FileImageOutlined />
                                                  }}
                                                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </Panel>
                                  </Collapse>
                                )}

                                {/* Ghi chú */}
                                {order.orderTracking?.notes && (
                                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                    <strong>Ghi chú:</strong> {order.orderTracking.notes}
                                  </div>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                        {/* Phân trang */}
                        {performanceData.allOrders.length > pageSize && (
                          <div className="flex justify-center mt-4">
                            <Pagination
                              current={performancePage}
                              total={performanceData.allOrders.length}
                              pageSize={pageSize}
                              onChange={(page) => setPerformancePage(page)}
                              showSizeChanger={false}
                              showQuickJumper
                            />
                          </div>
                        )}
                      </>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <TruckOutlined className="text-4xl mb-2" />
                          <div>Chưa có đơn hàng nào</div>
                        </div>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <Spin size="large" />
            <div className="mt-4 text-gray-600">Đang tải dữ liệu hiệu suất...</div>
          </div>
        )}
      </Modal>

      {/* Modal chi tiết đơn hàng */}
      <Modal
        open={orderDetailModalVisible}
        title={
          <div className="flex items-center space-x-3 py-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <TruckOutlined className="text-blue-600 text-lg" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-800">Chi tiết đơn hàng</div>
              <div className="text-sm text-gray-500 font-mono">#{selectedOrder?.orderNumber}</div>
            </div>
          </div>
        }
        footer={null}
        onCancel={() => {
          setOrderDetailModalVisible(false);
          setSelectedOrder(null);
        }}
        width={1200}
        className="order-detail-modal"
        styles={{
          header: {
            borderBottom: '1px solid #f0f0f0',
            paddingBottom: '16px'
          }
        }}
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Thông tin cơ bản */}
            <Card 
              size="small" 
              title={
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <TruckOutlined className="text-blue-600 text-sm" />
                  </div>
                  <span className="font-semibold text-gray-800">Thông tin đơn hàng</span>
                </div>
              }
              className="shadow-sm border-l-4 border-l-blue-500"
            >
              <Descriptions column={2} size="small" className="mt-4">
                <Descriptions.Item label="Mã đơn hàng" className="font-medium">
                  <span className="font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    #{selectedOrder.orderNumber}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={selectedOrder.statusInfo?.color || 'default'} className="text-sm font-medium">
                    {selectedOrder.statusInfo?.label || selectedOrder.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  <div className="flex items-center space-x-2">
                    <ClockCircleOutlined className="text-gray-400" />
                    <span>{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Phương thức thanh toán">
                  <Tag color="cyan" className="text-sm">
                    {selectedOrder.paymentMethod?.toUpperCase() || 'N/A'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái thanh toán">
                  <Tag color={selectedOrder.isPaid ? 'green' : 'orange'} className="text-sm">
                    {selectedOrder.displayPaymentStatus || selectedOrder.paymentStatus || 'N/A'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tổng giá trị">
                  <div className="flex items-center space-x-2">
                    <DollarOutlined className="text-green-500" />
                    <span className="font-bold text-green-600 text-lg">
                      {selectedOrder.totalPrice?.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Thông tin khách hàng */}
            <Card 
              size="small" 
              title={
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <UserOutlined className="text-green-600 text-sm" />
                  </div>
                  <span className="font-semibold text-gray-800">Thông tin khách hàng</span>
                </div>
              }
              className="shadow-sm border-l-4 border-l-green-500"
            >
              <Descriptions column={2} size="small" className="mt-4">
                <Descriptions.Item label="Tên khách hàng">
                  <div className="flex items-center space-x-2">
                    <UserOutlined className="text-gray-400" />
                    <span className="font-medium text-gray-800">
                      {selectedOrder.user?.name || selectedOrder.user?.fullName || 'N/A'}
                    </span>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">@</span>
                    <span className="text-blue-600">{selectedOrder.user?.email || 'N/A'}</span>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">📞</span>
                    <span className="font-mono">{selectedOrder.user?.phone || 'N/A'}</span>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ giao hàng">
                  <div className="flex items-start space-x-2">
                    <span className="text-gray-400 mt-1">📍</span>
                    <div className="text-sm">
                      {selectedOrder.shippingAddress ? 
                        `${selectedOrder.shippingAddress.fullName || ''} - ${selectedOrder.shippingAddress.address || ''}${selectedOrder.shippingAddress.ward ? `, ${selectedOrder.shippingAddress.ward}` : ''}${selectedOrder.shippingAddress.district ? `, ${selectedOrder.shippingAddress.district}` : ''}${selectedOrder.shippingAddress.province ? `, ${selectedOrder.shippingAddress.province}` : ''}`.replace(/^[,\s-]+|[,\s-]+$/g, '') : 
                        'N/A'}
                    </div>
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Chi tiết sản phẩm */}
            {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 && (
              <Card 
                size="small" 
                title={
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <BarChartOutlined className="text-purple-600 text-sm" />
                    </div>
                    <span className="font-semibold text-gray-800">Chi tiết sản phẩm</span>
                    <Tag color="purple" className="ml-2">
                      {selectedOrder.orderItems.length} sản phẩm
                    </Tag>
                  </div>
                }
                className="shadow-sm border-l-4 border-l-purple-500"
              >
                <List
                  dataSource={selectedOrder.orderItems}
                  renderItem={(item: any, index: number) => (
                    <List.Item className="!px-0 !py-4 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-4 w-full">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-bold">
                          {index + 1}
                        </div>
                        {item.product?.images?.[0] && (
                          <Image
                            width={80}
                            height={80}
                            src={item.product.images[0]}
                            className="rounded-lg shadow-sm"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 text-lg mb-1">
                            {item.product?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center space-x-4">
                            <span>Số lượng: <span className="font-medium text-blue-600">{item.quantity}</span></span>
                            <span>Đơn giá: <span className="font-medium text-orange-600">{item.price?.toLocaleString('vi-VN')}đ</span></span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600 text-lg">
                            {(item.quantity * item.price)?.toLocaleString('vi-VN')}đ
                          </div>
                          <div className="text-xs text-gray-400">Thành tiền</div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {/* Ảnh minh chứng */}
            {(selectedOrder.orderTracking?.pickupImages?.length > 0 || selectedOrder.orderTracking?.deliveryImages?.length > 0) && (
              <Card 
                size="small" 
                title={
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                      <CameraOutlined className="text-orange-600 text-sm" />
                    </div>
                    <span className="font-semibold text-gray-800">Ảnh minh chứng</span>
                    <Tag color="orange" className="ml-2">
                      {(selectedOrder.orderTracking?.pickupImages?.length || 0) + (selectedOrder.orderTracking?.deliveryImages?.length || 0)} ảnh
                    </Tag>
                  </div>
                }
                className="shadow-sm border-l-4 border-l-orange-500"
              >
                <div className="space-y-6 mt-4">
                  {selectedOrder.orderTracking.pickupImages?.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <CameraOutlined className="text-blue-600" />
                        </div>
                        <span className="font-semibold text-blue-800">Ảnh nhận hàng</span>
                        <Tag color="blue" className="text-xs">
                          {selectedOrder.orderTracking.pickupImages.length} ảnh
                        </Tag>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {selectedOrder.orderTracking.pickupImages.map((img: any, imgIndex: number) => (
                          <div key={imgIndex} className="relative group">
                            <Image
                              width={120}
                              height={120}
                              src={img.url?.startsWith('http') ? img.url : `http://localhost:8000/${img.url}`}
                              className="rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                              preview={{
                                mask: <FileImageOutlined />
                              }}
                              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                            />
                            <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                              {imgIndex + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedOrder.orderTracking.deliveryImages?.length > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircleOutlined className="text-green-600" />
                        </div>
                        <span className="font-semibold text-green-800">Ảnh giao hàng</span>
                        <Tag color="green" className="text-xs">
                          {selectedOrder.orderTracking.deliveryImages.length} ảnh
                        </Tag>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {selectedOrder.orderTracking.deliveryImages.map((img: any, imgIndex: number) => (
                          <div key={imgIndex} className="relative group">
                            <Image
                              width={120}
                              height={120}
                              src={img.url?.startsWith('http') ? img.url : `http://localhost:8000/${img.url}`}
                              className="rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                              preview={{
                                mask: <FileImageOutlined />
                              }}
                              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                            />
                            <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                              {imgIndex + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Ghi chú */}
            {selectedOrder.orderTracking?.notes && (
              <Card 
                size="small" 
                title={
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm">📝</span>
                    </div>
                    <span className="font-semibold text-gray-800">Ghi chú từ shipper</span>
                  </div>
                }
                className="shadow-sm border-l-4 border-l-gray-400"
              >
                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                  <div className="text-gray-700 leading-relaxed">
                    {selectedOrder.orderTracking.notes}
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ShipperList;
