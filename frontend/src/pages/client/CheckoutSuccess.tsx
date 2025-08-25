import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { FaCheckCircle, FaTruck, FaHome } from "react-icons/fa";
import { useToast } from "../../components/client/ToastContainer";
import axios from "axios";

const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useToast();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get("orderId");
  const paymentMethod = searchParams.get("paymentMethod");
  const status = searchParams.get("status"); // Từ ZaloPay

  useEffect(() => {
    console.log("CheckoutSuccess mounted with:", {
      orderId,
      paymentMethod,
      status,
    });

    if (!orderId) {
      console.log("Không có orderId, chuyển về trang chủ");
      navigate("/");
      return;
    }

    // ✅ SỬA: KIỂM TRA TRẠNG THÁI THỰC TẾ TỪ DATABASE
    const handlePaymentResult = async () => {
      try {
        const token = localStorage.getItem("token");

        // Xử lý theo phương thức thanh toán
        if (paymentMethod === "zalopay") {
  if (status === "1") {
    // ✅ Thanh toán ZaloPay thành công từ URL
    console.log("🔔 ZaloPay payment success from URL");

    showSuccess(
      "Thanh toán ZaloPay thành công!",
      `Đơn hàng ${orderId} đã được thanh toán và sẽ được giao trong 2-3 ngày.`
    );

    // Xóa sản phẩm đã đặt khỏi giỏ hàng
    const pendingOrder = localStorage.getItem("pendingOrder");
    if (pendingOrder) {
      const orderData = JSON.parse(pendingOrder);
      if (orderData.orderItems) {
        await removeOrderedItemsFromCart(orderData.orderItems);
      }
      localStorage.removeItem("pendingOrder");
    }

    // ✅ SỬA: Đợi callback rồi fetch data một lần
    setTimeout(async () => {
      await fetchOrderDetails();
    }, 3000); // Đợi 3 giây cho callback xử lý
    
  } else {
         // ❌ Thanh toán ZaloPay thất bại
     await axios.delete(`/api/order/${orderId}`, {
       headers: { Authorization: `Bearer ${token}` },
     });
    showError("Thanh toán ZaloPay thất bại", "Đơn hàng đã bị hủy");
    navigate("/checkout?error=payment_cancelled");
    return;
  }
}else if (paymentMethod === "momo") {
          // Kiểm tra từ URL parameters
          const resultCode = searchParams.get("resultCode");
          if (resultCode === "0") {
            // ✅ Thanh toán Momo thành công
            showSuccess(
              "Thanh toán Momo thành công!",
              `Đơn hàng ${orderId} đã được thanh toán và sẽ được giao trong 2-3 ngày.`
            );

            const pendingOrder = localStorage.getItem("pendingOrder");
            if (pendingOrder) {
              const orderData = JSON.parse(pendingOrder);
              if (orderData.orderItems) {
                await removeOrderedItemsFromCart(orderData.orderItems);
              }
              localStorage.removeItem("pendingOrder");
            }
            await fetchOrderDetails();
          } else {
                         // ❌ Thanh toán Momo thất bại
             await axios.delete(`/api/order/${orderId}`, {
               headers: { Authorization: `Bearer ${token}` },
             });
            showError("Thanh toán Momo thất bại", "Đơn hàng đã bị hủy");
            navigate("/checkout?error=payment_cancelled");
            return;
          }
        } else if (paymentMethod === "vnpay") {
          const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
          if (vnp_ResponseCode === "00") {
            // ✅ Thanh toán VNPAY thành công
            showSuccess(
              "Thanh toán VNPAY thành công!",
              `Đơn hàng ${orderId} đã được thanh toán và sẽ được giao trong 2-3 ngày.`
            );

            const pendingOrder = localStorage.getItem("pendingOrder");
            if (pendingOrder) {
              const orderData = JSON.parse(pendingOrder);
              if (orderData.orderItems) {
                await removeOrderedItemsFromCart(orderData.orderItems);
              }
              localStorage.removeItem("pendingOrder");
            }
            await fetchOrderDetails();
          } else {
                         // ❌ Thanh toán VNPAY thất bại
             await axios.delete(`/api/order/${orderId}`, {
               headers: { Authorization: `Bearer ${token}` },
             });
            showError("Thanh toán VNPAY thất bại", "Đơn hàng đã bị hủy");
            navigate("/checkout?error=payment_cancelled");
            return;
          }
        } else if (paymentMethod === "COD") {
          // COD - Hiển thị thành công ngay
          showSuccess(
            "Đặt hàng COD thành công!",
            `Đơn hàng ${orderId} đã được tạo và sẽ được giao trong 2-3 ngày.`
          );
          await fetchOrderDetails();
        } else {
          // ✅ Phương thức khác - lấy thông tin đơn hàng
          await fetchOrderDetails();
        }
      } catch (error) {
        console.error("Lỗi xử lý kết quả thanh toán:", error);
        showError("Có lỗi xảy ra", "Vui lòng kiểm tra lại đơn hàng");
        navigate("/checkout?error=payment_error");
      }
    };

    handlePaymentResult();
  }, [
    orderId,
    paymentMethod,
    status,
    searchParams,
    navigate,
    showSuccess,
    showError,
  ]);

  // ✅ Force refresh profile data khi order được cập nhật
  useEffect(() => {
    if (orderDetails && orderDetails.isPaid && orderDetails.paymentStatus === "paid") {
      // Gửi event để profile component refresh
      window.dispatchEvent(new CustomEvent('orderUpdated'));
      console.log("🔔 Dispatched orderUpdated event for profile refresh");
    }
  }, [orderDetails]);

  // ✅ Hàm xóa sản phẩm khỏi giỏ hàng
  const removeOrderedItemsFromCart = async (orderItems: any[]) => {
    try {
      const token = localStorage.getItem("token");
      const productIds = orderItems.map((item) => item.product);

             await axios.post(
         `/api/cart/remove-multiple`,
         { productIds },
         { headers: { Authorization: `Bearer ${token}` } }
       );

      console.log("✅ Đã xóa sản phẩm khỏi giỏ hàng sau thanh toán thành công");
    } catch (error) {
      console.error("Lỗi xóa sản phẩm khỏi giỏ hàng:", error);
    }
  };

  // ✅ Lấy thông tin đơn hàng
  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔄 Fetching order details for:", orderId);

             const response = await axios.get(
         `/api/order/${orderId}`,
         {
           headers: { Authorization: `Bearer ${token}` },
         }
       );

      console.log("📦 Order details received:", {
        id: response.data._id,
        status: response.data.status,
        paymentMethod: response.data.paymentMethod,
        isPaid: response.data.isPaid,
        paymentStatus: response.data.paymentStatus,
        paidAt: response.data.paidAt,
      });

      setOrderDetails(response.data);
    } catch (error) {
      console.error("❌ Lỗi khi lấy thông tin đơn hàng:", error);

      // Nếu là 404, có thể đơn hàng đã bị xóa do thanh toán thất bại
      if (error.response?.status === 404) {
        showError(
          "Đơn hàng không tồn tại",
          "Có thể đã bị hủy do thanh toán thất bại"
        );
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Hàm format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " đ";
  };

  // ✅ Hàm hiển thị tên phương thức thanh toán
    const getPaymentMethodDisplay = () => {
    switch (paymentMethod) {
      case "COD":
        return "Thanh toán khi nhận hàng (COD)";
      case "zalopay":
        return "ZaloPay";
      case "momo":
        return "Momo";
      case "vnpay":
        return "VNPAY";
      case "credit-card":
        return "Thẻ tín dụng";
      default:
        return paymentMethod || "Không xác định";
    }
  };

  // ✅ Hàm hiển thị trạng thái đơn hàng
  const getOrderStatus = (status: string) => {
    const statusMap: { [key: string]: { text: string; color: string } } = {
      draft: { text: "Đang tạo", color: "text-gray-500" },
      pending: { text: "Chờ xác nhận", color: "text-yellow-600" },
      confirmed: { text: "Đã xác nhận", color: "text-blue-600" },
      processing: { text: "Đang xử lý", color: "text-purple-600" },
      shipped: { text: "Đang giao", color: "text-orange-600" },
      delivered_success: { text: "Giao thành công", color: "text-green-600" },
      delivered_failed: { text: "Giao thất bại", color: "text-red-600" },
      completed: { text: "Hoàn thành", color: "text-green-600" },
      cancelled: { text: "Đã hủy", color: "text-red-600" },
      refund_requested: { text: "Yêu cầu hoàn tiền", color: "text-orange-600" },
      refunded: { text: "Đã hoàn tiền", color: "text-gray-600" },
      payment_failed: { text: "Thanh toán thất bại", color: "text-red-600" },
    };

    return (
      statusMap[status] || { text: "Không xác định", color: "text-gray-500" }
    );
  };

  // ✅ Hàm hiển thị trạng thái thanh toán
  const getPaymentStatus = (order: any) => {
    if (order.paymentMethod === "COD") {
      return order.isPaid ? "Đã thanh toán COD" : "Chưa thanh toán COD";
    } else {
      if (order.isPaid && order.paymentStatus === "paid") {
        return `Đã thanh toán ${getPaymentMethodDisplay()}`;
      } else if (order.paymentStatus === "failed") {
        return "Thanh toán thất bại";
      } else if (order.paymentStatus === "awaiting_payment") {
        return "Đang xử lý thanh toán";
      } else {
        return "Chưa thanh toán";
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {paymentMethod === "zalopay" && status === "1"
              ? "Đang xử lý thanh toán ZaloPay..."
              : "Đang tải thông tin đơn hàng..."}
          </p>
        </div>
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
              {["zalopay", "momo", "vnpay", "credit-card"].includes(
                paymentMethod || ""
              )
                ? `Thanh toán ${getPaymentMethodDisplay()} đã hoàn tất`
                : "Cảm ơn bạn đã mua sắm tại TechTrend"}
            </p>
          </div>

          {/* Order Details */}
          {orderDetails && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Thông tin đơn hàng
                </h2>
                <p className="text-gray-600">
                  Mã đơn hàng: #{orderDetails._id}
                </p>
              </div>

              <div className="space-y-4">
                {/* Thông tin cơ bản */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Phương thức thanh toán
                    </label>
                    <p className="text-gray-900">{getPaymentMethodDisplay()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Trạng thái đơn hàng
                    </label>
                    <p
                      className={`font-medium ${
                        getOrderStatus(orderDetails.status).color
                      }`}
                    >
                      {getOrderStatus(orderDetails.status).text}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Trạng thái thanh toán
                    </label>
                    <p className="text-gray-900">
                      {getPaymentStatus(orderDetails)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Tổng tiền
                    </label>
                    <p className="text-lg font-semibold text-green-600">
                      {formatPrice(orderDetails.totalPrice)}
                    </p>
                  </div>
                </div>

                {/* Địa chỉ giao hàng */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Địa chỉ giao hàng
                  </label>
                  <div className="mt-1 text-gray-900">
                    <p>{orderDetails.shippingAddress.fullName}</p>
                    <p>{orderDetails.shippingAddress.phone}</p>
                    <p>
                      {orderDetails.shippingAddress.address},{" "}
                      {orderDetails.shippingAddress.city}
                    </p>
                  </div>
                </div>

                {/* Sản phẩm */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Sản phẩm ({orderDetails.orderItems.length} món)
                  </label>
                  <div className="mt-2 space-y-3">
                    {orderDetails.orderItems.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Số lượng: {item.quantity} ×{" "}
                            {formatPrice(item.price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatPrice(item.quantity * item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tổng cộng */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tạm tính:</span>
                      <span>{formatPrice(orderDetails.itemsPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phí vận chuyển:</span>
                      <span>{formatPrice(orderDetails.shippingPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Thuế:</span>
                      <span>{formatPrice(orderDetails.taxPrice)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold border-t pt-2">
                      <span>Tổng cộng:</span>
                      <span className="text-green-600">
                        {formatPrice(orderDetails.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
              <FaTruck className="w-5 h-5 mr-2" />
              Bước tiếp theo
            </h3>
            <div className="space-y-2 text-blue-800">
              {orderDetails?.paymentMethod === "COD" ? (
                <>
                  <p>• Đơn hàng của bạn đang chờ xác nhận từ cửa hàng</p>
                  <p>• Bạn sẽ nhận được thông báo khi đơn hàng được xác nhận</p>
                  <p>• Thanh toán khi nhận hàng tại địa chỉ đã cung cấp</p>
                </>
              ) : (
                <>
                  <p>• Thanh toán đã được xử lý thành công</p>
                  <p>• Đơn hàng của bạn đang chờ xác nhận từ cửa hàng</p>
                  <p>
                    • Bạn sẽ nhận được thông báo khi đơn hàng được xác nhận và
                    giao hàng
                  </p>
                </>
              )}
              <p>• Thời gian giao hàng dự kiến: 2-3 ngày làm việc</p>
              <p>• Bạn có thể theo dõi đơn hàng trong trang Profile</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <button
              onClick={() => navigate("/profile?tab=orders")}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-semibold transition-colors mr-4"
            >
              Xem đơn hàng
            </button>
            <button
              onClick={() => navigate("/")}
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