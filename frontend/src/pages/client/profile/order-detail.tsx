import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Phone, User, Calendar, Truck, CheckCircle, XCircle, Clock, CreditCard, RotateCcw, Star, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../../api/axiosInstance';

interface OrderItem {
  _id: string;
  product?: string;
  name: string;
  image?: string;
  variant?: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
}

interface OrderDetail {
  _id: string;
  orderNumber?: string;
  orderItems: OrderItem[];
  totalPrice: number;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  status: 'draft' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered_success' | 'delivered_failed' | 'partially_delivered' | 'returned' | 'on_hold' | 'completed' | 'cancelled' | 'refund_requested' | 'refunded' | 'payment_failed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'awaiting_payment';
  paymentMethod: string;
  isPaid?: boolean;
  paidAt?: string;
  shippingAddress: {
    fullName: string;
    phone?: string;
    address: string;
    city: string;
    district?: string;
    ward?: string;
  };
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryDate?: string;
  deliveryPerson?: {
    name: string;
    phone: string;
    id: string;
  };
  deliveryNotes?: string;
  statusHistory?: {
    status: string;
    date: string;
    note?: string;
  }[];
  statusInfo?: {
    message: string;
    color: string;
    icon: string;
  };
}

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  const statusConfig = {
    draft: { label: 'Đang tạo', icon: Clock, color: 'text-gray-600 bg-gray-100' },
    pending: { label: 'Chờ xác nhận', icon: Clock, color: 'text-yellow-600 bg-yellow-100' },
    confirmed: { label: 'Đã xác nhận', icon: CheckCircle, color: 'text-blue-600 bg-blue-100' },
    processing: { label: 'Đang xử lý', icon: Package, color: 'text-purple-600 bg-purple-100' },
    shipped: { label: 'Đang giao hàng', icon: Truck, color: 'text-orange-600 bg-orange-100' },
    delivered_success: { label: 'Giao hàng thành công', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
    delivered_failed: { label: 'Giao hàng thất bại', icon: XCircle, color: 'text-red-600 bg-red-100' },
    partially_delivered: { label: 'Giao hàng một phần', icon: Package, color: 'text-orange-600 bg-orange-100' },
    returned: { label: 'Hoàn hàng', icon: RotateCcw, color: 'text-purple-600 bg-purple-100' },
    return_requested: { label: 'Yêu cầu hoàn hàng', icon: RotateCcw, color: 'text-orange-600 bg-orange-100' },
    on_hold: { label: 'Tạm dừng', icon: Clock, color: 'text-gray-600 bg-gray-100' },
    completed: { label: 'Thành công', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
    cancelled: { label: 'Đã hủy', icon: XCircle, color: 'text-red-600 bg-red-100' },
    refund_requested: { label: 'Yêu cầu hoàn tiền', icon: DollarSign, color: 'text-yellow-600 bg-yellow-100' },
    refunded: { label: 'Hoàn tiền thành công', icon: CheckCircle, color: 'text-blue-600 bg-blue-100' },
    payment_failed: { label: 'Thanh toán thất bại', icon: XCircle, color: 'text-red-600 bg-red-100' }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetail(id);
    }
  }, [id]);

  const fetchOrderDetail = async (orderId: string) => {
    try {
      setIsLoading(true);
      console.log('🔍 Fetching order detail for:', orderId);
      const response = await axiosInstance.get(`/order/${orderId}`);
      
      if (response.data) {
        console.log('✅ Order data received:', response.data);
        console.log('🔍 deliveryPerson structure:', response.data.deliveryPerson);
        console.log('🔍 shippingAddress structure:', response.data.shippingAddress);
        setOrder(response.data);
      }
    } catch (error: any) {
      console.error('❌ Error fetching order:', error);
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
      const response = await axiosInstance.put(`/order/${order._id}/cancel`);
      
      if (response.data) {
        setOrder(prev => prev ? { ...prev, status: 'cancelled' } : null);
        toast.success('Hủy đơn hàng thành công');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleConfirmDelivery = async () => {
    if (!order || order.status !== 'shipped') return;

    if (!confirm('Bạn có chắc chắn đã nhận được hàng?')) return;

    try {
      const response = await axiosInstance.put(`/order/${order._id}/confirm-delivery`);
      
      if (response.data) {
        setOrder(prev => prev ? { ...prev, status: 'delivered_success' } : null);
        toast.success('Xác nhận đã nhận hàng thành công!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleReturnRequest = async () => {
    if (!order || order.status !== 'shipped') return;

    const reason = window.prompt("Vui lòng nhập lý do yêu cầu hoàn hàng/hoàn tiền:");
    if (!reason || reason.trim() === "") return;

    try {
      const response = await axiosInstance.put(`/order/${order._id}/return-request`, {
        reason: reason.trim()
      });
      
      if (response.data) {
        setOrder(prev => prev ? { ...prev, status: 'return_requested' } : null);
        toast.success('Yêu cầu hoàn hàng/hoàn tiền đã được gửi thành công!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleConfirmSatisfaction = async () => {
    if (!order || order.status !== 'delivered_success') return;

    if (!confirm('Bạn có chắc chắn hài lòng với đơn hàng này?')) return;

    try {
      const response = await axiosInstance.put(`/order/${order._id}/confirm-satisfaction`);
      
      if (response.data) {
        setOrder(prev => prev ? { ...prev, status: 'completed' } : null);
        toast.success('Xác nhận hài lòng thành công! Đơn hàng đã hoàn thành.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleRefundRequest = async () => {
    if (!order || !refundReason.trim()) {
      toast.error('Vui lòng nhập lý do hoàn tiền');
      return;
    }

    try {
      setIsRefunding(true);
      const response = await axiosInstance.put(`/order/${order._id}/refund-request`, {
        reason: refundReason
      });
      
      if (response.data) {
        setOrder(prev => prev ? { ...prev, status: 'refund_requested' } : null);
        toast.success('Yêu cầu hoàn tiền đã được gửi thành công');
        setRefundReason('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu hoàn tiền');
    } finally {
      setIsRefunding(false);
    }
  };

  const handleReviewOrder = (orderId: string) => {
    // Mockup cho thành viên khác làm
    toast.success('Tính năng đánh giá đang được phát triển!');
    // navigate(`/profile/orders/${orderId}/review`);
  };

  const canConfirmDelivery = (order: OrderDetail) => {
    return order.status === 'shipped';
  };

  const canRequestRefund = (order: OrderDetail) => {
    console.log('🔍 canRequestRefund check:', {
      status: order.status,
      isPaid: order.isPaid,
      paymentStatus: order.paymentStatus
    });
    return order.status === 'delivered_success' && order.isPaid;
  };

  const canReview = (order: OrderDetail) => {
    return ['delivered_success', 'completed'].includes(order.status);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price || 0);
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
  const statusLabel = statusConfig[order.status as keyof typeof statusConfig]?.label || order.status || 'Không xác định';

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
            <h1 className="text-2xl font-bold text-gray-900">
              Đơn hàng #{order.orderNumber || order._id?.slice(-8) || 'N/A'}
            </h1>
            <p className="text-gray-600 mt-1">Đặt hàng lúc {formatDate(order.createdAt || new Date())}</p>
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

                          {/* Nút xác nhận đã nhận hàng */}
             {canConfirmDelivery(order) && (
               <button
                 onClick={handleConfirmDelivery}
                 className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
               >
                 <CheckCircle className="w-4 h-4" />
                 <span>Đã nhận được hàng</span>
               </button>
             )}

             {/* Nút yêu cầu hoàn hàng/hoàn tiền khi đang giao */}
             {canConfirmDelivery(order) && (
               <button
                 onClick={handleReturnRequest}
                 className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
               >
                 <RotateCcw className="w-4 h-4" />
                 <span>{order.paymentMethod === "COD" ? "Yêu cầu hoàn hàng" : "Yêu cầu hoàn tiền"}</span>
               </button>
             )}

             {/* Nút hoàn tiền */}
             {canRequestRefund(order) && (
               <button
                 onClick={() => setRefundReason('')}
                 className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors flex items-center space-x-2"
               >
                 <DollarSign className="w-4 h-4" />
                 <span>Yêu cầu hoàn tiền</span>
               </button>
             )}

             {/* Nút xác nhận hài lòng */}
             {canRequestRefund(order) && (
               <button
                 onClick={handleConfirmSatisfaction}
                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
               >
                 <CheckCircle className="w-4 h-4" />
                 <span>Hài lòng với đơn hàng</span>
               </button>
             )}

                         {/* Nút đánh giá */}
             {canReview(order) && (
               <button
                 onClick={() => handleReviewOrder(order._id)}
                 className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
               >
                 <Star className="w-4 h-4" />
                 <span>Đánh giá</span>
               </button>
             )}
          </div>
        </div>
      </div>

                    {/* Modal yêu cầu hoàn tiền */}
       {canRequestRefund(order) && (
         <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">Yêu cầu hoàn tiền</h3>
          <div className="space-y-3">
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Nhập lý do yêu cầu hoàn tiền..."
              className="w-full p-3 border border-yellow-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
              rows={3}
            />
            <div className="flex space-x-3">
              <button
                onClick={handleRefundRequest}
                disabled={isRefunding || !refundReason.trim()}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <DollarSign className="w-4 h-4" />
                <span>{isRefunding ? 'Đang gửi...' : 'Gửi yêu cầu'}</span>
              </button>
              <button
                onClick={() => setRefundReason('')}
                className="px-4 py-2 border border-yellow-300 text-yellow-600 rounded-md hover:bg-yellow-50 transition-colors"
              >
                Hủy
              </button>
                                                   </div>
            </div>
          </div>
        )}

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
                {order.orderItems?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                    <img
                      src={item.image || '/placeholder-product.png'}
                      alt={item.name || 'Sản phẩm'}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80?text=IMG'; }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name || 'Tên sản phẩm'}</h3>
                      {item.variant && item.variant.name && (
                        <p className="text-sm text-gray-500">Phân loại: {item.variant.name}</p>
                      )}
                      <p className="text-sm text-gray-500">Số lượng: {item.quantity || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatPrice(item.price || 0)}</p>
                      <p className="text-sm text-gray-500">x{item.quantity || 0}</p>
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
                {order.statusHistory && order.statusHistory.length > 0 ? (
                  order.statusHistory.map((history, index) => {
                    const HistoryIcon = statusConfig[history.status as keyof typeof statusConfig]?.icon || Package;
                    const historyLabel = statusConfig[history.status as keyof typeof statusConfig]?.label || history.status || 'Không xác định';
                    
                    return (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <HistoryIcon className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{historyLabel}</p>
                          <p className="text-sm text-gray-500">{formatDate(history.date || new Date())}</p>
                          {history.note && (
                            <p className="text-sm text-gray-600 mt-1">{history.note}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center py-4">Chưa có lịch sử trạng thái</p>
                )}
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
                <span className="font-medium">{order.shippingAddress?.fullName || 'N/A'}</span>
              </div>
              {order.shippingAddress?.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{order.shippingAddress.phone || 'N/A'}</span>
                </div>
              )}
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p>{order.shippingAddress?.address || 'N/A'}</p>
                  <p className="text-sm text-gray-500">
                    {[
                      order.shippingAddress?.ward,
                      order.shippingAddress?.district,
                      order.shippingAddress?.city
                    ].filter(Boolean).join(', ') || 'N/A'}
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
                <span className="font-medium">
                  {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : (order.paymentMethod ? order.paymentMethod.toUpperCase() : 'N/A')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái:</span>
                <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.paymentStatus === 'paid' ? 'Đã thanh toán' : (order.paymentStatus || 'Chưa thanh toán')}
                </span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày thanh toán:</span>
                  <span className="font-medium">{formatDate(order.paidAt || new Date())}</span>
                </div>
              )}
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
                <span>{formatPrice(order.itemsPrice || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span>{formatPrice(order.shippingPrice || 0)}</span>
              </div>
              {(order.taxPrice || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Thuế:</span>
                  <span>{formatPrice(order.taxPrice || 0)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Tổng cộng:</span>
                  <span className="text-xl font-bold text-red-600">{formatPrice(order.totalPrice || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          {(order.estimatedDeliveryDate || order.deliveryPerson) && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Truck className="w-5 h-5" />
                  <span>Thông tin giao hàng</span>
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {order.estimatedDeliveryDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dự kiến giao:</span>
                    <span className="font-medium">{formatDate(order.estimatedDeliveryDate || new Date())}</span>
                  </div>
                )}
                {order.deliveryPerson && order.deliveryPerson.name && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Người giao:</span>
                    <span className="font-medium">{order.deliveryPerson.name}</span>
                  </div>
                )}
                {order.deliveryPerson && order.deliveryPerson.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số điện thoại:</span>
                    <span className="font-medium">{order.deliveryPerson.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;