import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaMinus,
  FaPlus,
  FaArrowLeft,
  FaLock,
  FaTruck,
  FaShieldAlt,
  FaCreditCard,
} from "react-icons/fa";
import ProductCard from "../../components/client/ProductCard";
import { useCart } from "../../contexts/CartContext";
import cartApi, { getTaxConfig } from "../../services/cartApi";
import { Product } from "../../interfaces/Product";
import { Modal, Button, Image, message } from "antd";

const Cart: React.FC = () => {
  const { state, updateQuantity, removeFromCart, clearCart, loadCart } =
    useCart();
  const cartItems = state.items;
  useEffect(() => {
    loadCart();
  }, []);

  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/product");
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
              : ["/placeholder-image.jpg"],
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
        console.error("Lỗi khi lấy sản phẩm gợi ý:", err);
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

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const savings = cartItems.reduce((sum, item) => {
    if (item.product.salePrice && item.product.salePrice < item.product.price) {
      return (
        sum + (item.product.price - item.product.salePrice) * item.quantity
      );
    }
    return sum;
  }, 0);
  const shipping = subtotal > 500000 ? 0 : 30000;
  const [taxRate, setTaxRate] = useState(0.08);
  useEffect(() => {
    getTaxConfig()
      .then((cfg) => setTaxRate(cfg.rate))
      .catch(() => setTaxRate(0.08));
  }, []);
  const tax = subtotal * taxRate;
  const total = subtotal + shipping + tax;

  const navigate = useNavigate();
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<any>(null);

  const handleShowDetail = (item: any) => {
    setDetailItem(item);
    setDetailModalOpen(true);
  };
  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setDetailItem(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span>Tiếp tục mua sắm</span>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
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
              <div className="bg-white rounded-2xl shadow-lg p-4">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Sản phẩm trong giỏ hàng ({cartItems.length})
                  </h3>
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-700 transition-colors flex items-center space-x-1"
                  >
                    <FaTrash className="w-3 h-3" />
                    <span>Xóa tất cả</span>
                  </button>
                </div>
                {/* Scrollable container for cart items */}
                <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-3 cart-scroll">
                  {cartItems.map((item) => {
                    // Ưu tiên lấy thông tin từ variantInfo nếu có
                    const variant = item.variantInfo;
                    const displayName = variant?.name || item.product.name;
                    const displayImage =
                      variant?.images?.[0] ||
                      item.product.images?.[0] ||
                      "/placeholder-image.jpg";
                    const displayPrice =
                      variant?.salePrice && variant?.salePrice < variant?.price
                        ? variant.salePrice
                        : variant?.price ??
                        (item.product.salePrice &&
                          item.product.salePrice < item.product.price
                          ? item.product.salePrice
                          : item.product.price);
                    const displayOldPrice =
                      variant?.salePrice && variant?.salePrice < variant?.price
                        ? variant.price
                        : item.product.salePrice &&
                          item.product.salePrice < item.product.price
                          ? item.product.price
                          : undefined;
                    const displayStock = variant?.stock ?? item.product.stock;
                    const displayColor = variant?.color?.name ?? null;
                    const displaySize = variant?.size ?? null;
                    const displaySKU = variant?.sku ?? null;
                    return (
                      <div
                        key={item._id}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors"
                      >
                        <div className="flex gap-4">
                          {/* Product Image - Thu nhỏ */}
                          <div className="flex-shrink-0">
                            <img
                              src={displayImage}
                              alt={displayName}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          </div>

                          {/* Product Info - Thu gọn */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col h-full justify-between">
                              <div className="flex-1">
                                <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                                  {displayName}
                                </h3>

                                {/* Product Options - Thu gọn */}
                                <div className="flex items-center flex-wrap gap-2 mb-2">
                                  {displayColor && (
                                    <div className="flex items-center space-x-1">
                                      <span className="text-xs text-gray-500">Màu:</span>
                                      <div
                                        className="w-4 h-4 rounded-full border border-gray-300"
                                        style={{ backgroundColor: displayColor }}
                                      />
                                    </div>
                                  )}
                                  {displaySize && (
                                    <div className="flex items-center space-x-1">
                                      <span className="text-xs text-gray-500">Size:</span>
                                      <span className="text-xs font-medium bg-gray-200 px-2 py-1 rounded">
                                        {displaySize}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Price - Thu gọn */}
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="text-lg font-bold text-gray-900">
                                    {formatPrice(displayPrice)}
                                  </span>
                                  {displayOldPrice && (
                                    <span className="text-sm text-gray-500 line-through">
                                      {formatPrice(displayOldPrice)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Bottom row with quantity and actions */}
                              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                {/* Quantity Controls - Thu gọn */}
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() =>
                                      updateQuantity(item._id, item.quantity - 1)
                                    }
                                    disabled={item.quantity <= 1}
                                    className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <FaMinus className="w-2 h-2" />
                                  </button>
                                  <span className="text-sm font-semibold w-8 text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => {
                                      const maxStock =
                                        variant?.stock ?? item.product.stock;
                                      if (item.quantity >= maxStock) {
                                        message.warning(
                                          "Đã đạt số lượng tối đa tồn kho của biến thể này!"
                                        );
                                        return;
                                      }
                                      updateQuantity(item._id, item.quantity + 1);
                                    }}
                                    disabled={
                                      item.quantity >=
                                      (variant?.stock ?? item.product.stock)
                                    }
                                    className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <FaPlus className="w-2 h-2" />
                                  </button>
                                </div>

                                {/* Actions - Thu gọn */}
                                <div className="flex items-center space-x-3">
                                  <Button
                                    type="link"
                                    onClick={() => handleShowDetail(item)}
                                    style={{ padding: 0, fontSize: '12px' }}
                                    className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all duration-200 font-medium"
                                  >
                                    <span className="flex items-center space-x-1">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                      <span>Chi tiết</span>
                                    </span>
                                  </Button>
                                  <button
                                    onClick={() => removeFromCart(item._id)}
                                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all duration-200 font-medium"
                                  >
                                    <FaTrash className="w-3 h-3" />
                                    <span className="text-xs">Xóa</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Stock Info - Thu gọn */}
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-600">
                            {typeof displayStock === "number"
                              ? (() => {
                                const remain = displayStock - item.quantity;
                                if (remain <= 0)
                                  return (
                                    <span className="text-red-600 font-medium">
                                      Hết hàng
                                    </span>
                                  );
                                if (remain <= 5)
                                  return (
                                    <span className="text-orange-500 font-medium">
                                      Chỉ còn {remain}
                                    </span>
                                  );
                                return (
                                  <span className="text-green-600 font-medium">
                                    Còn {remain} sản phẩm
                                  </span>
                                );
                              })()
                              : (() => {
                                const remain =
                                  item.product.stock - item.quantity;
                                if (remain <= 0)
                                  return (
                                    <span className="text-red-600 font-medium">
                                      Hết hàng
                                    </span>
                                  );
                                if (remain <= 5)
                                  return (
                                    <span className="text-orange-500 font-medium">
                                      Chỉ còn {remain}
                                    </span>
                                  );
                                return (
                                  <span className="text-green-600 font-medium">
                                    Còn {remain} sản phẩm
                                  </span>
                                );
                              })()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Tóm tắt đơn hàng
              </h2>

              {/* Summary Items */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Tạm tính ({cartItems.length} sản phẩm)
                  </span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Tiết kiệm</span>
                    <span>-{formatPrice(savings)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-green-600">Miễn phí</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Thuế</span>
                  <span className="font-semibold">{formatPrice(tax)}</span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>Đã bao gồm tiết kiệm</span>
                      <span>-{formatPrice(savings)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <FaTruck className="text-blue-600 w-4 h-4" />
                  <span className="text-sm font-semibold text-blue-900">
                    Miễn phí vận chuyển
                  </span>
                </div>
                <p className="text-sm text-blue-800">
                  Đơn hàng trên 500K được miễn phí vận chuyển
                </p>
              </div>

              {/* Checkout Button */}
              <Link
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/checkout", {
                    state: {
                      subtotal,
                      savings,
                      shipping,
                      tax,
                      total,
                    },
                  });
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 mb-4"
              >
                <FaLock className="w-5 h-5" />
                <span>Tiến hành thanh toán</span>
              </Link>

              {/* Security Info */}
              <div className="text-center text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <FaShieldAlt className="w-4 h-4" />
                  <span>Thanh toán an toàn</span>
                </div>
                <p>Thông tin của bạn được bảo vệ bằng mã hóa SSL</p>
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
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                Chi tiết sản phẩm
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {detailItem?.product.name}
              </div>
            </div>
          }
          width={700}
          styles={{
            body: { maxHeight: 600, overflowY: "auto", padding: 20 },
            header: { borderBottom: '1px solid #e5e7eb', padding: '20px 20px 0' }
          }}
        >
          {detailItem && (
            <div className="space-y-6">
              {/* Header với ảnh và thông tin cơ bản */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <Image
                    src={
                      detailItem.variantInfo?.images?.[0] ||
                      detailItem.product.images?.[0] ||
                      "/placeholder-image.jpg"
                    }
                    alt={detailItem.product.name}
                    width={200}
                    height={200}
                    className="object-cover rounded-xl border border-gray-200"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {detailItem.product.name}
                  </h3>

                  {/* Thông tin biến thể nổi bật */}
                  {detailItem.variantInfo && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6 shadow-sm">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                        <span className="font-bold text-blue-900 text-xl">Thông tin biến thể đã chọn</span>
                      </div>

                      {/* Tên biến thể - Nổi bật nhất */}
                      {detailItem.variantInfo.name && (
                        <div className="mb-4">
                          <span className="text-blue-700 block mb-2 font-semibold text-sm uppercase tracking-wide">Tên biến thể</span>
                          <div className="text-lg font-bold text-gray-900 bg-white px-4 py-3 rounded-lg border border-blue-200">
                            {detailItem.variantInfo.name}
                          </div>
                        </div>
                      )}

                      {/* Thông tin chi tiết biến thể */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* SKU */}
                        {detailItem.variantInfo.sku && (
                          <div className="bg-white rounded-lg p-4 border border-blue-100">
                            <span className="text-gray-600 block mb-2 font-medium text-sm">SKU</span>
                            <div className="font-mono font-semibold text-gray-900 text-lg">{detailItem.variantInfo.sku}</div>
                          </div>
                        )}

                        {/* Màu sắc */}
                        {detailItem.variantInfo.color?.name && (
                          <div className="bg-white rounded-lg p-4 border border-blue-100">
                            <span className="text-gray-600 block mb-2 font-medium text-sm">Màu sắc</span>
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                                style={{ backgroundColor: detailItem.variantInfo.color.code }}
                              ></div>
                              <span className="font-semibold text-gray-900">{detailItem.variantInfo.color.name}</span>
                            </div>
                          </div>
                        )}

                        {/* Kích thước */}
                        {detailItem.variantInfo.size && (
                          <div className="bg-white rounded-lg p-4 border border-blue-100">
                            <span className="text-gray-600 block mb-2 font-medium text-sm">Kích thước</span>
                            <div className="font-semibold text-gray-900 text-lg">{detailItem.variantInfo.size}</div>
                          </div>
                        )}

                        {/* Tồn kho biến thể */}
                        <div className="bg-white rounded-lg p-4 border border-blue-100">
                          <span className="text-gray-600 block mb-2 font-medium text-sm">Tồn kho biến thể</span>
                          <div className={`font-bold text-lg ${detailItem.variantInfo.stock > 10
                            ? 'text-green-600'
                            : detailItem.variantInfo.stock > 0
                              ? 'text-orange-600'
                              : 'text-red-600'
                            }`}>
                            {detailItem.variantInfo.stock} sản phẩm
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Giá và thông tin cơ bản */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">


                    {/* Giá biến thể - Luôn hiển thị nếu có biến thể */}
                    {detailItem.variantInfo ? (
                      <div className="mb-4">
                        <span className="text-gray-600 block mb-2 font-medium text-sm">Giá biến thể</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-3xl font-bold text-red-600">
                            {formatPrice(
                              detailItem.variantInfo.salePrice &&
                                detailItem.variantInfo.salePrice < detailItem.variantInfo.price
                                ? detailItem.variantInfo.salePrice
                                : detailItem.variantInfo.price
                            )}
                          </span>
                          {detailItem.variantInfo.salePrice &&
                            detailItem.variantInfo.salePrice < detailItem.variantInfo.price && (
                              <div className="flex flex-col items-start">
                                <span className="text-lg text-gray-500 line-through">
                                  {formatPrice(detailItem.variantInfo.price)}
                                </span>
                                <span className="text-sm text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                                  Tiết kiệm {formatPrice(detailItem.variantInfo.price - detailItem.variantInfo.salePrice)}
                                </span>
                              </div>
                            )}
                        </div>
                      </div>
                    ) : (
                      /* Giá sản phẩm gốc nếu không có biến thể */
                      <div className="mb-4">
                        <span className="text-gray-600 block mb-2 font-medium text-sm">Giá sản phẩm</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-3xl font-bold text-red-600">
                            {formatPrice(
                              detailItem.product.salePrice &&
                                detailItem.product.salePrice < detailItem.product.price
                                ? detailItem.product.salePrice
                                : detailItem.product.price
                            )}
                          </span>
                          {detailItem.product.salePrice &&
                            detailItem.product.salePrice < detailItem.product.price && (
                              <div className="flex flex-col items-start">
                                <span className="text-lg text-gray-500 line-through">
                                  {formatPrice(detailItem.product.price)}
                                </span>
                                <span className="text-sm text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                                  Tiết kiệm {formatPrice(detailItem.product.price - detailItem.product.salePrice)}
                                </span>
                              </div>
                            )}
                        </div>
                      </div>
                    )}

                    {/* Thông tin cơ bản */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <span className="text-gray-600 block mb-1 text-sm">Số lượng đã chọn</span>
                        <span className="font-bold text-gray-900 text-lg">{detailItem.quantity}</span>
                      </div>

                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <span className="text-gray-600 block mb-1 text-sm">
                          {detailItem.variantInfo ? 'Tồn kho biến thể' : 'Tồn kho sản phẩm'}
                        </span>
                        <span className={`font-bold text-lg ${detailItem.variantInfo
                          ? (detailItem.variantInfo.stock > 10
                            ? 'text-green-600'
                            : detailItem.variantInfo.stock > 0
                              ? 'text-orange-600'
                              : 'text-red-600')
                          : (detailItem.product.stock > 10
                            ? 'text-green-600'
                            : detailItem.product.stock > 0
                              ? 'text-orange-600'
                              : 'text-red-600')
                          }`}>
                          {detailItem.variantInfo
                            ? `${detailItem.variantInfo.stock} sản phẩm`
                            : `${detailItem.product.stock} sản phẩm`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông số kỹ thuật - Hiển thị từ sản phẩm gốc */}
              {(() => {
                // Luôn hiển thị thông số kỹ thuật từ sản phẩm gốc
                const specifications = detailItem.product.specifications;

                if (specifications && Object.keys(specifications).length > 0) {
                  return (
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Thông số kỹ thuật</span>
                      </h4>
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <table className="w-full">
                          <tbody>
                            {Object.entries(specifications).map(([key, value], index) => (
                              <tr key={key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="py-3 px-4 font-medium text-gray-700 border-r border-gray-200 w-1/3">
                                  {key}
                                </td>
                                <td className="py-3 px-4 text-gray-900">{String(value)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="border-t border-gray-200 pt-6">
                      <div className="text-center text-gray-500 py-8">
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm">Sản phẩm này không có thông số kỹ thuật chi tiết</p>
                      </div>
                    </div>
                  );
                }
              })()}

              {/* Thông tin bổ sung - Ưu tiên từ biến thể */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Thông tin bổ sung</span>
                </h4>

                {/* Mô tả sản phẩm - Luôn hiển thị từ sản phẩm gốc */}
                {detailItem.product.description ? (
                  <div className="mb-4">
                    <span className="text-gray-600 block mb-2 font-medium">Mô tả:</span>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900 leading-relaxed">
                        {detailItem.product.description}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <span className="text-gray-600 block mb-2 font-medium">Mô tả:</span>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-500 italic">
                        Không có mô tả cho sản phẩm này
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {detailItem.variantInfo?.weight && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-600 block mb-1">Cân nặng</span>
                      <span className="font-medium text-gray-900">{detailItem.variantInfo.weight}g</span>
                    </div>
                  )}
                  {detailItem.variantInfo?.dimensions && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-600 block mb-1">Kích thước</span>
                      <span className="font-medium text-gray-900">
                        {detailItem.variantInfo.dimensions.length} × {detailItem.variantInfo.dimensions.width} × {detailItem.variantInfo.dimensions.height} cm
                      </span>
                    </div>
                  )}
                  {detailItem.variantInfo?.warranty && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-600 block mb-1">Bảo hành</span>
                      <span className="font-medium text-gray-900">{detailItem.variantInfo.warranty} tháng</span>
                    </div>
                  )}
                  {/* Hiển thị thông tin từ sản phẩm gốc nếu biến thể không có */}
                  {!detailItem.variantInfo?.weight && detailItem.product.weight && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-600 block mb-1">Cân nặng</span>
                      <span className="font-medium text-gray-900">{detailItem.product.weight}g</span>
                    </div>
                  )}
                  {!detailItem.variantInfo?.dimensions && detailItem.product.dimensions && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-600 block mb-1">Kích thước</span>
                      <span className="font-medium text-gray-900">
                        {detailItem.product.dimensions.length} × {detailItem.product.dimensions.width} × {detailItem.product.dimensions.height} cm
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Thông tin sản phẩm gốc nếu có biến thể */}
              {detailItem.variantInfo && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>Thông tin sản phẩm gốc</span>
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 block mb-1">Tên sản phẩm:</span>
                        <span className="font-medium text-gray-900">{detailItem.product.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">Giá gốc:</span>
                        <span className="font-medium text-gray-900">{formatPrice(detailItem.product.price)}</span>
                      </div>
                      {detailItem.product.salePrice && detailItem.product.salePrice < detailItem.product.price && (
                        <div>
                          <span className="text-gray-600 block mb-1">Giá khuyến mãi:</span>
                          <span className="font-medium text-green-600">{formatPrice(detailItem.product.salePrice)}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600 block mb-1">Tồn kho tổng:</span>
                        <span className="font-medium text-gray-900">{detailItem.product.stock} sản phẩm</span>
                      </div>
                    </div>
                  </div>
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
    </div>
  );
};

export default Cart;