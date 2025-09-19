import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import BlogSection from './BlogSection';

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
  createdAt?: string;
}

const RecommendedProductsSection: React.FC = () => {
  const navigate = useNavigate();
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch newest products from backend
  useEffect(() => {
    const fetchNewestProducts = async () => {
      try {
        setLoading(true);
        
        // Calculate date 3 days ago
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        const threeDaysAgoISO = threeDaysAgo.toISOString();
        
        // Fetch newest products created within last 3 days
        const response = await fetch(`/api/product?startDate=${threeDaysAgoISO}&sort=-createdAt&limit=8`);
        let products = [];
        
        if (response.ok) {
          const data = await response.json();
          products = data.products || data;
          
          // Filter products that are actually within 3 days
          products = products.filter((product: any) => {
            if (!product.createdAt) return false;
            const productDate = new Date(product.createdAt);
            const now = new Date();
            const diffTime = now.getTime() - productDate.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            return diffDays <= 3;
          });
        } else {
          // Fallback to general newest products
          const fallbackResponse = await fetch('/api/product?sort=-createdAt&limit=8');
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            products = fallbackData.products || fallbackData;
          }
        }
        
        // If no products found, don't show demo data for newest products
        // Just show empty state
        setRecommendedProducts(products);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching recommended products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewestProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              SẢN PHẨM MỚI NHẤT
            </h2>
          </div>
          <div className="text-center text-gray-500">Đang tải sản phẩm mới nhất...</div>
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
              SẢN PHẨM MỚI NHẤT
            </h2>
          </div>
          <div className="text-center text-red-500">{error}</div>
        </div>
      </section>
    );
  }

  // Don't show section if no new products
  if (recommendedProducts.length === 0) {
    return <BlogSection />;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            NEW ARRIVALS
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent mb-4">
            SẢN PHẨM MỚI NHẤT
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá những sản phẩm công nghệ mới nhất, được cập nhật liên tục để mang đến trải nghiệm tuyệt vời nhất
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {recommendedProducts.map((product, index) => {
            const mappedProduct = {
              _id: product._id,
              name: product.name,
              price: product.price,
              salePrice: product.salePrice,
              originalPrice: product.originalPrice,
              image: product.image || (product.images && product.images.length > 0 ? product.images[0] : ''),
              images: product.images,
              brand: product.brand,
              category: product.category,
              rating: product.rating || product.averageRating || 0,
              reviewCount: product.reviewCount || product.numReviews || 0,
              discount: product.discount,
              isNew: true, // Always new since they're within 3 days
              isHot: false,
              stock: product.stock || 0,
              variants: product.variants || [],
              createdAt: product.createdAt,
            };
            return (
              <div 
                key={mappedProduct._id} 
                className="transform hover:scale-105 transition-all duration-300 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard product={mappedProduct} />
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-16">
          <button 
            onClick={() => navigate('/products?sort=-createdAt')}
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-2xl hover:shadow-teal-500/25 transition-all duration-300 hover:scale-105"
          >
            <span>Xem tất cả sản phẩm mới</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>

      {/* Blog Section */}
      <BlogSection />
    </section>
  );
};

export default RecommendedProductsSection;
