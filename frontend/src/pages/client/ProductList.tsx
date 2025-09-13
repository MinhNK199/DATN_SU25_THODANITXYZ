import React, { useState, useEffect, useCallback } from 'react';
import { FaFilter, FaSort, FaTh, FaList, FaTimes, FaUndo } from 'react-icons/fa';
import ProductCard from '../../components/client/ProductCard';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { debounce } from 'lodash';

const ProductList: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');

  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterPriceRange, setFilterPriceRange] = useState([0, 50000000]);
  const [filterInStock, setFilterInStock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
    }, 500),
    []
  );

  useEffect(() => {
    axios.get('/api/category')
      .then(res => {
        console.log("🔍 Categories loaded:", res.data);
        setCategories(res.data);
      })
      .catch(err => {
        console.error("❌ Error loading categories:", err);
        setCategories([]);
      });
    axios.get('/api/brand')
      .then(res => setBrands(res.data))
      .catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search') || '';
    const category = params.get('category') || '';
    
    if (search) {
      debouncedSearch(search);
    } else {
      setSearchTerm('');
    }

    // Nếu có category từ URL, sử dụng trực tiếp (backend đã hỗ trợ slug)
    if (category) {
      console.log("🔍 Category from URL:", category);
      console.log("🔍 Available categories:", categories);
      const foundCategory = categories.find(cat => cat._id === category || cat.slug === category);
      console.log("🔍 Found category match:", foundCategory);
      console.log("🔍 Category name:", foundCategory?.name);
      setFilterCategory(category);
      setPage(1); // Reset về trang 1 khi có category mới
      setSearchTerm(''); // Clear search term khi có category
      setFilterBrand(''); // Clear brand filter khi có category
    } else {
      // Reset filter nếu không có category trong URL
      setFilterCategory('');
    }
  }, [location.search, debouncedSearch, categories]); // Thêm categories vào dependency

  // Update active filters
  useEffect(() => {
    const filters = [];
    if (filterCategory) {
      const category = categories.find(cat => cat._id === filterCategory || cat.slug === filterCategory);
      if (category) filters.push(`Danh mục: ${category.name}`);
    }
    if (filterBrand) {
      const brand = brands.find(b => b._id === filterBrand);
      if (brand) filters.push(`Thương hiệu: ${brand.name}`);
    }
    if (filterPriceRange[0] > 0 || filterPriceRange[1] < 50000000) {
      filters.push(`Giá: ${formatPrice(filterPriceRange[0])} - ${formatPrice(filterPriceRange[1])}`);
    }
    if (filterInStock) {
      filters.push('Còn hàng');
    }
    setActiveFilters(filters);
  }, [filterCategory, filterBrand, filterPriceRange, filterInStock, categories, brands]);

  // Reset all filters
  const resetFilters = () => {
    setFilterCategory('');
    setFilterBrand('');
    setFilterPriceRange([0, 50000000]);
    setFilterInStock(false);
    setSearchTerm('');
    setPage(1);
    // Update URL to remove all filters
    window.history.replaceState({}, '', '/products');
  };

  const removeFilter = (filterType: string) => {
    switch (filterType) {
      case 'category':
        setFilterCategory('');
        break;
      case 'brand':
        setFilterBrand('');
        break;
      case 'price':
        setFilterPriceRange([0, 50000000]);
        break;
      case 'stock':
        setFilterInStock(false);
        break;
    }
  };

  const fetchProducts = async (pageNum = 1) => {
    if (loading) {
      console.log("⏸️ Skipping fetch - already loading");
      return;
    }
    setLoading(true);
    setError(null);
    let url = `/api/product?page=${pageNum}`;
    
    console.log("🔍 Starting fetchProducts with filters:");
    console.log("  - filterCategory:", filterCategory);
    console.log("  - filterBrand:", filterBrand);
    console.log("  - filterPriceRange:", filterPriceRange);
    console.log("  - filterInStock:", filterInStock);
    console.log("  - searchTerm:", searchTerm);
    
    if (filterCategory) {
      url += `&category=${filterCategory}`;
      console.log("✅ Added category filter:", filterCategory);
    }
    if (filterBrand) url += `&brand=${filterBrand}`;
    if (filterPriceRange[0]) url += `&minPrice=${filterPriceRange[0]}`;
    if (filterPriceRange[1]) url += `&maxPrice=${filterPriceRange[1]}`;
    if (filterInStock) url += '&inStock=true';
    if (searchTerm.trim()) {
      url += `&keyword=${encodeURIComponent(searchTerm.trim())}`;
      console.log("✅ Added search term:", searchTerm.trim());
    }
  
    let sortParam = '-createdAt';
    if (sortBy === 'price-low') sortParam = 'price';
    else if (sortBy === 'price-high') sortParam = '-price';
    else if (sortBy === 'rating') sortParam = '-averageRating';
    else if (sortBy === 'newest') sortParam = '-createdAt';
    url += `&sort=${encodeURIComponent(sortParam)}`;
    
    console.log("🔍 Final URL:", url);
    
    try {
      const res = await axios.get(url);
      const filtered = res.data.products || [];
      console.log("📦 API Response:", res.data);
      console.log("📦 Products received:", filtered.length);
      console.log("📦 Total products:", res.data.total);
      console.log("📦 Current filterCategory when setting products:", filterCategory);
      setProducts(filtered);
      setPage(res.data.page || 1);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || filtered.length);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi fetch sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [searchTerm, filterCategory, filterBrand, filterPriceRange, filterInStock, sortBy]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatPriceCompact = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)}B đ`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)}M đ`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K đ`;
    } else {
      return `${price} đ`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {filterCategory ? 
                    (() => {
                      const selectedCategory = categories.find(cat => cat.slug === filterCategory || cat._id === filterCategory);
                      return selectedCategory ? selectedCategory.name : 'Danh mục sản phẩm';
                    })() :
                    'Tất cả sản phẩm'
                  }
                </h1>
                <p className="text-gray-600 text-lg">
                  {filterCategory ? 
                    (() => {
                      const selectedCategory = categories.find(cat => cat.slug === filterCategory || cat._id === filterCategory);
                      return selectedCategory ? 
                        `Khám phá ${total.toLocaleString()} sản phẩm trong danh mục "${selectedCategory.name}"` :
                        `Khám phá ${total.toLocaleString()} sản phẩm`;
                    })() :
                    `Khám phá ${total.toLocaleString()} sản phẩm chất lượng cao`
                  }
                </p>
              </div>
              <div className="flex items-center gap-4">
                {filterCategory && (
                  <button
                    onClick={() => {
                      setFilterCategory('');
                      setPage(1);
                      // Update URL to remove category parameter
                      const params = new URLSearchParams(location.search);
                      params.delete('category');
                      const newUrl = params.toString() ? `?${params.toString()}` : '/products';
                      window.history.replaceState({}, '', newUrl);
                    }}
                    className="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FaTimes className="w-4 h-4" />
                    Xóa bộ lọc danh mục
                  </button>
                )}
                <div className="bg-blue-50 rounded-2xl px-4 py-2">
                  <span className="text-blue-700 font-semibold">
                    {products.length} sản phẩm
                  </span>
                  {activeFilters.length > 0 && (
                    <span className="text-blue-500 ml-2">(đã lọc)</span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Trang {page}/{pages}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Active Filters - Compact */}
          {activeFilters.length > 0 && (
            <div className="w-50px bg-blue-50 rounded-2xl shadow-sm p-4 mb-4 border border-blue-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-gray-700">Bộ lọc:</span>
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {activeFilters.length}
                  </span>
                </div>
                <button
                  onClick={resetFilters}
                  className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded-lg transition-all duration-200 flex items-center gap-1"
                >
                  <FaUndo className="w-3 h-3" />
                  Xóa tất cả
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {activeFilters.map((filter, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 text-xs rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 w-fit"
                  >
                    {filter}
                    <button
                      onClick={() => {
                        if (filter.startsWith('Danh mục:')) removeFilter('category');
                        else if (filter === 'Còn hàng') removeFilter('stock');
                        else if (filter.startsWith('Thương hiệu:')) removeFilter('brand');
                        else if (filter.startsWith('Giá:')) removeFilter('price');
                      }}
                      className="hover:text-red-600 hover:bg-red-50 p-0.5 rounded-md transition-all duration-200"
                    >
                      <FaTimes className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <aside className="lg:w-64 w-full bg-white rounded-3xl shadow-xl p-6 mb-8 lg:mb-0 flex-shrink-0 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <FaFilter className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Bộ lọc</h2>
              </div>
              <button
                onClick={resetFilters}
                className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-lg transition-all duration-200 flex items-center gap-1"
              >
                <FaUndo className="w-3 h-3" />
                Reset
              </button>
            </div>

            <div className="space-y-4">
              {/* Category Filter */}
              <div className="bg-gray-50 rounded-2xl p-3">
                <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Danh mục
                  {filterCategory && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Đã chọn
                    </span>
                  )}
                </h3>
                <select
                  className="w-full px-3 py-2 border-0 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-700 bg-white shadow-sm"
                  value={filterCategory}
                  onChange={e => {
                    setFilterCategory(e.target.value);
                    setPage(1);
                    // Update URL
                    const params = new URLSearchParams(location.search);
                    if (e.target.value) {
                      params.set('category', e.target.value);
                    } else {
                      params.delete('category');
                    }
                    const newUrl = params.toString() ? `?${params.toString()}` : '/products';
                    window.history.replaceState({}, '', newUrl);
                  }}
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((cat: any) => (
                    <option key={cat._id} value={cat.slug || cat._id}>{cat.name}</option>
                  ))}
                </select>
                {filterCategory && (
                  <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    Đang hiển thị: {(() => {
                      const selectedCategory = categories.find(cat => cat.slug === filterCategory || cat._id === filterCategory);
                      return selectedCategory ? selectedCategory.name : filterCategory;
                    })()}
                  </div>
                )}
              </div>

              {/* Stock Filter */}
              <div className="bg-gray-50 rounded-2xl p-3">
                <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  Tình trạng
                </h3>
                <label className="flex items-center gap-2 cursor-pointer select-none p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={filterInStock}
                    onChange={e => setFilterInStock(e.target.checked)}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <span className="text-gray-700 text-sm font-medium">Chỉ hiển thị còn hàng</span>
                </label>
              </div>

              {/* Brand Filter */}
              <div className="bg-gray-50 rounded-2xl p-3">
                <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Thương hiệu
                </h3>
                <select
                  className="w-full px-3 py-2 border-0 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 text-sm text-gray-700 bg-white shadow-sm"
                  value={filterBrand}
                  onChange={e => setFilterBrand(e.target.value)}
                >
                  <option value="">Tất cả thương hiệu</option>
                  {brands.map((brand: any) => (
                    <option key={brand._id} value={brand._id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="bg-gray-50 rounded-2xl p-3">
                <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  Khoảng giá
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Từ</label>
                      <input
                        type="number"
                        min={0}
                        max={filterPriceRange[1]}
                        value={filterPriceRange[0] || ''}
                        onChange={e => {
                          const value = e.target.value === '' ? 0 : Number(e.target.value);
                          setFilterPriceRange([value, filterPriceRange[1]]);
                        }}
                        className="w-full px-3 py-2 border-0 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm bg-white shadow-sm text-center"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Đến</label>
                      <input
                        type="number"
                        min={filterPriceRange[0]}
                        value={filterPriceRange[1] || ''}
                        onChange={e => {
                          const value = e.target.value === '' ? 0 : Number(e.target.value);
                          setFilterPriceRange([filterPriceRange[0], value]);
                        }}
                        className="w-full px-3 py-2 border-0 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm bg-white shadow-sm text-center"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-1.5 text-center">
                    <span className="text-xs text-gray-600 truncate block">
                      {formatPriceCompact(filterPriceRange[0])} - {formatPriceCompact(filterPriceRange[1])}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 border border-gray-100">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl px-4 py-2">
                    <span className="text-gray-700 font-semibold">
                      {products.length} sản phẩm
                    </span>
                    {activeFilters.length > 0 && (
                      <span className="text-blue-600 ml-2 font-medium">(đã lọc)</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Sort */}
                  <div className="flex items-center gap-3">
                    <FaSort className="text-gray-500 w-4 h-4" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700 font-medium shadow-sm"
                    >
                      <option value="featured">Nổi bật</option>
                      <option value="price-low">Giá: Thấp đến cao</option>
                      <option value="price-high">Giá: Cao đến thấp</option>
                      <option value="rating">Đánh giá cao nhất</option>
                      <option value="newest">Mới nhất</option>
                    </select>
                  </div>

                  {/* View Mode */}
                  <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-3 rounded-xl transition-all duration-200 ${
                        viewMode === 'grid' 
                          ? 'bg-white shadow-lg text-blue-600' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <FaTh className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-3 rounded-xl transition-all duration-200 ${
                        viewMode === 'list' 
                          ? 'bg-white shadow-lg text-blue-600' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <FaList className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg font-medium">Đang tải sản phẩm...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 rounded-3xl shadow-xl p-12 text-center border border-red-100">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-500 text-2xl">⚠️</span>
                </div>
                <p className="text-red-600 text-lg font-medium">{error}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-2xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-500 mb-4">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                <button
                  onClick={resetFilters}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
                }`}>
                {products.map((product) => {
                  const mappedProduct = {
                    _id: product._id || product.id,
                    name: product.name,
                    price: product.salePrice || product.price,
                    originalPrice: product.salePrice ? product.price : undefined,
                    image: product.images && product.images.length > 0 ? product.images[0] : '',
                    brand:
                      product.brand && typeof product.brand === 'object'
                        ? product.brand.name
                        : product.brand,
                    category:
                      product.category && typeof product.category === 'object'
                        ? product.category.name
                        : product.category,
                    rating: product.averageRating || 0,
                    reviewCount: product.numReviews || 0,
                    discount: product.salePrice
                      ? Math.round(100 - (product.salePrice / product.price) * 100)
                      : undefined,
                    isNew: product.isFeatured || false,
                    isHot: product.isActive || false,
                    stock: product.stock || 0,
                    variants: product.variants || [],
                  };
                  return <ProductCard key={mappedProduct._id} product={mappedProduct} />;
                })}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                  <nav className="flex items-center space-x-2">
                    <button
                      className="px-4 py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 font-medium"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      ← Trước
                    </button>
                    
                    {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                      let pageNum;
                      if (pages <= 7) {
                        pageNum = i + 1;
                      } else if (page <= 4) {
                        pageNum = i + 1;
                      } else if (page >= pages - 3) {
                        pageNum = pages - 6 + i;
                      } else {
                        pageNum = page - 3 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                            pageNum === page 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      className="px-4 py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 font-medium"
                      onClick={() => setPage(page + 1)}
                      disabled={page === pages}
                    >
                      Sau →
                    </button>
                  </nav>
                  
                  <div className="mt-4 text-center">
                    <span className="text-sm text-gray-500">
                      Trang {page} / {pages} • {total.toLocaleString()} sản phẩm
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
