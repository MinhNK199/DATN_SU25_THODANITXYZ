import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt, FaTruck, FaShieldAlt, FaHeadset, FaCreditCard } from 'react-icons/fa';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Sản phẩm', href: '/products' },
    { name: 'Giới thiệu', href: '/about' },
    { name: 'Liên hệ', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Chính sách bảo mật', href: '/privacy' },
    { name: 'Điều khoản sử dụng', href: '/terms' },
    { name: 'Hướng dẫn mua hàng', href: '/guide' }
  ];

  const categories = [
    { name: 'Điện thoại', href: '/products?category=mobile' },
    { name: 'Laptop', href: '/products?category=laptop' },
    { name: 'Máy tính bảng', href: '/products?category=tablets' },
    { name: 'Đồng hồ thông minh', href: '/products?category=watches' },
    { name: 'Tai nghe', href: '/products?category=headphones' },
    { name: 'Phụ kiện', href: '/products?category=accessories' }
  ];

  const brands = [
    { name: 'Apple', href: '/products?brand=apple' },
    { name: 'Samsung', href: '/products?brand=samsung' },
    { name: 'Sony', href: '/products?brand=sony' },
    { name: 'Huawei', href: '/products?brand=huawei' },
    { name: 'Xiaomi', href: '/products?brand=xiaomi' },
    { name: 'Dell', href: '/products?brand=dell' }
  ];

  const features = [
    {
      icon: FaTruck,
      title: 'Miễn phí vận chuyển',
      description: 'Cho đơn hàng trên 500K'
    },
    {
      icon: FaShieldAlt,
      title: 'Bảo hành chính hãng',
      description: '12-24 tháng bảo hành'
    },
    {
      icon: FaHeadset,
      title: 'Hỗ trợ 24/7',
      description: 'Tư vấn miễn phí'
    },
    {
      icon: FaCreditCard,
      title: 'Thanh toán an toàn',
      description: 'Nhiều phương thức'
    }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  ElectronStore
                </h3>
                <p className="text-xs text-gray-400">Thiết bị điện tử cao cấp</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Chuyên cung cấp các sản phẩm điện tử chính hãng với chất lượng cao, 
              giá cả hợp lý và dịch vụ hậu mãi tốt nhất.
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-blue-400 hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-pink-600 hover:bg-pink-700 rounded-full flex items-center justify-center transition-colors">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors">
                <FaYoutube className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-blue-700 hover:bg-blue-800 rounded-full flex items-center justify-center transition-colors">
                <FaLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Liên kết nhanh</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Danh mục sản phẩm</h4>
            <ul className="space-y-3">
              {categories.map((category, index) => (
                <li key={index}>
                  <Link
                    to={category.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Thông tin liên hệ</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <FaMapMarkerAlt className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-400">
                    123 Đường ABC, Quận 1<br />
                    TP. Hồ Chí Minh, Việt Nam
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <FaPhone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-400">+84 123 456 789</p>
                  <p className="text-gray-400">+84 987 654 321</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <FaEnvelope className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-400">info@electronstore.vn</p>
                  <p className="text-gray-400">support@electronstore.vn</p>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="mt-6">
              <h5 className="font-semibold mb-2">Giờ làm việc</h5>
              <p className="text-gray-400 text-sm">
                Thứ 2 - Thứ 6: 8:00 - 20:00<br />
                Thứ 7: 8:00 - 18:00<br />
                Chủ nhật: 9:00 - 17:00
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h5 className="font-semibold text-white">{feature.title}</h5>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-gray-950 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} ElectronStore. Tất cả quyền được bảo lưu.
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Chính sách bảo mật
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                Điều khoản sử dụng
              </Link>
              <Link to="/sitemap" className="text-gray-400 hover:text-white transition-colors">
                Sitemap
              </Link>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>Được phát triển bởi</span>
              <span className="text-blue-400 font-semibold">ElectronStore Team</span>
            </div>
          </div>
        </div>
      </div>

    
    </footer>
  );
};

export default Footer; 