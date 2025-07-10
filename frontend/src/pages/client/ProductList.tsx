import React, { useState, useEffect } from 'react';
import { FaFilter, FaSort, FaTh, FaList } from 'react-icons/fa';
import ProductCard from '../../components/client/ProductCard';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const ProductList: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

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

  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    axios.get('http://localhost:8000/api/category')
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));
    axios.get('http://localhost:8000/api/brand')
      .then(res => setBrands(res.data))
      .catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search') || '';
    setSearchTerm(search);
  }, [location.search]);

  const fetchProducts = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    let url = `http://localhost:8000/api/product?page=${pageNum}`;
    if (filterCategory) url += `&category=${filterCategory}`;
    if (filterBrand) url += `&brand=${filterBrand}`;
    if (filterPriceRange[0]) url += `&minPrice=${filterPriceRange[0]}`;
    if (filterPriceRange[1]) url += `&maxPrice=${filterPriceRange[1]}`;
    if (filterInStock) url += '&inStock=true';
    if (sortBy) {
      if (sortBy === 'price-low') url += '&sort=price';
      else if (sortBy === 'price-high') url += '&sort=-price';
      else if (sortBy === 'rating') url += '&sort=-averageRating';
      else if (sortBy === 'newest') url += '&sort=-createdAt';
      // 'featured' mặc định không truyền sort
    }
    try {
      const res = await axios.get(url);
      let filtered = res.data.products || [];
      if (searchTerm.trim()) {
        const lower = searchTerm.trim().toLowerCase();
        // Sản phẩm tên trùng khớp tuyệt đối lên đầu
        let exact = filtered.filter(p => p.name.toLowerCase() === lower);
        let partial = filtered.filter(p => p.name.toLowerCase().includes(lower) && p.name.toLowerCase() !== lower);
        // Nếu không có exact và partial, fallback: gợi ý các sản phẩm có chữ đầu tiên của từ khóa
        if (exact.length === 0 && partial.length === 0) {
          const firstWord = lower.split(' ')[0];
          partial = filtered.filter(p => p.name.toLowerCase().includes(firstWord));
        }
        filtered = [...exact, ...partial];
      }
      setProducts(filtered);
      setPage(res.data.page || 1);
      setPages(res.data.pages || 1);
      setTotal(filtered.length);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi fetch sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Xóa useEffect tự động fetchProducts khi thay đổi filter
  // useEffect(() => {
  //   fetchProducts();
  //   // eslint-disable-next-line
  // }, [searchTerm, filterCategory, filterBrand, filterPriceRange, filterInStock]);

  // Thay vào đó, chỉ fetchProducts khi bấm nút Lọc

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tất cả sản phẩm</h1>
          <p className="text-gray-600">
            Hiển thị {products.length}/{total} sản phẩm | Trang {page}/{pages}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72 w-full bg-white rounded-2xl shadow-lg p-6 mb-8 lg:mb-0 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Bộ lọc sản phẩm</h2>

            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-700 mb-2">Danh mục</h3>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((cat: any) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-700 mb-2">Thương hiệu</h3>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                value={filterBrand}
                onChange={e => setFilterBrand(e.target.value)}
              >
                <option value="">Tất cả thương hiệu</option>
                {brands.map((brand: any) => (
                  <option key={brand._id} value={brand._id}>{brand.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-700 mb-2">Khoảng giá</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={filterPriceRange[1]}
                  value={filterPriceRange[0]}
                  onChange={e => setFilterPriceRange([Number(e.target.value), filterPriceRange[1]])}
                  className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Từ"
                />
                <span>-</span>
                <input
                  type="number"
                  min={filterPriceRange[0]}
                  value={filterPriceRange[1]}
                  onChange={e => setFilterPriceRange([filterPriceRange[0], Number(e.target.value)])}
                  className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Đến"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterInStock}
                  onChange={e => setFilterInStock(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="text-gray-700 text-sm">Chỉ hiển thị còn hàng</span>
              </label>
            </div>

            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors mb-4"
              onClick={() => fetchProducts(1)}
            >
              Lọc
            </button>
          </aside>

          <div className="flex-1">
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

            {loading ? (
              <div className="text-center py-12 text-gray-500">Đang tải sản phẩm...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
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

            <div className="mt-12 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Trước
                </button>
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`px-3 py-2 rounded-lg ${p === page ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  onClick={() => setPage(page + 1)}
                  disabled={page === pages}
                >
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
