import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">

        {/* Section Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ĐIỆN THOẠI NỔI BẬT NHẤT
          </h2>
        </div>


        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {featuredProducts
            .filter(product => product.isFeatured === true) // Chỉ hiển thị sản phẩm nổi bật
            .slice(0, 10)
            .map((product) => {
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
              return <ProductCard key={mappedProduct._id} product={mappedProduct} />;
            })}
        </div>

        {/* Show more button */}
        {featuredProducts.length > 10 && (
          <div className="text-center mt-8">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition-colors">
              Xem thêm sản phẩm
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProductsSection;
