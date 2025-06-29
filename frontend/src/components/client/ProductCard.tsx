import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaShoppingCart, FaEye, FaStar, FaTruck, FaShieldAlt, FaClock, FaCheck, FaBalanceScale } from 'react-icons/fa';
import { useCart } from '../../contexts/CartContext';
// import { useWishlist } from '../../contexts/WishlistContext';
// import { useToast } from '../../components/client/ToastNotification';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    brand: string;
    rating: number;
    reviewCount: number;
    discount?: number;
    isNew?: boolean;
    isHot?: boolean;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart, isInCart } = useCart();
  // const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  // const { showToast } = useToast();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        brand: product.brand
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlistToggle = () => {
    console.log('Toggle wishlist:', product.name);
    // if (isInWishlist(product.id)) {
    //   removeFromWishlist(product.id);
    //   showToast('Đã xóa khỏi danh sách yêu thích!', 'info');
    // } else {
    //   addToWishlist({
    //     id: product.id,
    //     name: product.name,
    //     price: product.price,
    //     image: product.image,
    //     brand: product.brand,
    //     discount: product.discount
    //   });
    //   showToast('Đã thêm vào danh sách yêu thích!', 'success');
    // }
  };

  const handleCompare = () => {
    console.log('Add to compare:', product.name);
    // Add to comparison list (implement later)
    // showToast('Đã thêm vào danh sách so sánh!', 'success');
  };

  return (
    <div className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <Link to={`/product/${product.id}`}>
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
        <div className="absolute top-3 right-3">
          <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            {product.brand}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex space-x-2">
            <button
              onClick={handleAddToCart}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
            >
              <FaShoppingCart className="w-3 h-3" />
              <span>{isLoading ? 'Đang thêm...' : 'Thêm vào giỏ'}</span>
            </button>
            <button
              onClick={handleWishlistToggle}
              className="p-2 bg-white text-gray-600 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
            >
              <FaHeart className="w-4 h-4" />
            </button>
            <Link
              to={`/product/${product.id}`}
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
        <div className="text-sm text-blue-600 font-medium mb-1">{product.brand}</div>

        {/* Product Name */}
        <Link to={`/product/${product.id}`}>
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
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
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
            Trả góp 0%
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleAddToCart}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
          >
            <FaShoppingCart className="w-3 h-3" />
            <span>{isLoading ? 'Đang thêm...' : 'Thêm vào giỏ'}</span>
          </button>
          <button
            onClick={handleWishlistToggle}
            className="p-2 bg-gray-200 text-gray-600 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
          >
            <FaHeart className="w-4 h-4" />
          </button>
        </div>

        {/* Compare Button */}
        <div className="mt-4">
          <button
            onClick={handleCompare}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
          >
            <FaBalanceScale className="w-3 h-3" />
            <span>So sánh</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 