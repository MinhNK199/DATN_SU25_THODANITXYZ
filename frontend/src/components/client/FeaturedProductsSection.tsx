import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

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

const FeaturedProductsSection: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch featured products
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const productsResponse = await fetch('/api/product?isFeatured=true&limit=10');
        if (!productsResponse.ok) throw new Error('Lỗi khi tải sản phẩm nổi bật');
        const productsData = await productsResponse.json();
        const products = productsData.products || productsData;
        setFeaturedProducts(products as Product[]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-gray-500">Đang tải sản phẩm nổi bật...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Title */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            FEATURED COLLECTION
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
            SẢN PHẨM NỔI BẬT NHẤT
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá những sản phẩm công nghệ được yêu thích nhất, được lựa chọn kỹ lưỡng bởi đội ngũ chuyên gia
          </p>
        </div>


        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {featuredProducts
            .filter(product => product.isFeatured === true) // Chỉ hiển thị sản phẩm nổi bật
            .slice(0, 10)
            .map((product, index) => {
              // Kiểm tra sản phẩm được tạo trong vòng 3 ngày gần nhất
              const isRecentlyAdded = product.createdAt && 
                new Date().getTime() - new Date(product.createdAt).getTime() <= 3 * 24 * 60 * 60 * 1000;
              
              // Map product data to ProductCard props
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
                isNew: isRecentlyAdded || false, // Tự động dựa trên thời gian tạo
                isHot: true, // Tự động HOT vì đã được check nổi bật
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

        {/* Show more button */}
        {featuredProducts.length > 10 && (
          <div className="text-center mt-16">
            <button className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
              <span>Xem thêm sản phẩm</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProductsSection;
