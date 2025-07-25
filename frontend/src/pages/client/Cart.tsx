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
import { Modal, Button, message } from "antd";

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
              <div className="space-y-4">
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
                  const displayColor = variant?.color ?? null;
                  const displaySize = variant?.size ?? null;
                  const displaySKU = variant?.sku ?? null;
                  const displaySpecifications =
                    variant?.specifications &&
                    Object.keys(variant.specifications).length > 0
                      ? variant.specifications
                      : item.specifications &&
                        Object.keys(item.specifications).length > 0
                      ? item.specifications
                      : null;
                  return (
                    <div
                      key={item._id}
                      className="bg-white rounded-2xl shadow-lg p-6"
                    >
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
                                {displayName}
                              </h3>
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
                                {displayColor && (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">
                                      Màu:
                                    </span>
                                    <div
                                      className="w-6 h-6 rounded-full border-2 border-gray-300"
                                      style={{ backgroundColor: displayColor }}
                                    />
                                  </div>
                                )}
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
                                <span className="text-2xl font-bold text-gray-900">
                                  {formatPrice(displayPrice)}
                                </span>
                                {displayOldPrice && (
                                  <span className="text-lg text-gray-500 line-through">
                                    {formatPrice(displayOldPrice)}
                                  </span>
                                )}
                                {displayOldPrice && (
                                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                                    Tiết kiệm{" "}
                                    {formatPrice(
                                      displayOldPrice - displayPrice
                                    )}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                Tồn kho: {displayStock}
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
                                    updateQuantity(item._id, item.quantity + 1);
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
                          {/* Thông số kỹ thuật của biến thể nếu có */}
                          {displaySpecifications &&
                            Object.keys(displaySpecifications).length > 0 && (
                              <div className="mt-2">
                                <span className="font-medium text-gray-700">
                                  Thông số kỹ thuật:
                                </span>
                                <table className="w-full border rounded-lg overflow-hidden mb-2 mt-1">
                                  <tbody>
                                    {Object.entries(displaySpecifications).map(
                                      ([key, value]) => (
                                        <tr key={key}>
                                          <td className="py-1 px-2 bg-gray-50 font-medium text-sm text-gray-700">
                                            {key}
                                          </td>
                                          <td className="py-1 px-2 text-sm text-gray-600">
                                            {value}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            )}
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
          title="Thông tin chi tiết sản phẩm"
        >
          {detailItem && (
            <div>
              <div className="flex flex-col items-center mb-4">
                <img
                  src={
                    detailItem.variantInfo?.images?.[0] ||
                    detailItem.product.images?.[0] ||
                    "/placeholder-image.jpg"
                  }
                  alt={detailItem.variantInfo?.name || detailItem.product.name}
                  className="w-40 h-40 object-cover rounded-lg mb-2"
                />
                <div className="text-lg font-bold mb-1">
                  {detailItem.variantInfo?.name || detailItem.product.name}
                </div>
                <div className="mb-1">
                  Giá:{" "}
                  <span className="text-red-600 font-semibold">
                    {formatPrice(
                      detailItem.variantInfo?.salePrice &&
                        detailItem.variantInfo?.salePrice <
                          detailItem.variantInfo?.price
                        ? detailItem.variantInfo.salePrice
                        : typeof detailItem.variantInfo?.price === "number"
                        ? detailItem.variantInfo.price
                        : detailItem.product.salePrice &&
                          detailItem.product.salePrice <
                            detailItem.product.price
                        ? detailItem.product.salePrice
                        : detailItem.product.price
                    )}
                  </span>
                </div>
                <div className="mb-1">
                  Tồn kho:{" "}
                  <span className="font-semibold">
                    {typeof detailItem.variantInfo?.stock === "number"
                      ? detailItem.variantInfo.stock
                      : detailItem.product.stock}
                  </span>
                </div>
                <div className="mb-1">
                  SKU:{" "}
                  <span className="font-mono">
                    {detailItem.variantInfo?.sku ||
                      detailItem.product.sku ||
                      "N/A"}
                  </span>
                </div>
                <div className="mb-1">
                  Màu sắc:{" "}
                  <span>
                    {detailItem.variantInfo?.color ||
                      detailItem.product.color ||
                      "N/A"}
                  </span>
                </div>
                <div className="mb-1">
                  Kích thước:{" "}
                  <span>
                    {detailItem.variantInfo?.size ||
                      detailItem.product.size ||
                      "N/A"}
                  </span>
                </div>
                <div className="mb-1">
                  Cân nặng:{" "}
                  <span>
                    {typeof detailItem.variantInfo?.weight === "number"
                      ? detailItem.variantInfo.weight
                      : typeof detailItem.product.weight === "number"
                      ? detailItem.product.weight
                      : "N/A"}
                  </span>
                </div>
                {detailItem.variantInfo?.specifications &&
                Object.keys(detailItem.variantInfo.specifications).length >
                  0 ? (
                  <div className="mt-2 w-full">
                    <div className="font-medium mb-1">Thông số kỹ thuật:</div>
                    <table className="w-full text-xs">
                      <tbody>
                        {Object.entries(
                          detailItem.variantInfo.specifications
                        ).map(([key, value]) => (
                          <tr key={key}>
                            <td className="pr-2 text-gray-600">{key}</td>
                            <td className="text-gray-800">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="mt-2 text-gray-500">
                    Biến thể này chưa có thông số kỹ thuật.
                  </div>
                )}
              </div>
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
