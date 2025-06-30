import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../../components/client/ProductCard';

const ProductSearchPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Lấy từ khóa từ URL
  const params = new URLSearchParams(location.search);
  const keyword = params.get('keyword') || '';
  console.log('DEBUG: keyword from URL:', keyword);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let url = 'http://localhost:5000/api/products';
      if (keyword) {
        url += `?keyword=${encodeURIComponent(keyword)}`;
      }
      console.log('DEBUG: Fetching URL:', url);
      try {
        const res = await fetch(url);
        const data = await res.json();
        console.log('DEBUG: API response:', data);
        setProducts(data.products || []);
      } catch (err) {
        setProducts([]);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [keyword]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Kết quả tìm kiếm cho: <b>{keyword}</b></h2>
        {loading ? (
          <p>Đang tải...</p>
        ) : products.length === 0 ? (
          <p>Không tìm thấy sản phẩm nào.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSearchPage; 