import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const CheckoutStatus: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("checking");
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 10; // Giới hạn retry 10 lần (30 giây)

  const orderId = searchParams.get("orderId");
  const paymentMethod = searchParams.get("paymentMethod");
  const resultCode = searchParams.get("resultCode");
  const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
  const zp_ResponseCode = searchParams.get("zp_ResponseCode");

  useEffect(() => {
    console.log("🔍 CheckoutStatus mounted with:", {
      orderId,
      paymentMethod,
      resultCode,
      vnp_ResponseCode,
    });

    if (!orderId) {
      console.error("❌ No orderId found");
      navigate("/checkout/failed?error=invalid_order");
      return;
    }

    checkPaymentStatus();
  }, [orderId, paymentMethod, resultCode, vnp_ResponseCode]);

  const checkPaymentStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("❌ No token found");
        navigate("/checkout/failed?error=unauthorized");
        return;
      }

      // Kiểm tra trạng thái đơn hàng từ backend
      const orderResponse = await axios.get(
        `http://localhost:8000/api/order/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("📦 Order status from backend:", orderResponse.data);

      const order = orderResponse.data;

      // Kiểm tra trạng thái thanh toán
      console.log("🔍 Checking order status:", {
        isPaid: order.isPaid,
        paymentStatus: order.paymentStatus,
        status: order.status,
        paymentMethod: order.paymentMethod,
        resultCode,
        vnp_ResponseCode,
        zp_ResponseCode,
      });

      // ✅ ƯU TIÊN 1: URL Parameters (thành công)
      if (
        resultCode === "0" ||
        vnp_ResponseCode === "00" ||
        zp_ResponseCode === "1"
      ) {
        console.log(
          "✅ Payment successful based on URL params, redirecting to success page"
        );
        setStatus("success");
        setTimeout(() => {
          navigate(
            `/checkout/success?orderId=${orderId}&paymentMethod=${
              order.paymentMethod || paymentMethod
            }&resultCode=${resultCode}`
          );
        }, 1000);
      }
      // ❌ ƯU TIÊN 2: URL Parameters (thất bại)
      else if (
        (resultCode && resultCode !== "0") ||
        (vnp_ResponseCode && vnp_ResponseCode !== "00") ||
        (zp_ResponseCode && zp_ResponseCode !== "1")
      ) {
        console.log(
          "❌ Payment failed based on URL params, redirecting to failed page"
        );
        setStatus("failed");
        setTimeout(() => {
          navigate(
            `/checkout/failed?orderId=${orderId}&paymentMethod=${
              order.paymentMethod || paymentMethod
            }&error=payment_failed&resultCode=${resultCode}&amount=${
              order.totalPrice || ""
            }`
          );
        }, 1000);
      }
      // ✅ ƯU TIÊN 3: COD luôn thành công
      else if (
        order.paymentMethod?.toUpperCase() === "COD" ||
        paymentMethod?.toUpperCase() === "COD"
      ) {
        console.log("✅ COD order created, treating as success");
        setStatus("success");
        setTimeout(() => {
          navigate(
            `/checkout/success?orderId=${orderId}&paymentMethod=COD`
          );
        }, 1000);
      }
      // ✅ Backend báo đã thanh toán
      else if (order.isPaid && order.paymentStatus === "paid") {
        console.log(
          "✅ Payment successful from backend status, redirecting to success page"
        );
        setStatus("success");
        setTimeout(() => {
          navigate(
            `/checkout/success?orderId=${orderId}&paymentMethod=${
              order.paymentMethod || paymentMethod
            }`
          );
        }, 1000);
      }
      // ❌ Backend báo thất bại
      else if (
        order.paymentStatus === "failed" ||
        order.status === "cancelled"
      ) {
        console.log(
          "❌ Payment failed from backend status, redirecting to failed page"
        );
        setStatus("failed");
        setTimeout(() => {
          navigate(
            `/checkout/failed?orderId=${orderId}&paymentMethod=${
              order.paymentMethod || paymentMethod
            }&error=payment_failed&amount=${order.totalPrice || ""}`
          );
        }, 1000);
      }
      // ⏳ Chưa rõ trạng thái → retry
      else {
        if (retryCount >= MAX_RETRIES) {
          console.log("❌ Max retries reached, redirecting to failed page");
          setStatus("failed");
          setTimeout(() => {
            navigate(
              `/checkout/failed?orderId=${orderId}&paymentMethod=${
                order.paymentMethod || paymentMethod
              }&error=timeout&amount=${order.totalPrice || ""}`
            );
          }, 1000);
        } else {
          console.log(
            `⏳ Payment pending, retrying in 3 seconds... (${
              retryCount + 1
            }/${MAX_RETRIES})`
          );
          setRetryCount((prev) => prev + 1);
          setTimeout(() => {
            checkPaymentStatus();
          }, 3000);
        }
      }
    } catch (error) {
      console.error("❌ Error checking payment status:", error);

      // Fallback: dựa vào URL parameters
      if (
        resultCode === "0" ||
        vnp_ResponseCode === "00" ||
        zp_ResponseCode === "1"
      ) {
        setStatus("success");
        setTimeout(() => {
          navigate(
            `/checkout/success?orderId=${orderId}&paymentMethod=${paymentMethod}`
          );
        }, 1000);
      } else {
        setStatus("failed");
        setTimeout(() => {
          navigate(
            `/checkout/failed?orderId=${orderId}&paymentMethod=${paymentMethod}&error=payment_failed`
          );
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "checking":
        return "Đang kiểm tra trạng thái thanh toán...";
      case "success":
        return "Thanh toán thành công! Đang chuyển hướng...";
      case "failed":
        return "Thanh toán thất bại! Đang chuyển hướng...";
      default:
        return "Đang xử lý...";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "checking":
        return "🔄";
      case "success":
        return "✅";
      case "failed":
        return "❌";
      default:
        return "⏳";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        {/* Loading Animation */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
            <span className="text-4xl">
              {loading ? "🔄" : getStatusIcon()}
            </span>
          </div>
          {loading && (
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          )}
        </div>

        {/* Status Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {getStatusMessage()}
        </h1>

        {/* Order Info */}
        {orderId && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Mã đơn hàng:</p>
            <p className="font-mono text-lg font-semibold text-gray-900">
              {orderId}
            </p>
            {paymentMethod && (
              <p className="text-sm text-gray-500 mt-2">
                Phương thức: {paymentMethod.toUpperCase()}
              </p>
            )}
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${
              status === "checking"
                ? "bg-blue-600 w-1/3"
                : status === "success"
                ? "bg-green-600 w-full"
                : status === "failed"
                ? "bg-red-600 w-full"
                : "bg-blue-600 w-1/2"
            }`}
          ></div>
        </div>

        {/* Additional Info */}
        <div className="text-sm text-gray-500">
          {status === "checking" && <p>Vui lòng đợi trong giây lát...</p>}
          {status === "success" && <p>Chuyển hướng đến trang thành công</p>}
          {status === "failed" && <p>Chuyển hướng đến trang thất bại</p>}
        </div>
      </div>
    </div>
  );
};

export default CheckoutStatus;
