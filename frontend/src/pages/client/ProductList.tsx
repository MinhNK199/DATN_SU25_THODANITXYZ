import React, { useState } from 'react';
import { FaFilter, FaSort, FaTh, FaList, FaStar, FaHeart, FaShoppingCart } from 'react-icons/fa';
import ProductCard from '../../components/client/ProductCard';

const ProductList: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Mock data
  const products = [
    {
      id: '1',
      name: 'iPhone 15 Pro Max - Titanium',
      price: 1199,
      originalPrice: 1299,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
      rating: 4.8,
      reviewCount: 124,
      stock: 15,
      isNew: true,
      brand: 'Apple',
      category: 'Mobile',
      colors: ['#000000', '#FFFFFF', '#FFD700'],
      features: ['A17 Pro Chip', '48MP Camera', 'USB-C']
    },
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
      category: 'Laptop',
      colors: ['#000000', '#C0C0C0'],
      features: ['M3 Max Chip', '32GB RAM', '1TB SSD']
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
      category: 'Mobile',
      colors: ['#000000', '#FFFFFF', '#FF6B35'],
      features: ['Snapdragon 8 Gen 3', '200MP Camera', 'S Pen']
    },
    {
      id: '4',
      name: 'AirPods Pro 2nd Generation',
      price: 249,
      originalPrice: 299,
      image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
      rating: 4.6,
      reviewCount: 203,
      stock: 45,
      isSale: true,
      discount: 20,
      brand: 'Apple',
      category: 'Accessories',
      colors: ['#FFFFFF'],
      features: ['Active Noise Cancellation', 'Spatial Audio', 'USB-C']
    },
    {
      id: '5',
      name: 'iPad Pro 12.9" M2 Chip',
      price: 1099,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1011&q=80',
      rating: 4.8,
      reviewCount: 78,
      stock: 12,
      brand: 'Apple',
      category: 'Tablets',
      colors: ['#000000', '#FFFFFF', '#FFD700'],
      features: ['M2 Chip', 'Liquid Retina XDR', 'ProMotion 120Hz']
    },
    {
      id: '6',
      name: 'Apple Watch Series 9 GPS',
      price: 399,
      originalPrice: 449,
      image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca359?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
      rating: 4.7,
      reviewCount: 134,
      stock: 28,
      isSale: true,
      discount: 12,
      brand: 'Apple',
      category: 'Watches',
      colors: ['#000000', '#FFFFFF', '#FF6B35', '#4ECDC4'],
      features: ['S9 Chip', 'Double Tap', 'Always-On Display']
    }
  ];

  const categories = [
    { id: 'mobile', name: 'Điện thoại', count: 156 },
    { id: 'laptop', name: 'Laptop', count: 89 },
    { id: 'tablets', name: 'Máy tính bảng', count: 67 },
    { id: 'watches', name: 'Đồng hồ thông minh', count: 43 },
    { id: 'accessories', name: 'Phụ kiện', count: 234 }
  ];

  const brands = [
    { id: 'apple', name: 'Apple', count: 45 },
    { id: 'samsung', name: 'Samsung', count: 38 },
    { id: 'sony', name: 'Sony', count: 23 },
    { id: 'huawei', name: 'Huawei', count: 19 },
    { id: 'xiaomi', name: 'Xiaomi', count: 27 }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tất cả sản phẩm</h1>
          <p className="text-gray-600">Khám phá bộ sưu tập đầy đủ các thiết bị điện tử cao cấp của chúng tôi</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Bộ lọc</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh mục</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, category.id]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{category.name}</span>
                      <span className="text-gray-500 text-sm">({category.count})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thương hiệu</h3>
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <label key={brand.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBrands([...selectedBrands, brand.id]);
                          } else {
                            setSelectedBrands(selectedBrands.filter(id => id !== brand.id));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{brand.name}</span>
                      <span className="text-gray-500 text-sm">({brand.count})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Khoảng giá</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      placeholder="Tối thiểu"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Tối đa"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Áp dụng
                  </button>
                </div>
              </div>

              {/* Clear Filters */}
              <button className="w-full text-gray-600 hover:text-gray-800 transition-colors">
                Xóa tất cả bộ lọc
              </button>
            </div>
          </div>

          {/* Products Section */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowFilters(true)}
                    className="lg:hidden flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
                  >
                    <FaFilter className="w-4 h-4" />
                    <span>Bộ lọc</span>
                  </button>
                  <span className="text-gray-600">Hiển thị {products.length} sản phẩm</span>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Sort */}
                  <div className="flex items-center space-x-2">
                    <FaSort className="text-gray-500" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="featured">Nổi bật</option>
                      <option value="price-low">Giá: Thấp đến cao</option>
                      <option value="price-high">Giá: Cao đến thấp</option>
                      <option value="rating">Đánh giá cao nhất</option>
                      <option value="newest">Mới nhất</option>
                    </select>
                  </div>

                  {/* View Mode */}
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                      }`}
                    >
                      <FaTh className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                      }`}
                    >
                      <FaList className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50">
                  Trước
                </button>
                <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">1</button>
                <button className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">2</button>
                <button className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">3</button>
                <span className="px-3 py-2 text-gray-500">...</span>
                <button className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">10</button>
                <button className="px-3 py-2 text-gray-500 hover:text-gray-700">
                  Sau
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList; 