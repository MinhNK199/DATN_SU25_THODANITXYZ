import React from 'react';
import HeroSlider from '../../components/client/HeroSlider';
import ProductCard from '../../components/client/ProductCard';
import { FaGift, FaTruck, FaShieldAlt, FaHeadset, FaStar, FaUsers, FaAward } from 'react-icons/fa';

const Home: React.FC = () => {
  // Mock data for featured products
  const featuredProducts = [
    {
      id: '1',
      name: 'iPhone 15 Pro Max 256GB - Titan tự nhiên',
      price: 29990000,
      originalPrice: 32990000,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
      brand: 'Apple',
      rating: 4.8,
      reviewCount: 1247,
      discount: 9,
      isNew: true,
      isHot: true
    },
    {
      id: '2',
      name: 'Samsung Galaxy S24 Ultra 512GB - Titanium Gray',
      price: 24990000,
      originalPrice: 27990000,
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop',
      brand: 'Samsung',
      rating: 4.7,
      reviewCount: 892,
      discount: 11,
      isHot: true
    },
    {
      id: '3',
      name: 'MacBook Pro 14" M3 Pro 512GB - Space Black',
      price: 45990000,
      originalPrice: 49990000,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
      brand: 'Apple',
      rating: 4.9,
      reviewCount: 567,
      discount: 8,
      isNew: true
    },
    {
      id: '4',
      name: 'Sony WH-1000XM5 - Tai nghe chống ồn',
      price: 8990000,
      originalPrice: 10990000,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      brand: 'Sony',
      rating: 4.6,
      reviewCount: 1234,
      discount: 18
    },
    {
      id: '5',
      name: 'iPad Pro 12.9" M2 256GB - Space Gray',
      price: 28990000,
      originalPrice: 31990000,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
      brand: 'Apple',
      rating: 4.8,
      reviewCount: 756,
      discount: 9
    },
    {
      id: '6',
      name: 'Apple Watch Series 9 45mm - Midnight',
      price: 12990000,
      originalPrice: 14990000,
      image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca359?w=400&h=400&fit=crop',
      brand: 'Apple',
      rating: 4.7,
      reviewCount: 432,
      discount: 13,
      isNew: true
    },
    {
      id: '7',
      name: 'Dell XPS 13 Plus 9320 - Laptop cao cấp',
      price: 38990000,
      originalPrice: 42990000,
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop',
      brand: 'Dell',
      rating: 4.5,
      reviewCount: 234,
      discount: 9
    },
    {
      id: '8',
      name: 'Samsung Galaxy Tab S9 Ultra 14.6" 256GB',
      price: 19990000,
      originalPrice: 22990000,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
      brand: 'Samsung',
      rating: 4.6,
      reviewCount: 189,
      discount: 13
    }
  ];

  const categories = [
    {
      name: 'Điện thoại',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
      count: 156,
      href: '/products?category=mobile'
    },
    {
      name: 'Laptop',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
      count: 89,
      href: '/products?category=laptop'
    },
    {
      name: 'Máy tính bảng',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop',
      count: 67,
      href: '/products?category=tablets'
    },
    {
      name: 'Đồng hồ thông minh',
      image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca359?w=300&h=300&fit=crop',
      count: 43,
      href: '/products?category=watches'
    }
  ];

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
            {categories.map((category, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-6 text-white">
                      <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                      <p className="text-sm opacity-90">{category.count} sản phẩm</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-lg">
              Xem tất cả sản phẩm
            </button>
          </div>
        </div>
      </section>

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