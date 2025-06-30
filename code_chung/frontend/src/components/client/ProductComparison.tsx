import React, { useState } from 'react';
import { FaTimes, FaCheck, FaMinus, FaStar, FaHeart, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../../contexts/CartContext';
// import { useWishlist } from '../../contexts/WishlistContext';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  brand: string;
  rating: number;
  reviewCount: number;
  specs: {
    screen?: string;
    processor?: string;
    ram?: string;
    storage?: string;
    battery?: string;
    camera?: string;
    os?: string;
    weight?: string;
    dimensions?: string;
  };
  features: string[];
  pros: string[];
  cons: string[];
}

const ProductComparison: React.FC = () => {
  const [compareList, setCompareList] = useState<Product[]>([
    {
      id: '1',
      name: 'iPhone 15 Pro Max 256GB',
      price: 29990000,
      originalPrice: 32990000,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
      brand: 'Apple',
      rating: 4.8,
      reviewCount: 1247,
      specs: {
        screen: '6.7 inch OLED',
        processor: 'A17 Pro',
        ram: '8GB',
        storage: '256GB',
        battery: '4441mAh',
        camera: '48MP + 12MP + 12MP',
        os: 'iOS 17',
        weight: '221g',
        dimensions: '159.9 x 76.7 x 8.3mm'
      },
      features: ['Face ID', '5G', 'Wireless Charging', 'Water Resistant'],
      pros: ['Hiệu năng mạnh mẽ', 'Camera chất lượng cao', 'Thiết kế đẹp'],
      cons: ['Giá cao', 'Không có jack 3.5mm']
    },
    {
      id: '2',
      name: 'Samsung Galaxy S24 Ultra 512GB',
      price: 24990000,
      originalPrice: 27990000,
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop',
      brand: 'Samsung',
      rating: 4.7,
      reviewCount: 892,
      specs: {
        screen: '6.8 inch AMOLED',
        processor: 'Snapdragon 8 Gen 3',
        ram: '12GB',
        storage: '512GB',
        battery: '5000mAh',
        camera: '200MP + 12MP + 50MP + 10MP',
        os: 'Android 14',
        weight: '232g',
        dimensions: '163.4 x 79.0 x 8.6mm'
      },
      features: ['S Pen', '5G', 'Wireless Charging', 'Water Resistant'],
      pros: ['S Pen tích hợp', 'Camera đa năng', 'Pin lớn'],
      cons: ['Thiết kế nặng', 'Giá cao']
    }
  ]);

  const { addToCart } = useCart();
  // const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const removeFromCompare = (productId: string) => {
    setCompareList(prev => prev.filter(product => product.id !== productId));
  };

  const addToCompare = (product: Product) => {
    if (compareList.length < 4) {
      setCompareList(prev => [...prev, product]);
    }
  };

  const getSpecValue = (product: Product, specKey: keyof Product['specs']) => {
    return product.specs[specKey] || 'N/A';
  };

  const renderSpecComparison = (specKey: keyof Product['specs'], label: string) => {
    return (
      <tr className="border-b border-gray-200">
        <td className="py-3 px-4 bg-gray-50 font-medium text-gray-700">{label}</td>
        {compareList.map((product) => (
          <td key={product.id} className="py-3 px-4 text-center">
            {getSpecValue(product, specKey)}
          </td>
        ))}
      </tr>
    );
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      brand: product.brand
    });
  };

  const handleWishlistToggle = (product: Product) => {
    console.log('Toggle wishlist:', product.name);
    // if (isInWishlist(product.id)) {
    //   removeFromWishlist(product.id);
    // } else {
    //   addToWishlist(product);
    // }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">So sánh sản phẩm</h1>
          <p className="text-gray-600">
            So sánh chi tiết {compareList.length} sản phẩm để đưa ra quyết định tốt nhất
          </p>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {compareList.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => removeFromCompare(product.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="text-sm text-blue-600 font-medium mb-1">{product.brand}</div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                
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
                <div className="mb-3">
                  <span className="text-xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                  >
                    <FaShoppingCart className="w-4 h-4 inline mr-1" />
                    Thêm vào giỏ
                  </button>
                  <button
                    onClick={() => handleWishlistToggle(product)}
                    className="p-2 bg-gray-200 text-gray-600 hover:bg-red-500 hover:text-white rounded transition-colors"
                  >
                    <FaHeart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add Product Card */}
          {compareList.length < 4 && (
            <div className="bg-white rounded-lg shadow-lg border-2 border-dashed border-gray-300 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-400">+</span>
                </div>
                <p className="text-gray-600">Thêm sản phẩm để so sánh</p>
              </div>
            </div>
          )}
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Bảng so sánh chi tiết</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-4 px-4 text-left font-semibold text-gray-900">Thông số</th>
                  {compareList.map((product) => (
                    <th key={product.id} className="py-4 px-4 text-center font-semibold text-gray-900">
                      {product.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {renderSpecComparison('screen', 'Màn hình')}
                {renderSpecComparison('processor', 'Chip xử lý')}
                {renderSpecComparison('ram', 'RAM')}
                {renderSpecComparison('storage', 'Bộ nhớ')}
                {renderSpecComparison('battery', 'Pin')}
                {renderSpecComparison('camera', 'Camera')}
                {renderSpecComparison('os', 'Hệ điều hành')}
                {renderSpecComparison('weight', 'Trọng lượng')}
                {renderSpecComparison('dimensions', 'Kích thước')}
                
                {/* Features */}
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-4 bg-gray-50 font-medium text-gray-700">Tính năng</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="py-3 px-4">
                      <div className="space-y-1">
                        {product.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <FaCheck className="w-3 h-3 text-green-500 mr-2" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Pros */}
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-4 bg-gray-50 font-medium text-gray-700">Ưu điểm</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="py-3 px-4">
                      <div className="space-y-1">
                        {product.pros.map((pro, index) => (
                          <div key={index} className="flex items-center text-sm text-green-600">
                            <FaCheck className="w-3 h-3 mr-2" />
                            {pro}
                          </div>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Cons */}
                <tr>
                  <td className="py-3 px-4 bg-gray-50 font-medium text-gray-700">Nhược điểm</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="py-3 px-4">
                      <div className="space-y-1">
                        {product.cons.map((con, index) => (
                          <div key={index} className="flex items-center text-sm text-red-600">
                            <FaMinus className="w-3 h-3 mr-2" />
                            {con}
                          </div>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kết luận</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Hiệu năng tốt nhất:</span>
                <span className="font-medium">iPhone 15 Pro Max</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Giá tốt nhất:</span>
                <span className="font-medium">Samsung Galaxy S24 Ultra</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Camera tốt nhất:</span>
                <span className="font-medium">Samsung Galaxy S24 Ultra</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pin tốt nhất:</span>
                <span className="font-medium">Samsung Galaxy S24 Ultra</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Khuyến nghị</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-1">Cho người dùng iOS:</h4>
                <p className="text-sm text-blue-800">iPhone 15 Pro Max - Hiệu năng mạnh mẽ, camera chất lượng cao</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-1">Cho người dùng Android:</h4>
                <p className="text-sm text-green-800">Samsung Galaxy S24 Ultra - S Pen, camera đa năng, pin lớn</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductComparison; 