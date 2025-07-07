import React, { useState, useEffect } from 'react';
import { FaFilter, FaSearch, FaStar } from 'react-icons/fa';
import ProductCard from '../../components/client/ProductCard';
import { useSearchParams } from 'react-router-dom';

const API_URL = 'http://localhost:8000/api/product';

const AdvancedProductList: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [searchParams] = useSearchParams();

  // Fetch categories and brands
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/category');
        const data = await res.json();
        setCategories(data || []);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/brand');
        const data = await res.json();
        setBrands(data || []);
      } catch {
        setBrands([]);
      }
    };
    fetchBrands();
  }, []);

  // Lấy từ khóa từ query param khi mount
  useEffect(() => {
    const keyword = searchParams.get('keyword') || '';
    setQuery(keyword);
  }, [searchParams]);

  // Fetch products with filters
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('keyword', query);
      if (category) params.append('category', category);
      if (brand) params.append('brand', brand);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (minRating) params.append('minRating', minRating);
      params.append('pageSize', '24');
      const res = await fetch(`${API_URL}?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [query, category, brand, minPrice, maxPrice, minRating]);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Kết quả tìm kiếm sản phẩm</h2>
      <form onSubmit={handleSearch} className="flex flex-wrap gap-4 mb-6 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Từ khóa</label>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Nhập tên sản phẩm..."
              className="w-full border border-gray-300 rounded px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Danh mục</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 min-w-[150px]"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Thương hiệu</label>
          <select
            value={brand}
            onChange={e => setBrand(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 min-w-[150px]"
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map((br) => (
              <option key={br._id} value={br._id}>
                {br.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Giá từ</label>
          <input
            type="number"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            placeholder="Min"
            className="border border-gray-300 rounded px-4 py-2 w-24"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Đến</label>
          <input
            type="number"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            placeholder="Max"
            className="border border-gray-300 rounded px-4 py-2 w-24"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Đánh giá tối thiểu</label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={minRating}
            onChange={e => setMinRating(e.target.value)}
            placeholder="0-5"
            className="border border-gray-300 rounded px-4 py-2 w-20"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          <FaFilter /> Lọc
        </button>
      </form>
      {loading ? (
        <div className="text-center py-12 text-lg">Đang tải sản phẩm...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-lg text-gray-500">Không tìm thấy sản phẩm phù hợp.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedProductList; 