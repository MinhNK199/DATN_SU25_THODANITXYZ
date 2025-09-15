import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EnhancedProductCard from './EnhancedProductCard';

interface Product {
  _id: string;
  name: string;
  price: number;
  salePrice?: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  brand: any;
  category?: any;
  rating?: number;
  averageRating?: number;
  reviewCount?: number;
  numReviews?: number;
  discount?: number;
  isNew?: boolean;
  isHot?: boolean;
  stock: number;
  variants?: any[];
  isFeatured?: boolean;
}

const RecommendedProductsSection: React.FC = () => {
  const navigate = useNavigate();
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch recommended products from backend
  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        setLoading(true);
        
        // Try to fetch user-specific recommendations first
        const response = await fetch('http://localhost:8000/api/product/recommendations/user', {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        let products = [];
        
        if (response.ok) {
          const data = await response.json();
          // Handle different response structures
          if (data.recommendations && Array.isArray(data.recommendations)) {
            products = data.recommendations;
          } else if (data.products && Array.isArray(data.products)) {
            products = data.products;
          } else if (Array.isArray(data)) {
            products = data;
          } else {
            products = [];
          }
        } else {
          // Fallback to general recommendations or featured products
          const fallbackResponse = await fetch('http://localhost:8000/api/product?isFeatured=true&limit=5');
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            if (fallbackData.products && Array.isArray(fallbackData.products)) {
              products = fallbackData.products;
            } else if (Array.isArray(fallbackData)) {
              products = fallbackData;
            } else {
              products = [];
            }
          }
        }
        
        // Add some demo data if no products found
        if (products.length === 0) {
          products = [
            {
              _id: '1',
              name: 'iPhone 15 Pro Max 256GB',
              price: 29990000,
              salePrice: 27990000,
              image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
              brand: { name: 'Apple' },
              rating: 5,
              reviewCount: 12,
              discount: 7,
              stock: 50,
              variants: []
            },
            {
              _id: '2',
              name: 'Samsung Galaxy S24 Ultra 512GB',
              price: 24990000,
              salePrice: 22990000,
              image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&h=300&fit=crop',
              brand: { name: 'Samsung' },
              rating: 4.8,
              reviewCount: 28,
              discount: 8,
              stock: 30,
              variants: []
            },
            {
              _id: '3',
              name: 'MacBook Air M2 13 inch',
              price: 25990000,
              salePrice: 23990000,
              image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&h=300&fit=crop',
              brand: { name: 'Apple' },
              rating: 4.9,
              reviewCount: 15,
              discount: 8,
              stock: 20,
              variants: []
            },
            {
              _id: '4',
              name: 'iPad Pro 12.9 inch M2',
              price: 22990000,
              salePrice: 20990000,
              image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop',
              brand: { name: 'Apple' },
              rating: 4.7,
              reviewCount: 22,
              discount: 9,
              stock: 25,
              variants: []
            },
            {
              _id: '5',
              name: 'AirPods Pro 2nd Gen',
              price: 5990000,
              salePrice: 5490000,
              image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300&h=300&fit=crop',
              brand: { name: 'Apple' },
              rating: 4.8,
              reviewCount: 45,
              discount: 8,
              stock: 100,
              variants: []
            },
            {
              _id: '6',
              name: 'Samsung Galaxy Watch 6 Classic',
              price: 8990000,
              salePrice: 7990000,
              image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
              brand: { name: 'Samsung' },
              rating: 4.7,
              reviewCount: 32,
              discount: 11,
              stock: 40,
              variants: []
            },
            {
              _id: '7',
              name: 'MacBook Pro 14 inch M3',
              price: 45990000,
              salePrice: 42990000,
              image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
              brand: { name: 'Apple' },
              rating: 4.9,
              reviewCount: 18,
              discount: 7,
              stock: 15,
              variants: []
            },
            {
              _id: '8',
              name: 'Sony WH-1000XM5',
              price: 8990000,
              salePrice: 7990000,
              image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop',
              brand: { name: 'Sony' },
              rating: 4.8,
              reviewCount: 67,
              discount: 11,
              stock: 60,
              variants: []
            },
            {
              _id: '9',
              name: 'iPad Air 5th Gen',
              price: 15990000,
              salePrice: 13990000,
              image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop',
              brand: { name: 'Apple' },
              rating: 4.6,
              reviewCount: 38,
              discount: 13,
              stock: 35,
              variants: []
            },
            {
              _id: '10',
              name: 'Xiaomi 13 Pro',
              price: 19990000,
              salePrice: 17990000,
              image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop',
              brand: { name: 'Xiaomi' },
              rating: 4.5,
              reviewCount: 29,
              discount: 10,
              stock: 45,
              variants: []
            }
          ];
        }
        
        // Ensure products is an array before slicing
        const safeProducts = Array.isArray(products) ? products : [];
        setRecommendedProducts(safeProducts.slice(0, 10));
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching recommended products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              SẢN PHẨM ĐỀ XUẤT CHO BẠN
            </h2>
          </div>
          <div className="text-center text-gray-500">Đang tải sản phẩm đề xuất...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              SẢN PHẨM ĐỀ XUẤT CHO BẠN
            </h2>
          </div>
          <div className="text-center text-red-500">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            SẢN PHẨM ĐỀ XUẤT CHO BẠN
          </h2>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {recommendedProducts.slice(0, 10).map((product) => {
            const mappedProduct = {
              _id: product._id,
              name: product.name,
              price: product.salePrice || product.price,
              originalPrice: product.salePrice ? product.price : undefined,
              image: product.image || (product.images && product.images.length > 0 ? product.images[0] : ''),
              brand: product.brand,
              category: product.category,
              rating: product.rating || product.averageRating || 0,
              reviewCount: product.reviewCount || product.numReviews || 0,
              discount: product.discount,
              isNew: product.isNew || false,
              isHot: product.isHot || false,
              stock: product.stock || 0,
              variants: product.variants || [],
            };
            return <EnhancedProductCard key={mappedProduct._id} product={mappedProduct} />;
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button 
            onClick={() => navigate('/products?recommended=true')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            Xem tất cả
          </button>
        </div>
      </div>
    </section>
  );
};

export default RecommendedProductsSection;
