import React from 'react';
import { Timeline, Card, Tag, Tooltip, Badge } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  TruckOutlined,
  PackageOutlined,
  DollarOutlined,
  RotateLeftOutlined,
  PauseCircleOutlined
} from '@ant-design/icons';

interface OrderTrackingProps {
  order: any;
  showDetails?: boolean;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ order, showDetails = true }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <ClockCircleOutlined style={{ color: '#6B7280' }} />;
      case 'pending': return <ClockCircleOutlined style={{ color: '#F59E0B' }} />;
      case 'confirmed': return <CheckCircleOutlined style={{ color: '#3B82F6' }} />;
      case 'processing': return <PackageOutlined style={{ color: '#8B5CF6' }} />;
      case 'shipped': return <TruckOutlined style={{ color: '#F97316' }} />;
      case 'delivered_success': return <CheckCircleOutlined style={{ color: '#059669' }} />;
      case 'delivered_failed': return <CloseCircleOutlined style={{ color: '#DC2626' }} />;
      case 'partially_delivered': return <PackageOutlined style={{ color: '#F97316' }} />;
      case 'returned': return <RotateLeftOutlined style={{ color: '#7C3AED' }} />;
      case 'on_hold': return <PauseCircleOutlined style={{ color: '#6B7280' }} />;
      case 'completed': return <CheckCircleOutlined style={{ color: '#059669' }} />;
      case 'cancelled': return <CloseCircleOutlined style={{ color: '#DC2626' }} />;
      case 'refund_requested': return <DollarOutlined style={{ color: '#F59E0B' }} />;
      case 'refunded': return <CheckCircleOutlined style={{ color: '#3B82F6' }} />;
      case 'payment_failed': return <CloseCircleOutlined style={{ color: '#DC2626' }} />;
      default: return <ClockCircleOutlined style={{ color: '#6B7280' }} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Đang tạo';
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đang giao hàng';
      case 'delivered_success': return 'Giao hàng thành công';
      case 'delivered_failed': return 'Giao hàng thất bại';
      case 'partially_delivered': return 'Giao hàng một phần';
      case 'returned': return 'Hoàn hàng';
      case 'on_hold': return 'Tạm dừng';
      case 'completed': return 'Thành công';
      case 'cancelled': return 'Đã hủy';
      case 'refund_requested': return 'Yêu cầu hoàn tiền';
      case 'refunded': return 'Hoàn tiền thành công';
      case 'payment_failed': return 'Thanh toán thất bại';
      default: return 'Không xác định';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'pending': return 'processing';
      case 'confirmed': return 'processing';
      case 'processing': return 'processing';
      case 'shipped': return 'processing';
      case 'delivered_success': return 'success';
      case 'delivered_failed': return 'error';
      case 'partially_delivered': return 'warning';
      case 'returned': return 'warning';
      case 'on_hold': return 'default';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'refund_requested': return 'processing';
      case 'refunded': return 'success';
      case 'payment_failed': return 'error';
      default: return 'default';
    }
  };

  const getTimelineItems = () => {
    if (!order.statusHistory || order.statusHistory.length === 0) {
      return [];
    }

    return order.statusHistory.map((history: any, index: number) => {
      const isLatest = index === order.statusHistory.length - 1;
      const isError = ['cancelled', 'delivered_failed', 'payment_failed'].includes(history.status);
      
      return {
        dot: getStatusIcon(history.status),
        children: (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Tag color={getStatusColor(history.status)}>
                  {getStatusText(history.status)}
                </Tag>
                {isLatest && (
                  <Badge status="processing" text="Hiện tại" />
                )}
              </div>
              <span className="text-sm text-gray-500">
                {new Date(history.date).toLocaleString('vi-VN')}
              </span>
            </div>
            
            {showDetails && history.note && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-700">{history.note}</p>
              </div>
            )}
            
            {/* Hiển thị thông tin đặc biệt cho một số trạng thái */}
            {showDetails && history.status === 'shipped' && order.estimatedDeliveryDate && (
              <div className="mt-2 p-2 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700">
                  📅 Dự kiến giao hàng: {new Date(order.estimatedDeliveryDate).toLocaleDateString('vi-VN')}
                </p>
                {order.deliveryPerson?.name && (
                  <p className="text-sm text-blue-700">
                    🚚 Người giao: {order.deliveryPerson.name}
                  </p>
                )}
              </div>
            )}
            
            {showDetails && history.status === 'delivered_success' && (
              <div className="mt-2 p-2 bg-green-50 rounded-md">
                <p className="text-sm text-green-700">
                  ✅ Giao hàng thành công lúc {new Date(history.date).toLocaleString('vi-VN')}
                </p>
              </div>
            )}
            
            {showDetails && history.status === 'refunded' && (
              <div className="mt-2 p-2 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700">
                  💰 Hoàn tiền đã được xử lý thành công
                </p>
              </div>
            )}
          </div>
        ),
        color: isError ? 'red' : isLatest ? 'blue' : 'green'
      };
    });
  };

  return (
    <Card 
      title={
        <div className="flex items-center gap-2">
          <span>📦 Theo dõi đơn hàng #{order._id}</span>
          <Tag color={getStatusColor(order.status)}>
            {getStatusText(order.status)}
          </Tag>
        </div>
      }
      className="mb-4"
    >
      <Timeline items={getTimelineItems()} />
      
      {/* Hiển thị thông tin tổng quan */}
      {showDetails && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">📋 Thông tin tổng quan</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Ngày đặt hàng:</span>
              <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
            <div>
              <span className="text-gray-600">Phương thức thanh toán:</span>
              <p className="font-medium">{order.paymentMethod}</p>
            </div>
            <div>
              <span className="text-gray-600">Trạng thái thanh toán:</span>
              <p className="font-medium">
                {order.paymentStatus === 'paid' ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Tổng tiền:</span>
              <p className="font-medium">{order.totalPrice?.toLocaleString('vi-VN')}đ</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default OrderTracking;
