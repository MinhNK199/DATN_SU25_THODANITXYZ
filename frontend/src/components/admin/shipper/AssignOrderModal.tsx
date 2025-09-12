import React, { useState, useEffect } from 'react';
import { Order } from '../../../interfaces/Order';
import { Shipper } from '../../../interfaces/Shipper';

interface AssignOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (orderId: string) => void;
  shipper: Shipper | null;
}

const AssignOrderModal: React.FC<AssignOrderModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  shipper
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableOrders();
    }
  }, [isOpen]);

  const fetchAvailableOrders = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Fetching available orders for assignment...');
      
      const response = await fetch('/api/order?status=confirmed&unassigned=true', {
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
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = () => {
    if (selectedOrder) {
      onAssign(selectedOrder);
      onClose();
      setSelectedOrder('');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Phân công đơn hàng cho: {shipper?.fullName}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Đóng</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn đơn hàng cần phân công:
              </label>
              
              {orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="mt-2">Không có đơn hàng nào cần phân công</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                        selectedOrder === order._id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedOrder(order._id)}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="selectedOrder"
                          value={order._id}
                          checked={selectedOrder === order._id}
                          onChange={() => setSelectedOrder(order._id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Đơn hàng #{order._id.slice(-8)}
                              </p>
                              <p className="text-sm text-gray-600">
                                Khách hàng: {order.shippingAddress?.fullName || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Địa chỉ: {order.shippingAddress?.address}, {order.shippingAddress?.ward}, {order.shippingAddress?.district}, {order.shippingAddress?.province}
                              </p>
                              <p className="text-sm text-gray-600">
                                SĐT: {order.shippingAddress?.phone || 'N/A'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {formatPrice(order.totalAmount)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(order.createdAt)}
                              </p>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                {order.status === 'confirmed' ? 'Đã xác nhận' : order.status}
                              </span>
                            </div>
                          </div>
                          
                          {order.items && order.items.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">
                                Sản phẩm: {order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Hủy
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedOrder || isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Phân công
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignOrderModal;
