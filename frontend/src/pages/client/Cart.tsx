import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaMinus,
  FaPlus,
  FaArrowLeft,
  FaLock,
  FaShieldAlt,
} from "react-icons/fa";
import ProductCard from "../../components/client/ProductCard";
import { useCart } from "../../contexts/CartContext";
import { getTaxConfig } from "../../services/cartApi";
import { getAvailableCoupons, getUsedCoupons, applyCoupon, removeCoupon } from "../../services/couponApi";
import { Coupon } from "../../interfaces/Coupon";
import { Product } from "../../interfaces/Product";
import { Modal, Button, Image, Input, Radio } from "antd";
import { useNotification } from "../../hooks/useNotification";
import {
  calculateDisplayPrice,
  calculateSubtotal,
  calculateTotalSavings
} from "../../utils/priceUtils";

const Cart: React.FC = () => {
  const { state, updateQuantity, removeFromCart, loadCart } =
    useCart();
  const { success, error, warning, info } = useNotification();
  const cartItems = state.items;

  // Debug log để kiểm tra component mount
  console.log('🛒 Cart component mounted');

  useEffect(() => {
    loadCart();
  }, []);

  // Debug: Log mỗi khi cartItems thay đổi (only in development)
  useEffect(() => {
    if (import.meta.env.DEV) {
      // Removed console.log to reduce noise
    }
  }, [cartItems]);

  // Debug: Log subtotal mỗi khi nó thay đổi (only in development)
  useEffect(() => {
    if (import.meta.env.DEV && cartItems.length > 0) {
      // Debug: Calculate current subtotal
      cartItems.reduce((sum, item) => {
        const price = calculateDisplayPrice(item);
        return sum + (price * item.quantity);
      }, 0);
      // Removed console.log to reduce noise
    }
  }, [cartItems]);

  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/product");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        // Chuẩn hóa dữ liệu sản phẩm gợi ý
        const normalized = (data.products || []).map((p: Product) => ({
          _id: p._id,
          name: p.name,
          price: p.price,
          salePrice: p.salePrice,
          images:
            p.images && p.images.length > 0
              ? p.images
              : ["/placeholder.svg"],
          brand: p.brand,
          stock: p.stock ?? 0,
          variants: p.variants ?? [],
          averageRating: p.averageRating ?? 0,
          numReviews: p.numReviews ?? 0,
          description: p.description ?? "",
          category: p.category,
          isActive: p.isActive ?? true,
          // các trường khác nếu cần
        }));
        setRecommendedProducts(normalized);
      } catch (err) {
        // Silently handle error - set empty array as fallback
        setRecommendedProducts([]);
      }
    };
    fetchRecommended();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const navigate = useNavigate();
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<any>(null);
  const [promoCode, setPromoCode] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [, setUsedCoupons] = useState<Coupon[]>([]);
  const [appliedDiscountCoupon, setAppliedDiscountCoupon] = useState<Coupon | null>(null);
  const [appliedShippingCoupon, setAppliedShippingCoupon] = useState<Coupon | null>(null);
  const [, setLoadingCoupons] = useState(false);
  const [isCouponModalVisible, setIsCouponModalVisible] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);
  const [taxRate, setTaxRate] = useState(0.08);
  const [serverOnline, setServerOnline] = useState(true);

  useEffect(() => {
    getTaxConfig()
      .then((cfg) => setTaxRate(cfg.rate))
      .catch(() => {
        // Silently handle error - use default tax rate
        setTaxRate(0.08); // Default tax rate
      });
  }, []);

  // Tính toán subtotal và savings chỉ cho các sản phẩm được chọn
  const selectedCartItems = cartItems.filter(item => selectedItems.has(item._id));
  const subtotal = calculateSubtotal(selectedCartItems);

  const savings = calculateTotalSavings(selectedCartItems);

  // Tính toán giảm giá từ coupon
  let couponDiscount = 0;
  if (appliedDiscountCoupon) {
    const discountValue = appliedDiscountCoupon.discount || appliedDiscountCoupon.value || 0;
    if (appliedDiscountCoupon.type === "percentage") {
      couponDiscount = (subtotal * discountValue) / 100;
      // Áp dụng giới hạn tối đa nếu có
      const maxDiscount = appliedDiscountCoupon.maxDiscount || appliedDiscountCoupon.maxDiscountValue;
      if (maxDiscount && couponDiscount > maxDiscount) {
        couponDiscount = maxDiscount;
      }
    } else if (appliedDiscountCoupon.type === "fixed") {
      couponDiscount = Math.min(discountValue, subtotal);
    }
  }

  const shipping = subtotal > 10000000 || appliedShippingCoupon ? 0 : 30000;
  const tax = (subtotal - couponDiscount) * taxRate;
  const total = subtotal - couponDiscount + shipping + tax;

  const handleShowDetail = (item: any) => {
    setDetailItem(item);
    setDetailModalOpen(true);
  };
  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setDetailItem(null);
  };

  // Load coupons function
  const loadCoupons = async () => {
    try {
      setLoadingCoupons(true);
      const [availableResponse, usedResponse] = await Promise.all([
        getAvailableCoupons(),
        getUsedCoupons()
      ]);

      console.log('Available coupons response:', availableResponse);
      console.log('Available coupons count:', availableResponse.coupons?.length || 0);
      setAvailableCoupons(availableResponse.coupons || []);
      setUsedCoupons(usedResponse.coupons || []);
    } catch (error: any) {
      // Silently handle error - set server offline status
      if (error.message === 'Network Error') {
        setServerOnline(false);
      }
      // Set empty arrays as fallback
      setAvailableCoupons([]);
      setUsedCoupons([]);
    } finally {
      setLoadingCoupons(false);
    }
  };

  // Load coupons on component mount
  useEffect(() => {
    loadCoupons();
  }, []);

  // Auto-reload coupons with smart polling
  useEffect(() => {
    let interval: number;

    const startPolling = () => {
      interval = setInterval(() => {
        loadCoupons();
      }, 15000); // Reload every 15 seconds for faster updates
    };

    // Start polling immediately
    startPolling();

    // Add visibility change listener for better performance
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, stop polling
        if (interval) clearInterval(interval);
      } else {
        // Page is visible, restart polling and reload immediately
        if (interval) clearInterval(interval);
        loadCoupons(); // Immediate reload when page becomes visible
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Initialize selected items when cart loads
  useEffect(() => {
    if (cartItems.length > 0) {
      const allItemIds = new Set(cartItems.map(item => item._id));
      setSelectedItems(allItemIds);
    }
  }, [cartItems]);

  const handleItemSelect = (itemId: string, isSelected: boolean) => {
    const newSelected = new Set(selectedItems);
    if (isSelected) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      const allItemIds = new Set(cartItems.map(item => item._id));
      setSelectedItems(allItemIds);
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleApplyDiscountCoupon = async (couponId: string) => {
    if (!couponId) {
      setAppliedDiscountCoupon(null);
      return;
    }

    try {
      const coupon = availableCoupons.find(c => c._id === couponId);
      if (!coupon) {
        error("Mã giảm giá không tồn tại");
        return;
      }

      // No special handling needed for current coupon types

      const selectedSubtotal = cartItems
        .filter(item => selectedItems.has(item._id))
        .reduce((sum, item) => sum + (calculateDisplayPrice(item) * item.quantity), 0);

      const minAmount = coupon.minAmount || coupon.minOrderValue || 0;
      if (selectedSubtotal < minAmount) {
        warning(`Đơn hàng tối thiểu ${formatPrice(minAmount)} để sử dụng mã này`);
        return;
      }

      const result = await applyCoupon(coupon.code, selectedSubtotal);
      if (result.success) {
        setAppliedDiscountCoupon(coupon);
        success(`Đã áp dụng mã giảm giá "${coupon.name}"`);
      } else {
        error(result.message || "Không thể áp dụng mã giảm giá");
      }
    } catch {
      error("Có lỗi xảy ra khi áp dụng mã giảm giá");
    }
  };


  const handleRemoveDiscountCoupon = async () => {
    if (appliedDiscountCoupon) {
      try {
        await removeCoupon(appliedDiscountCoupon._id);
        setAppliedDiscountCoupon(null);
        info("Đã hủy áp dụng mã giảm giá");
      } catch {
        error("Có lỗi xảy ra khi hủy mã giảm giá");
      }
    }
  };

  const handleRemoveShippingCoupon = async () => {
    if (appliedShippingCoupon) {
      try {
        await removeCoupon(appliedShippingCoupon._id);
        setAppliedShippingCoupon(null);
        info("Đã hủy áp dụng mã vận chuyển");
      } catch {
        error("Có lỗi xảy ra khi hủy mã vận chuyển");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <FaArrowLeft className="w-4 h-4" />
                <span>← Tiếp tục mua sắm</span>
              </Link>
            </div>
            {!serverOnline && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                  <span className="text-sm text-yellow-800">
                    Đang chế độ offline - Một số tính năng có thể bị hạn chế
                  </span>
                </div>
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 lg:items-stretch cart-layout">
          {/* Left Column - Cart Items and Coupons */}
          <div className="lg:col-span-2 order-2 lg:order-1 cart-left-column">
            {/* Cart Items - Table Format */}
            <div className="cart-items-container">
              {cartItems.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <div className="text-6xl mb-4">🛒</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Giỏ hàng của bạn trống
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng.
                  </p>
                  <Link
                    to="/products"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300"
                  >
                    Bắt đầu mua sắm
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col flex-1">
                  {/* Table Header */}
                  <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-900">Giỏ hàng</h2>
                      <span className="text-sm text-gray-600">{state.itemCount} sản phẩm</span>
                    </div>
                  </div>

                  {/* Table Headers */}
                  <div className="px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
                    <div className="grid grid-cols-12 gap-2 sm:gap-4 text-xs sm:text-sm font-semibold text-gray-700">
                      <div className="col-span-1">
                        <input
                          type="checkbox"
                          checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-4 hidden sm:block">CHI TIẾT SẢN PHẨM</div>
                      <div className="col-span-4 sm:hidden">SẢN PHẨM</div>
                      <div className="col-span-2 text-center">SỐ LƯỢNG</div>
                      <div className="col-span-2 text-right hidden md:block">GIÁ</div>
                      <div className="col-span-2 text-right">TỔNG</div>
                      <div className="col-span-1"></div>
                    </div>
                  </div>

                  {/* Table Body - Scrollable with flexible height */}
                  <div className="divide-y divide-gray-200 flex-1 overflow-y-auto cart-scrollable" style={{ minHeight: '300px', maxHeight: '500px' }}>
                    {cartItems.map((item) => {
                      const variant = item.variantInfo;
                      const displayName = item.product.name; // Luôn hiển thị tên sản phẩm cha
                      const displayImage = variant?.images?.[0] || item.product.images?.[0] || "/placeholder.svg";

                      // Sử dụng calculateDisplayPrice để đảm bảo tính toán đúng
                      const displayPrice = calculateDisplayPrice(item);

                      // Fallback: Nếu variantInfo rỗng, tính giá từ product.variants
                      let actualDisplayPrice = displayPrice;
                      if (!item.variantInfo && item.variantId && (item.product as any).variants) {
                        const variant = (item.product as any).variants.find((v: any) => v._id.toString() === item.variantId?.toString());
                        if (variant) {
                          actualDisplayPrice = variant.salePrice && variant.salePrice < variant.price ? variant.salePrice : variant.price;
                        }
                      }

                      const displayOldPrice = variant?.price || item.product.price;

                      const displayColor = variant?.color?.code || variant?.color?.name || null;
                      const displaySize = variant?.size || null;
                      const displaySKU = variant?.sku || null;

                      return (
                        <div key={item._id} className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors">
                          <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center">
                            {/* Checkbox */}
                            <div className="col-span-1">
                              <input
                                type="checkbox"
                                checked={selectedItems.has(item._id)}
                                onChange={(e) => handleItemSelect(item._id, e.target.checked)}
                                className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                            </div>

                            {/* Product Details */}
                            <div className="col-span-4">
                              <div className="flex items-center space-x-2 sm:space-x-4">
                                {/* Product Image */}
                                <div className="flex-shrink-0">
                                  <img
                                    src={displayImage}
                                    alt={displayName}
                                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 object-cover rounded-lg"
                                  />
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                                    {item.product.name}
                                  </h3>

                                  {/* Variant Info */}
                                  {item.variantInfo && item.variantInfo.name && item.variantInfo.name.trim() && (
                                    <div className="mt-1">
                                      <span className="text-xs text-gray-600 font-medium">
                                        {item.variantInfo.name}
                                      </span>
                                    </div>
                                  )}

                                  {/* Fallback: Hiển thị variant info từ product.variants nếu variantInfo rỗng */}
                                  {(!item.variantInfo || !item.variantInfo.name) && item.variantId && (item.product as any).variants && (
                                    <div className="mt-1">
                                      <span className="text-xs text-gray-600 font-medium">
                                        {(() => {
                                          const variant = (item.product as any).variants.find((v: any) => v._id.toString() === item.variantId?.toString());
                                          return variant ? variant.name : '';
                                        })()}
                                      </span>
                                    </div>
                                  )}


                                  {/* View Details Button */}
                                  <div className="mt-2">
                                    <button
                                      onClick={() => handleShowDetail(item)}
                                      className="text-blue-600 hover:text-blue-800 text-xs font-medium underline"
                                    >
                                      Xem chi tiết
                                    </button>
                                  </div>

                                  {/* Product Options - Hidden on mobile */}
                                  <div className="mt-2 flex flex-wrap gap-2 hidden sm:flex">
                                    {displayColor && (
                                      <div className="flex items-center space-x-1">
                                        <div
                                          className="w-4 h-4 rounded-full border border-gray-300"
                                          style={{ backgroundColor: displayColor }}
                                          title={displayColor}
                                        />
                                        <span className="text-xs text-gray-600">Màu</span>
                                      </div>
                                    )}
                                    {displaySize && (
                                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                        Size: {displaySize}
                                      </span>
                                    )}
                                    {displaySKU && (
                                      <span className="text-xs text-gray-500 font-mono">
                                        SKU: {displaySKU}
                                      </span>
                                    )}
                                  </div>

                                </div>
                              </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="col-span-2">
                              <div className="flex flex-col items-center space-y-2">
                                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                                  <button
                                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <FaMinus className="w-2 h-2 sm:w-3 sm:h-3" />
                                  </button>
                                  <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => {
                                      const newQuantity = parseInt(e.target.value) || 1;
                                      const maxStock = variant?.stock ?? item.product.stock;
                                      if (newQuantity > maxStock) {
                                        warning("Đã đạt số lượng tối đa tồn kho!");
                                        return;
                                      }
                                      updateQuantity(item._id, Math.max(1, newQuantity));
                                    }}
                                    className="w-8 sm:w-12 h-6 sm:h-8 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                                    min="1"
                                    max={variant?.stock ?? item.product.stock}
                                  />
                                  <button
                                    onClick={() => {
                                      const maxStock = variant?.stock ?? item.product.stock;
                                      if (item.quantity >= maxStock) {
                                        warning("Đã đạt số lượng tối đa tồn kho!");
                                        return;
                                      }
                                      updateQuantity(item._id, item.quantity + 1);
                                    }}
                                    disabled={item.quantity >= (variant?.stock ?? item.product.stock)}
                                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <FaPlus className="w-2 h-2 sm:w-3 sm:h-3" />
                                  </button>
                                </div>

                                {/* Stock Info - Moved here */}
                                <div className="text-center">
                                  <span className="text-xs text-gray-500">
                                    {(() => {
                                      // Lấy stock của variant cụ thể hoặc product
                                      const variantStock = variant?.stock;
                                      const productStock = item.product.stock;
                                      const currentStock = variantStock !== undefined ? variantStock : productStock;

                                      if (typeof currentStock === "number") {
                                        const remainingStock = currentStock - item.quantity;
                                        if (remainingStock <= 0) {
                                          return <span className="text-red-600 font-medium">Hết hàng</span>;
                                        } else if (remainingStock <= 5) {
                                          return <span className="text-orange-500 font-medium">Chỉ còn {remainingStock}</span>;
                                        } else {
                                          return <span className="text-green-600 font-medium">Còn {remainingStock} sản phẩm</span>;
                                        }
                                      } else {
                                        return <span className="text-gray-500">Tồn kho: {currentStock}</span>;
                                      }
                                    })()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Price - Hidden on mobile */}
                            <div className="col-span-2 text-right hidden md:block">
                              <div className="space-y-1">
                                <div className="text-sm font-semibold text-gray-900">
                                  {formatPrice(actualDisplayPrice)}
                                </div>
                                {displayOldPrice && displayOldPrice !== displayPrice && (
                                  <div className="text-xs text-gray-500 line-through">
                                    {formatPrice(displayOldPrice)}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Total */}
                            <div className="col-span-2 text-right">
                              <div className="text-xs sm:text-sm font-bold text-gray-900">
                                {formatPrice(actualDisplayPrice * item.quantity)}
                              </div>
                              {displayOldPrice && displayOldPrice !== displayPrice && (
                                <div className="text-xs text-green-600">
                                  Tiết kiệm {formatPrice((displayOldPrice - actualDisplayPrice) * item.quantity)}
                                </div>
                              )}
                              {/* Show price per item on mobile */}
                              <div className="text-xs text-gray-500 md:hidden">
                                {formatPrice(actualDisplayPrice)}/cái
                              </div>
                            </div>

                            {/* Remove Button */}
                            <div className="col-span-1 text-center">
                              <button
                                onClick={() => removeFromCart(item._id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 sm:p-2 rounded-full transition-colors"
                                title="Xóa sản phẩm"
                              >
                                <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Coupon Section - Moved to Left Column */}
            {cartItems.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 cart-coupon-container">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-orange-800">MÃ GIẢM GIÁ</span>
                    </div>
                    {availableCoupons.length > 0 && (
                      <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                        {availableCoupons.length} mã có sẵn
                      </span>
                    )}
                  </div>

                  {/* Available Coupons List */}
                  {availableCoupons.length > 0 && (
                    <div className="space-y-2 mb-3">
                      <div className="text-xs text-orange-600 font-medium">
                        Các mã giảm giá có thể sử dụng:
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto cart-scrollable">
                        {availableCoupons.map((coupon) => (
                          <div
                            key={coupon._id}
                            className={`border rounded-lg p-3 cursor-pointer transition-all ${appliedDiscountCoupon?._id === coupon._id
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-200 hover:border-orange-300 hover:bg-orange-25"
                              }`}
                            onClick={() => {
                              if (appliedDiscountCoupon?._id === coupon._id) {
                                // Nếu đã chọn voucher này, hủy chọn
                                handleRemoveDiscountCoupon();
                              } else {
                                // Chọn voucher mới
                                handleApplyDiscountCoupon(coupon._id);
                              }
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                                    {coupon.type === "percentage" ? "GIẢM %" : "GIẢM TIỀN"}
                                  </span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {coupon.name}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-600">
                                  {coupon.type === "percentage"
                                    ? `Giảm ${coupon.discount || coupon.value || 0}%`
                                    : `Giảm ${formatPrice(coupon.discount || coupon.value || 0)}`
                                  }
                                  {coupon.maxDiscount && (
                                    <span className="text-orange-600 ml-1">
                                      (Tối đa {formatPrice(coupon.maxDiscount)})
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Đơn tối thiểu: {formatPrice(coupon.minAmount || coupon.minOrderValue || 0)}
                                </div>
                              </div>
                              <div className="ml-3">
                                {appliedDiscountCoupon?._id === coupon._id ? (
                                  <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                ) : (
                                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Coupon Button */}
                  <button
                    onClick={() => setIsCouponModalVisible(true)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
                  >
                    <span>Xem tất cả mã giảm giá</span>
                    <span className="text-sm opacity-90">›</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 order-1 lg:order-2 cart-right-column">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 sticky top-4 lg:top-8 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Tóm tắt đơn hàng
                </h2>
                <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                  {selectedItems.size} sản phẩm
                </div>
              </div>

              {/* Summary Items */}
              <div className="space-y-4 mb-6 flex-1">
                {/* Products Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-gray-700">
                      SẢN PHẨM
                    </span>
                    <span className="text-sm font-bold text-gray-900">{formatPrice(subtotal)}</span>
                  </div>

                  {/* Product Details */}
                  {selectedCartItems.length > 0 && (
                    <div className="space-y-2 max-h-32 overflow-y-auto cart-scrollable">
                      {selectedCartItems.map((item, index) => {
                        const variant = item.variantInfo;
                        const price = calculateDisplayPrice(item);
                        const total = price * item.quantity;
                        const variantName = variant?.name || '';

                        return (
                          <div key={index} className="flex justify-between items-center text-xs bg-white rounded p-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-800 truncate">
                                {item.product.name}
                              </div>
                              {variantName && (
                                <div className="text-gray-500 truncate">
                                  {variantName}
                                </div>
                              )}
                            </div>
                            <div className="text-right ml-2">
                              <div className="font-semibold text-gray-900">
                                {formatPrice(total)}
                              </div>
                              <div className="text-gray-500">
                                {formatPrice(price)} × {item.quantity}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Savings Section */}
                {savings > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-semibold text-green-800">Tiết kiệm sản phẩm</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">-{formatPrice(savings)}</span>
                    </div>
                  </div>
                )}


                {/* Applied Discount Coupon */}
                {appliedDiscountCoupon && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-green-800">
                          {appliedDiscountCoupon.name}
                        </div>
                        <div className="text-xs text-green-600">
                          Mã: {appliedDiscountCoupon.code}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-800">
                          -{formatPrice(couponDiscount)}
                        </div>
                        <button
                          onClick={handleRemoveDiscountCoupon}
                          className="text-xs text-green-600 hover:text-green-800 underline"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Applied Shipping Coupon */}
                {appliedShippingCoupon && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-blue-800">
                          {appliedShippingCoupon.name}
                        </div>
                        <div className="text-xs text-blue-600">
                          Mã: {appliedShippingCoupon.code}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-blue-800">
                          Miễn phí ship
                        </div>
                        <button
                          onClick={handleRemoveShippingCoupon}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Shipping & Tax Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="space-y-3">
                    {/* Shipping */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-semibold text-blue-800">VẬN CHUYỂN</span>
                      </div>
                      <span className="text-sm font-bold">
                        {shipping === 0 ? (
                          <span className="text-green-600">Miễn phí</span>
                        ) : (
                          <span className="text-blue-800">{formatPrice(shipping)}</span>
                        )}
                      </span>
                    </div>
                    <div className="text-xs text-blue-600 ml-4">
                      Giao hàng tiêu chuẩn - {shipping === 0 ? "Miễn phí" : formatPrice(shipping)}
                    </div>
                    <div className="text-xs text-gray-500 ml-4 mt-1">
                      <span className="font-medium">Lưu ý:</span> Đơn hàng dưới 10 triệu: phí ship 30.000đ | Trên 10 triệu: miễn phí ship
                    </div>

                    {/* Tax */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-semibold text-blue-800">THUẾ (8%)</span>
                      </div>
                      <span className="text-sm font-bold text-blue-800">{formatPrice(tax)}</span>
                    </div>
                  </div>
                </div>

                {/* Detailed Summary */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4">
                  <div className="space-y-3 mb-4">
                    {/* Tổng tiền hàng */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Tổng tiền hàng:</span>
                      <span className="text-sm font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                    </div>

                    {/* Phí vận chuyển */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Phí vận chuyển:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {shipping === 0 ? (
                          <span className="text-green-600">Miễn phí</span>
                        ) : (
                          formatPrice(shipping)
                        )}
                      </span>
                    </div>

                    {/* Áp dụng mã giảm giá */}
                    {couponDiscount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Áp dụng mã giảm giá:</span>
                        <span className="text-sm font-semibold text-green-600">-{formatPrice(couponDiscount)}</span>
                      </div>
                    )}

                    {/* Thuế VAT */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Thuế VAT (8%):</span>
                      <span className="text-sm font-semibold text-gray-900">{formatPrice(tax)}</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-300 my-3"></div>

                  {/* Tổng cộng */}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">TỔNG CỘNG:</span>
                    <span className="text-xl font-bold text-purple-600">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>


              {/* Checkout Button */}
              <div className="mt-auto">
                <Link
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (selectedItems.size === 0) {
                      warning("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
                      return;
                    }
                    navigate("/checkout/shipping", {
                      state: {
                        subtotal,
                        savings,
                        shipping,
                        tax,
                        total,
                        selectedItems: Array.from(selectedItems),
                        appliedDiscountCoupon,
                        appliedShippingCoupon,
                        couponDiscount,
                      },
                    });
                  }}
                  className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-3 text-base shadow-lg hover:shadow-xl ${selectedItems.size === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105"
                    }`}
                >
                  <FaLock className="w-5 h-5" />
                  <span>
                    {selectedItems.size === 0
                      ? "CHỌN SẢN PHẨM ĐỂ THANH TOÁN"
                      : `THANH TOÁN (${selectedItems.size} sản phẩm)`
                    }
                  </span>
                </Link>
              </div>

              {/* Security Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <FaShieldAlt className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-gray-700">Thanh toán an toàn</span>
                </div>
                <p className="text-xs text-gray-500">Thông tin của bạn được bảo vệ bằng mã hóa SSL</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal hiển thị chi tiết sản phẩm/biến thể */}
        <Modal
          open={detailModalOpen}
          onCancel={handleCloseDetail}
          footer={null}
          title={
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-lg font-semibold">Thông tin chi tiết: {detailItem?.product.name}</span>
            </div>
          }
          width={650}
          styles={{ 
            body: { 
              maxHeight: 700, 
              overflowY: "auto", 
              padding: 20 
            } 
          }}
          className="product-detail-modal"
        >
          {detailItem && (
            <div className="space-y-6">
              {/* Product Image */}
              <div className="flex justify-center mb-6">
                <Image
                  src={
                    detailItem.variantInfo?.images?.[0] ||
                    detailItem.product.images?.[0] ||
                    "/placeholder.svg"
                  }
                  alt={detailItem.product.name}
                  width={250}
                  height={250}
                  className="object-cover rounded-lg shadow-lg"
                />
              </div>

              {/* Product Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {detailItem.product.name}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Số lượng:</span>
                    <span className="ml-2 font-semibold text-gray-900">{detailItem.quantity}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Tồn kho:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {(() => {
                        // Lấy stock từ variant hoặc product
                        if (detailItem.variantInfo?.stock !== undefined) {
                          return detailItem.variantInfo.stock;
                        }
                        if (detailItem.variantId && (detailItem.product as any).variants) {
                          const variant = (detailItem.product as any).variants.find((v: any) => v._id.toString() === detailItem.variantId?.toString());
                          if (variant?.stock !== undefined) {
                            return variant.stock;
                          }
                        }
                        return detailItem.product.stock;
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Variant Information */}
              {(() => {
                // Lấy thông tin biến thể từ variantInfo hoặc từ product.variants
                const variantInfo = detailItem.variantInfo;
                let variantData = variantInfo;
                
                // Fallback: Nếu không có variantInfo, tìm từ product.variants
                if (!variantInfo && detailItem.variantId && (detailItem.product as any).variants) {
                  const variant = (detailItem.product as any).variants.find((v: any) => v._id.toString() === detailItem.variantId?.toString());
                  if (variant) {
                    variantData = variant;
                  }
                }

                // Chỉ hiển thị nếu có thông tin biến thể
                if (!variantData) return null;

                return (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center mb-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <h4 className="text-lg font-semibold text-blue-800">Thông tin biến thể</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-blue-700">Tên biến thể:</span>
                        <div className="text-blue-900 font-semibold mt-1">
                          {variantData.name || "N/A"}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-blue-700">Mã biến thể:</span>
                        <div className="text-blue-900 font-mono text-xs mt-1">
                          {detailItem.variantId || variantData._id || "N/A"}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-blue-700">SKU:</span>
                        <div className="text-blue-900 font-mono text-xs mt-1">
                          {variantData.sku || "N/A"}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-blue-700">Màu sắc:</span>
                        <div className="flex items-center mt-1">
                          {variantData.color?.code && (
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300 mr-2"
                              style={{ backgroundColor: variantData.color.code }}
                              title={variantData.color.name || variantData.color.code}
                            />
                          )}
                          <span className="text-blue-900">
                            {variantData.color?.name || variantData.color?.code || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-blue-700">Kích thước:</span>
                        <div className="text-blue-900 font-semibold mt-1">
                          {variantData.size || "N/A"}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-blue-700">Tồn kho:</span>
                        <div className="text-blue-900 font-semibold mt-1">
                          {variantData.stock || 0} sản phẩm
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Pricing Information */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <h4 className="text-lg font-semibold text-green-800">Thông tin giá</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 font-medium">Giá hiện tại:</span>
                    <span className="text-xl font-bold text-green-900">
                      {formatPrice(calculateDisplayPrice(detailItem))}
                    </span>
                  </div>
                  {detailItem.variantInfo?.price && detailItem.variantInfo.price !== calculateDisplayPrice(detailItem) && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 font-medium">Giá gốc:</span>
                      <span className="text-lg text-gray-500 line-through">
                        {formatPrice(detailItem.variantInfo.price)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-green-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 font-medium">Tổng cộng:</span>
                      <span className="text-2xl font-bold text-green-900">
                        {formatPrice(calculateDisplayPrice(detailItem) * detailItem.quantity)}
                      </span>
                    </div>
                    <div className="text-sm text-green-600 text-right">
                      {formatPrice(calculateDisplayPrice(detailItem))} × {detailItem.quantity}
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              {(() => {
                // Lấy thông số kỹ thuật từ variant hoặc product
                let specifications = {};
                
                // Ưu tiên thông số từ variant
                if (detailItem.variantInfo?.specifications) {
                  specifications = detailItem.variantInfo.specifications;
                } else if (detailItem.variantId && (detailItem.product as any).variants) {
                  // Fallback: Tìm từ product.variants
                  const variant = (detailItem.product as any).variants.find((v: any) => v._id.toString() === detailItem.variantId?.toString());
                  if (variant?.specifications) {
                    specifications = variant.specifications;
                  }
                } else if (detailItem.product.specifications) {
                  // Fallback cuối cùng: từ product
                  specifications = detailItem.product.specifications;
                }

                const hasSpecifications = Object.keys(specifications).length > 0;

                if (!hasSpecifications) {
                  return (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-gray-500">
                        <div className="text-4xl mb-2">📋</div>
                        <div>Sản phẩm này không có thông số kỹ thuật</div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center mb-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      <h4 className="text-lg font-semibold text-purple-800">Thông số kỹ thuật</h4>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center py-2 border-b border-purple-100 last:border-b-0">
                          <span className="font-medium text-purple-700">{key}:</span>
                          <span className="text-purple-900 text-right">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </Modal>

        {/* Recommended Products */}
        {cartItems.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Bạn có thể thích
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendedProducts
                .filter(
                  (p) =>
                    p &&
                    p._id &&
                    p.name &&
                    p.images &&
                    p.images.length > 0 &&
                    typeof p.price === "number" &&
                    typeof p.averageRating === "number" &&
                    typeof p.numReviews === "number"
                )
                .map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
            </div>
          </div>
        )}
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
            // Khi mở modal, set voucher hiện tại đã được chọn (nếu có)
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
              if (selectedCouponId) {
                const coupon = availableCoupons.find(c => c._id === selectedCouponId);
                if (coupon) {
                  setAppliedShippingCoupon(null);
                  handleApplyDiscountCoupon(selectedCouponId);
                  success("Áp dụng mã giảm giá thành công!");
                }
              } else {
                // Nếu không chọn voucher nào, hủy áp dụng voucher hiện tại
                if (appliedDiscountCoupon) {
                  handleRemoveDiscountCoupon();
                  info("Đã hủy áp dụng mã giảm giá");
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
                    setAppliedShippingCoupon(null);
                    handleApplyDiscountCoupon(coupon._id);
                    success("Áp dụng mã giảm giá thành công!");
                    setIsCouponModalVisible(false);
                    setPromoCode("");
                  } else {
                    error("Mã giảm giá không hợp lệ");
                  }
                } else {
                  warning("Vui lòng nhập mã giảm giá");
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
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {/* Option: Không sử dụng voucher */}
              <div
                className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedCouponId === null
                  ? "border-gray-400 bg-gray-50"
                  : "border-gray-200 hover:border-gray-300"
                  }`}
                onClick={() => setSelectedCouponId(null)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 border-2 border-gray-400 rounded-full flex items-center justify-center">
                      {selectedCouponId === null && (
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Không sử dụng voucher</div>
                      <div className="text-xs text-gray-500">Thanh toán với giá gốc</div>
                    </div>
                  </div>
                </div>
              </div>

              {availableCoupons
                .map((coupon) => (
                  <div
                    key={coupon._id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedCouponId === coupon._id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                    onClick={() => {
                      // Nếu đã chọn voucher này, bỏ chọn; nếu chưa chọn, chọn voucher này
                      setSelectedCouponId(selectedCouponId === coupon._id ? null : coupon._id);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                            {coupon.type === "percentage" ? "GIẢM %" : "GIẢM TIỀN"}
                          </span>
                          <span className="text-xs text-gray-500">x10</span>
                        </div>

                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {coupon.name}
                        </div>

                        <div className="text-xs text-gray-600 space-y-1">
                          <div>
                            {coupon.type === "percentage"
                              ? `Giảm ${coupon.discount || coupon.value || 0}%`
                              : `Giảm ${formatPrice(coupon.discount || coupon.value || 0)}`
                            }
                          </div>
                          <div>Đơn tối thiểu {formatPrice(coupon.minAmount || coupon.minOrderValue || 0)}</div>
                          <div className="text-blue-600 font-medium">TOÀN NGÀNH HÀNG</div>
                          <div>HSD: {new Date(coupon.endDate || Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')}</div>
                        </div>

                        <div className="mt-2">
                          <a href="#" className="text-xs text-blue-500 hover:underline">
                            Điều kiện
                          </a>
                        </div>
                      </div>

                      <div className="ml-4">
                        <Radio
                          checked={selectedCouponId === coupon._id}
                          onChange={() => {
                            // Nếu đã chọn voucher này, bỏ chọn; nếu chưa chọn, chọn voucher này
                            setSelectedCouponId(selectedCouponId === coupon._id ? null : coupon._id);
                          }}
                        />
                      </div>
                    </div>

                    {selectedItems.size === 0 && (
                      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-2">
                        <div className="text-xs text-yellow-800">
                          Vui lòng chọn sản phẩm trong giỏ hàng để áp dụng Voucher này
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Cart;