import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaStar, FaHeart, FaShare, FaTruck, FaShieldAlt, FaClock, FaCheck, FaMinus, FaPlus, FaShoppingCart, FaEye } from 'react-icons/fa';
import ProductCard from '../../components/client/ProductCard';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  // Mock product data
  const product = {
    id: '1',
    name: 'iPhone 15 Pro Max - Titanium',
    price: 1199,
    originalPrice: 1299,
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1026&q=80',
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1011&q=80',
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca359?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80'
    ],
    rating: 4.8,
    reviewCount: 124,
    stock: 15,
    isNew: true,
    brand: 'Apple',
    colors: ['#000000', '#FFFFFF', '#FFD700', '#C0C0C0'],
    sizes: ['128GB', '256GB', '512GB', '1TB'],
    features: [
      'A17 Pro Chip với GPU 6 nhân',
      'Camera chính 48MP với Telephoto 2x',
      'Cổng kết nối USB-C',
      'Thiết kế Titanium',
      'Màn hình Always-On',
      'SOS khẩn cấp qua vệ tinh'
    ],
    description: 'iPhone 15 Pro Max đại diện cho đỉnh cao công nghệ smartphone, với chip A17 Pro tiên tiến nhất từng có trong smartphone, hệ thống camera tinh vi và thiết kế titanium đẹp mắt.',
    specifications: {
      'Màn hình': 'Màn hình Super Retina XDR 6.7 inch',
      'Bộ xử lý': 'Chip A17 Pro với GPU 6 nhân',
      'Bộ nhớ': '128GB, 256GB, 512GB, 1TB',
      'Camera': '48MP Chính + 12MP Ultra Wide + 12MP Telephoto',
      'Pin': 'Lên đến 29 giờ phát video',
      'Kết nối': '5G, Wi-Fi 6E, Bluetooth 5.3'
    },
    reviews: [
      {
        id: 1,
        user: 'Nguyễn Văn A',
        rating: 5,
        date: '2024-01-15',
        comment: 'Điện thoại tuyệt vời! Chất lượng camera xuất sắc và hiệu suất đáng kinh ngạc.'
      },
      {
        id: 2,
        user: 'Trần Thị B',
        rating: 4,
        date: '2024-01-10',
        comment: 'Điện thoại tốt tổng thể, nhưng pin có thể tốt hơn. Camera thì tuyệt vời.'
      }
    ]
  };

  const relatedProducts = [
    {
      id: '2',
      name: 'MacBook Pro 16" M3 Max',
      price: 2499,
      originalPrice: 2699,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1026&q=80',
      rating: 4.9,
      reviewCount: 89,
      stock: 8,
      isSale: true,
      discount: 15,
      brand: 'Apple',
      colors: ['#000000', '#C0C0C0'],
      features: ['Chip M3 Max', '32GB RAM', '1TB SSD']
    },
    {
      id: '3',
      name: 'Samsung Galaxy S24 Ultra',
      price: 1299,
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
      rating: 4.7,
      reviewCount: 156,
      stock: 22,
      brand: 'Samsung',
      colors: ['#000000', '#FFFFFF', '#FF6B35'],
      features: ['Snapdragon 8 Gen 3', 'Camera 200MP', 'S Pen']
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const calculateDiscount = () => {
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="text-gray-700 hover:text-blue-600">Trang chủ</a>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <a href="/category/mobile" className="text-gray-700 hover:text-blue-600">Điện thoại</a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-500">{product.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
              {/* Product Labels */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    MỚI
                  </span>
                )}
                <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{calculateDiscount()}%
                </span>
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                    selectedImage === index
                      ? 'border-blue-500 scale-105'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand */}
            <div className="flex items-center space-x-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                {product.brand}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={`w-5 h-5 ${
                      index < Math.floor(product.rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-gray-600">{product.rating}</span>
              </div>
              <span className="text-gray-500">({product.reviewCount} đánh giá)</span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {product.originalPrice > product.price && (
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                  Tiết kiệm {formatPrice(product.originalPrice - product.price)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <FaCheck className="w-4 h-4 text-green-500" />
              <span className="text-green-600 font-medium">
                Còn {product.stock} sản phẩm trong kho
              </span>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Màu sắc</h3>
              <div className="flex space-x-3">
                {product.colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                      selectedColor === color
                        ? 'border-blue-500 scale-110'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Dung lượng</h3>
              <div className="flex space-x-3">
                {product.sizes.map((size, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
                      selectedSize === size
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Số lượng</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <FaMinus className="w-3 h-3" />
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <FaPlus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2">
                <FaShoppingCart className="w-5 h-5" />
                <span>Thêm vào giỏ hàng</span>
              </button>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                  isWishlisted
                    ? 'border-red-500 bg-red-50 text-red-500'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <FaHeart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              <button className="w-12 h-12 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors">
                <FaShare className="w-5 h-5" />
              </button>
            </div>

            {/* Features */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tính năng nổi bật</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <FaCheck className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Shipping Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FaTruck className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-blue-900">Miễn phí vận chuyển</h4>
                  <p className="text-blue-700 text-sm">Giao hàng trong 2-3 ngày làm việc</p>
                </div>
              </div>
            </div>

            {/* Warranty Info */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FaShieldAlt className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="font-semibold text-green-900">Bảo hành chính hãng</h4>
                  <p className="text-green-700 text-sm">Bảo hành 12 tháng toàn quốc</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Mô tả' },
                { id: 'specifications', label: 'Thông số kỹ thuật' },
                { id: 'reviews', label: 'Đánh giá' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-3 border-b border-gray-200">
                    <span className="font-medium text-gray-900">{key}</span>
                    <span className="text-gray-700">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Đánh giá từ khách hàng ({product.reviewCount})
                  </h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Viết đánh giá
                  </button>
                </div>
                
                <div className="space-y-4">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-semibold">
                              {review.user.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{review.user}</h4>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, index) => (
                                <FaStar
                                  key={index}
                                  className={`w-4 h-4 ${
                                    index < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-gray-500 text-sm">{review.date}</span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 