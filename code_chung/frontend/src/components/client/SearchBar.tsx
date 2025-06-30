import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaHistory, FaFire } from 'react-icons/fa';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Mock data for autocomplete
  const allProducts = [
    'iPhone 15 Pro Max',
    'Samsung Galaxy S24 Ultra',
    'MacBook Pro M3',
    'iPad Pro 12.9',
    'Apple Watch Series 9',
    'Sony WH-1000XM5',
    'Dell XPS 13 Plus',
    'Samsung Galaxy Tab S9',
    'AirPods Pro 2',
    'MacBook Air M2',
    'iPhone 14 Pro',
    'Samsung Galaxy Z Fold 5',
    'iPad Air 5',
    'Apple Watch Ultra',
    'Sony WF-1000XM5',
    'Dell XPS 15',
    'Samsung Galaxy S23',
    'MacBook Pro 16',
    'iPad Mini 6',
    'Apple Watch SE'
  ];

  // Mock trending searches
  const trendingSearches = [
    'iPhone 15 Pro Max',
    'Samsung Galaxy S24',
    'MacBook Pro M3',
    'Apple Watch Series 9'
  ];

  // Mock search history
  const searchHistory = ['iPhone 15 Pro Max', 'MacBook Pro', 'Samsung Galaxy'];

  // Filter products based on query
  const filteredProducts = allProducts.filter(product =>
    product.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  const handleSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    setIsOpen(false);
    // Navigate to search results page
    console.log('Searching for:', searchTerm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleSearch(query.trim());
    }
  };

  const clearHistory = () => {
    console.log('Clear history clicked');
  };

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

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
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
          {query && filteredProducts.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Kết quả tìm kiếm</h3>
              <div className="space-y-2">
                {filteredProducts.map((product, index) => (
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
              {trendingSearches.map((trend, index) => (
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

          {/* Quick Filters */}
          <div className="p-4 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Lọc nhanh</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="p-2 bg-white border border-gray-200 rounded text-sm hover:bg-blue-50 hover:border-blue-300 transition-colors">
                Giá dưới 10M
              </button>
              <button className="p-2 bg-white border border-gray-200 rounded text-sm hover:bg-blue-50 hover:border-blue-300 transition-colors">
                Giá 10M-20M
              </button>
              <button className="p-2 bg-white border border-gray-200 rounded text-sm hover:bg-blue-50 hover:border-blue-300 transition-colors">
                Giá trên 20M
              </button>
              <button className="p-2 bg-white border border-gray-200 rounded text-sm hover:bg-blue-50 hover:border-blue-300 transition-colors">
                Khuyến mãi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar; 