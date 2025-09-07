import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSlider from '../../components/client/HeroSlider';
import ProductCard from '../../components/client/ProductCard';
import RecommendationList from '../../components/client/RecommendationList';
import BlogSection from '../../components/client/BlogSection';
import { FaGift, FaTruck, FaShieldAlt, FaHeadset, FaStar, FaUsers, FaAward } from 'react-icons/fa';

const Home: React.FC = () => {
  const navigate = useNavigate();
  // State cho danh mục và sản phẩm nổi bật
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingFeatured, setLoadingFeatured] = useState(false);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);
  const [errorFeatured, setErrorFeatured] = useState<string | null>(null);

  useEffect(() => {
    setLoadingCategories(true);
    fetch('/api/category')
      .then(res => {
        if (!res.ok) throw new Error('Lỗi khi fetch danh mục');
        return res.json();
      })
      .then(data => {
        setCategories(data);
        setLoadingCategories(false);
      })
      .catch(err => {
        setErrorCategories(err.message);
        setLoadingCategories(false);
      });
  }, []);

  useEffect(() => {
    setLoadingFeatured(true);
    fetch('/api/product?isFeatured=true')
      .then(res => {
        if (!res.ok) throw new Error('Lỗi khi fetch sản phẩm nổi bật');
        return res.json();
      })
      .then(data => {
        // Nếu trả về dạng { products: [...] }
        const products = data.products || data;
        setFeaturedProducts(products);
        setLoadingFeatured(false);
      })
      .catch(err => {
        setErrorFeatured(err.message);
        setLoadingFeatured(false);
      });
  }, []);

  const features = [
    {
      icon: FaGift,
      title: 'Ưu đãi đặc biệt',
      description: 'Giảm giá lên đến 50% cho các sản phẩm mới nhất'
    },
    {
      icon: FaTruck,
      title: 'Miễn phí vận chuyển',
      description: 'Giao hàng miễn phí cho đơn hàng trên 500K'
    },
    {
      icon: FaShieldAlt,
      title: 'Bảo hành chính hãng',
      description: 'Bảo hành 12-24 tháng cho tất cả sản phẩm'
    },
    {
      icon: FaHeadset,
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ tư vấn chuyên nghiệp sẵn sàng hỗ trợ'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Khách hàng hài lòng' },
    { number: '100K+', label: 'Sản phẩm đã bán' },
    { number: '5+', label: 'Năm kinh nghiệm' },
    { number: '99%', label: 'Tỷ lệ hài lòng' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSlider />

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Mua sắm theo danh mục</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Khám phá các danh mục sản phẩm đa dạng với chất lượng cao và giá cả hợp lý
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loadingCategories ? (
              <div className="col-span-4 text-center text-gray-500">Đang tải danh mục...</div>
            ) : errorCategories ? (
              <div className="col-span-4 text-center text-red-500">{errorCategories}</div>
            ) : (
              categories.map((category, index) => (
                <button
                  key={category._id || index}
                  className="group cursor-pointer p-0 bg-transparent border-none text-left"
                  style={{ all: 'unset', cursor: 'pointer' }}
                  onClick={() => navigate(`/products?category=${category.slug || category._id}`)}
                >
                  <div className="relative overflow-hidden rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300">
                    <img
                      src={category.image || 'https://via.placeholder.com/300'}
                      alt={category.name}
                      className="w-full h-48 object-cover object-center group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                      <div className="p-6 text-white">
                        <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                        {category.count !== undefined && (
                          <p className="text-sm opacity-90">{category.count} sản phẩm</p>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sản phẩm nổi bật</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những sản phẩm được yêu thích nhất với công nghệ tiên tiến và thiết kế hiện đại
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {loadingFeatured ? (
              <div className="col-span-4 text-center text-gray-500">Đang tải sản phẩm nổi bật...</div>
            ) : errorFeatured ? (
              <div className="col-span-4 text-center text-red-500">{errorFeatured}</div>
            ) : (
              featuredProducts.map((product: any) => {
                // Map dữ liệu sang props ProductCard
                const mappedProduct = {
                  _id: product._id || product.id,
                  name: product.name,
                  price: product.salePrice || product.price,
                  originalPrice: product.salePrice ? product.price : undefined,
                  image: product.images && product.images.length > 0 ? product.images[0] : '',
                  brand: typeof product.brand === 'object' ? product.brand?.name : product.brand,
                  rating: product.averageRating || 0,
                  reviewCount: product.numReviews || 0,
                  discount: product.salePrice ? Math.round(100 - (product.salePrice / product.price) * 100) : undefined,
                  isNew: product.isFeatured || false,
                  isHot: product.isActive || false,
                  stock: product.stock || 0,
                  variants: product.variants || [], // Bổ sung dòng này
                };
                return <ProductCard key={mappedProduct._id} product={mappedProduct} />;
              })
            )}
          </div>
          <div className="text-center mt-12">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-lg">
              Xem tất cả sản phẩm
            </button>
          </div>
        </div>
      </section>

      {/* Recommendation Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <RecommendationList />
        </div>
      </section>

      {/* Blog Section */}
      <BlogSection />

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="text-white">
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Đăng ký nhận thông báo</h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Nhận thông tin về sản phẩm mới, khuyến mãi đặc biệt và các ưu đãi độc quyền
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 px-4 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 