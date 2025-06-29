import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaUser, FaHeart, FaBars, FaTimes, FaPhone, FaEnvelope, FaMapMarkerAlt, FaChevronDown } from 'react-icons/fa';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import SearchBar from './SearchBar';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showMiniCart, setShowMiniCart] = useState(false);
  const miniCartRef = useRef<HTMLDivElement>(null);
  
  const { state: cartState } = useCart();
  const { state: wishlistState } = useWishlist();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!showMiniCart) return;
    const handleClick = (e: MouseEvent) => {
      if (miniCartRef.current && !miniCartRef.current.contains(e.target as Node)) {
        setShowMiniCart(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMiniCart]);

  const categories = [
    { name: 'Điện thoại', href: '/products?category=mobile' },
    { name: 'Laptop', href: '/products?category=laptop' },
    { name: 'Máy tính bảng', href: '/products?category=tablets' },
    { name: 'Đồng hồ thông minh', href: '/products?category=watches' },
    { name: 'Phụ kiện', href: '/products?category=accessories' }
  ];

  const brands = [
    { name: 'Apple', href: '/products?brand=apple' },
    { name: 'Samsung', href: '/products?brand=samsung' },
    { name: 'Sony', href: '/products?brand=sony' },
    { name: 'Huawei', href: '/products?brand=huawei' },
    { name: 'Xiaomi', href: '/products?brand=xiaomi' }
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <FaPhone className="w-3 h-3" />
                <span>+84 123 456 789</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaEnvelope className="w-3 h-3" />
                <span>support@electronstore.vn</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span>Miễn phí vận chuyển cho đơn hàng trên 500K</span>
              <div className="flex items-center space-x-2">
                <FaMapMarkerAlt className="w-3 h-3" />
                <span>Theo dõi đơn hàng</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-white'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ElectronStore
                </h1>
                <p className="text-xs text-gray-500">Thiết bị điện tử cao cấp</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Trang chủ
              </Link>
              
              {/* Categories Dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  <span>Danh mục</span>
                  <FaChevronDown className="w-3 h-3" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-xl rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Mua sắm theo danh mục</h3>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <Link
                          key={category.name}
                          to={category.href}
                          className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition-colors"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Brands Dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  <span>Thương hiệu</span>
                  <FaChevronDown className="w-3 h-3" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-xl rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Thương hiệu nổi bật</h3>
                    <div className="space-y-2">
                      {brands.map((brand) => (
                        <Link
                          key={brand.name}
                          to={brand.href}
                          className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition-colors"
                        >
                          {brand.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Link to="/products" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Sản phẩm
              </Link>

              {/* More Menu Dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  <span>Thêm</span>
                  <FaChevronDown className="w-3 h-3" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-56 bg-white shadow-xl rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Tùy chọn khác</h3>
                    <div className="space-y-2">
                      <Link
                        to="/compare"
                        className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition-colors"
                      >
                        So sánh sản phẩm
                      </Link>
                      <Link
                        to="/about"
                        className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition-colors"
                      >
                        Giới thiệu
                      </Link>
                      <Link
                        to="/contact"
                        className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition-colors"
                      >
                        Liên hệ
                      </Link>
                      <Link
                        to="/faq"
                        className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition-colors"
                      >
                        Câu hỏi thường gặp
                      </Link>
                      <Link
                        to="/checkout"
                        className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition-colors"
                      >
                        Thanh toán
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <SearchBar />
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              {/* Search Icon (Mobile) */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="md:hidden text-gray-700 hover:text-blue-600"
              >
                <FaSearch className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <Link to="/profile?tab=wishlist" className="relative text-gray-700 hover:text-blue-600 transition-colors">
                <FaHeart className="w-5 h-5" />
                {wishlistState.itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistState.itemCount}
                  </span>
                )}
              </Link>

              {/* Cart with mini cart */}
              <div
                className="relative group"
                onMouseEnter={() => setShowMiniCart(true)}
                onMouseLeave={() => setShowMiniCart(false)}
              >
                <Link to="/cart" className="relative text-gray-700 hover:text-blue-600 transition-colors">
                  <FaShoppingCart className="w-5 h-5" />
                  {cartState.itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartState.itemCount}
                    </span>
                  )}
                </Link>
                {/* Mini Cart Popup */}
                <div
                  ref={miniCartRef}
                  className={`absolute right-0 mt-3 w-96 max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 transition-all duration-300 ${showMiniCart ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'} p-4`}
                  style={{ minWidth: 320 }}
                >
                  <h3 className="font-bold text-lg mb-3 text-gray-900">Giỏ hàng</h3>
                  {cartState.items.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <FaShoppingCart className="mx-auto w-10 h-10 mb-2 text-gray-300" />
                      Giỏ hàng của bạn trống
                    </div>
                  ) : (
                    <>
                      <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 mb-3">
                        {cartState.items.slice(0, 2).map(item => (
                          <div key={item.id} className="flex items-center py-2 gap-3">
                            <img src={item.image} alt={item.name} className="w-14 h-14 object-contain rounded-lg border" />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 line-clamp-1">{item.name}</div>
                              <div className="text-sm text-gray-500">Số lượng: {item.quantity}</div>
                            </div>
                            <div className="font-semibold text-blue-600 whitespace-nowrap">{item.price.toLocaleString('vi-VN')}₫</div>
                          </div>
                        ))}
                        {cartState.items.length > 2 && (
                          <div className="text-center text-gray-500 py-2 text-sm">... và {cartState.items.length - 2} sản phẩm khác</div>
                        )}
                      </div>
                      <div className="flex justify-between items-center font-semibold text-gray-900 mb-3">
                        <span>Tổng cộng:</span>
                        <span className="text-blue-600 text-lg">
                          {cartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Link to="/cart" className="flex-1 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-center font-medium text-gray-700 transition">Xem giỏ hàng</Link>
                        <Link to="/checkout" className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center font-medium transition">Thanh toán</Link>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* User Menu */}
              <div className="relative group">
                <Link to="/profile" className="text-gray-700 hover:text-blue-600 transition-colors">
                  <FaUser className="w-5 h-5" />
                </Link>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-xl rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="p-2">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors"
                    >
                      Tài khoản của tôi
                    </Link>
                    <Link
                      to="/profile?tab=orders"
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors"
                    >
                      Đơn hàng của tôi
                    </Link>
                    <Link
                      to="/profile?tab=wishlist"
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors"
                    >
                      Danh sách yêu thích
                    </Link>
                    <hr className="my-2" />
                    <Link
                      to="/login"
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors"
                    >
                      Đăng nhập
                    </Link>
                  </div>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-gray-700 hover:text-blue-600"
              >
                {isMobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {isSearchOpen && (
            <div className="md:hidden pb-4">
              <SearchBar />
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-6 space-y-4">
              <Link
                to="/"
                className="block text-gray-700 hover:text-blue-600 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Trang chủ
              </Link>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Danh mục</h3>
                <div className="space-y-2 ml-4">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      to={category.href}
                      className="block text-gray-600 hover:text-blue-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Thương hiệu</h3>
                <div className="space-y-2 ml-4">
                  {brands.map((brand) => (
                    <Link
                      key={brand.name}
                      to={brand.href}
                      className="block text-gray-600 hover:text-blue-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {brand.name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                to="/products"
                className="block text-gray-700 hover:text-blue-600 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sản phẩm
              </Link>

              {/* More Options Section */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Thêm</h3>
                <div className="space-y-2 ml-4">
                  <Link
                    to="/compare"
                    className="block text-gray-600 hover:text-blue-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    So sánh sản phẩm
                  </Link>
                  <Link
                    to="/about"
                    className="block text-gray-600 hover:text-blue-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Giới thiệu
                  </Link>
                  <Link
                    to="/contact"
                    className="block text-gray-600 hover:text-blue-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Liên hệ
                  </Link>
                  <Link
                    to="/faq"
                    className="block text-gray-600 hover:text-blue-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Câu hỏi thường gặp
                  </Link>
                  <Link
                    to="/checkout"
                    className="block text-gray-600 hover:text-blue-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Thanh toán
                  </Link>
                </div>
              </div>

              <hr className="my-4" />

              <Link
                to="/profile"
                className="block text-gray-700 hover:text-blue-600 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Tài khoản của tôi
              </Link>
              <Link
                to="/login"
                className="block text-gray-700 hover:text-blue-600 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header; 