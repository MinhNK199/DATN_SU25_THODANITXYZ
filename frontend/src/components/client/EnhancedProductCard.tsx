import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaShoppingCart,
  FaEye,
  FaStar,
} from "react-icons/fa";
import { useCart } from "../../contexts/CartContext";
import cartApi from "../../services/cartApi";
import { toast } from "react-hot-toast";
import wishlistApi from "../../services/wishlistApi";

type Product = {
  _id: string;
  name: string;
  price: number;
  salePrice?: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  brand: any;
  category?: any;
  rating?: number;
  reviewCount?: number;
  averageRating?: number;
  numReviews?: number;
  discount?: number;
  isNew?: boolean;
  isHot?: boolean;
  stock: number;
  variants?: any[];
};

interface EnhancedProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    salePrice?: number;
    originalPrice?: number;
    image?: string;
    images?: string[];
    brand:
      | {
          _id?: string;
          name: string;
        }
      | string
      | null;
    category?: {
      _id?: string;
      name: string;
    } | string | null;
    rating?: number;
    reviewCount?: number;
    averageRating?: number;
    numReviews?: number;
    discount?: number;
    isNew?: boolean;
    isHot?: boolean;
    stock: number;
    variants?: Array<{
      _id?: string;
      name?: string;
      price: number;
      salePrice?: number;
      stock: number;
      images?: string[];
      sku?: string;
      size?: string | number;
      weight?: number;
      isActive?: boolean;
      specifications?: Record<string, string>;
    }>;
  };
}

const EnhancedProductCard: React.FC<EnhancedProductCardProps> = ({ product }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [availableStock, setAvailableStock] = useState<number | null>(null);
  const { addToCart } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const availability = await cartApi.getProductAvailability(product._id);
        setAvailableStock(availability.availableStock);
      } catch (error) {
        console.error("Error fetching product availability:", error);
        setAvailableStock(getTotalStock(product));
      }
    };

    fetchAvailability();
  }, [product._id, product.stock, product]);

  const handleAddToCart = async () => {
    // Always navigate to product detail page
    navigate(`/product/${product._id}`);
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

  const getTotalStock = (product: Product) => {
    let total = product.stock || 0;
    if (product.variants && product.variants.length > 0) {
      for (const v of product.variants) {
        total += v.stock || 0;
      }
    }
    return total;
  };

  const isOutOfStock = availableStock === 0;
  const bestPrice = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
  const discountPercent = product.salePrice ? Math.round(100 - (product.salePrice / product.price) * 100) : 0;
  const memberDiscount = Math.round(bestPrice * 0.01); // 1% member discount

  const handleProductClick = () => {
    // Check if the product name contains "iPhone 15"
    if (product.name.toLowerCase().includes('iphone 15')) {
      // Navigate to product list with iPhone 15 filter
      navigate(`/products?search=iPhone 15&brand=Apple`);
    } else {
      // Navigate to product detail page
      navigate(`/product/${product._id}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group">
      <div className="relative overflow-hidden">
        <div onClick={handleProductClick} className="cursor-pointer">
          <img
            src={product.image || (product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg')}
            alt={product.name}
            className="w-full h-48 object-contain group-hover:scale-105 transition-transform duration-300 bg-gray-50"
          />
        </div>

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {product.isNew && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Mới
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Giảm {discountPercent}%
            </span>
          )}
        </div>

        {/* Installment badge for hot sale products */}
        {product.isHot && (
          <div className="absolute top-3 right-3">
            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Trả góp 0%
            </span>
          </div>
        )}

        {/* Hover actions */}
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
                  : "Thêm vào giỏ hàng"}
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
          </div>
        </div>
      </div>

      <div className="p-3">
        {/* Product title */}
        <div onClick={handleProductClick} className="cursor-pointer">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name} | Chính hãng
          </h3>
        </div>

        {/* Status */}
        <div className="mb-3">
          {product.isNew ? (
            <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
              Hàng đặt trước
            </span>
          ) : (
            <span className="bg-green-100 text-green-600 text-xs font-medium px-2 py-1 rounded-full">
              Còn hàng
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mb-2">
          <span className="text-xl font-bold text-red-600">
            {formatPrice(bestPrice)}
          </span>
          {product.originalPrice && product.originalPrice > bestPrice && (
            <span className="text-sm text-gray-500 line-through ml-1">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Member discount */}
        <div className="bg-blue-50 text-blue-700 text-sm px-3 py-2 rounded-lg mb-3">
          Tmember giảm đến {formatPrice(memberDiscount)}
        </div>

        {/* Installment info for hot sale products */}
        {product.isHot && (
          <div className="text-xs text-gray-600 mb-3">
            Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6...
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating || product.averageRating || 0)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            ({product.reviewCount || product.numReviews || 0})
          </span>
        </div>

        {/* Favorite button */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleAddFavorite}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isFavorite
                ? "text-red-500 bg-red-50 hover:bg-red-100"
                : "text-gray-600 bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <FaHeart className="w-4 h-4" />
            <span className="text-sm font-medium">Yêu thích</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductCard;
