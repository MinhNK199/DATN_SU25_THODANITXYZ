import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTruck, FaHome } from 'react-icons/fa';
import { useToast } from '../../components/client/ToastContainer';
import axios from 'axios';

const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSuccess } = useToast();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('orderId');
  const paymentMethod = searchParams.get('paymentMethod');

  useEffect(() => {
  console.log("CheckoutSuccess mounted with:", { orderId, paymentMethod }); // Debug log
  
  if (!orderId) {
    console.log("Không có orderId, chuyển về trang chủ"); // Debug log
    navigate('/');
    return;
  }

  // Lấy thông tin đơn hàng
  const fetchOrderDetails = async () => {
  try {
    const token = localStorage.getItem('token');
    console.log("Fetching order details for:", orderId); // Debug log
    
    // 🎯 SỬA ENDPOINT TỪ /api/orders THÀNH /api/order
    const response = await axios.get(`http://localhost:8000/api/order/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("Order details received:", response.data); // Debug log
    setOrderDetails(response.data);
    
    if (paymentMethod === 'zalopay') {
      showSuccess(
        'Thanh toán ZaloPay thành công!',
        `Đơn hàng ${orderId} đã được thanh toán và sẽ được giao trong 2-3 ngày.`
      );
    }
  } catch (error) {
    console.error('Lỗi khi lấy thông tin đơn hàng:', error);
    navigate('/');
  } finally {
    setLoading(false);
  }
};

  fetchOrderDetails();
}, [orderId, paymentMethod, navigate, showSuccess]);
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <FaCheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Đặt hàng thành công!
            </h1>
            <p className="text-gray-600">
              {paymentMethod === 'zalopay' 
                ? 'Thanh toán ZaloPay đã hoàn tất' 
                : 'Cảm ơn bạn đã mua sắm tại TechTrend'
              }
            </p>
          </div>

          {/* Order Details */}
          {orderDetails && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Chi tiết đơn hàng</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Mã đơn hàng</h3>
                  <p className="text-gray-600">{orderId}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Phương thức thanh toán</h3>
                  <p className="text-gray-600">
                    {paymentMethod === 'zalopay' ? 'ZaloPay' : orderDetails.paymentMethod}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Tổng tiền</h3>
                  <p className="text-lg font-bold text-blue-600">
                    {formatPrice(orderDetails.totalPrice)}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Trạng thái</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {orderDetails.isPaid ? 'Đã thanh toán' : 'Chờ thanh toán'}
                  </span>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Thông tin giao hàng</h3>
                <div className="text-gray-600">
                  <p>{orderDetails.shippingAddress?.fullName}</p>
                  <p>{orderDetails.shippingAddress?.phone}</p>
                  <p>{orderDetails.shippingAddress?.address}</p>
                  <p>{orderDetails.shippingAddress?.city}</p>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-2xl p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Những bước tiếp theo:</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FaTruck className="w-5 h-5 text-blue-600" />
                <span>Đơn hàng sẽ được xử lý và giao trong 2-3 ngày làm việc</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaCheckCircle className="w-5 h-5 text-green-600" />
                <span>Bạn sẽ nhận được email xác nhận và thông tin theo dõi</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <button
              onClick={() => navigate('/profile?tab=orders')}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-semibold transition-colors mr-4"
            >
              Xem đơn hàng
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-8 rounded-lg font-semibold transition-colors"
            >
              <FaHome className="w-4 h-4 inline mr-2" />
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;