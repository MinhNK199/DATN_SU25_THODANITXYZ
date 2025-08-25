import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Phone, User, Calendar, Truck, CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../../api/axiosInstance';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  variant?: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    province: string;
    district: string;
    ward: string;
  };
  statusHistory: {
    status: string;
    timestamp: string;
    note?: string;
  }[];
}

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const statusConfig = {
    pending: { label: 'Chờ xác nhận', icon: Clock, color: 'text-yellow-600 bg-yellow-100' },
    confirmed: { label: 'Đã xác nhận', icon: CheckCircle, color: 'text-blue-600 bg-blue-100' },
    shipped: { label: 'Đang giao hàng', icon: Truck, color: 'text-purple-600 bg-purple-100' },
    delivered_success: { label: 'Đã giao hàng', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
    cancelled: { label: 'Đã hủy', icon: XCircle, color: 'text-red-600 bg-red-100' }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetail(id);
    }
  }, [id]);

  const fetchOrderDetail = async (orderId: string) => {
    try {
      setIsLoading(true);
      // ✅ Sửa endpoint theo backend route: /api/order/:id
      const response = await axiosInstance.get(`/order/${orderId}`);
      
      if (response.data) {
        setOrder(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
      navigate('/profile/orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || order.status !== 'pending') return;

    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;

    try {
      // ✅ Sửa endpoint theo backend route để cancel order
      const response = await axiosInstance.put(`/order/${order._id}/status`, {
        status: 'cancelled',
        note: 'Khách hàng hủy đơn hàng'
      });
      
      if (response.data) {
        setOrder(prev => prev ? { ...prev, status: 'cancelled' } : null);
        toast.success('Hủy đơn hàng thành công');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Đang tải chi tiết đơn hàng...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
      </div>
    );
  }

  const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Package;
  const statusStyle = statusConfig[order.status as keyof typeof statusConfig]?.color || 'text-gray-600 bg-gray-100';
  const statusLabel = statusConfig[order.status as keyof typeof statusConfig]?.label || order.status;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/profile/orders')}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách đơn hàng</span>
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Đơn hàng #{order.orderNumber}</h1>
            <p className="text-gray-600 mt-1">Đặt hàng lúc {formatDate(order.createdAt)}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${statusStyle}`}>
              <StatusIcon className="w-4 h-4" />
              <span>{statusLabel}</span>
            </div>
            
            {order.status === 'pending' && (
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
              >
                Hủy đơn hàng
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Sản phẩm đã đặt</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.productName}</h3>
                      {item.variant && (
                        <p className="text-sm text-gray-500">Phân loại: {item.variant}</p>
                      )}
                      <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatPrice(item.price)}</p>
                      <p className="text-sm text-gray-500">x{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Lịch sử đơn hàng</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {order.statusHistory.map((history, index) => {
                  const HistoryIcon = statusConfig[history.status as keyof typeof statusConfig]?.icon || Package;
                  const historyLabel = statusConfig[history.status as keyof typeof statusConfig]?.label || history.status;
                  
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <HistoryIcon className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{historyLabel}</p>
                        <p className="text-sm text-gray-500">{formatDate(history.timestamp)}</p>
                        {history.note && (
                          <p className="text-sm text-gray-600 mt-1">{history.note}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Địa chỉ giao hàng</span>
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{order.shippingAddress.fullName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{order.shippingAddress.phone}</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p>{order.shippingAddress.address}</p>
                  <p className="text-sm text-gray-500">
                    {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Thông tin thanh toán</span>
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Phương thức:</span>
                <span className="font-medium">{order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái:</span>
                <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Tóm tắt đơn hàng</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính:</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Giảm giá:</span>
                  <span className="text-red-600">-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Tổng cộng:</span>
                  <span className="text-xl font-bold text-red-600">{formatPrice(order.finalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;