import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import cartApi from "../../services/cartApi";
import { Product } from "../../interfaces/Product";

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
        const res = await fetch("http://localhost:5000/api/product");
        const data = await res.json();
        // Chuẩn hóa dữ liệu sản phẩm gợi ý
        const normalized = (data.products || []).map((p: Product) => ({
          _id: p._id,
          name: p.name,
          price: p.price,
          salePrice: p.salePrice,
          images: p.images && p.images.length > 0 ? p.images : ["/placeholder-image.jpg"],
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
  const tax = subtotal * 0.08;
  const total = subtotal - savings + shipping + tax;

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
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={
                            item.product.images && item.product.images[0]
                              ? item.product.images[0]
                              : "/placeholder-image.jpg"
                          }
                          alt={item.product.name}
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

                            {/* Product Options */}
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">
                                  Màu:
                                </span>
                                <div
                                  className="w-6 h-6 rounded-full border-2 border-gray-300"
                                  style={{ backgroundColor: item.color }}
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">
                                  Dung lượng:
                                </span>
                                <span className="text-sm font-medium">
                                  {item.size || "Không có"}
                                </span>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="flex items-center space-x-3 mb-4">
                              <span className="text-2xl font-bold text-gray-900">
                                {formatPrice(
                                  item.product.salePrice || item.product.price
                                )}
                              </span>
                              {item.product.salePrice &&
                                item.product.salePrice < item.product.price && (
                                  <span className="text-lg text-gray-500 line-through">
                                    {formatPrice(item.product.price)}
                                  </span>
                                )}
                              {item.product.salePrice &&
                                item.product.salePrice < item.product.price && (
                                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                                    Tiết kiệm{" "}
                                    {formatPrice(
                                      item.product.price -
                                        item.product.salePrice
                                    )}
                                  </span>
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
                                onClick={() =>
                                  updateQuantity(item._id, item.quantity + 1)
                                }
                                disabled={
                                  item.quantity >= (item.product.stock || 99)
                                }
                                className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <FaPlus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => removeFromCart(item._id)}
                              className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
                            >
                              <FaTrash className="w-4 h-4" />
                              <span>Xóa</span>
                            </button>
                          </div>
                        </div>

                        {/* Stock Info */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <span className="text-sm text-gray-600">
                            {typeof item.product.availableStock === "number"
                              ? (() => {
                                  const remain =
                                    item.product.availableStock - item.quantity;
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
                ))}
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
                to="/checkout"
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
                    p.images && p.images.length > 0 &&
                    typeof p.price === "number" &&
                    typeof p.averageRating === "number" &&
                    typeof p.numReviews === "number"
                )
                .map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
