import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaUser, FaHeart, FaBars, FaTimes, FaPhone, FaEnvelope, FaMapMarkerAlt, FaChevronDown } from 'react-icons/fa';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import SearchBar from './SearchBar';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string | Category;
  isActive: boolean;
}

interface Brand {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  isActive: boolean;
}

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showMiniCart, setShowMiniCart] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const miniCartRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { state: cartState, loadCart } = useCart();
  const { state: wishlistState } = useWishlist();

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    setIsLoggedIn(!!token);
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (error) {
        // Silently handle user data parsing error
        setUserRole(null);
      }
    } else {
      setUserRole(null);
    }
    
    if (token) {
      loadCart();
    }
  }, [loadCart]);

  // Listen for login/logout events
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      setIsLoggedIn(!!token);
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserRole(user.role);
        } catch (error) {
          // Silently handle user data parsing error
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
      
      if (token) {
        loadCart();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadCart]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/category');
        const activeCategories = response.data.filter((cat: Category) => cat.isActive);
        setCategories(activeCategories);
      } catch (error) {
        // Silently handle error - fallback to default categories
        setCategories([
          { _id: '1', name: 'Điện thoại', slug: 'mobile', isActive: true },
          { _id: '2', name: 'Laptop', slug: 'laptop', isActive: true },
          { _id: '3', name: 'Máy tính bảng', slug: 'tablets', isActive: true },
          { _id: '4', name: 'Đồng hồ thông minh', slug: 'watches', isActive: true },
          { _id: '5', name: 'Phụ kiện', slug: 'accessories', isActive: true }
        ]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/brand');
        const activeBrands = response.data.filter((brand: Brand) => brand.isActive);
        setBrands(activeBrands);
      } catch (error) {
        // Silently handle error - fallback to default brands
        setBrands([
          { _id: '1', name: 'Apple', isActive: true },
          { _id: '2', name: 'Samsung', isActive: true },
          { _id: '3', name: 'Sony', isActive: true },
          { _id: '4', name: 'Huawei', isActive: true },
          { _id: '5', name: 'Xiaomi', isActive: true }
        ]);
      } finally {
        setIsLoadingBrands(false);
      }
    };

    fetchBrands();
  }, []);

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    setUserRole(null);
    toast.success('Đăng xuất thành công');
    navigate('/login');
  };

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
                <span>support@techtrend.vn</span>
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
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TechTrend
                </h1>
                <p className="text-xs text-gray-500">Công nghệ dẫn đầu</p>
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
                    {isLoadingCategories ? (
                      <div className="text-gray-500 text-sm">Đang tải...</div>
                    ) : (
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <Link
                            key={category._id}
                            to={`/products?category=${category.slug}`}
                          className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition-colors"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                    )}
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
                    {isLoadingBrands ? (
                      <div className="text-gray-500 text-sm">Đang tải...</div>
                    ) : (
                    <div className="space-y-2">
                      {brands.map((brand) => (
                        <Link
                            key={brand._id}
                            to={`/products?brand=${brand.name.toLowerCase()}`}
                          className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition-colors"
                        >
                          {brand.name}
                        </Link>
                      ))}
                    </div>
                    )}
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
              {userRole === 'customer' && (
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
                    
                    {!isLoggedIn ? (
                      <div className="text-center text-gray-500 py-8">
                        <FaShoppingCart className="mx-auto w-10 h-10 mb-2 text-gray-300" />
                        <p className="mb-4">Vui lòng đăng nhập để xem giỏ hàng</p>
                        <Link 
                          to="/login"
                          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Đăng nhập
                        </Link>
                      </div>
                    ) : cartState.loading ? (
                      <div className="text-center text-gray-500 py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p>Đang tải giỏ hàng...</p>
                      </div>
                    ) : cartState.items.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <FaShoppingCart className="mx-auto w-10 h-10 mb-2 text-gray-300" />
                      Giỏ hàng của bạn trống
                    </div>
                  ) : (
                    <>
                      <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 mb-3">
                        {cartState.items.slice(0, 2).map(item => (
                            <div key={item._id} className="flex items-center py-2 gap-3">
                              <img src={item.product.images && item.product.images[0] ? item.product.images[0] : '/placeholder.svg'} alt={item.product.name} className="w-14 h-14 object-contain rounded-lg border" />
                            <div className="flex-1">
                                <div className="font-medium text-gray-900 line-clamp-1">{item.product.name}</div>
                              <div className="text-sm text-gray-500">Số lượng: {item.quantity}</div>
                            </div>
                              <div className="font-semibold text-blue-600 whitespace-nowrap">{formatPrice(item.product.salePrice || item.product.price)}</div>
                          </div>
                        ))}
                        {cartState.items.length > 2 && (
                          <div className="text-center text-gray-500 py-2 text-sm">... và {cartState.items.length - 2} sản phẩm khác</div>
                        )}
                      </div>
                      <div className="flex justify-between items-center font-semibold text-gray-900 mb-3">
                        <span>Tổng cộng:</span>
                        <span className="text-blue-600 text-lg">
                            {formatPrice(cartState.total)}
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
              )}

              {/* Admin/Superadmin notice */}
              {isLoggedIn && userRole && userRole !== 'customer' && (
                <div className="relative group">
                  <div className="text-gray-400 cursor-not-allowed">
                    <FaShoppingCart className="w-5 h-5" />
                  </div>
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-4">
                    <div className="text-center text-gray-500 py-4">
                      <FaShoppingCart className="mx-auto w-10 h-10 mb-2 text-gray-300" />
                      <p className="text-sm">
                        {userRole === 'admin' ? 'Admin' : 'Super Admin'} không thể sử dụng giỏ hàng
                      </p>
                      <p className="text-xs mt-1">Chỉ khách hàng mới được thêm sản phẩm vào giỏ hàng</p>
                    </div>
                  </div>
                </div>
              )}

              {/* User Menu */}
              <div className="relative group">
                <Link to="/profile" className="text-gray-700 hover:text-blue-600 transition-colors">
                  <FaUser className="w-5 h-5" />
                </Link>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-xl rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="p-2">
                    {isLoggedIn ? (
                      <>
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
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors"
                        >
                          Đăng xuất
                        </button>
                      </>
                    ) : (
                      <>
                    <Link
                      to="/login"
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors"
                    >
                      Đăng nhập
                    </Link>
                        <Link
                          to="/register"
                          className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors"
                        >
                          Đăng ký
                        </Link>
                      </>
                    )}
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
                {isLoadingCategories ? (
                  <div className="text-gray-500 text-sm ml-4">Đang tải...</div>
                ) : (
                <div className="space-y-2 ml-4">
                  {categories.map((category) => (
                    <Link
                        key={category._id}
                        to={`/products?category=${category.slug}`}
                      className="block text-gray-600 hover:text-blue-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Thương hiệu</h3>
                {isLoadingBrands ? (
                  <div className="text-gray-500 text-sm ml-4">Đang tải...</div>
                ) : (
                <div className="space-y-2 ml-4">
                  {brands.map((brand) => (
                    <Link
                        key={brand._id}
                        to={`/products?brand=${brand.name.toLowerCase()}`}
                      className="block text-gray-600 hover:text-blue-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {brand.name}
                    </Link>
                  ))}
                </div>
                )}
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

              {isLoggedIn ? (
                <>
              <Link
                to="/profile"
                className="block text-gray-700 hover:text-blue-600 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Tài khoản của tôi
              </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left text-gray-700 hover:text-blue-600 font-medium"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
              <Link
                to="/login"
                className="block text-gray-700 hover:text-blue-600 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Đăng nhập
              </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header; 