import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaSearch, FaTimes, FaHistory, FaFire } from 'react-icons/fa';
import debounce from 'lodash.debounce';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:9000/api/product';

const SmartSearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [trending, setTrending] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const history = localStorage.getItem('searchHistory');
    return history ? JSON.parse(history) : [];
  });
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debounced fetch suggestions
  const fetchSuggestions = useCallback(
    debounce(async (keyword: string) => {
      if (!keyword) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/suggest?query=${encodeURIComponent(keyword)}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch {
        setSuggestions([]);
      }
    }, 300),
    []
  );

  // Fetch trending keywords (mock: lấy top sản phẩm nổi bật)
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(`${API_URL}?sort=-averageRating&pageSize=4`);
        const data = await res.json();
        setTrending((data.products || []).map((p: any) => p.name));
      } catch {
        setTrending([]);
      }
    };
    fetchTrending();
  }, []);

  // Handle input change with debounce
  useEffect(() => {
    fetchSuggestions(query);
    setIsOpen(!!query);
  }, [query, fetchSuggestions]);

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
          {query && suggestions.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Kết quả gợi ý</h3>
              <div className="space-y-2">
                {suggestions.map((product, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(product)}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded flex items-center space-x-3 group"
                  >
                    <FaSearch className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                    <span className="text-gray-700 group-hover:text-blue-600">{product}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <FaFire className="w-4 h-4 mr-2 text-orange-500" />
              Tìm kiếm phổ biến
            </h3>
            <div className="flex flex-wrap gap-2">
              {trending.map((trend, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(trend)}
                  className="px-3 py-1 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-600 rounded-full text-sm transition-colors"
                >
                  {trend}
                </button>
              ))}
            </div>
          </div>

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
                  <button
                    key={index}
                    onClick={() => handleSearch(item)}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded flex items-center justify-between group"
                  >
                    <span className="text-gray-700 group-hover:text-blue-600">{item}</span>
                    <FaHistory className="w-3 h-3 text-gray-400" />
                  </button>
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