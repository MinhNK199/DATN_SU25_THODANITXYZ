import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaHeart,
  FaShoppingCart,
  FaEye,
  FaStar,
  FaTruck,
  FaShieldAlt,
  FaClock,
  FaCheck,
  FaBalanceScale,
} from "react-icons/fa";
import { useCart } from "../../contexts/CartContext";
import cartApi from "../../services/cartApi";
import { toast } from "react-hot-toast";
import wishlistApi from "../../services/wishlistApi";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    brand:
      | {
          _id: string;
          name: string;
        }
      | string;
    rating: number;
    reviewCount: number;
    discount?: number;
    isNew?: boolean;
    isHot?: boolean;
    stock: number;
    variants?: { stock: number }[];
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [availableStock, setAvailableStock] = useState<number | null>(null);
  const [stockLoading, setStockLoading] = useState(false);
  const { addToCart, isInCart } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Lấy số lượng có sẵn khi component mount
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setStockLoading(true);
        const availability = await cartApi.getProductAvailability(product._id);
        setAvailableStock(availability.availableStock);
      } catch (error) {
        console.error("Error fetching product availability:", error);
        setAvailableStock(getTotalStock(product)); // Fallback to total stock
      } finally {
        setStockLoading(false);
      }
    };

    fetchAvailability();
  }, [product._id, product.stock]);

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await addToCart(product._id, 1);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const checkIsFavorite = async () => {
      try {
        const res = await wishlistApi.getFavorites();
        const isFav = res.data.favorites.some(
          (item: any) => item._id === product._id
        );
        setIsFavorite(isFav);
      } catch (err) {
        console.error("Lỗi khi kiểm tra yêu thích", err);
      }
    };
    checkIsFavorite();
  }, [product._id]);

  const handleAddFavorite = async () => {
    try {
      if (isFavorite) {
        await wishlistApi.removeFromWishlist(product._id);
        setIsFavorite(false);
        toast.success("Đã xóa khỏi yêu thích");
      } else {
        await wishlistApi.addToWishlist(product._id);
        setIsFavorite(true);
        toast.success("Đã thêm vào yêu thích");
      }
    } catch (error) {
      console.error("Lỗi xử lý yêu thích:", error);
      toast.error("Có lỗi xảy ra khi xử lý yêu thích");
    }
  };

  const handleCompare = () => {
    console.log("Add to compare:", product.name);
    toast.success("Tính năng so sánh sẽ được phát triển sau");
  };

  // Helper tính tổng stock
  const getTotalStock = (product: any) => {
    let total = product.stock || 0;
    if (product.variants && product.variants.length > 0) {
      for (const v of product.variants) {
        total += v.stock || 0;
      }
    }
    return total;
  };

  const getStockStatus = () => {
    if (stockLoading) {
      return <span className="text-gray-500 text-sm">Đang kiểm tra...</span>;
    }
    const totalStock = getTotalStock(product);
    if (availableStock === null) {
      return <span className="text-gray-500 text-sm">Còn hàng</span>;
    }
    if (availableStock === 0) {
      return <span className="text-red-500 text-sm font-medium">Hết hàng</span>;
    }
    if (availableStock <= 5) {
      return (
        <span className="text-orange-500 text-sm font-medium">Chỉ còn ít</span>
      );
    }
    return <span className="text-green-500 text-sm">Còn hàng</span>;
  };

  const isOutOfStock = availableStock === 0;

  return (
    <div className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <Link to={`/product/${product._id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {product.isNew && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Mới
            </span>
          )}
          {product.isHot && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Hot
            </span>
          )}
          {product.discount && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Brand Badge */}
  <div className="text-sm text-blue-600 font-medium mb-1">
  {typeof product.brand === "object" && product.brand !== null
  ? product.brand.name
  : product.brand || "Không rõ"}
</div>
        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3 transform translate-x-16">
          <div className="bg-white bg-opacity-90 text-xs font-medium px-2 py-1 rounded-full">
            {getStockStatus()}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex space-x-2">
            <button
              onClick={handleAddToCart}
              disabled={isLoading || isOutOfStock}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1 ${
                isOutOfStock
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <FaShoppingCart className="w-3 h-3" />
              <span>
                {isLoading
                  ? "Đang thêm..."
                  : isOutOfStock
                  ? "Hết hàng"
                  : "Thêm vào giỏ"}
              </span>
            </button>
            <button
              onClick={handleAddFavorite}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite
                  ? "text-red-500 bg-red-100 hover:bg-red-200"
                  : "text-gray-600 bg-white hover:bg-red-500 hover:text-white"
              }`}
            >
              <FaHeart className="w-4 h-4" />
            </button>
            <Link
              to={`/product/${product._id}`}
              className="p-2 bg-white text-gray-600 hover:bg-blue-500 hover:text-white rounded-lg transition-colors"
            >
              <FaEye className="w-4 h-4" />
            </Link>
            <button
              onClick={handleCompare}
              className="p-2 bg-white text-gray-600 hover:bg-green-500 hover:text-white rounded-lg transition-colors"
            >
              <FaBalanceScale className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand */}
        <div className="text-sm text-blue-600 font-medium mb-1">
  {product.brand && typeof product.brand === "object"
    ? product.brand.name
    : product.brand || "Không rõ thương hiệu"}
</div>

        {/* Product Name */}
        <Link to={`/product/${product._id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mb-3">{getStockStatus()}</div>

        {/* Features */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center text-xs text-gray-600">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Miễn phí vận chuyển
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Bảo hành chính hãng
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Giao hàng nhanh
          </div>
        </div>

        {/* Add to Cart Button (Mobile) */}
        <button
          onClick={handleAddToCart}
          disabled={isLoading || isOutOfStock}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
            isOutOfStock
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          <FaShoppingCart className="w-4 h-4" />
          <span>
            {isLoading
              ? "Đang thêm..."
              : isOutOfStock
              ? "Hết hàng"
              : "Thêm vào giỏ hàng"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
