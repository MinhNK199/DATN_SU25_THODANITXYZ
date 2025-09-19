import React from 'react';
import { FaTimes, FaStar, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import { useCart } from '../../contexts/CartContext';
import { useCompare } from '../../contexts/CompareContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getProductImage } from '../../utils/imageUtils';

const SimpleProductComparison: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    try {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(price || 0);
    } catch (error) {
      console.error('Error formatting price:', error);
      return '0 VND';
    }
  };

  const getDisplayPrice = (product: any) => {
    try {
      return product.salePrice || product.price || 0;
    } catch (error) {
      console.error('Error getting display price:', error);
      return 0;
    }
  };

  const getBrandName = (product: any) => {
    try {
      if (typeof product.brand === 'string') {
        return product.brand;
      }
      return product.brand?.name || 'N/A';
    } catch (error) {
      console.error('Error getting brand name:', error);
      return 'N/A';
    }
  };

  const getTotalStock = (product: any) => {
    try {
      // Nếu có variants, tính tổng stock từ variants
      if (product.variants && product.variants.length > 0) {
        let total = 0;
        for (const v of product.variants) {
          total += v.stock || 0;
        }
        return total;
      }
      // Nếu không có variants, dùng stock gốc
      return product.stock || 0;
    } catch (error) {
      console.error('Error getting total stock:', error);
      return 0;
    }
  };

  const handleAddToCart = (product: any) => {
    try {
      addToCart({
        id: product._id,
        name: product.name,
        price: getDisplayPrice(product),
        image: getProductImage(product),
        brand: getBrandName(product)
      });
      toast.success('Đã thêm vào giỏ hàng');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Không thể thêm vào giỏ hàng');
    }
  };

  const handleRemoveFromCompare = (productId: string) => {
    try {
      removeFromCompare(productId);
      toast.success('Đã xóa khỏi danh sách so sánh');
    } catch (error) {
      console.error('Error removing from compare:', error);
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const handleClearCompare = () => {
    try {
      clearCompare();
      toast.success('Đã xóa tất cả sản phẩm khỏi danh sách so sánh');
    } catch (error) {
      console.error('Error clearing compare:', error);
      toast.error('Không thể xóa danh sách so sánh');
    }
  };

  if (compareList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Chưa có sản phẩm để so sánh</h1>
            <p className="text-gray-600 mb-8">
              Hãy thêm ít nhất 2 sản phẩm để bắt đầu so sánh
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <FaArrowLeft className="w-4 h-4 inline mr-2" />
              Quay lại danh sách sản phẩm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">So sánh sản phẩm</h1>
              <p className="text-gray-600">
                So sánh chi tiết {compareList.length} sản phẩm
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/products')}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FaArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </button>
              <button
                onClick={handleClearCompare}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {compareList.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative">
                <img
                  src={getProductImage(product)}
                  alt={product.name || 'Sản phẩm'}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => handleRemoveFromCompare(product._id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="text-sm text-blue-600 font-medium mb-1">{getBrandName(product)}</div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name || 'Tên sản phẩm'}</h3>
                
                {/* Rating */}
                <div className="flex items-center space-x-1 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating || product.averageRating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({product.reviewCount || product.numReviews || 0})</span>
                </div>

                {/* Price */}
                <div className="mb-3">
                  <span className="text-xl font-bold text-gray-900">
                    {formatPrice(getDisplayPrice(product))}
                  </span>
                </div>

                {/* Stock Status */}
                <div className="mb-3">
                  {(() => {
                    const totalStock = getTotalStock(product);
                    return totalStock > 0 ? (
                      <span className="text-sm text-green-600 font-medium">Còn hàng ({totalStock})</span>
                    ) : (
                      <span className="text-sm text-red-600 font-medium">Hết hàng</span>
                    );
                  })()}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={getTotalStock(product) === 0}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                  >
                    <FaShoppingCart className="w-4 h-4 inline mr-1" />
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Simple Comparison Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Bảng so sánh cơ bản</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-4 px-4 text-left font-semibold text-gray-900">Thông số</th>
                  {compareList.map((product) => (
                    <th key={product._id} className="py-4 px-4 text-center font-semibold text-gray-900">
                      {product.name || 'Sản phẩm'}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-4 bg-gray-50 font-medium text-gray-700">Thương hiệu</td>
                  {compareList.map((product) => (
                    <td key={product._id} className="py-3 px-4 text-center">
                      {getBrandName(product)}
                    </td>
                  ))}
                </tr>
                
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-4 bg-gray-50 font-medium text-gray-700">Giá</td>
                  {compareList.map((product) => (
                    <td key={product._id} className="py-3 px-4 text-center">
                      <div className="font-bold text-lg">{formatPrice(getDisplayPrice(product))}</div>
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-gray-200">
                  <td className="py-3 px-4 bg-gray-50 font-medium text-gray-700">Đánh giá</td>
                  {compareList.map((product) => (
                    <td key={product._id} className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.averageRating || 0)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({product.numReviews || 0})</span>
                      </div>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-4 bg-gray-50 font-medium text-gray-700">Tồn kho</td>
                  {compareList.map((product) => (
                    <td key={product._id} className="py-3 px-4 text-center">
                      <span className={`font-medium ${
                        product.stock > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.stock > 0 ? `Còn ${product.stock}` : 'Hết hàng'}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleProductComparison;
