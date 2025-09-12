import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
// import { XCircle, RefreshCw, ShoppingCart } from "react-icons/fa";
// import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import { useToast } from "../../components/client/ToastContainer";
import axios from "axios";

const CheckoutFailed: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const orderId = searchParams.get("orderId");
  const paymentMethod = searchParams.get("paymentMethod");
  const errorMessage = searchParams.get("error") || "Đặt hàng thất bại";
  const amount = searchParams.get("amount");
  const resultCode = searchParams.get("resultCode");

  useEffect(() => {
    console.log("CheckoutFailed mounted with:", {
      orderId,
      paymentMethod,
      errorMessage,
      amount,
      resultCode,
    });

    // Lấy thông tin đơn hàng từ backend và xử lý thất bại
    if (orderId) {
      fetchOrderDetails();
      handlePaymentFailure();
      
      // Hiển thị thông báo thất bại với lý do cụ thể
      let failureReason = errorMessage;
      if (resultCode === "1006") {
        failureReason = "Người dùng hủy giao dịch";
      } else if (resultCode === "1001") {
        failureReason = "Lỗi hệ thống";
      } else if (resultCode === "1002") {
        failureReason = "Lỗi tham số";
      } else if (resultCode === "1003") {
        failureReason = "Lỗi xác thực";
      } else if (resultCode === "1004") {
        failureReason = "Lỗi kết nối";
      } else if (resultCode === "1005") {
        failureReason = "Lỗi timeout";
      } else if (errorMessage === "timeout_error") {
        failureReason = "MoMo server không phản hồi - Vui lòng thử lại sau";
      } else if (errorMessage === "network_error") {
        failureReason = "Không thể kết nối đến MoMo server - Vui lòng kiểm tra kết nối mạng";
      } else if (errorMessage === "payment_error") {
        failureReason = "Lỗi thanh toán - Vui lòng thử lại";
      }
      
      showError(
        `Đơn hàng ${orderId} thất bại`,
        failureReason
      );
    }
  }, [orderId, errorMessage, showError]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token && orderId) {
        const response = await axios.get(`http://localhost:8000/api/order/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrderDetails(response.data);
        console.log("📦 Order details fetched:", response.data);
      }
    } catch (error) {
      console.error("❌ Error fetching order details:", error);
    }
  };

  const handlePaymentFailure = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token && orderId) {
        console.log("🔄 Handling payment failure for order:", orderId);
        
        // Cập nhật trạng thái đơn hàng thành thất bại
        await axios.put(
          `http://localhost:8000/api/order/${orderId}/payment-failed`,
          { 
            reason: resultCode === "1006" ? "Người dùng hủy giao dịch" : "Thanh toán thất bại",
            resultCode: resultCode 
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log("✅ Payment failure handled successfully - order removed from user's order list");
      }
    } catch (error) {
      console.error("❌ Error handling payment failure:", error);
    }
  };

  const handleRetry = async () => {
    setLoading(true);
    try {
      // Xóa đơn hàng thất bại nếu có
      if (orderId) {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:8000/api/order/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      
      // Chuyển về trang checkout để thử lại
      navigate("/checkout");
    } catch (error) {
      console.error("Lỗi khi xóa đơn hàng thất bại:", error);
      navigate("/checkout");
    } finally {
      setLoading(false);
    }
  };

  const handleGoCart = () => {
    navigate("/cart");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const getPaymentMethodDisplay = () => {
    // Ưu tiên lấy từ order details, fallback về URL params
    const method = orderDetails?.paymentMethod || paymentMethod;
    
    switch (method) {
      case "momo":
        return "MoMo";
      case "vnpay":
        return "VNPAY";
      case "credit-card":
        return "Thẻ tín dụng";
      case "bank-transfer":
        return "Chuyển khoản ngân hàng";
      case "COD":
        return "Thanh toán khi nhận hàng (COD)";
      default:
        return method || "Không xác định";
    }
  };

  const getErrorMessage = () => {
    switch (errorMessage) {
      case "payment_cancelled":
        return "Bạn đã hủy thanh toán";
      case "payment_failed":
        return "Thanh toán thất bại";
      case "insufficient_funds":
        return "Tài khoản không đủ số dư";
      case "network_error":
        return "Lỗi kết nối mạng";
      case "timeout":
        return "Hết thời gian thanh toán";
      default:
        return errorMessage;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
                         <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
               <span className="text-4xl text-red-600">❌</span>
             </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Đặt hàng thất bại
            </h1>
            <p className="text-lg text-gray-600">
              Rất tiếc, đã xảy ra lỗi trong quá trình đặt hàng
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Error Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Chi tiết lỗi
              </h2>
              
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                                         <span className="text-red-500 text-lg">⚠️</span>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-red-800 mb-1">
                        Lý do thất bại:
                      </h3>
                      <p className="text-sm text-red-700">
                        {getErrorMessage()}
                      </p>
                    </div>
                  </div>
                </div>

                {orderId && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Thông tin đơn hàng:
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Mã đơn hàng:</span>
                        <span className="font-mono">{orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phương thức thanh toán:</span>
                        <span className="font-medium">
                          {getPaymentMethodDisplay()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Số tiền:</span>
                        <span className="font-medium">
                          {orderDetails?.totalPrice ? `${orderDetails.totalPrice.toLocaleString('vi-VN')}₫` : amount ? `${parseInt(amount).toLocaleString('vi-VN')}₫` : 'Không xác định'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">
                    Có thể thử các cách sau:
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Kiểm tra lại thông tin thanh toán</li>
                    <li>• Đảm bảo tài khoản có đủ số dư</li>
                    <li>• Thử phương thức thanh toán khác</li>
                    <li>• Kiểm tra kết nối mạng</li>
                    <li>• Liên hệ hỗ trợ nếu vấn đề tiếp tục</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Panel */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Bước tiếp theo
              </h2>
              
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-yellow-800 mb-2">
                    Lưu ý quan trọng:
                  </h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Đơn hàng đã được hủy tự động</li>
                    <li>• Sản phẩm vẫn còn trong giỏ hàng</li>
                    <li>• Bạn có thể thử đặt hàng lại</li>
                    <li>• Không có phí phát sinh</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleRetry}
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center px-6 py-4 bg-red-600 text-white text-base font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    <span className="text-xl mr-3">🔄</span>
                    {loading ? "Đang xử lý..." : "Thử lại"}
                  </button>

                  <button
                    onClick={handleGoCart}
                    className="w-full inline-flex items-center justify-center px-6 py-4 bg-blue-600 text-white text-base font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                  >
                    <span className="text-xl mr-3">🛒</span>
                    Xem giỏ hàng
                  </button>

                  <button
                    onClick={handleGoBack}
                    className="w-full inline-flex items-center justify-center px-6 py-4 bg-gray-600 text-white text-base font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-md"
                  >
                    <span className="text-xl mr-3">←</span>
                    Quay lại
                  </button>

                  <button
                    onClick={handleGoHome}
                    className="w-full inline-flex items-center justify-center px-6 py-4 bg-gray-100 text-gray-700 text-base font-medium rounded-lg hover:bg-gray-200 transition-colors shadow-md"
                  >
                    <span className="text-xl mr-3">🏠</span>
                    Về trang chủ
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Cần hỗ trợ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Hotline</h3>
                <p className="text-sm text-gray-600">+84 123 456 789</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Email</h3>
                <p className="text-sm text-gray-600">support@techtrend.vn</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Chat</h3>
                <p className="text-sm text-gray-600">Hỗ trợ 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFailed;
