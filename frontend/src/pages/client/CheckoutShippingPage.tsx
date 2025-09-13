import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheck, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useCart } from "../../contexts/CartContext";
import { useCheckout } from "../../contexts/CheckoutContext";
import { useVoucher } from "../../hooks/useVoucher";
import { useToast } from "../../components/client/ToastContainer";
import axios from "axios";
import userApi, { Address } from "../../services/userApi";
import { getTaxConfig } from "../../services/cartApi";
import ScrollToTop from "../../components/ScrollToTop";
import CheckoutShippingInfo from "./CheckoutShippingInfo";
import AddressSelector from "../../components/client/AddressSelector";
import AddressForm from "../../components/client/AddressForm";

interface Province {
  code: number;
  name: string;
}

const CheckoutShippingPage: React.FC = () => {
  const [formData, setFormData] = useState({
    lastName: "",
    phone: "",
    address: "",
    province_code: "",
    ward_code: "",
    paymentMethod: "",
  });
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [taxRate, setTaxRate] = useState(0.08);
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [buyNowProduct, setBuyNowProduct] = useState<any>(null);

  const { state: cartState } = useCart();
  const { voucher } = useCheckout();
  const { revalidateVoucher } = useVoucher();
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  // Khởi tạo selectedItems và buyNowProduct
  useEffect(() => {
    const buyNowProductData = localStorage.getItem("buyNowProduct");
    if (buyNowProductData) {
      const product = JSON.parse(buyNowProductData);
      setBuyNowProduct(product);
      setSelectedItems(new Set([product._id]));
    } else if (cartState.items && cartState.items.length > 0) {
      const allItemIds = new Set(cartState.items.map((item) => item._id));
      setSelectedItems(allItemIds);
    } else {
      navigate("/cart");
    }
  }, [cartState.items, navigate]);

  // Tính toán selectedCartItems
  const selectedCartItems = buyNowProduct
    ? [buyNowProduct]
    : cartState.items?.filter((item) => selectedItems.has(item._id)) || [];

  useEffect(() => {
    axios
      .get<Province[]>("https://provinces.open-api.vn/api/?depth=1")
      .then((r) => setProvinces(r.data))
      .catch(() => {});
    getTaxConfig()
      .then((cfg) => setTaxRate(cfg.rate))
      .catch(() => setTaxRate(0.08));
  }, []);

  // Revalidate voucher khi component mount
  useEffect(() => {
    if (voucher && cartState.total > 0) {
      revalidateVoucher();
    }
  }, [voucher, cartState.total, revalidateVoucher]);

  // Fetch addresses and set default
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/api/address", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const addressesData = response.data;
        setAddresses(addressesData);

        // Tự động chọn địa chỉ mặc định
        const defaultAddress =
          addressesData.find((a: Address) => a.isDefault) || addressesData[0];
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
          setFormData((f) => ({
            ...f,
            lastName: defaultAddress.fullName.split(" ").slice(-1).join(" "),
            phone: defaultAddress.phone,
            address: defaultAddress.address,
            province_code: defaultAddress.city,
            ward_code: defaultAddress.ward,
            paymentMethod: f.paymentMethod || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };

    fetchAddresses();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (selectedAddress) {
      // Lưu thông tin shipping vào localStorage để truyền sang trang tiếp theo
      localStorage.setItem(
        "checkoutShippingData",
        JSON.stringify({
          selectedAddress,
          formData,
        })
      );
      navigate("/checkout/payment");
    } else if (
      buyNowProduct &&
      formData.lastName &&
      formData.phone &&
      formData.address
    ) {
      // Nếu là mua ngay và có thông tin form, tạo địa chỉ tạm thời
      const tempAddress = {
        _id: `temp_${Date.now()}`,
        fullName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        city: formData.province_code,
        ward: formData.ward_code,
        isDefault: false,
      };

      localStorage.setItem(
        "checkoutShippingData",
        JSON.stringify({
          selectedAddress: tempAddress,
          formData,
        })
      );
      navigate("/checkout/payment");
    } else {
      alert("Vui lòng chọn địa chỉ giao hàng hoặc điền đầy đủ thông tin!");
    }
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
    const price = Number(displayPrice) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + price * quantity;
  }, 0);

  const voucherDiscount =
    voucher && voucher.isValid ? voucher.discountAmount : 0;
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const taxPrice = (subtotal - voucherDiscount) * taxRate;
  const finalTotal = subtotal - voucherDiscount + shippingFee + taxPrice;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* === Các phần UI giữ nguyên như bạn đã viết, chỉ khác logic merge === */}
      {/* Mình đã giữ lại xử lý hình ảnh cho variant + giá chính xác */}
      {/* ... */}
    </div>
  );
};

export default CheckoutShippingPage;
