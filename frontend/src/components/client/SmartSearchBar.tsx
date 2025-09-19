import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaSearch, FaTimes, FaHistory, FaFire } from 'react-icons/fa';
import debounce from 'lodash.debounce';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

interface SearchResult {
  _id: string;
  name: string;
  price: number;
  salePrice?: number;
  images?: string[];
  brand?: { name: string };
  category?: { name: string };
  rating?: number;
  reviewCount?: number;
}

const SmartSearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [trending, setTrending] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const history = localStorage.getItem('searchHistory');
    return history ? JSON.parse(history) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Format price function
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Debounced fetch search results
  const fetchSearchResults = useCallback(
    debounce(async (keyword: string) => {
      if (!keyword || keyword.length < 2) {
        setSearchResults([]);
        setSuggestions([]);
        return;
      }
      
      setIsLoading(true);
      try {
        // Gọi API search để lấy kết quả sản phẩm
        const searchRes = await axiosInstance.get(`/product/search?query=${encodeURIComponent(keyword)}`);
        setSearchResults(searchRes.data || []);
        
        // Gọi API suggest để lấy gợi ý từ khóa
        const suggestRes = await axiosInstance.get(`/product/suggest?query=${encodeURIComponent(keyword)}`);
        setSuggestions(suggestRes.data.suggestions || []);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Fetch trending keywords
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axiosInstance.get('/product?sort=-averageRating&pageSize=4');
        setTrending((res.data.products || []).map((p: any) => p.name));
      } catch {
        setTrending([]);
      }
    };
    fetchTrending();
  }, []);

  // Handle input change with debounce
  useEffect(() => {
    fetchSearchResults(query);
    setIsOpen(!!query);
  }, [query, fetchSearchResults]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    setIsOpen(false);
    // Lưu vào lịch sử
    if (searchTerm.trim()) {
      const newHistory = [searchTerm, ...searchHistory.filter(item => item !== searchTerm)].slice(0, 8);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
    // Navigate to search result page
    navigate(`/advanced-products?keyword=${encodeURIComponent(searchTerm)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleSearch(query.trim());
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const removeFromHistory = (index: number) => {
    const newHistory = searchHistory.filter((_, i) => i !== index);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {/* Search Results */}
          {query && searchResults.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Kết quả tìm kiếm</h3>
              <div className="space-y-2">
                {searchResults.slice(0, 5).map((product) => (
                  <button
                    key={product._id}
                    onClick={() => {
                      // Điều hướng đến trang chi tiết sản phẩm
                      navigate(`/product/${product._id}`);
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className="w-full text-left p-3 hover:bg-gray-50 rounded flex items-center space-x-3 group"
                  >
                    <img
                      src={product.images?.[0] || '/placeholder-product.png'}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">
                        {product.brand?.name} • {product.category?.name}
                      </p>
                      <p className="text-sm font-semibold text-blue-600">
                        {product.salePrice ? (
                          <>
                            <span className="text-red-600">{formatPrice(product.salePrice)}</span>
                            <span className="text-gray-400 line-through ml-2">{formatPrice(product.price)}</span>
                          </>
                        ) : (
                          formatPrice(product.price)
                        )}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {query && suggestions.length > 0 && searchResults.length === 0 && (
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Gợi ý từ khóa</h3>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleSearch(suggestion);
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded flex items-center space-x-3 group"
                  >
                    <FaSearch className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                    <span className="text-gray-700 group-hover:text-blue-600">{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {query && isLoading && (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Đang tìm kiếm...</p>
            </div>
          )}

          {/* No Results */}
          {query && !isLoading && searchResults.length === 0 && suggestions.length === 0 && (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">Không tìm thấy kết quả nào</p>
            </div>
          )}

          {/* Trending Searches - Only show when no query */}
          {!query && (
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <FaFire className="w-4 h-4 mr-2 text-orange-500" />
                Tìm kiếm phổ biến
              </h3>
              <div className="flex flex-wrap gap-2">
                {trending.map((trend, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleSearch(trend);
                      setIsOpen(false);
                    }}
                    className="px-3 py-1 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-600 rounded-full text-sm transition-colors"
                  >
                    {trend}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                  <FaHistory className="w-4 h-4 mr-2 text-gray-500" />
                  Lịch sử tìm kiếm
                </h3>
                <button
                  onClick={clearHistory}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Xóa tất cả
                </button>
              </div>
              <div className="space-y-2">
                {searchHistory.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between group hover:bg-gray-50 rounded p-2"
                  >
                    <button
                      onClick={() => {
                        // Điền từ khóa vào thanh tìm kiếm
                        setQuery(item);
                        // Focus vào input để người dùng có thể chỉnh sửa
                        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                        if (input) {
                          input.focus();
                        }
                      }}
                      className="flex-1 text-left flex items-center space-x-2"
                    >
                      <FaHistory className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-700 group-hover:text-blue-600">{item}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(index);
                      }}
                      className="ml-2 p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-500"
                      title="Xóa khỏi lịch sử"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartSearchBar; 