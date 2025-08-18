import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '../../../api/axiosInstance';

interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  inStock: boolean;
  category: string;
  rating: number;
  reviewCount: number;
  addedAt: string;
}

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchWishlist();
  }, []);

  useEffect(() => {
    filterAndSortItems();
  }, [wishlistItems, searchTerm, categoryFilter, sortBy]);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/wishlist');
      
      if (response.data.success) {
        setWishlistItems(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortItems = () => {
    let filtered = wishlistItems;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Sort items
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.productName.localeCompare(b.productName));
        break;
      default:
        break;
    }

    setFilteredItems(filtered);
  };

  const handleRemoveFromWishlist = async (itemId: string) => {
    try {
      const response = await axiosInstance.delete(`/wishlist/${itemId}`);
      
      if (response.data.success) {
        setWishlistItems(prev => prev.filter(item => item.id !== itemId));
        toast.success('Đã xóa khỏi danh sách yêu thích');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      const response = await axiosInstance.post('/cart/add', {
        productId,
        quantity: 1
      });

      if (response.data.success) {
        toast.success('Đã thêm vào giỏ hàng');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Get unique categories
  const categories = [...new Set(wishlistItems.map(item => item.category))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Đang tải danh sách yêu thích...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sản phẩm yêu thích</h1>
        <p className="text-gray-600 mt-1">
          {wishlistItems.length} sản phẩm trong danh sách yêu thích
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="price-low">Giá thấp đến cao</option>
              <option value="price-high">Giá cao đến thấp</option>
              <option value="name">Tên A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Wishlist Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || categoryFilter !== 'all' ? 'Không tìm thấy sản phẩm' : 'Danh sách yêu thích trống'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || categoryFilter !== 'all' 
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              : 'Thêm sản phẩm vào danh sách yêu thích để theo dõi'
            }
          </p>
          {!searchTerm && categoryFilter === 'all' && (
            <Link
              to="/products"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Khám phá sản phẩm
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="relative">
                <Link to={`/products/${item.productId}`}>
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-full h-48 object-cover"
                  />
                </Link>
                
                {/* Discount Badge */}
                {item.discount && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                    -{item.discount}%
                  </div>
                )}

                {/* Remove from Wishlist */}
                <button
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                >
                  <Heart className="w-4 h-4 text-red-500 fill-current" />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <Link 
                  to={`/products/${item.productId}`}
                  className="block mb-2"
                >
                  <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
                    {item.productName}
                  </h3>
                </Link>

                <div className="flex items-center space-x-1 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(item.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">({item.reviewCount})</span>
                </div>

                <div className="mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-red-600">
                      {formatPrice(item.price)}
                    </span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.inStock 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {item.inStock ? 'Còn hàng' : 'Hết hàng'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Thêm ngày {formatDate(item.addedAt)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddToCart(item.productId)}
                    disabled={!item.inStock}
                    className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{item.inStock ? 'Thêm giỏ hàng' : 'Hết hàng'}</span>
                  </button>
                  
                  <button
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="p-2 border border-gray-300 rounded-md hover:bg-red-50 hover:border-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;