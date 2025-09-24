import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Truck, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '../../components/client/ToastContainer';
import { useCart } from '../../contexts/CartContext';
import axiosInstance from '../../api/axiosInstance';

interface OrderDetails {
  _id: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
    image: string;
    variantId?: string;
    variantInfo?: {
      _id?: string;
      name?: string;
      price?: number;
      salePrice?: number;
      stock?: number;
      images?: string[];
      sku?: string;
      color?: {
        name?: string;
        code?: string;
      };
      size?: number;
      specifications?: Record<string, string>;
    };
  }>;
  totalPrice: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  isPaid: boolean;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    phone: string;
    ward?: string;
    district?: string;
    wardName?: string;
    cityName?: string;
  };
  createdAt: string;
}

const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { removeOrderedItemsFromCart } = useCart();
  
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('orderId');
  const paymentMethod = searchParams.get('paymentMethod');
  const status = searchParams.get('status');
  const resultCode = searchParams.get('resultCode');

  useEffect(() => {
    if (!orderId) {
      setError('Không tìm thấy thông tin đơn hàng');
      setLoading(false);
      return;
    }

    handlePaymentSuccess();
  }, [orderId]);

  const handlePaymentSuccess = async () => {
    try {
      console.log('🔍 CheckoutSuccess handlePaymentSuccess:', { paymentMethod, resultCode, orderId });
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập để xem thông tin đơn hàng');
        setLoading(false);
        return;
      }

      // Xử lý theo phương thức thanh toán
      if (paymentMethod === "momo") {
        console.log('🔍 MoMo payment check:', { resultCode, isSuccess: resultCode === "0" });
        // Kiểm tra từ URL parameters
        if (resultCode === "0") {
          // ✅ Thanh toán Momo thành công
          showSuccess(
            "Thanh toán Momo thành công!",
            `Đơn hàng ${orderId} đã được thanh toán và sẽ được giao trong 2-3 ngày.`
          );

          // ✅ Xóa sản phẩm đã đặt khỏi giỏ hàng
          const pendingOrder = localStorage.getItem("pendingOrder");
          if (pendingOrder) {
            const orderData = JSON.parse(pendingOrder);
            if (orderData.orderItems) {
              await removeOrderedItemsFromCart(orderData.orderItems);
            }
            localStorage.removeItem("pendingOrder");
          }

          // ✅ Đợi callback rồi fetch data một lần
          setTimeout(async () => {
            await fetchOrderDetails();
          }, 2000); // Đợi 2 giây cho callback xử lý

        } else {
          // ❌ Thanh toán MoMo thất bại - CHỈ XÓA KHI THỰC SỰ THẤT BẠI
          console.log('❌ MoMo payment failed, checking if order exists:', { resultCode, orderId });
          
          // Kiểm tra xem đơn hàng có tồn tại và đã thanh toán chưa
          try {
            const orderResponse = await axiosInstance.get(`/order/${orderId}`);
            const order = orderResponse.data;
            
            if (order.isPaid && order.paymentStatus === 'paid') {
              console.log('✅ Order already paid, not deleting');
              // Đơn hàng đã thanh toán, chỉ fetch details
              await fetchOrderDetails();
              return;
            }
          } catch (error) {
            console.log('❌ Error checking order status:', error);
          }
          
          // Chỉ xóa khi thực sự thất bại
          console.log('❌ MoMo payment failed, deleting order:', { resultCode, orderId });
          await axiosInstance.delete(`/order/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          showError("Thanh toán MoMo thất bại", "Đơn hàng đã bị hủy");
          navigate("/checkout?error=payment_cancelled");
          return;
        }
      } else if (paymentMethod === "vnpay") {
        // Kiểm tra từ URL parameters
        const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
        if (vnp_ResponseCode === "00") {
          // ✅ Thanh toán VNPay thành công
          showSuccess(
            "Thanh toán VNPay thành công!",
            `Đơn hàng ${orderId} đã được thanh toán và sẽ được giao trong 2-3 ngày.`
          );

          // ✅ Xóa sản phẩm đã đặt khỏi giỏ hàng
          const pendingOrder = localStorage.getItem("pendingOrder");
          if (pendingOrder) {
            const orderData = JSON.parse(pendingOrder);
            if (orderData.orderItems) {
              await removeOrderedItemsFromCart(orderData.orderItems);
            }
            localStorage.removeItem("pendingOrder");
          }

          // ✅ Đợi callback rồi fetch data một lần
          setTimeout(async () => {
            await fetchOrderDetails();
          }, 2000); // Đợi 2 giây cho callback xử lý

        } else {
          // ❌ Thanh toán VNPay thất bại
          await axiosInstance.delete(`/order/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          showError("Thanh toán VNPay thất bại", "Đơn hàng đã bị hủy");
          navigate("/checkout?error=payment_cancelled");
          return;
        }
      } else if (paymentMethod === "credit-card") {
        // ✅ Thanh toán Credit Card thành công
        showSuccess(
          "Thanh toán thẻ tín dụng thành công!",
          `Đơn hàng ${orderId} đã được thanh toán và sẽ được giao trong 2-3 ngày.`
        );

        // ✅ Xóa sản phẩm đã đặt khỏi giỏ hàng
        const pendingOrder = localStorage.getItem("pendingOrder");
        if (pendingOrder) {
          const orderData = JSON.parse(pendingOrder);
          if (orderData.orderItems) {
            await removeOrderedItemsFromCart(orderData.orderItems);
          }
          localStorage.removeItem("pendingOrder");
        }

        // ✅ Fetch order details ngay lập tức
        await fetchOrderDetails();
      } else {
        // COD hoặc phương thức khác
        showSuccess(
          "Đặt hàng thành công!",
          `Đơn hàng ${orderId} đã được tạo và sẽ được xử lý trong thời gian sớm nhất.`
        );
        await fetchOrderDetails();
      }

    } catch (error) {
      console.error('Error handling payment success:', error);
      setError('Có lỗi xảy ra khi xử lý thanh toán');
      setLoading(false);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !orderId) return;

      const response = await axiosInstance.get(`/order/${orderId}`);
      setOrderDetails(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Không thể tải thông tin đơn hàng');
      setLoading(false);
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'momo':
        return '💜';
      case 'vnpay':
        return '🟢';
      case 'credit-card':
        return '💳';
      case 'cod':
        return '💰';
      default:
        return '💳';
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'momo':
        return 'MoMo';
      case 'vnpay':
        return 'VNPay';
      case 'credit-card':
        return 'Thẻ tín dụng';
      case 'cod':
        return 'Thanh toán khi nhận hàng (COD)';
      default:
        return method || 'Không xác định';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang xử lý thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Có lỗi xảy ra</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
           Đặt hàng thành công!
          </h1>
          <p className="text-lg text-gray-600">
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận.
          </p>
        </div>

        {/* Order Summary */}
        {orderDetails && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Details */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Chi tiết đơn hàng</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã đơn hàng:</span>
                    <span className="font-medium">#{orderDetails._id.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày đặt:</span>
                    <span>{new Date(orderDetails.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phương thức thanh toán:</span>
                    <span className="flex items-center">
                      <span className="mr-2">{getPaymentMethodIcon(orderDetails.paymentMethod)}</span>
                      {getPaymentMethodName(orderDetails.paymentMethod)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      {orderDetails.isPaid ? 'Đã thanh toán' : 'Chờ thanh toán'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng tiền:</span>
                    <span className="font-bold text-lg text-green-600">
                      {orderDetails.totalPrice?.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Địa chỉ giao hàng</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium">{orderDetails.shippingAddress.fullName}</p>
                  <p>Điện thoại: {orderDetails.shippingAddress.phone}</p>
                  <div className="flex items-start space-x-2">
                    <div className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p>{orderDetails.shippingAddress.address}</p>
                      <div className="space-y-1">
                        {orderDetails.shippingAddress.wardName && (
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span className="font-medium">Phường/Xã:</span>
                            <span>{orderDetails.shippingAddress.wardName}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span className="font-medium">Thành phố/Tỉnh:</span>
                          <span>{orderDetails.shippingAddress.cityName || orderDetails.shippingAddress.city}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        {orderDetails && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Sản phẩm đã đặt</h2>
            <div className="space-y-4">
              {orderDetails.orderItems.map((item, index) => {
                // Ưu tiên ảnh biến thể, nếu không có thì dùng ảnh sản phẩm đại diện
                const displayImage = item.variantInfo?.images?.[0] || item.image;
                return (
                  <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img
                      src={displayImage}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      title={item.variantInfo?.images?.[0] ? 'Ảnh sản phẩm' : 'Ảnh sản phẩm'}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      {item.variantInfo && item.variantInfo.name && (
                        <p className="text-sm text-blue-600 font-medium"> sản phẩm: {item.variantInfo.name}</p>
                      )}
                      <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Các bước tiếp theo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Đơn hàng được xác nhận</h3>
              <p className="text-sm text-gray-600">
                Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Truck className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Giao hàng</h3>
              <p className="text-sm text-gray-600">
                Đơn hàng sẽ được giao trong 2-3 ngày làm việc.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Nhận hàng</h3>
              <p className="text-sm text-gray-600">
                Kiểm tra và nhận hàng khi shipper giao đến.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/profile/orders')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Xem đơn hàng của tôi
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Tiếp tục mua sắm
          </button>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Nếu bạn có câu hỏi, vui lòng liên hệ chúng tôi qua email{' '}
            <a href="mailto:support@techtrend.com" className="text-blue-600 hover:underline">
              support@techtrend.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
