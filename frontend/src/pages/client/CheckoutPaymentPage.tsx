import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheck, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useCart } from "../../contexts/CartContext";
import { useCheckout } from "../../contexts/CheckoutContext";
import { useToast } from "../../components/client/ToastContainer";
import { getTaxConfig } from "../../services/cartApi";
import { useVoucher } from "../../hooks/useVoucher";
import VoucherDisplay from "../../components/client/VoucherDisplay";
import ScrollToTop from "../../components/ScrollToTop";
import CheckoutPaymentMethod from "./CheckoutPaymentMethod";

const CheckoutPaymentPage: React.FC = () => {
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
  const [bankTransferInfo, setBankTransferInfo] = useState({ transactionId: "" });
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [showNewWalletForm, setShowNewWalletForm] = useState(false);
  const [taxRate, setTaxRate] = useState(0.08);
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [voucherCode, setVoucherCode] = useState("");

  const { state: cartState } = useCart();
  const { voucher, revalidateVoucher } = useCheckout();
  const { applyVoucher, removeVoucher, isValidating } = useVoucher();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // Khởi tạo selectedItems và buyNowProduct
  useEffect(() => {
    const buyNowProductData = localStorage.getItem("buyNowProduct");
    if (buyNowProductData) {
      const product = JSON.parse(buyNowProductData);
      setSelectedItems(new Set([product._id]));
    } else if (cartState.items && cartState.items.length > 0) {
      const allItemIds = new Set(cartState.items.map((item) => item._id));
      setSelectedItems(allItemIds);
    }
  }, [cartState.items]);

  // Lấy buyNowProduct từ localStorage
  const buyNowProduct = useMemo(() => {
    try {
      const buyNowData = localStorage.getItem("buyNowProduct");
      if (buyNowData) {
        return JSON.parse(buyNowData);
      }
    } catch (error) {
      localStorage.removeItem("buyNowProduct");
    }
    return null;
  }, []);

  // Tính toán selectedCartItems
  const selectedCartItems = useMemo(() => {
    return buyNowProduct
      ? [buyNowProduct]
      : cartState.items?.filter((item) => selectedItems.has(item._id)) || [];
  }, [buyNowProduct, cartState.items, selectedItems]);

  // Lấy config thuế + kiểm tra shipping/voucher
  useEffect(() => {
    getTaxConfig()
      .then((cfg) => setTaxRate(cfg.rate))
      .catch(() => setTaxRate(0.08));

    const shippingData = localStorage.getItem("checkoutShippingData");
    if (shippingData) {
      const { selectedAddress: savedAddress, formData: savedFormData } = JSON.parse(shippingData);
      setSelectedAddress(savedAddress);
      setFormData(savedFormData);
    } else if (!buyNowProduct) {
      navigate("/checkout/shipping");
    }

    // Load voucher từ localStorage và revalidate
    if (voucher) {
      setVoucherCode(voucher.code);
      revalidateVoucher(subtotal);
    }

    // Nếu giỏ hàng trống và không có buyNowProduct => về /cart
    if ((!cartState.items || cartState.items.length === 0) && !buyNowProduct) {
      navigate("/cart");
    }
  }, [navigate, cartState.items, buyNowProduct]);

  // Xử lý voucher
  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) {
      showError("Vui lòng nhập mã voucher");
      return;
    }
    try {
      const result = await applyVoucher(voucherCode);
      if (result.valid) {
        showSuccess("Voucher đã được áp dụng thành công!");
      } else {
        showError(result.message || "Voucher không hợp lệ");
      }
    } catch (error) {
      showError("Có lỗi xảy ra khi kiểm tra voucher");
    }
  };

  const handleRemoveVoucher = () => {
    removeVoucher();
    setVoucherCode("");
    showSuccess("Đã xóa voucher");
  };

  // Tính toán giá từ selectedCartItems
  const subtotal = selectedCartItems.reduce((sum, item) => {
    const variant = item.variantInfo;
    const displayPrice = variant
      ? variant.salePrice && variant.salePrice < variant.price
        ? variant.salePrice
        : variant.price
      : item.product.salePrice && item.product.salePrice < item.product.price
      ? item.product.salePrice
      : item.product.price;
    return sum + (Number(displayPrice) || 0) * (Number(item.quantity) || 0);
  }, 0);

  const voucherDiscount = voucher && voucher.isValid ? voucher.discountAmount : 0;
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const taxPrice = (subtotal - voucherDiscount) * taxRate;
  const finalTotal = subtotal - voucherDiscount + shippingFee + taxPrice;

  // Kiểm tra giới hạn COD (100 triệu)
  const isCODAllowed = finalTotal <= 100000000;

  // 👉 các function handlePrevStep, handleNextStep, formatPrice giữ nguyên như bạn có

  return (
    <div>
      {/* 👉 giữ nguyên phần UI như code bạn đưa, chỉ thay subtotal/voucherDiscount/finalTotal đã merge */}
    </div>
  );
};

export default CheckoutPaymentPage;
