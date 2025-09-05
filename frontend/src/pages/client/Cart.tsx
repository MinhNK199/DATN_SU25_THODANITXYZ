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
import {
  calculateDisplayPrice,
  calculateOriginalPrice,
  calculateSubtotal,
  calculateTotalSavings
} from "../../utils/priceUtils";

const Cart: React.FC = () => {
  const { state, updateQuantity, removeFromCart, clearCart, loadCart } =
    useCart();
  const cartItems = state.items;
  useEffect(() => {
    loadCart();
  }, []);

  // Debug: Log mỗi khi cartItems thay đổi
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Cart Items changed:', cartItems);
      console.log('📊 Current subtotal calculation:');
      cartItems.forEach((item, index) => {
        const price = calculateDisplayPrice(item);
        const total = price * item.quantity;
        console.log(`  Item ${index + 1}: ${item.product.name}`);
        console.log(`    Price: ${price} (${formatPrice(price)})`);
        console.log(`    Quantity: ${item.quantity}`);
        console.log(`    Total: ${total} (${formatPrice(total)})`);
      });
    }
  }, [cartItems]);

  // Debug: Log subtotal mỗi khi nó thay đổi
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && cartItems.length > 0) {
      const currentSubtotal = cartItems.reduce((sum, item) => {
        const price = calculateDisplayPrice(item);
        return sum + (price * item.quantity);
      }, 0);
      console.log(`💰 Subtotal updated: ${currentSubtotal} (${formatPrice(currentSubtotal)})`);
    }
  }, [cartItems]);

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



  // Tính toán subtotal và savings sử dụng utility functions
  const subtotal = calculateSubtotal(cartItems);
  const savings = calculateTotalSavings(cartItems);
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
              <div className="space-y-4">
                {cartItems.map((item) => {

                  // Ưu tiên lấy thông tin từ variantInfo nếu có
                  const variant = item.variantInfo;
                  const displayName = variant?.name || item.product.name;
                  const displayImage =
                    variant?.images?.[0] ||
                    item.product.images?.[0] ||
                    "/placeholder.svg";
                  // Logic hiển thị giá: ưu tiên giá từ biến thể, đảm bảo nhất quán
                  const displayPrice = calculateDisplayPrice(item);

                  // Logic hiển thị giá gốc để so sánh, đảm bảo nhất quán
                  const displayOldPrice = calculateOriginalPrice(item);
                  const displayStock = variant?.stock ?? item.product.stock;

                  // Cải thiện logic hiển thị màu sắc và kích thước
                  const displayColor = variant?.color?.code || variant?.color?.name || item.product.color?.code || item.product.color?.name || null;
                  const displaySize = variant?.size || item.product.size || null;
                  const displaySKU = variant?.sku || item.product.sku || null;
                  return (
                    <div
                      key={item._id}
                      className="bg-white rounded-2xl shadow-lg p-6"
                    >
                      {/* Thông báo biến thể nếu có */}
                      {item.variantId && (
                        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-blue-600 text-sm font-medium">
                                🎯 Sản phẩm với biến thể đã chọn
                              </span>
                              {variant?.name && (
                                <span className="text-blue-700 text-sm">
                                  ({variant.name})
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                              ID: {item.variantId}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={displayImage}
                            alt={displayName}
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {item.product.name}
                              </h3>

                              {/* Hiển thị tên biến thể ngay dưới tên sản phẩm */}
                              {variant?.name && (
                                <div className="mb-3">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-lg font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 shadow-sm">
                                      🎯 {variant.name}
                                    </span>
                                    {item.variantId && (
                                      <span className="text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded-full">
                                        ID: {item.variantId}
                                      </span>
                                    )}
                                  </div>

                                  {/* Debug info tạm thời để kiểm tra giá biến thể */}
                                  <div className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
                                    <div>Variant Price: {variant.price || 'Không có'}</div>
                                    <div>Variant Sale Price: {variant.salePrice || 'Không có'}</div>
                                    <div>Product Price: {item.product.price}</div>
                                    <div>Item Price (from backend): {item.price}</div>
                                    <div>Final Price (calculated): {displayPrice}</div>
                                    <div>Price Source: {variant.price ? 'Variant' : 'Product'}</div>
                                    <div>Quantity: {item.quantity}</div>
                                    <div>Total: {displayPrice * item.quantity}</div>
                                  </div>

                                  {/* Hiển thị thông tin bổ sung của biến thể */}
                                  <div className="flex items-center space-x-4 text-xs text-gray-600 mt-2">
                                    {variant?.sku && (
                                      <span className="bg-gray-100 px-2 py-1 rounded">
                                        SKU: {variant.sku}
                                      </span>
                                    )}
                                    {variant?.stock !== undefined && (
                                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                                        Tồn kho: {variant.stock}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                              {/* Nút xem chi tiết */}
                              <Button
                                type="link"
                                onClick={() => handleShowDetail(item)}
                                style={{ padding: 0 }}
                              >
                                Xem chi tiết
                              </Button>
                              {/* Product Options */}
                              <div className="flex items-center space-x-4 mb-4">
                                {/* Hiển thị màu sắc */}
                                {displayColor && (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">
                                      Màu:
                                    </span>
                                    <div
                                      className="w-6 h-6 rounded-full border-2 border-gray-300"
                                      style={{ backgroundColor: displayColor }}
                                      title={displayColor}
                                    />
                                  </div>
                                )}

                                {/* Hiển thị kích thước */}
                                {displaySize && (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">
                                      Kích thước:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {displaySize}
                                    </span>
                                  </div>
                                )}

                                {/* Hiển thị SKU */}
                                {displaySKU && (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">
                                      SKU:
                                    </span>
                                    <span className="text-sm font-mono">
                                      {displaySKU}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Price */}
                              <div className="flex items-center space-x-3 mb-4">
                                <div className="flex flex-col">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-2xl font-bold text-gray-900">
                                      {formatPrice(displayPrice)}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      / sản phẩm
                                    </span>
                                  </div>

                                  {/* Hiển thị tổng giá theo số lượng */}
                                  <div className="text-lg font-semibold text-green-600">
                                    Tổng: {formatPrice(displayPrice * item.quantity)}
                                  </div>





                                  {/* Hiển thị giá gốc nếu có giảm giá */}
                                  {displayOldPrice && displayOldPrice !== displayPrice && (
                                    <span className="text-lg text-gray-500 line-through">
                                      {formatPrice(displayOldPrice)}
                                    </span>
                                  )}
                                </div>

                                {/* Hiển thị thông tin tiết kiệm */}
                                {displayOldPrice && displayOldPrice !== displayPrice && (
                                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                                    Tiết kiệm{" "}
                                    {formatPrice((displayOldPrice - displayPrice) * item.quantity)}
                                  </span>
                                )}

                                {/* Hiển thị thông báo rõ ràng về nguồn giá */}
                                {variant && variant.price ? (
                                  <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm font-semibold">
                                    🎯 Giá biến thể: {formatPrice(calculateDisplayPrice(item))}
                                  </span>
                                ) : (
                                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                                    Giá sản phẩm gốc
                                  </span>
                                )}


                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                {variant?.stock !== undefined ? (
                                  <span className="text-blue-600 font-medium">
                                    🎯 Tồn kho biến thể: {variant.stock}
                                  </span>
                                ) : (
                                  <span>Tồn kho: {displayStock}</span>
                                )}
                              </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex flex-col items-end space-y-4">
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() =>
                                    updateQuantity(item._id, item.quantity - 1)
                                  }
                                  disabled={item.quantity <= 1}
                                  className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  <FaMinus className="w-3 h-3" />
                                </button>
                                <span className="text-lg font-semibold w-12 text-center">
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

                                    const newQuantity = item.quantity + 1;
                                    updateQuantity(item._id, newQuantity);
                                  }}
                                  disabled={
                                    item.quantity >=
                                    (variant?.stock ?? item.product.stock)
                                  }
                                  className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  <FaPlus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={() => removeFromCart(item._id)}
                                className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg border border-red-200 hover:border-red-300 transition-all duration-200 font-medium"
                              >
                                <FaTrash className="w-5 h-5" />
                                <span>Xóa</span>
                              </button>
                            </div>
                          </div>

                          {/* Stock Info */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <span className="text-sm text-gray-600">
                              {typeof displayStock === "number"
                                ? (() => {
                                  const remain = displayStock - item.quantity;
                                  if (remain <= 0)
                                    return (
                                      <span className="text-red-600">
                                        Hết hàng
                                      </span>
                                    );
                                  if (remain <= 5)
                                    return (
                                      <span className="text-orange-500">
                                        Chỉ còn {remain}
                                      </span>
                                    );
                                  return (
                                    <span className="text-green-600">
                                      Còn {remain} sản phẩm
                                    </span>
                                  );
                                })()
                                : (() => {
                                  const remain =
                                    item.product.stock - item.quantity;
                                  if (remain <= 0)
                                    return (
                                      <span className="text-red-600">
                                        Hết hàng
                                      </span>
                                    );
                                  if (remain <= 5)
                                    return (
                                      <span className="text-orange-500">
                                        Chỉ còn {remain}
                                      </span>
                                    );
                                  return (
                                    <span className="text-green-600">
                                      Còn {remain} sản phẩm
                                    </span>
                                  );
                                })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                    Tạm tính ({state.itemCount} sản phẩm)
                  </span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>

                {/* Debug: Hiển thị chi tiết tính toán tạm tính */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                    <div className="font-medium mb-1">🔍 Chi tiết tạm tính:</div>
                    {cartItems.map((item, index) => {
                      const price = calculateDisplayPrice(item);
                      const total = price * item.quantity;
                      return (
                        <div key={index} className="ml-2 mb-1">
                          • {item.product.name}: {formatPrice(price)} × {item.quantity} = {formatPrice(total)}
                          <div className="ml-4 text-xs text-gray-400">
                            Price Source: {item.variantInfo?.price ? 'Variant' : 'Product'} |
                            Variant Price: {item.variantInfo?.price || 'N/A'} |
                            Product Price: {item.product.price}
                          </div>
                        </div>
                      );
                    })}
                    <div className="border-t border-gray-300 pt-1 mt-1 font-medium">
                      Tổng: {formatPrice(subtotal)}
                    </div>
                  </div>
                )}



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
                  navigate("/checkout/shipping", {
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
                          <td className="py-2 px-2 text-gray-600">{value}</td>
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
    </div>
  );
};

export default Cart;