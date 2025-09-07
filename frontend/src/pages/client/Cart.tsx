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
import { getAvailableCoupons, getUsedCoupons, applyCoupon, removeCoupon, Coupon } from "../../services/couponApi";
import { Product } from "../../interfaces/Product";
import { Modal, Button, Image, message, Input, Radio } from "antd";
import {
  calculateDisplayPrice,
  calculateSubtotal,
  calculateTotalSavings
} from "../../utils/priceUtils";

const Cart: React.FC = () => {
  const { state, updateQuantity, removeFromCart, loadCart } =
    useCart();
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

  const shipping = subtotal > 500000 || appliedShippingCoupon ? 0 : 30000;
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

  // Load coupons on component mount
  useEffect(() => {
    const loadCoupons = async () => {
      try {
        setLoadingCoupons(true);
        const [availableResponse, usedResponse] = await Promise.all([
          getAvailableCoupons(),
          getUsedCoupons()
        ]);

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

    loadCoupons();
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
        message.error("Mã giảm giá không tồn tại");
        return;
      }

      if (coupon.type === "shipping") {
        message.warning("Mã này chỉ áp dụng cho vận chuyển");
        return;
      }

      const selectedSubtotal = cartItems
        .filter(item => selectedItems.has(item._id))
        .reduce((sum, item) => sum + (calculateDisplayPrice(item) * item.quantity), 0);

      const minAmount = coupon.minAmount || coupon.minOrderValue || 0;
      if (selectedSubtotal < minAmount) {
        message.warning(`Đơn hàng tối thiểu ${formatPrice(minAmount)} để sử dụng mã này`);
        return;
      }

      const result = await applyCoupon(coupon.code, selectedSubtotal);
      if (result.success) {
        setAppliedDiscountCoupon(coupon);
        message.success(`Đã áp dụng mã giảm giá "${coupon.name}"`);
      } else {
        message.error(result.message || "Không thể áp dụng mã giảm giá");
      }
    } catch {
      message.error("Có lỗi xảy ra khi áp dụng mã giảm giá");
    }
  };

  const handleApplyShippingCoupon = async (couponId: string) => {
    if (!couponId) {
      setAppliedShippingCoupon(null);
      return;
    }

    try {
      const coupon = availableCoupons.find(c => c._id === couponId);
      if (!coupon) {
        message.error("Mã giảm giá không tồn tại");
        return;
      }

      if (coupon.type !== "shipping") {
        message.warning("Mã này chỉ áp dụng cho giảm giá sản phẩm");
        return;
      }

      const selectedSubtotal = cartItems
        .filter(item => selectedItems.has(item._id))
        .reduce((sum, item) => sum + (calculateDisplayPrice(item) * item.quantity), 0);

      const minAmount = coupon.minAmount || coupon.minOrderValue || 0;
      if (selectedSubtotal < minAmount) {
        message.warning(`Đơn hàng tối thiểu ${formatPrice(minAmount)} để sử dụng mã này`);
        return;
      }

      const result = await applyCoupon(coupon.code, selectedSubtotal);
      if (result.success) {
        setAppliedShippingCoupon(coupon);
        message.success(`Đã áp dụng mã vận chuyển "${coupon.name}"`);
      } else {
        message.error(result.message || "Không thể áp dụng mã vận chuyển");
      }
    } catch {
      message.error("Có lỗi xảy ra khi áp dụng mã vận chuyển");
    }
  };

  const handleRemoveDiscountCoupon = async () => {
    if (appliedDiscountCoupon) {
      try {
        await removeCoupon(appliedDiscountCoupon._id);
        setAppliedDiscountCoupon(null);
        message.info("Đã hủy áp dụng mã giảm giá");
      } catch {
        message.error("Có lỗi xảy ra khi hủy mã giảm giá");
      }
    }
  };

  const handleRemoveShippingCoupon = async () => {
    if (appliedShippingCoupon) {
      try {
        await removeCoupon(appliedShippingCoupon._id);
        setAppliedShippingCoupon(null);
        message.info("Đã hủy áp dụng mã vận chuyển");
      } catch {
        message.error("Có lỗi xảy ra khi hủy mã vận chuyển");
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items - Table Format */}
          <div className="lg:col-span-2 order-2 lg:order-1">
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
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Table Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Giỏ hàng</h2>
                    <span className="text-sm text-gray-600">{state.itemCount} sản phẩm</span>
                  </div>
                </div>

                {/* Table Headers */}
                <div className="px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-200">
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

                {/* Table Body - Scrollable */}
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
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


                    const displayStock = variant?.stock ?? item.product.stock;
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

                                {/* Stock Info - Hidden on mobile */}
                                <div className="mt-1 hidden sm:block">
                                  <span className="text-xs text-gray-500">
                                    {typeof displayStock === "number" ? (
                                      displayStock - item.quantity <= 0 ? (
                                        <span className="text-red-600">Hết hàng</span>
                                      ) : displayStock - item.quantity <= 5 ? (
                                        <span className="text-orange-500">Chỉ còn {displayStock - item.quantity}</span>
                                      ) : (
                                        <span className="text-green-600">Còn {displayStock - item.quantity} sản phẩm</span>
                                      )
                                    ) : (
                                      <span>Tồn kho: {displayStock}</span>
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="col-span-2">
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
                                    message.warning("Đã đạt số lượng tối đa tồn kho!");
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
                                    message.warning("Đã đạt số lượng tối đa tồn kho!");
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

          {/* Order Summary */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 sticky top-4 lg:top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Tóm tắt đơn hàng
                </h2>
                <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                  {selectedItems.size} sản phẩm
                </div>
              </div>

              {/* Summary Items */}
              <div className="space-y-4 mb-6">
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
                    <div className="space-y-2 max-h-32 overflow-y-auto">
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

                {/* Debug: Hiển thị chi tiết tính toán tạm tính */}
                {import.meta.env.DEV && (
                  <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                    <div className="font-medium mb-1">🔍 Chi tiết tạm tính (chỉ sản phẩm được chọn):</div>
                    {selectedCartItems.map((item, index) => {
                      const variant = item.variantInfo;
                      const price = calculateDisplayPrice(item);
                      const total = price * item.quantity;
                      const variantName = variant?.name || '';

                      return (
                        <div key={index} className="ml-2 mb-1">
                          • {item.product.name}{variantName ? ` (${variantName})` : ''}: {formatPrice(price)} × {item.quantity} = {formatPrice(total)}
                        </div>
                      );
                    })}
                    <div className="border-t border-gray-300 pt-1 mt-1 font-medium">
                      Tổng: {formatPrice(subtotal)}
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

                {/* Total */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-gray-900">TỔNG CỘNG</span>
                    <span className="text-xl font-bold text-purple-600">{formatPrice(total)}</span>
                  </div>
                  {(savings > 0 || couponDiscount > 0) && (
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Đã bao gồm giảm giá</span>
                      <span className="font-semibold text-green-600">-{formatPrice(savings + couponDiscount)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Coupon Section */}
              <div className="mb-6">
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

                  {/* Coupon Button */}
                  <button
                    onClick={() => setIsCouponModalVisible(true)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
                  >
                    <span>Chọn mã giảm giá</span>
                    <span className="text-sm opacity-90">›</span>
                  </button>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="mb-4">
                <Link
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (selectedItems.size === 0) {
                      message.warning("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
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
          title={`Thông tin chi tiết: ${detailItem?.product.name}`}
          width={500}
          styles={{ body: { maxHeight: 600, overflowY: "auto", padding: 16 } }}
        >
          {detailItem && (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <Image
                  src={
                    detailItem.variantInfo?.images?.[0] ||
                    detailItem.product.images?.[0] ||
                    "/placeholder.svg"
                  }
                  alt={detailItem.product.name}
                  width={200}
                  height={200}
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="text-lg font-bold mb-2">
                Tên sản phẩm: {detailItem.product.name}
              </div>
              {detailItem.variantInfo && (
                <div className="mb-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="font-medium text-blue-800 mb-2">🎯 Thông tin biến thể:</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Tên biến thể:</span> {detailItem.variantInfo.name || "N/A"}</div>
                    <div><span className="font-medium">Variant ID:</span> {detailItem.variantId || "N/A"}</div>
                    <div><span className="font-medium">Giá gốc:</span> {formatPrice(detailItem.variantInfo.price || 0)}</div>
                    <div><span className="font-medium">Giá sale:</span> {detailItem.variantInfo.salePrice ? formatPrice(detailItem.variantInfo.salePrice) : "Không có"}</div>
                    <div><span className="font-medium">Tồn kho:</span> {detailItem.variantInfo.stock || 0}</div>
                    <div><span className="font-medium">SKU:</span> {detailItem.variantInfo.sku || "N/A"}</div>
                  </div>
                </div>
              )}
              <div className="mb-2">
                <div className="flex items-center space-x-2">
                  <span>Giá:</span>
                  <span className="text-red-600 font-semibold">
                    {formatPrice(calculateDisplayPrice(detailItem))}
                  </span>
                  <span className="text-sm text-gray-500">/ sản phẩm</span>
                </div>

                {/* Hiển thị tổng giá theo số lượng */}
                <div className="mt-1 text-lg font-bold text-green-600">
                  Tổng: {formatPrice(calculateDisplayPrice(detailItem) * detailItem.quantity)}
                </div>
              </div>
              <div className="mb-2">
                Số lượng: <span className="font-semibold">{detailItem.quantity}</span>
              </div>
              <div className="mb-2">
                Tồn kho:{" "}
                <span className="font-semibold">
                  {detailItem.variantInfo?.stock ?? detailItem.product.stock}
                </span>
              </div>
              <div className="mb-2">
                SKU:{" "}
                <span className="font-mono">
                  {detailItem.variantInfo?.sku ?? detailItem.product.sku ?? "N/A"}
                </span>
              </div>
              <div className="mb-2">
                Màu sắc:{" "}
                <span>
                  {detailItem.variantInfo?.color ?? detailItem.product.color ?? "N/A"}
                </span>
              </div>
              <div className="mb-2">
                Kích thước:{" "}
                <span>
                  {detailItem.variantInfo?.size ?? detailItem.product.size ?? "N/A"}
                </span>
              </div>
              <div className="mb-2">
                Cân nặng:{" "}
                <span>
                  {typeof detailItem.variantInfo?.weight === "number"
                    ? `${detailItem.variantInfo.weight}g`
                    : typeof detailItem.product.weight === "number"
                      ? `${detailItem.product.weight}g`
                      : "N/A"}
                </span>
              </div>
              {(detailItem.variantInfo?.specifications &&
                Object.keys(detailItem.variantInfo.specifications).length > 0) ||
                (detailItem.specifications &&
                  Object.keys(detailItem.specifications).length > 0) ? (
                <div className="mt-2">
                  <div className="font-medium mb-1">Thông số kỹ thuật:</div>
                  <table className="w-full text-sm border rounded-lg">
                    <tbody>
                      {Object.entries(
                        detailItem.variantInfo?.specifications ||
                        detailItem.specifications || {}
                      ).map(([key, value]) => (
                        <tr key={key}>
                          <td className="py-2 px-2 bg-gray-50 font-medium text-gray-700">
                            {key}
                          </td>
                          <td className="py-2 px-2 text-gray-600">{String(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-gray-500 mt-2">
                  Sản phẩm này không có thông số kỹ thuật.
                </div>
              )}
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
                  if (coupon.type === "shipping") {
                    setAppliedDiscountCoupon(null);
                    handleApplyShippingCoupon(selectedCouponId);
                  } else {
                    setAppliedShippingCoupon(null);
                    handleApplyDiscountCoupon(selectedCouponId);
                  }
                  message.success("Áp dụng mã giảm giá thành công!");
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
                    if (coupon.type === "shipping") {
                      setAppliedDiscountCoupon(null);
                      handleApplyShippingCoupon(coupon._id);
                    } else {
                      setAppliedShippingCoupon(null);
                      handleApplyDiscountCoupon(coupon._id);
                    }
                    message.success("Áp dụng mã giảm giá thành công!");
                    setIsCouponModalVisible(false);
                    setPromoCode("");
                  } else {
                    message.error("Mã giảm giá không hợp lệ");
                  }
                } else {
                  message.warning("Vui lòng nhập mã giảm giá");
                }
              }}
            >
              ÁP DỤNG
            </Button>
          </div>

          {/* Free Shipping Vouchers */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Mã Miễn Phí Vận Chuyển</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availableCoupons
                .filter(coupon => coupon.type === "shipping")
                .map((coupon) => (
                  <div
                    key={coupon._id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedCouponId === coupon._id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                    onClick={() => setSelectedCouponId(coupon._id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                            FREE SHIP
                          </span>
                          <span className="text-xs text-gray-500">x10</span>
                        </div>

                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {coupon.name}
                        </div>

                        <div className="text-xs text-gray-600 space-y-1">
                          <div>Giảm tối đa {formatPrice(coupon.maxDiscount || coupon.maxDiscountValue || coupon.discount || coupon.value || 0)}</div>
                          <div>Đơn tối thiểu {formatPrice(coupon.minAmount || coupon.minOrderValue || 0)}</div>
                          <div className="text-green-600 font-medium">TOÀN NGÀNH HÀNG</div>
                          <div>HSD: {new Date(coupon.endDate || coupon.expiryDate || Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')}</div>
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
                          onChange={() => setSelectedCouponId(coupon._id)}
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

          {/* Discount Vouchers */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Mã Giảm Giá Sản Phẩm</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availableCoupons
                .filter(coupon => coupon.type !== "shipping")
                .map((coupon) => (
                  <div
                    key={coupon._id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedCouponId === coupon._id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                    onClick={() => setSelectedCouponId(coupon._id)}
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
                          <div>HSD: {new Date(coupon.endDate || coupon.expiryDate || Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')}</div>
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
                          onChange={() => setSelectedCouponId(coupon._id)}
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