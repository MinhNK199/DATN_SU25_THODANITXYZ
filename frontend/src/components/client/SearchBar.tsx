import React, { useState, useCallback } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  // Hàm gọi API tìm kiếm
  const fetchResults = async (searchTerm: string) => {
    if (!searchTerm) {
      setResults([]);
      return;
    }
    try {
      const res = await axios.get(`/api/product/search?query=${encodeURIComponent(searchTerm)}`);
      setResults(res.data);
    } catch (err) {
      setResults([]);
    }
  };

  // Debounce hàm fetchResults
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce(fetchResults, 400), []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleManualSearch = () => {
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Tìm kiếm sản phẩm..."
        style={{ width: 300, padding: 8, borderRadius: 20, border: "1px solid #90caf9" }}
      />
      <button onClick={handleManualSearch} style={{ position: 'absolute', right: 10, top: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}>
        🔍
      </button>
    </div>
  );
};

export default SearchBar; 