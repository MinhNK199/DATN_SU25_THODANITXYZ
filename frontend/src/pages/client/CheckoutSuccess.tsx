import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { FaCheckCircle, FaTruck, FaHome } from "react-icons/fa";
import { useModernNotification } from "../../components/client/ModernNotification";
import { useCart } from "../../contexts/CartContext";
import axios from "axios";
import PaymentStatusModal from "../../components/client/PaymentStatusModal";
import CartUpdateNotification from "../../components/client/CartUpdateNotification";


const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showOrderSuccess } = useModernNotification();
  const { removeOrderedItemsFromCart } = useCart();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'failed' | 'unknown'>('processing');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCartNotification, setShowCartNotification] = useState(false);


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

<<<<<<< HEAD
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
=======
            showOrderSuccess(
              orderId,
>>>>>>> f02c39049ad512ebf3b7dfa5f69c0d7abaf47e53
              `Đơn hàng ${orderId} đã được thanh toán và sẽ được giao trong 2-3 ngày.`
            );

            // ✅ Xóa sản phẩm đã đặt khỏi giỏ hàng
            const pendingOrder = localStorage.getItem("pendingOrder");
            if (pendingOrder) {
              const orderData = JSON.parse(pendingOrder);
              if (orderData.orderItems) {
                await handleRemoveFromCart(orderData.orderItems);
              }
              localStorage.removeItem("pendingOrder");
            }

            // ✅ Đợi callback rồi fetch data một lần
            setTimeout(async () => {
              await fetchOrderDetails();
            }, 2000); // Đợi 2 giây cho callback xử lý

          } else {
<<<<<<< HEAD
                         // ❌ Thanh toán Momo thất bại
             await axios.delete(`/api/order/${orderId}`, {
               headers: { Authorization: `Bearer ${token}` },
             });
            showError("Thanh toán Momo thất bại", "Đơn hàng đã bị hủy");
            navigate("/checkout?error=payment_cancelled");
=======
            // ❌ Thanh toán ZaloPay thất bại
            await axios.delete(`http://localhost:8000/api/order/${orderId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            // Chuyển hướng đến trang thất bại
            navigate(`/checkout/failed?orderId=${orderId}&paymentMethod=zalopay&error=payment_cancelled&amount=${orderDetails?.totalPrice || ''}`);
>>>>>>> f02c39049ad512ebf3b7dfa5f69c0d7abaf47e53
            return;
            return;
          }
                } else if (paymentMethod === "momo") {
          // ✅ Ưu tiên kiểm tra URL params trước
          const resultCode = searchParams.get("resultCode");
          console.log("🔍 MoMo resultCode from URL:", resultCode);
          
          if (resultCode === "0") {
            // ✅ Thanh toán thành công dựa trên URL params - KHÔNG cần kiểm tra backend
            console.log("✅ MoMo payment successful based on URL params - proceeding with success flow");
            showOrderSuccess(
              orderId,
              `Đơn hàng ${orderId} đã được thanh toán và sẽ được giao trong 2-3 ngày.`
            );
            
            // ✅ Xóa sản phẩm khỏi giỏ hàng
            const pendingOrder = localStorage.getItem("pendingOrder");
            if (pendingOrder) {
              const orderData = JSON.parse(pendingOrder);
              if (orderData.orderItems) {
                await handleRemoveFromCart(orderData.orderItems);
              }
              localStorage.removeItem("pendingOrder");
            }
            
            // ✅ Đợi webhook xử lý rồi fetch order details
            setTimeout(async () => {
              await fetchOrderDetails();
            }, 3000); // Đợi 3 giây cho webhook xử lý
          } else {
            // ⏳ Kiểm tra backend nếu không có resultCode hoặc resultCode khác 0
            console.log("🔄 Checking MoMo payment status from backend...");
            
            try {
              // Kiểm tra trạng thái từ backend
              const statusResponse = await axios.get(`http://localhost:8000/api/payment/momo/status/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              console.log("📦 MoMo payment status response:", statusResponse.data);
              
              // ✅ Kiểm tra cả trạng thái thanh toán và trạng thái đơn hàng
              if (statusResponse.data.isPaid && statusResponse.data.paymentStatus === 'paid') {
                // ✅ Thanh toán thành công
                showOrderSuccess(
                  orderId,
                  `Đơn hàng ${orderId} đã được thanh toán và sẽ được giao trong 2-3 ngày.`
                );

                // ✅ Xóa sản phẩm khỏi giỏ hàng
                const pendingOrder = localStorage.getItem("pendingOrder");
                if (pendingOrder) {
                  const orderData = JSON.parse(pendingOrder);
                  if (orderData.orderItems) {
                    await handleRemoveFromCart(orderData.orderItems);
                  }
                  localStorage.removeItem("pendingOrder");
                }
                
                await fetchOrderDetails();
              } else if (statusResponse.data.paymentStatus === 'failed' || statusResponse.data.status === 'cancelled') {
                // ❌ Thanh toán thất bại hoặc bị hủy
                console.log("❌ MoMo payment failed or cancelled:", statusResponse.data);
                
                // Xóa đơn hàng thất bại
                try {
                  await axios.delete(`http://localhost:8000/api/order/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                } catch (deleteError) {
                  console.log("⚠️ Order already deleted or not found");
                }
                
                // Chuyển hướng đến trang thất bại
                navigate(`/checkout/failed?orderId=${orderId}&paymentMethod=momo&error=payment_cancelled&amount=${orderDetails?.totalPrice || ''}`);
                return;
              } else {
                // ⏳ Đang chờ xử lý - đợi thêm và kiểm tra lại (chỉ 1 lần)
                console.log("⏳ MoMo payment pending, retrying once...");
                
                setTimeout(async () => {
                  try {
                    const retryResponse = await axios.get(`http://localhost:8000/api/payment/momo/status/${orderId}`, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (retryResponse.data.isPaid && retryResponse.data.paymentStatus === 'paid') {
                      showOrderSuccess(
                        orderId,
                        `Đơn hàng ${orderId} đã được thanh toán và sẽ được giao trong 2-3 ngày.`
                      );
                      
                      const pendingOrder = localStorage.getItem("pendingOrder");
                      if (pendingOrder) {
                        const orderData = JSON.parse(pendingOrder);
                        if (orderData.orderItems) {
                          await handleRemoveFromCart(orderData.orderItems);
                        }
                        localStorage.removeItem("pendingOrder");
                      }
                      
                      await fetchOrderDetails();
                    } else {
                      // Xóa đơn hàng thất bại
                      try {
                        await axios.delete(`http://localhost:8000/api/order/${orderId}`, {
                          headers: { Authorization: `Bearer ${token}` },
                        });
                      } catch (deleteError) {
                        console.log("⚠️ Order already deleted or not found");
                      }
                      // Chuyển hướng đến trang thất bại
                      navigate(`/checkout/failed?orderId=${orderId}&paymentMethod=momo&error=payment_cancelled&amount=${orderDetails?.totalPrice || ''}`);
                      return;
                    }
                  } catch (retryError) {
                    console.error("❌ Error retrying MoMo status check:", retryError);
                    try {
                      await axios.delete(`http://localhost:8000/api/order/${orderId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                    } catch (deleteError) {
                      console.log("⚠️ Order already deleted or not found");
                    }
                    // Chuyển hướng đến trang thất bại
                    navigate(`/checkout/failed?orderId=${orderId}&paymentMethod=momo&error=payment_cancelled&amount=${orderDetails?.totalPrice || ''}`);
                    return;
                  }
                }, 3000);
              }
            } catch (statusError) {
              console.error("❌ Error checking MoMo payment status:", statusError);
              
              // Nếu không thể kiểm tra backend, dựa vào URL parameters
              if (resultCode === "0") {
                // Có resultCode = 0 -> thành công
                showOrderSuccess(
                  orderId,
                  `Đơn hàng ${orderId} đã được thanh toán và sẽ được giao trong 2-3 ngày.`
                );
                
                const pendingOrder = localStorage.getItem("pendingOrder");
                if (pendingOrder) {
                  const orderData = JSON.parse(pendingOrder);
                  if (orderData.orderItems) {
                    await handleRemoveFromCart(orderData.orderItems);
                  }
                  localStorage.removeItem("pendingOrder");
                }
                
                setTimeout(async () => {
                  await fetchOrderDetails();
                }, 3000);
              } else if (resultCode && resultCode !== "0") {
                // Có resultCode nhưng không phải 0 -> thất bại
                try {
                  await axios.delete(`http://localhost:8000/api/order/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                } catch (deleteError) {
                  console.log("⚠️ Order already deleted or not found");
                }
                navigate(`/checkout/failed?orderId=${orderId}&paymentMethod=momo&error=payment_cancelled&amount=${orderDetails?.totalPrice || ''}`);
                return;
              } else {
                // Không có resultCode -> chuyển về trang thất bại
                try {
                  await axios.delete(`http://localhost:8000/api/order/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                } catch (deleteError) {
                  console.log("⚠️ Order already deleted or not found");
                }
                navigate(`/checkout/failed?orderId=${orderId}&paymentMethod=momo&error=payment_cancelled&amount=${orderDetails?.totalPrice || ''}`);
                return;
              }
            }
          }
        } else if (paymentMethod === "zalopay") {
          // ✅ Ưu tiên kiểm tra URL params trước
          const zp_ResponseCode = searchParams.get("zp_ResponseCode");
          console.log("🔍 ZaloPay zp_ResponseCode from URL:", zp_ResponseCode);
          
          if (zp_ResponseCode === "1") {
            // ✅ Thanh toán thành công dựa trên URL params
            console.log("✅ ZaloPay payment successful based on URL params");
            showOrderSuccess(
              orderId,
              `Đơn hàng ${orderId} đã được thanh toán và sẽ được giao trong 2-3 ngày.`
            );
            
            const pendingOrder = localStorage.getItem("pendingOrder");
            if (pendingOrder) {
              const orderData = JSON.parse(pendingOrder);
              if (orderData.orderItems) {
                await handleRemoveFromCart(orderData.orderItems);
              }
              localStorage.removeItem("pendingOrder");
            }
            
            await fetchOrderDetails();
          } else {
            // ⏳ Kiểm tra backend nếu không có zp_ResponseCode hoặc khác 1
            console.log("🔄 Checking ZaloPay payment status from backend...");
            
            try {
              // Kiểm tra trạng thái từ backend
              const statusResponse = await axios.get(`http://localhost:8000/api/order/zalo-pay/status/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              console.log("📦 ZaloPay payment status response:", statusResponse.data);
              
              if (statusResponse.data.synced && statusResponse.data.isPaid) {
                // ✅ Thanh toán thành công từ backend
                showOrderSuccess(
                  orderId,
                  `Đơn hàng ${orderId} đã được thanh toán và sẽ được giao trong 2-3 ngày.`
                );
                
                const pendingOrder = localStorage.getItem("pendingOrder");
                if (pendingOrder) {
                  const orderData = JSON.parse(pendingOrder);
                  if (orderData.orderItems) {
                    await handleRemoveFromCart(orderData.orderItems);
                  }
                  localStorage.removeItem("pendingOrder");
                }
                
                await fetchOrderDetails();
              } else {
                // ❌ Thanh toán thất bại
                console.log("❌ ZaloPay payment failed");
                
                try {
                  await axios.delete(`http://localhost:8000/api/order/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                } catch (deleteError) {
                  console.log("⚠️ Order already deleted or not found");
                }
                
                // Chuyển hướng đến trang thất bại
                navigate(`/checkout/failed?orderId=${orderId}&paymentMethod=zalopay&error=payment_cancelled&amount=${orderDetails?.totalPrice || ''}`);
                return;
              }
            } catch (statusError) {
              console.error("❌ Error checking ZaloPay payment status:", statusError);
              
              // Nếu không kiểm tra được, dựa vào URL parameters
              if (zp_ResponseCode === "1") {
                showOrderSuccess(
                  orderId,
                  `Đơn hàng ${orderId} đã được thanh toán và sẽ được giao trong 2-3 ngày.`
                );
                
                const pendingOrder = localStorage.getItem("pendingOrder");
                if (pendingOrder) {
                  const orderData = JSON.parse(pendingOrder);
                  if (orderData.orderItems) {
                    await handleRemoveFromCart(orderData.orderItems);
                  }
                  localStorage.removeItem("pendingOrder");
                }
                
                setTimeout(async () => {
                  await fetchOrderDetails();
                }, 2000);
              } else {
                // ❌ Thanh toán thất bại
                try {
                  await axios.delete(`http://localhost:8000/api/order/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                } catch (deleteError) {
                  console.log("⚠️ Order already deleted or not found");
                }
                // Chuyển hướng đến trang thất bại
                navigate(`/checkout/failed?orderId=${orderId}&paymentMethod=zalopay&error=payment_cancelled&amount=${orderDetails?.totalPrice || ''}`);
                return;
              }
            }
          }
        } else if (paymentMethod === "vnpay") {
          // ✅ Ưu tiên kiểm tra URL params trước
          const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
          console.log("🔍 VNPay vnp_ResponseCode from URL:", vnp_ResponseCode);
          
          if (vnp_ResponseCode === "00") {
            // ✅ Thanh toán thành công dựa trên URL params
            console.log("✅ VNPay payment successful based on URL params");
            showOrderSuccess(
              orderId,
              `Đơn hàng ${orderId} đã được thanh toán và sẽ được giao trong 2-3 ngày.`
            );
            
            const pendingOrder = localStorage.getItem("pendingOrder");
            if (pendingOrder) {
              const orderData = JSON.parse(pendingOrder);
              if (orderData.orderItems) {
                await handleRemoveFromCart(orderData.orderItems);
              }
              localStorage.removeItem("pendingOrder");
            }
            
            await fetchOrderDetails();
          } else {
<<<<<<< HEAD
                         // ❌ Thanh toán VNPAY thất bại
             await axios.delete(`/api/order/${orderId}`, {
               headers: { Authorization: `Bearer ${token}` },
             });
            showError("Thanh toán VNPAY thất bại", "Đơn hàng đã bị hủy");
            navigate("/checkout?error=payment_cancelled");
            return;
=======
            // ⏳ Kiểm tra backend nếu không có vnp_ResponseCode hoặc khác 00
            console.log("🔄 Checking VNPay payment status from backend...");
            
            try {
              // Kiểm tra trạng thái từ backend
              const statusResponse = await axios.get(`http://localhost:8000/api/payment/vnpay/status/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              console.log("📦 VNPay payment status response:", statusResponse.data);
              
              if (statusResponse.data.synced && statusResponse.data.isPaid) {
                // ✅ Thanh toán thành công từ backend
                showOrderSuccess(
                  orderId,
                  `Đơn hàng ${orderId} đã được thanh toán và sẽ được giao trong 2-3 ngày.`
                );
                
                const pendingOrder = localStorage.getItem("pendingOrder");
                if (pendingOrder) {
                  const orderData = JSON.parse(pendingOrder);
                  if (orderData.orderItems) {
                    await handleRemoveFromCart(orderData.orderItems);
                  }
                  localStorage.removeItem("pendingOrder");
                }
                
                await fetchOrderDetails();
              } else {
                // ❌ Thanh toán thất bại
                console.log("❌ VNPay payment failed");
                
                try {
                  await axios.delete(`http://localhost:8000/api/order/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                } catch (deleteError) {
                  console.log("⚠️ Order already deleted or not found");
                }
                
                // Chuyển hướng đến trang thất bại
                navigate(`/checkout/failed?orderId=${orderId}&paymentMethod=vnpay&error=payment_cancelled&amount=${orderDetails?.totalPrice || ''}`);
                return;
              }
            } catch (statusError) {
              console.error("❌ Error checking VNPay payment status:", statusError);
              
              // Nếu không kiểm tra được, dựa vào URL parameters
              if (vnp_ResponseCode === "00") {
                showOrderSuccess(
                  orderId,
                  `Đơn hàng ${orderId} đã được thanh toán và sẽ được giao trong 2-3 ngày.`
                );
                
                const pendingOrder = localStorage.getItem("pendingOrder");
                if (pendingOrder) {
                  const orderData = JSON.parse(pendingOrder);
                  if (orderData.orderItems) {
                    await handleRemoveFromCart(orderData.orderItems);
                  }
                  localStorage.removeItem("pendingOrder");
                }
                
                setTimeout(async () => {
                  await fetchOrderDetails();
                }, 2000);
              } else {
                // ❌ Thanh toán thất bại
                try {
                  await axios.delete(`http://localhost:8000/api/order/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                } catch (deleteError) {
                  console.log("⚠️ Order already deleted or not found");
                }
                // Chuyển hướng đến trang thất bại
                navigate(`/checkout/failed?orderId=${orderId}&paymentMethod=vnpay&error=payment_cancelled&amount=${orderDetails?.totalPrice || ''}`);
                return;
              }
            }
>>>>>>> f02c39049ad512ebf3b7dfa5f69c0d7abaf47e53
          }
        } else if (paymentMethod === "credit-card") {
          // Credit Card - Hiển thị thành công (giả lập)
          showOrderSuccess(
            orderId,
            `Đơn hàng ${orderId} đã được thanh toán và sẽ được giao trong 2-3 ngày.`
          );
          
          // ✅ Xóa sản phẩm khỏi giỏ hàng
          const pendingOrder = localStorage.getItem("pendingOrder");
          if (pendingOrder) {
            const orderData = JSON.parse(pendingOrder);
            if (orderData.orderItems) {
              await handleRemoveFromCart(orderData.orderItems);
            }
            localStorage.removeItem("pendingOrder");
          }
          
          await fetchOrderDetails();
        } else if (paymentMethod === "bank-transfer") {
          // Bank Transfer - Hiển thị chờ xác nhận
          showOrderSuccess(
            orderId,
            `Đơn hàng ${orderId} đã được tạo. Vui lòng chờ xác nhận chuyển khoản.`
          );
          
          // ✅ Xóa sản phẩm khỏi giỏ hàng
          const pendingOrder = localStorage.getItem("pendingOrder");
          if (pendingOrder) {
            const orderData = JSON.parse(pendingOrder);
            if (orderData.orderItems) {
              await handleRemoveFromCart(orderData.orderItems);
            }
            localStorage.removeItem("pendingOrder");
          }
          
          await fetchOrderDetails();
        } else if (paymentMethod === "COD") {
          // COD - Hiển thị thành công ngay
          showOrderSuccess(
            orderId,
            `Đơn hàng ${orderId} đã được tạo và sẽ được giao trong 2-3 ngày.`
          );
          
          // ✅ Xóa sản phẩm khỏi giỏ hàng
          const pendingOrder = localStorage.getItem("pendingOrder");
          if (pendingOrder) {
            const orderData = JSON.parse(pendingOrder);
            if (orderData.orderItems) {
              await handleRemoveFromCart(orderData.orderItems);
            }
            localStorage.removeItem("pendingOrder");
          }
          
          await fetchOrderDetails();
        } else {
          // ✅ Phương thức khác - lấy thông tin đơn hàng
          await fetchOrderDetails();
        }
      } catch (error) {
        console.error("Lỗi xử lý kết quả thanh toán:", error);
        // Chuyển hướng đến trang thất bại
        navigate(`/checkout/failed?orderId=${orderId}&error=payment_error&amount=${orderDetails?.totalPrice || ''}`);
        return;
      }
    };

    handlePaymentResult();
  }, [
    orderId,
    paymentMethod,
    status,
    searchParams,
    navigate,
  ]);

  // ✅ Force refresh profile data khi order được cập nhật
  useEffect(() => {
    if (orderDetails) {
      console.log("🔔 Order details updated:", {
        status: orderDetails.status,
        isPaid: orderDetails.isPaid,
        paymentStatus: orderDetails.paymentStatus
      });
      
      if (orderDetails.isPaid && orderDetails.paymentStatus === "paid") {
        // Gửi event để profile component refresh
        window.dispatchEvent(new CustomEvent('orderUpdated'));
        console.log("🔔 Dispatched orderUpdated event for profile refresh");
        
        // ✅ Gửi thêm event để refresh cart
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        console.log("🔔 Dispatched cartUpdated event");
      }
    }
  }, [orderDetails]);

  // ✅ Sử dụng removeOrderedItemsFromCart từ CartContext

  // ✅ Helper function để xóa khỏi giỏ hàng và hiển thị thông báo
  const handleRemoveFromCart = async (orderItems: any[]) => {
    try {
<<<<<<< HEAD
      const token = localStorage.getItem("token");
      const productIds = orderItems.map((item) => item.product);

             await axios.post(
         `/api/cart/remove-multiple`,
         { productIds },
         { headers: { Authorization: `Bearer ${token}` } }
       );

      console.log("✅ Đã xóa sản phẩm khỏi giỏ hàng sau thanh toán thành công");
=======
      await handleRemoveFromCart(orderItems);
      setShowCartNotification(true);
>>>>>>> f02c39049ad512ebf3b7dfa5f69c0d7abaf47e53
    } catch (error) {
      console.error("Lỗi xóa khỏi giỏ hàng:", error);
    }
  };

  // ✅ Lấy thông tin đơn hàng với retry logic
  const fetchOrderDetails = async (retryCount = 0) => {
    try {
      const token = localStorage.getItem("token");
      console.log(`🔄 Fetching order details for: ${orderId} (attempt ${retryCount + 1})`);

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
      
      // ✅ Kiểm tra nếu order chưa được cập nhật đúng và retry
      if (response.data.status === 'draft' && response.data.paymentStatus === 'awaiting_payment' && retryCount < 3) {
        console.log("⚠️ Order chưa được cập nhật, retrying in 2 seconds...");
        setTimeout(() => fetchOrderDetails(retryCount + 1), 2000);
        return;
      }
      
    } catch (error) {
      console.error("❌ Lỗi khi lấy thông tin đơn hàng:", error);

      // Nếu là 404, có thể đơn hàng đã bị xóa do thanh toán thất bại
      if (error.response?.status === 404) {
        // Chuyển hướng đến trang thất bại
        navigate(`/checkout/failed?orderId=${orderId || ''}&error=payment_error&amount=${orderDetails?.totalPrice || ''}`);
        return;
      } else if (retryCount < 3) {
        // Retry nếu có lỗi network
        console.log("⚠️ Network error, retrying in 2 seconds...");
        setTimeout(() => fetchOrderDetails(retryCount + 1), 2000);
        return;
      }
    } finally {
      if (retryCount === 0) {
        setLoading(false);
      }
    }
  };

  // ✅ Hàm format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " đ";
  };

  // ✅ Hàm hiển thị tên phương thức thanh toán
<<<<<<< HEAD
    const getPaymentMethodDisplay = () => {
    switch (paymentMethod) {
=======
  const getPaymentMethodDisplay = () => {
    const method = orderDetails?.paymentMethod || paymentMethod;
    switch (method) {
>>>>>>> f02c39049ad512ebf3b7dfa5f69c0d7abaf47e53
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
<<<<<<< HEAD
=======
      case "bank-transfer":
        return "Chuyển khoản ngân hàng";
      case "e-wallet":
        return "Ví điện tử";
>>>>>>> f02c39049ad512ebf3b7dfa5f69c0d7abaf47e53
      default:
        return method || "Không xác định";
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
    if (!order) return "Không xác định";
    
    if (order.paymentMethod === "COD") {
      return order.isPaid ? "Đã thanh toán COD" : "Chưa thanh toán COD";
    } else {
      if (order.isPaid && order.paymentStatus === "paid") {
        return `Đã thanh toán ${getPaymentMethodDisplay()}`;
      } else if (order.paymentStatus === "failed") {
        return "Thanh toán thất bại";
      } else if (order.paymentStatus === "awaiting_payment") {
        return "Chưa thanh toán";
      } else if (order.paymentStatus === "pending") {
        return "Chưa thanh toán";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Left Column */}
            <div className="lg:col-span-2">
              {/* Success Header */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <FaCheckCircle className="w-14 h-14 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  Đặt hàng thành công!
                </h1>
                <p className="text-lg text-gray-600 mb-2">
                  {["zalopay", "momo", "vnpay", "credit-card"].includes(
                    paymentMethod || ""
                  )
                    ? `Thanh toán ${getPaymentMethodDisplay()} đã hoàn tất`
                    : "Cảm ơn bạn đã mua sắm tại TechTrend"}
                </p>
                <p className="text-sm text-gray-500">
                  Mã đơn hàng: #{orderDetails?._id || orderId}
                </p>
              </div>

              {/* Order Details */}
              {orderDetails && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Thông tin đơn hàng
                    </h2>
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
                            className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg shadow-sm"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-lg">
                                {item.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                Số lượng: {item.quantity} ×{" "}
                                {formatPrice(item.price)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 text-lg">
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
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  <FaTruck className="w-5 h-5 mr-2" />
                  Bước tiếp theo
                </h3>
                <div className="space-y-3 text-blue-800">
                  {orderDetails?.paymentMethod === "COD" ? (
                    <>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Đơn hàng của bạn đang chờ xác nhận từ cửa hàng</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Bạn sẽ nhận được thông báo khi đơn hàng được xác nhận</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Thanh toán khi nhận hàng tại địa chỉ đã cung cấp</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Thanh toán đã được xử lý thành công</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Đơn hàng của bạn đang chờ xác nhận từ cửa hàng</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Bạn sẽ nhận được thông báo khi đơn hàng được xác nhận và giao hàng</p>
                      </div>
                    </>
                  )}
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Thời gian giao hàng dự kiến: <strong>2-3 ngày làm việc</strong></p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Bạn có thể theo dõi đơn hàng trong trang <strong>Profile</strong></p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="text-center space-y-4">
                <button
                  onClick={() => navigate("/profile?tab=orders")}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-10 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 mr-4"
                >
                  Xem đơn hàng
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-4 px-10 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <FaHome className="w-4 h-4 inline mr-2" />
                  Về trang chủ
                </button>
              </div>
            </div>

            {/* Sidebar - Right Column */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Order Summary Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Tóm tắt đơn hàng
                  </h3>
                  
                  {orderDetails && (
                    <div className="space-y-4">
                      {/* Order Status */}
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-800">Trạng thái</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            getOrderStatus(orderDetails.status).color === 'text-green-600' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {getOrderStatus(orderDetails.status).text}
                          </span>
                        </div>
                      </div>

                      {/* Payment Status */}
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-800">Thanh toán</span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getPaymentStatus(orderDetails)}
                          </span>
                        </div>
                      </div>

                      {/* Total Amount */}
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">Tổng tiền</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatPrice(orderDetails.totalPrice)}
                          </p>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="space-y-2">
                        <button
                          onClick={() => navigate("/profile?tab=orders")}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors text-sm"
                        >
                          Xem chi tiết đơn hàng
                        </button>
                        <button
                          onClick={() => navigate("/")}
                          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors text-sm"
                        >
                          Tiếp tục mua sắm
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Customer Support Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">
                    Cần hỗ trợ?
                  </h3>
                  <div className="space-y-3 text-sm text-blue-800">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Hotline: <strong>+84 123 456 789</strong></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Email: <strong>support@techtrend.vn</strong></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Hỗ trợ 24/7</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Info Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaTruck className="w-5 h-5 mr-2 text-blue-600" />
                    Thông tin giao hàng
                  </h3>
                  {orderDetails && (
                    <div className="space-y-3 text-sm text-gray-600">
                      <div>
                        <p className="font-medium text-gray-900">{orderDetails.shippingAddress.fullName}</p>
                        <p>{orderDetails.shippingAddress.phone}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-700">
                          {orderDetails.shippingAddress.address}
                        </p>
                        <p className="text-gray-700">
                          {orderDetails.shippingAddress.city}
                        </p>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-green-800 font-medium">Dự kiến: 2-3 ngày</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        
      {/* Payment Status Modal */}
      <PaymentStatusModal
        isOpen={showPaymentModal}
        status={paymentStatus}
        title={
          paymentStatus === 'processing' ? 'Đang kiểm tra thanh toán...' :
          paymentStatus === 'success' ? 'Thanh toán thành công!' :
          paymentStatus === 'failed' ? 'Thanh toán thất bại' :
          'Không thể xác nhận thanh toán'
        }
        message={
          paymentStatus === 'processing' ? 'Vui lòng đợi trong khi chúng tôi xác nhận trạng thái thanh toán của bạn.' :
          paymentStatus === 'success' ? 'Giao dịch đã được xử lý thành công. Đơn hàng của bạn sẽ được giao trong 2-3 ngày.' :
          paymentStatus === 'failed' ? 'Giao dịch không thành công. Đơn hàng sẽ được hủy và bạn có thể thử lại.' :
          'Không thể xác nhận trạng thái thanh toán. Đơn hàng sẽ được hủy để đảm bảo an toàn.'
        }
        onClose={() => setShowPaymentModal(false)}
      />
      
      {/* Cart Update Notification */}
      <CartUpdateNotification
        isVisible={showCartNotification}
        onClose={() => setShowCartNotification(false)}
      />
      
      
    </div>
  );
};

export default CheckoutSuccess;
