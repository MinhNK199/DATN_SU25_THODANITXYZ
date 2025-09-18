import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaCheck, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useCart } from "../../contexts/CartContext";
import { useCheckout } from "../../contexts/CheckoutContext";
import { useToast } from "../../components/client/ToastContainer";
import axios from "axios";
import { createOrder, createMomoPayment } from "../../services/orderApi";
import { getTaxConfig } from "../../services/cartApi";
import { getAvailableCoupons, getUsedCoupons, applyCoupon, removeCoupon } from "../../services/couponApi";
import { Coupon } from "../../interfaces/Coupon";
import { Modal, Button, Input } from "antd";
import { calculateDisplayPrice } from "../../utils/priceUtils";
import ScrollToTop from "../../components/ScrollToTop";
import CheckoutReview from "./CheckoutReview";

const CheckoutReviewPage: React.FC = () => {
  const [formData, setFormData] = useState({
    lastName: "",
    phone: "",
    address: "",
    province_code: "",
    ward_code: "",
    paymentMethod: "",
  });
  const [cardInfo, setCardInfo] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [walletInfo, setWalletInfo] = useState({ type: "", phone: "" });
  const [bankTransferInfo, setBankTransferInfo] = useState({
    transactionId: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [taxRate, setTaxRate] = useState(0.08);
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState<boolean>(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [appliedDiscountCoupon, setAppliedDiscountCoupon] = useState<any>(null);
  
  // Coupon states
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [isCouponModalVisible, setIsCouponModalVisible] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  const { state: cartState, removeOrderedItemsFromCart } = useCart();
  const { voucher } = useCheckout();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const location = useLocation();

  // Load coupons function
  const loadCoupons = useCallback(async () => {
    try {
      setLoadingCoupons(true);
      console.log('🔄 Loading coupons for checkout...');

      const [availableResponse, usedResponse] = await Promise.all([
        getAvailableCoupons(),
        getUsedCoupons()
      ]);

      console.log('✅ Available coupons response:', availableResponse);
      setAvailableCoupons(availableResponse.coupons || []);
    } catch (error: any) {
      console.error('❌ Error loading coupons:', error);
      setAvailableCoupons([]);
    } finally {
      setLoadingCoupons(false);
    }
  }, []);

  // Load coupons on component mount
  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  // Coupon handlers
  const handleApplyDiscountCoupon = async (couponId: string) => {
    console.log('🔍 handleApplyDiscountCoupon called with couponId:', couponId);

    if (!couponId) {
      console.log('❌ No couponId provided, setting appliedDiscountCoupon to null');
      setAppliedDiscountCoupon(null);
      return;
    }

    try {
      console.log('🔍 Looking for coupon in availableCoupons:', availableCoupons.length, 'coupons available');
      const coupon = availableCoupons.find(c => c._id === couponId);
      console.log('🔍 Found coupon:', coupon);

      if (!coupon) {
        console.log('❌ Coupon not found in availableCoupons');
        showError("Mã giảm giá không tồn tại");
        return;
      }

      const selectedSubtotal = selectedCartItems
        .reduce((sum, item) => sum + (calculateDisplayPrice(item) * item.quantity), 0);

      console.log('🔍 Selected subtotal:', selectedSubtotal);

      const minAmount = coupon.minAmount || coupon.minOrderValue || 0;
      console.log('🔍 Min amount check:', selectedSubtotal, 'vs', minAmount);

      if (selectedSubtotal < minAmount) {
        console.log('❌ Subtotal too low:', selectedSubtotal, 'min required:', minAmount);
        showError(`Đơn hàng tối thiểu ${formatPrice(minAmount)} để sử dụng mã này`);
        return;
      }

      // Set applied coupon directly
      console.log('✅ Setting appliedDiscountCoupon to:', coupon);
      setAppliedDiscountCoupon(coupon);
      showSuccess(`Đã áp dụng mã giảm giá "${coupon.name}"`);
    } catch (error) {
      console.log('❌ Error in handleApplyDiscountCoupon:', error);
      showError("Có lỗi xảy ra khi áp dụng mã giảm giá");
    }
  };

  const handleRemoveDiscountCoupon = async () => {
    if (appliedDiscountCoupon) {
      try {
        setAppliedDiscountCoupon(null);
        showSuccess("Đã hủy áp dụng mã giảm giá");
      } catch {
        showError("Có lỗi xảy ra khi hủy mã giảm giá");
      }
    }
  };

  // Khởi tạo selectedItems và buyNowProduct
  useEffect(() => {
    const buyNowProductData = localStorage.getItem('buyNowProduct');
    if (buyNowProductData) {
      try {
        const product = JSON.parse(buyNowProductData);
        console.log('🔍 [DEBUG] buyNowProduct from localStorage:', product);
        
        // Check if product ID exists in current products
        if (product.product && product.product._id) {
          console.log('🔍 [DEBUG] Product ID from buyNowProduct:', product.product._id);
          setSelectedItems(new Set([product._id]));
        } else {
          console.log('❌ [DEBUG] Invalid buyNowProduct structure, clearing localStorage');
          localStorage.removeItem('buyNowProduct');
        }
      } catch (error) {
        console.error('❌ Error parsing buyNowProduct:', error);
        localStorage.removeItem('buyNowProduct');
      }
    } else if (cartState.items && cartState.items.length > 0) {
      const allItemIds = new Set(cartState.items.map(item => item._id));
      setSelectedItems(allItemIds);
    }
  }, [cartState.items]);

  // Nhận appliedDiscountCoupon từ state
  useEffect(() => {
    if (location.state?.appliedDiscountCoupon) {
      setAppliedDiscountCoupon(location.state.appliedDiscountCoupon);
    }
  }, [location.state]);

  // Lấy buyNowProduct để sử dụng trong useEffect
  const buyNowProduct = useMemo(() => {
    try {
      const buyNowData = localStorage.getItem('buyNowProduct');
      if (buyNowData) {
        const product = JSON.parse(buyNowData);
        return product;
      }
    } catch (error) {
      console.error('❌ Lỗi parse buyNowProduct:', error);
      localStorage.removeItem('buyNowProduct');
    }
    return null;
  }, []);

  // Tính toán selectedCartItems với useMemo để tránh re-render
  const selectedCartItems = useMemo(() => {
    const items = buyNowProduct 
      ? [buyNowProduct]
      : (cartState.items?.filter(item => selectedItems.has(item._id)) || []);
    
    console.log("🔍 [DEBUG] selectedCartItems:", items);
    console.log("🔍 [DEBUG] buyNowProduct:", buyNowProduct);
    console.log("🔍 [DEBUG] cartState.items:", cartState.items);
    
    return items;
  }, [buyNowProduct, cartState.items, selectedItems]);

  useEffect(() => {
    getTaxConfig()
      .then((cfg) => setTaxRate(cfg.rate))
      .catch(() => setTaxRate(0.08));

    // Lấy thông tin shipping và payment từ localStorage
    const shippingData = localStorage.getItem('checkoutShippingData');
    const paymentData = localStorage.getItem('checkoutPaymentData');

    if (shippingData && paymentData) {
      const { selectedAddress: savedAddress, formData: savedFormData } = JSON.parse(shippingData);
      const { formData: savedPaymentData, cardInfo: savedCardInfo, walletInfo: savedWalletInfo, bankTransferInfo: savedBankTransferInfo } = JSON.parse(paymentData);

      setSelectedAddress(savedAddress);
      setFormData({ ...savedFormData, ...savedPaymentData });
      setCardInfo(savedCardInfo);
      setWalletInfo(savedWalletInfo);
      setBankTransferInfo(savedBankTransferInfo);
    } else if (!buyNowProduct) {
      // Nếu không có thông tin đầy đủ và không có sản phẩm mua ngay, quay về trang shipping
      navigate('/checkout/shipping');
    }

    // Kiểm tra nếu không có sản phẩm trong giỏ hàng và không có sản phẩm mua ngay, redirect về Cart
    if ((!cartState.items || cartState.items.length === 0) && !buyNowProduct) {
      navigate('/cart');
    }
  }, [navigate, cartState.items, buyNowProduct]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handlePaymentFailure = async (orderId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8000/api/order/${orderId}/payment-failed`,
        { reason: "Người dùng hủy thanh toán hoặc thanh toán thất bại" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái thanh toán thất bại:", error);
    }
  };

  const handleSubmit = async () => {
    console.log("🔍 [DEBUG] handleSubmit called");
    console.log("🔍 [DEBUG] selectedAddress:", selectedAddress);
    console.log("🔍 [DEBUG] formData.paymentMethod:", formData.paymentMethod);
    
    if (!selectedAddress || !formData.paymentMethod) {
      console.log("❌ [DEBUG] Validation failed - missing address or payment method");
      showError("Lỗi", "Vui lòng chọn địa chỉ và phương thức thanh toán");
      return;
    }

    // Kiểm tra giới hạn COD
    console.log("🔍 [DEBUG] isCODAllowed:", isCODAllowed);
    if (formData.paymentMethod === "COD" && !isCODAllowed) {
      console.log("❌ [DEBUG] COD not allowed for this amount");
      alert("Đơn hàng có giá trị trên 100 triệu ₫ không được phép thanh toán COD. Vui lòng chọn phương thức thanh toán trực tuyến.");
      return;
    }

    console.log("🔍 [DEBUG] Setting isProcessing to true");
    setIsProcessing(true);
    console.log("🔍 [DEBUG] Starting try block");
    try {
      // Validate selectedCartItems before creating order
      console.log("🔍 [DEBUG] Validating selectedCartItems:", selectedCartItems);
      if (!selectedCartItems || selectedCartItems.length === 0) {
        console.log("❌ [DEBUG] No selectedCartItems");
        showError("Lỗi", "Không có sản phẩm nào để đặt hàng");
        setIsProcessing(false);
        return;
      }
      console.log("✅ [DEBUG] selectedCartItems validation passed");

      // Validate each item
      console.log("🔍 [DEBUG] Starting item validation loop for", selectedCartItems.length, "items");
      for (let i = 0; i < selectedCartItems.length; i++) {
        const item = selectedCartItems[i];
        console.log(`🔍 [DEBUG] Validating item ${i + 1}:`, item);
        
        if (!item.product || !item.product._id) {
          console.log(`❌ [DEBUG] Item ${i + 1} - Invalid product info`);
          showError("Lỗi", "Thông tin sản phẩm không hợp lệ");
          setIsProcessing(false);
          return;
        }
        console.log(`✅ [DEBUG] Item ${i + 1} - Product info valid`);
        
        if (!item.quantity || item.quantity <= 0) {
          console.log(`❌ [DEBUG] Item ${i + 1} - Invalid quantity:`, item.quantity);
          showError("Lỗi", "Số lượng sản phẩm không hợp lệ");
          setIsProcessing(false);
          return;
        }
        console.log(`✅ [DEBUG] Item ${i + 1} - Quantity valid:`, item.quantity);
        
        // Check if product still exists (basic validation) - DISABLED for testing
        // if (item.product._id === '68c1263bfe5ee3ec6a03eb4f') {
        //   console.log(`❌ [DEBUG] Item ${i + 1} - Product is blacklisted`);
        //   showError("Lỗi", "Sản phẩm không còn khả dụng. Vui lòng làm mới trang và thử lại.");
        //   setIsProcessing(false);
        //   return;
        // }
        console.log(`✅ [DEBUG] Item ${i + 1} - Product not blacklisted`);
      }
      console.log("✅ [DEBUG] All items validation passed");
      console.log("✅ [DEBUG] Item validation passed");

      console.log("🔍 [DEBUG] Creating orderData...");
      const orderData = {
        orderItems: selectedCartItems.map((item) => {
          const orderItem = {
            name: item.product.name,
            quantity: item.quantity,
            image: item.product.images?.[0] || "",
            price: item.variantInfo ? 
              (item.variantInfo.salePrice && item.variantInfo.salePrice < item.variantInfo.price ? item.variantInfo.salePrice : item.variantInfo.price) :
              (item.product.salePrice || item.product.price),
            product: item.product._id,
            variantId: item.variantId || undefined, // Ensure undefined instead of null
            variantInfo: item.variantInfo,
          };
          console.log("🔍 [DEBUG] Order item being sent:", orderItem);
          
          // Additional validation
          if (!orderItem.product) {
            throw new Error(`Product ID is missing for item: ${orderItem.name}`);
          }
          
          return orderItem;
        }),
        shippingAddress: {
          fullName: formData.lastName,
          address: formData.address,
          city: formData.province_code,
          ward: formData.ward_code,
          postalCode: formData.ward_code + "-" + formData.province_code,
          phone: formData.phone,
        },
        paymentMethod: formData.paymentMethod,
        itemsPrice: subtotal,
        // ✅ THÊM THÔNG TIN COUPON
        couponDiscount: couponDiscount,
        couponCode: appliedDiscountCoupon?.code || null,
        // ✅ THÊM THÔNG TIN VOUCHER
        voucherDiscount: voucherDiscount,
        voucherCode: voucher?.code || null,
        voucherProductId: voucher?.productId || null,
        taxPrice: taxPrice,
        shippingPrice: shippingFee,
        totalPrice: finalTotal,
      };
      console.log("🔍 [DEBUG] OrderData created:", orderData);

      console.log("🔍 [DEBUG] Calling createOrder API...");
      const res = await createOrder(orderData);
      setOrderNumber(res._id || "");
      console.log("PaymentMethod before submit:", formData.paymentMethod);
      console.log("Wallet info:", walletInfo);
      console.log("👉 Order API response:", res);

      // ✅ CHỈ xóa giỏ hàng cho COD, online payment sẽ xóa sau khi thanh toán thành công
      if (formData.paymentMethod === "COD") {
        if (buyNowProduct) {
          // Nếu là mua ngay, xóa sản phẩm tạm thời
          localStorage.removeItem('buyNowProduct');
        } else {
          // Nếu là từ giỏ hàng, xóa sản phẩm khỏi giỏ hàng
          await removeOrderedItemsFromCart(orderData.orderItems);
        }
      }
      // ⚠️ Online payment: KHÔNG xóa giỏ hàng ngay, chỉ xóa khi thanh toán thành công
      // Nếu thanh toán thất bại, sản phẩm vẫn còn trong giỏ hàng để người dùng thử lại

      // Xử lý từng loại thanh toán
      if (formData.paymentMethod === "momo") {
        console.log("🚀 MOMO Payment Started");
        console.log("🔍 MOMO Payment Data:", {
          amount: orderData.totalPrice,
          orderId: res._id,
          orderInfo: `Thanh toán đơn hàng ${res._id}`,
          redirectUrl: window.location.origin + "/checkout/status?orderId=" + res._id + "&paymentMethod=momo",
          ipnUrl: "http://localhost:8000/api/payment/momo/webhook",
          extraData: "",
        });
        
        try {
          const momoRes = await createMomoPayment({
            amount: orderData.totalPrice,
            orderId: res._id,
            orderInfo: `Thanh toán đơn hàng ${res._id}`,
            redirectUrl: window.location.origin + "/checkout/status?orderId=" + res._id + "&paymentMethod=momo",
            ipnUrl: "http://localhost:8000/api/payment/momo/webhook",
            extraData: "",
          });

          console.log("✅ MOMO Payment Response:", momoRes);

          if (momoRes && momoRes.payUrl) {
            console.log("🔗 Redirecting to MOMO payment URL:", momoRes.payUrl);
            localStorage.setItem(
              "pendingOrder",
              JSON.stringify({
                orderId: res._id,
                paymentMethod: "momo",
                orderItems: orderData.orderItems,
              })
            );
            window.location.href = momoRes.payUrl;
            return;
          } else {
            console.error("❌ MOMO Payment failed - no payUrl:", momoRes);
            await handlePaymentFailure(res._id);
            navigate(`/checkout/failed?orderId=${res._id}&paymentMethod=momo&error=payment_error&amount=${orderData.totalPrice}`);
            return;
          }
        } catch (error) {
          console.error("❌ MOMO Payment Error:", error);
          await handlePaymentFailure(res._id);
          navigate(`/checkout/failed?orderId=${res._id}&paymentMethod=momo&error=payment_error&amount=${orderData.totalPrice}`);
          return;
        }
      } else if (formData.paymentMethod === "vnpay") {
        try {
          console.log("🚀 VNPAY Payment Started");
          console.log("📋 Order Data:", {
            amount: orderData.totalPrice,
            orderId: res._id,
            orderInfo: `Thanh toán đơn hàng ${res._id}`,
            redirectUrl: "http://localhost:8000/api/payment/vnpay/callback",
          });

          const vnpayRes = await axios.post("/api/payment/vnpay/create", {
            amount: orderData.totalPrice,
            orderId: res._id,
            orderInfo: `Thanh toán đơn hàng ${res._id}`,
            redirectUrl: "http://localhost:8000/api/payment/vnpay/callback",
          });

          console.log("📤 VNPAY Response received:", vnpayRes);
          console.log("📤 VNPAY Response data:", vnpayRes.data);
          console.log("📤 VNPAY Response status:", vnpayRes.status);

          if (vnpayRes.data && vnpayRes.data.payUrl) {
            console.log("✅ VNPAY payUrl received:", vnpayRes.data.payUrl);
            console.log("📏 VNPAY payUrl length:", vnpayRes.data.payUrl.length);
            console.log("🔗 VNPAY payUrl starts with:", vnpayRes.data.payUrl.substring(0, 50) + "...");
            console.log("🔗 VNPAY payUrl ends with:", "..." + vnpayRes.data.payUrl.substring(vnpayRes.data.payUrl.length - 50));

            localStorage.setItem(
              "pendingOrder",
              JSON.stringify({
                orderId: res._id,
                paymentMethod: "vnpay",
                orderItems: orderData.orderItems,
              })
            );

            console.log("💾 Pending order saved to localStorage");
            console.log("🔄 Redirecting to VNPAY...");
            console.log("🎯 Final redirect URL:", vnpayRes.data.payUrl);

            window.location.href = vnpayRes.data.payUrl;
            return;
          } else {
            console.error("❌ VNPAY payUrl missing from response");
            console.error("❌ VNPAY response data:", vnpayRes.data);
            await handlePaymentFailure(res._id);
            navigate(`/checkout/failed?orderId=${res._id}&paymentMethod=vnpay&error=payment_error&amount=${orderData.totalPrice}`);
            return;
          }
        } catch (err) {
          console.error("❌ VNPAY Payment Error:", err);
          console.error("❌ VNPAY Error details:", {
            message: err instanceof Error ? err.message : 'Unknown error',
            response: (err as any)?.response?.data,
            status: (err as any)?.response?.status
          });
          await handlePaymentFailure(res._id);
          const error = err as Error;
          navigate(`/checkout/failed?orderId=${res._id}&paymentMethod=vnpay&error=payment_error&amount=${orderData.totalPrice}`);
          return;
        }
      } else if (formData.paymentMethod === "COD") {
        // ✅ COD - Chuyển đến trang CheckoutStatus
        console.log("🚀 COD Payment - Redirecting to success page");
        navigate(
          `/checkout/status?orderId=${res._id}&paymentMethod=COD&status=success`
        );
      } else {
        // ✅ Other payment methods - Chuyển đến trang CheckoutStatus
        console.log("🚀 Other Payment - Redirecting to success page");
        navigate(
          `/checkout/status?orderId=${res._id}&paymentMethod=${formData.paymentMethod}&status=success`
        );
      }
    } catch (err: unknown) {
      console.error("❌ General Order Error:", err);
      console.error("❌ Error type:", typeof err);
      console.error("❌ Error instanceof Error:", err instanceof Error);
      if (err instanceof Error) {
        console.error("❌ Error message:", err.message);
        console.error("❌ Error stack:", err.stack);
      }
      if ((err as any)?.response) {
        console.error("❌ Error response:", (err as any).response);
        console.error("❌ Error response data:", (err as any).response.data);
        console.error("❌ Error response status:", (err as any).response.status);
      }

      let errorMessage = "payment_error";
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
      ) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      // Check if it's a product availability error
      if (errorMessage.includes("không khả dụng") || errorMessage.includes("không tìm thấy")) {
        showError("Lỗi", "Một số sản phẩm không còn khả dụng. Đang làm mới giỏ hàng...");
        // Refresh cart data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        return;
      }

      // Chuyển hướng đến trang thất bại
      navigate(`/checkout/failed?error=${errorMessage}&amount=${finalTotal}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrevStep = () => {
    navigate('/checkout/payment');
  };

  // Tính toán giá từ selectedCartItems
  const subtotal = selectedCartItems.reduce((sum, item) => {
    const variant = item.variantInfo;
    const displayPrice = variant ? 
      (variant.salePrice && variant.salePrice < variant.price ? variant.salePrice : variant.price) :
      (item.product.salePrice && item.product.salePrice < item.product.price ? item.product.salePrice : item.product.price);
    const price = Number(displayPrice) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + (price * quantity);
  }, 0);

  // Tính toán coupon discount
  const couponDiscount = useMemo(() => {
    if (!appliedDiscountCoupon) return 0;

    const discountValue = appliedDiscountCoupon.discount || appliedDiscountCoupon.value || 0;
    if (appliedDiscountCoupon.type === "percentage") {
      const discount = (subtotal * discountValue) / 100;
      // Áp dụng giới hạn tối đa nếu có
      const maxDiscount = appliedDiscountCoupon.maxDiscount || appliedDiscountCoupon.maxDiscountValue;
      if (maxDiscount && discount > maxDiscount) {
        return maxDiscount;
      }
      return discount;
    } else if (appliedDiscountCoupon.type === "fixed") {
      return Math.min(discountValue, subtotal);
    }
    return 0;
  }, [appliedDiscountCoupon, subtotal]);

  const voucherDiscount = voucher && voucher.isValid ? voucher.discountAmount : 0;
  const totalDiscount = couponDiscount + voucherDiscount;
  
  // Tính thuế trước khi áp dụng mã giảm giá
  const taxPrice = subtotal * taxRate;
  
  // Tính phí vận chuyển dựa trên subtotal gốc (trước mã giảm giá)
  const shippingFee = subtotal >= 10000000 ? 0 : 30000; // Đồng bộ với giỏ hàng: freeship từ 10tr
  
  // Tổng cuối cùng: (subtotal + thuế + vận chuyển) - mã giảm giá
  const finalTotal = subtotal + taxPrice + shippingFee - totalDiscount;

  // Kiểm tra giới hạn COD (100 triệu)
  const COD_LIMIT = 100000000; // 100 triệu VND
  const isCODAllowed = finalTotal <= COD_LIMIT;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrevStep}
                className="flex items-center space-x-3 text-white hover:text-blue-100 transition-all duration-300 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl backdrop-blur-sm"
              >
                <FaArrowLeft className="w-5 h-5" />
                <span className="font-semibold text-lg">Quay lại</span>
              </button>
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-2">
                Xác nhận đơn hàng
              </h1>
              <p className="text-blue-100 text-lg">Bước 3/3 - Kiểm tra lại thông tin trước khi đặt hàng</p>
            </div>
            <div className="w-40"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white shadow-lg">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600 text-white shadow-xl scale-110">
                    <FaCheck className="w-8 h-8" />
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-base font-bold text-blue-600">Thông tin giao hàng</p>
                    <p className="text-sm text-gray-400 mt-1">Bước 1</p>
                  </div>
                </div>
                <div className="flex-1 mx-6">
                  <div className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg"></div>
                </div>
              </div>

              <div className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600 text-white shadow-xl scale-110">
                    <FaCheck className="w-8 h-8" />
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-base font-bold text-blue-600">Phương thức thanh toán</p>
                    <p className="text-sm text-gray-400 mt-1">Bước 2</p>
                  </div>
                </div>
                <div className="flex-1 mx-6">
                  <div className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg"></div>
                </div>
              </div>

              <div className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600 text-white shadow-xl scale-110">
                    <span className="text-2xl">3</span>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-base font-bold text-blue-600">Xác nhận đơn hàng</p>
                    <p className="text-sm text-gray-400 mt-1">Bước 3</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-8xl mx-auto">
          {/* Left Column - Form */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  ✅ Xác nhận đơn hàng
                </h2>
                <p className="text-blue-100">Kiểm tra lại thông tin trước khi đặt hàng</p>
              </div>

              <div className="p-8">
                <CheckoutReview
                  selectedAddress={selectedAddress}
                  formData={formData}
                  cardInfo={cardInfo}
                  walletInfo={walletInfo}
                  bankTransferInfo={bankTransferInfo}
                  selectedCartItems={selectedCartItems}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary & Action */}
          <div className="xl:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Order Summary Card - Collapsible */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
                  className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-6 py-5 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="mr-3 text-xl">📋</span>
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-white">Tóm tắt đơn hàng</h3>
                        <p className="text-green-100 text-sm mt-1">
                          {selectedCartItems.length} sản phẩm • {formatPrice(finalTotal)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-white text-sm font-semibold">
                        {isOrderSummaryOpen ? 'Thu gọn' : 'Xem chi tiết'}
                      </span>
                      {isOrderSummaryOpen ? (
                        <FaChevronUp className="text-white text-lg" />
                      ) : (
                        <FaChevronDown className="text-white text-lg" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Collapsible Content */}
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOrderSummaryOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                  <div className="p-6">
                    {/* Order Items Preview - Compact */}
                    <div className="mb-6">
                      <h4 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                        <span className="mr-2">🛍️</span>
                        Sản phẩm ({selectedCartItems.length})
                      </h4>
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {selectedCartItems.length > 0 ? (
                          <>
                            {selectedCartItems.slice(0, 4).map((item, index) => {
                              try {
                                return (
                                  <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden shadow-sm">
                                      {(() => {
                                        const variant = item.variantInfo;
                                        // Ưu tiên ảnh biến thể, nếu không có thì dùng ảnh sản phẩm đại diện
                                        const displayImage = variant?.images?.[0] || item.product?.images?.[0];
                                        return displayImage ? (
                                          <img 
                                            src={displayImage} 
                                            alt={item.product?.name || 'Sản phẩm'}
                                            className="w-full h-full object-cover"
                                            title={variant?.images?.[0] ? 'Ảnh sản phẩm' : 'Ảnh sản phẩm'}
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                                            <span className="text-gray-500 text-xs">No Image</span>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-gray-900 truncate mb-1">
                                        {item.product?.name || 'Tên sản phẩm'}
                                      </p>
                                      {item.variantInfo && (
                                        <p className="text-xs text-gray-500 mb-1">
                                          {item.variantInfo.color?.name || item.variantInfo.name || 'Chi tiết sản phẩm'}
                                          {item.variantInfo.size && ` - Size ${item.variantInfo.size} inch`}
                                        </p>
                                      )}
                                      <p className="text-xs text-gray-600">
                                        SL: <span className="font-semibold text-blue-600">{item.quantity}</span> × {(() => {
                                          const variant = item.variantInfo;
                                          const displayPrice = variant ? 
                                            (variant.salePrice && variant.salePrice < variant.price ? variant.salePrice : variant.price) :
                                            (item.product?.salePrice && item.product?.salePrice < item.product?.price ? item.product?.salePrice : item.product?.price);
                                          return formatPrice(displayPrice || 0);
                                        })()}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-bold text-gray-900">
                                        {(() => {
                                          const variant = item.variantInfo;
                                          const displayPrice = variant ? 
                                            (variant.salePrice && variant.salePrice < variant.price ? variant.salePrice : variant.price) :
                                            (item.product?.salePrice && item.product?.salePrice < item.product?.price ? item.product?.salePrice : item.product?.price);
                                          return formatPrice((displayPrice || 0) * (item.quantity || 0));
                                        })()}
                                      </div>
                                    </div>
                                  </div>
                                );
                              } catch (error) {
                                console.error('❌ Error rendering item:', error, item);
                                return (
                                  <div key={index} className="flex items-center space-x-3 p-3 bg-red-50 rounded-xl border border-red-200">
                                    <div className="text-red-600 text-sm">
                                      Lỗi hiển thị sản phẩm: {error.message}
                                    </div>
                                  </div>
                                );
                              }
                            })}
                            {selectedCartItems.length > 4 && (
                              <div className="text-center py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm">
                                  +{selectedCartItems.length - 4} sản phẩm khác
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <div className="text-gray-400 text-6xl mb-4">✓</div>
                            <p className="text-gray-600 text-lg">Không có sản phẩm nào trong đơn hàng.</p>
                            <p className="text-gray-500 text-sm mt-2">Vui lòng quay lại để chọn sản phẩm.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price Breakdown - Compact */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-6">
                      <h4 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                        <span className="mr-2">💰</span>
                        Chi tiết thanh toán
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-700 text-sm">Tạm tính:</span>
                          <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-700 text-sm">Thuế VAT (8%):</span>
                          <span className="font-semibold text-gray-900">{formatPrice(taxPrice)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-700 text-sm">Phí vận chuyển:</span>
                          <span className={`font-semibold ${shippingFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                            {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
                          </span>
                        </div>
                        {couponDiscount > 0 && (
                          <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="text-green-700 text-sm">Giảm giá coupon:</span>
                            <span className="font-semibold text-green-600">-{formatPrice(couponDiscount)}</span>
                          </div>
                        )}
                        {voucherDiscount > 0 && (
                          <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="text-green-700 text-sm">Giảm giá voucher:</span>
                            <span className="font-semibold text-green-600">-{formatPrice(voucherDiscount)}</span>
                          </div>
                        )}

                        <div className="pt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                              {formatPrice(finalTotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Coupon Section */}
                    <div className="mb-6">
                      <h4 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                        <span className="mr-2">🎫</span>
                        Mã khuyến mãi
                      </h4>
                      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-200">
                        {appliedDiscountCoupon ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-lg">✅</span>
                              </div>
                              <div>
                                <p className="font-semibold text-green-800">{appliedDiscountCoupon.name}</p>
                                <p className="text-sm text-green-600">
                                  {appliedDiscountCoupon.type === 'percentage' 
                                    ? `Giảm ${appliedDiscountCoupon.discount || appliedDiscountCoupon.value}%`
                                    : `Giảm ${formatPrice(appliedDiscountCoupon.discount || appliedDiscountCoupon.value)}`
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-semibold text-green-600">
                                -{formatPrice(couponDiscount)}
                              </span>
                              <button
                                onClick={handleRemoveDiscountCoupon}
                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <span className="text-lg">🎫</span>
                              </div>
                              <div>
                                <p className="font-semibold text-orange-800">Chưa áp dụng mã khuyến mãi</p>
                                <p className="text-sm text-orange-600">Tiết kiệm thêm với mã giảm giá</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setIsCouponModalVisible(true)}
                              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              Chọn mã
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Method Display */}
                    <div className="mb-6">
                      <h4 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                        <span className="mr-2">💳</span>
                        Phương thức thanh toán
                      </h4>
                      <div className={`p-4 rounded-xl border-2 ${formData.paymentMethod === "COD" && !isCODAllowed
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                        }`}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.paymentMethod === "COD" && !isCODAllowed
                              ? 'bg-red-100'
                              : formData.paymentMethod === "COD"
                                ? 'bg-green-100'
                                : 'bg-blue-100'
                            }`}>
                            {formData.paymentMethod === "COD" ? (
                              <span className="text-lg">🚚</span>
                            ) : (
                              <span className="text-lg">💳</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`font-semibold ${formData.paymentMethod === "COD" && !isCODAllowed
                                ? 'text-red-800'
                                : 'text-gray-800'
                              }`}>
                              {formData.paymentMethod === "COD"
                                ? "Thanh toán khi nhận hàng (COD)"
                                : formData.paymentMethod === "momo"
                                  ? "Thanh toán qua MoMo"
                                  : formData.paymentMethod === "vnpay"
                                    ? "Thanh toán qua VNPay"
                                    : "Thanh toán trực tuyến"
                              }
                              {formData.paymentMethod === "COD" && !isCODAllowed && (
                                <span className="text-sm text-red-600 ml-2">(Không khả dụng)</span>
                              )}
                            </p>
                            {formData.paymentMethod === "COD" && !isCODAllowed && (
                              <p className="text-sm text-red-600 mt-1">
                                Đơn hàng có giá trị {finalTotal.toLocaleString('vi-VN')}₫ vượt quá giới hạn 100 triệu ₫ cho thanh toán COD
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* COD Restriction Warning */}
                    {!isCODAllowed && (
                      <div className="mb-6">
                        <div className="bg-red-100 border border-red-200 rounded-xl p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-red-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-red-600 text-sm">!</span>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-red-800 mb-1">
                                Giới hạn thanh toán COD
                              </h4>
                              <p className="text-sm text-red-700">
                                Đơn hàng có giá trị trên 100 triệu ₫ không được phép thanh toán COD.
                                Vui lòng quay lại trang thanh toán để chọn phương thức thanh toán trực tuyến.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Promotional Message - Compact */}
                    {shippingFee > 0 && (
                      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm">💡</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-blue-800 mb-1">
                              Thêm {formatPrice(10000000 - subtotalAfterDiscount)} để được miễn phí vận chuyển!
                            </p>
                            <div className="w-full bg-blue-200 rounded-full h-2 mb-1">
                              <div
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500 shadow-sm"
                                style={{ width: `${Math.min((subtotalAfterDiscount / 10000000) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-blue-600">
                              Đã tiết kiệm: {formatPrice(subtotalAfterDiscount)} / {formatPrice(10000000)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button Card */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Security & Guarantee - Compact */}
                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 rounded-xl p-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <FaCheck className="w-3 h-3 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-green-800">
                              Giao hàng 2-3 ngày
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 via-violet-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 text-xs">🔒</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-purple-800">
                              Thanh toán an toàn
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 text-xs">🔄</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-orange-800">
                              Đổi trả 30 ngày
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Continue Button - Prominent */}
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isProcessing || (formData.paymentMethod === "COD" && !isCODAllowed)}
                        className={`w-full inline-flex items-center justify-center px-6 py-4 rounded-2xl transition-all duration-300 shadow-xl font-bold text-lg ${isProcessing || (formData.paymentMethod === "COD" && !isCODAllowed)
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 hover:shadow-2xl'
                          }`}
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            Đang xử lý...
                          </>
                        ) : formData.paymentMethod === "COD" && !isCODAllowed ? (
                          <>
                            <span>COD không khả dụng - Chọn phương thức khác</span>
                            <span className="ml-3 text-xl">⚠️</span>
                          </>
                        ) : (
                          <>
                            <span>Đặt hàng ngay</span>
                            <span className="ml-3 text-xl">→</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coupon Selection Modal */}
      <Modal
        title={
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Chọn mã giảm giá</span>
            <a href="#" className="text-orange-500 text-sm hover:underline">Hỗ trợ</a>
          </div>
        }
        open={isCouponModalVisible}
        onCancel={() => {
          setIsCouponModalVisible(false);
          setSelectedCouponId(null);
        }}
        afterOpenChange={(open) => {
          if (open) {
            // Khi mở modal, set coupon hiện tại đã được chọn (nếu có)
            setSelectedCouponId(appliedDiscountCoupon?._id || null);
          }
        }}
        footer={[
          <Button key="back" onClick={() => setIsCouponModalVisible(false)}>
            TRỞ LẠI
          </Button>,
          <Button
            key="ok"
            type="primary"
            className="bg-orange-500 hover:bg-orange-600 border-orange-500"
            onClick={() => {
              console.log('🔍 Modal OK button clicked');
              console.log('🔍 selectedCouponId:', selectedCouponId);
              console.log('🔍 appliedDiscountCoupon before:', appliedDiscountCoupon);

              if (selectedCouponId) {
                const coupon = availableCoupons.find(c => c._id === selectedCouponId);
                console.log('🔍 Found coupon in modal:', coupon);
                if (coupon) {
                  handleApplyDiscountCoupon(selectedCouponId);
                  showSuccess("Áp dụng mã giảm giá thành công!");
                }
              } else {
                // Nếu không chọn coupon nào, hủy áp dụng coupon hiện tại
                if (appliedDiscountCoupon) {
                  handleRemoveDiscountCoupon();
                  showSuccess("Đã hủy áp dụng mã giảm giá");
                }
              }
              setIsCouponModalVisible(false);
              setSelectedCouponId(null);
            }}
          >
            OK
          </Button>,
        ]}
        width={600}
        className="coupon-modal"
      >
        <div className="space-y-4">
          {/* Manual Input */}
          <div className="flex space-x-2">
            <Input
              placeholder="Mã Voucher"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-1"
            />
            <Button
              type="primary"
              className="bg-orange-500 hover:bg-orange-600 border-orange-500"
              onClick={() => {
                if (promoCode.trim()) {
                  const coupon = availableCoupons.find(c => c.code.toLowerCase() === promoCode.toLowerCase());
                  if (coupon) {
                    handleApplyDiscountCoupon(coupon._id);
                    showSuccess("Áp dụng mã giảm giá thành công!");
                    setIsCouponModalVisible(false);
                    setPromoCode("");
                  } else {
                    showError("Mã giảm giá không hợp lệ");
                  }
                } else {
                  showError("Vui lòng nhập mã giảm giá");
                }
              }}
            >
              ÁP DỤNG
            </Button>
          </div>

          {/* Discount Vouchers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Mã Giảm Giá</h3>
              <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                Chỉ được chọn 1 voucher/1 đơn
              </span>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {loadingCoupons ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Đang tải mã giảm giá...</p>
                </div>
              ) : availableCoupons.length > 0 ? (
                availableCoupons.map((coupon) => (
                  <div
                    key={coupon._id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedCouponId === coupon._id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                    onClick={() => setSelectedCouponId(selectedCouponId === coupon._id ? null : coupon._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-800">{coupon.name}</h4>
                          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                            {coupon.type === 'percentage' ? 'Phần trăm' : 'Cố định'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{coupon.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Mã: {coupon.code}</span>
                          {coupon.minAmount && (
                            <span>Đơn tối thiểu: {formatPrice(coupon.minAmount)}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-orange-600">
                          {coupon.type === 'percentage' 
                            ? `${coupon.discount || coupon.value}%`
                            : formatPrice(coupon.discount || coupon.value)
                          }
                        </div>
                        <div className="text-xs text-gray-500">Giảm giá</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">🎫</div>
                  <p className="text-gray-600">Không có mã giảm giá khả dụng</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      <ScrollToTop />
    </div>
  );
};

export default CheckoutReviewPage;
