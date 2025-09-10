import React from 'react';
import { Order } from '../../interfaces/Order';

interface DeliveryStatusProps {
  order: Order;
}

const DeliveryStatus: React.FC<DeliveryStatusProps> = ({ order }) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'draft':
        return {
          text: 'Đơn hàng tạm',
          color: 'bg-gray-100 text-gray-800',
          icon: '📝',
          description: 'Đơn hàng đang được tạo'
        };
      case 'pending':
        return {
          text: 'Chờ xác nhận',
          color: 'bg-yellow-100 text-yellow-800',
          icon: '⏳',
          description: 'Đang chờ admin xác nhận đơn hàng'
        };
      case 'confirmed':
        return {
          text: 'Đã xác nhận',
          color: 'bg-blue-100 text-blue-800',
          icon: '✅',
          description: 'Đơn hàng đã được xác nhận'
        };
      case 'processing':
        return {
          text: 'Đang xử lý',
          color: 'bg-purple-100 text-purple-800',
          icon: '⚙️',
          description: 'Đang chuẩn bị và đóng gói hàng'
        };
      case 'shipped':
        return {
          text: 'Đang giao hàng',
          color: 'bg-indigo-100 text-indigo-800',
          icon: '🚚',
          description: 'Shipper đã nhận hàng và đang giao'
        };
      case 'delivered_success':
        return {
          text: 'Giao hàng thành công',
          color: 'bg-green-100 text-green-800',
          icon: '🎉',
          description: 'Đã giao hàng thành công'
        };
      case 'delivered_failed':
        return {
          text: 'Giao hàng thất bại',
          color: 'bg-red-100 text-red-800',
          icon: '❌',
          description: 'Giao hàng không thành công'
        };
      case 'completed':
        return {
          text: 'Hoàn thành',
          color: 'bg-green-100 text-green-800',
          icon: '✨',
          description: 'Đơn hàng đã hoàn thành'
        };
      case 'cancelled':
        return {
          text: 'Đã hủy',
          color: 'bg-red-100 text-red-800',
          icon: '🚫',
          description: 'Đơn hàng đã bị hủy'
        };
      default:
        return {
          text: status,
          color: 'bg-gray-100 text-gray-800',
          icon: '❓',
          description: 'Trạng thái không xác định'
        };
    }
  };

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-3 mb-4">
        <span className="text-2xl">{statusInfo.icon}</span>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Trạng thái giao hàng</h3>
          <p className="text-sm text-gray-600">{statusInfo.description}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
          {statusInfo.text}
        </span>
        
        {order.shipper && (
          <span className="text-sm text-gray-600">
            • Shipper: {order.shipper.fullName || 'Đang phân công'}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Đặt hàng</span>
          <span>Xác nhận</span>
          <span>Chuẩn bị</span>
          <span>Giao hàng</span>
          <span>Hoàn thành</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              ['delivered_success', 'completed'].includes(order.status) 
                ? 'bg-green-500 w-full' 
                : ['shipped'].includes(order.status)
                ? 'bg-indigo-500 w-4/5'
                : ['processing'].includes(order.status)
                ? 'bg-purple-500 w-3/5'
                : ['confirmed'].includes(order.status)
                ? 'bg-blue-500 w-2/5'
                : 'bg-yellow-500 w-1/5'
            }`}
          ></div>
        </div>
      </div>

      {/* Additional Info */}
      {order.deliveredAt && (
        <div className="mt-4 p-3 bg-green-50 rounded-md">
          <p className="text-sm text-green-800">
            <strong>Thời gian giao hàng:</strong> {new Date(order.deliveredAt).toLocaleString('vi-VN')}
          </p>
        </div>
      )}

      {order.autoConfirmAt && order.status === 'delivered_success' && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Lưu ý:</strong> Đơn hàng sẽ được tự động xác nhận hoàn thành sau{' '}
            {new Date(order.autoConfirmAt).toLocaleDateString('vi-VN')}
          </p>
        </div>
      )}
    </div>
  );
};

export default DeliveryStatus;
