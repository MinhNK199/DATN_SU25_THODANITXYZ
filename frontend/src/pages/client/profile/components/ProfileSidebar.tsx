import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  User, 
  Lock, 
  MapPin, 
  ShoppingBag, 
  Heart, 
  Bell,
  LogOut
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const ProfileSidebar = ({ setIsLoggedIn, setUserRole }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    if (setIsLoggedIn) setIsLoggedIn(false);
    if (setUserRole) setUserRole(null);
    toast.success('Bạn đã đăng xuất tài khoản thành công');
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/profile/personal-info',
      icon: User,
      label: 'Thông tin cá nhân',
      description: 'Quản lý thông tin tài khoản'
    },
    {
      path: '/profile/change-password',
      icon: Lock,
      label: 'Đổi mật khẩu',
      description: 'Cập nhật mật khẩu bảo mật'
    },
    {
      path: '/profile/addresses',
      icon: MapPin,
      label: 'Sổ địa chỉ',
      description: 'Quản lý địa chỉ giao hàng'
    },
    {
      path: '/profile/orders',
      icon: ShoppingBag,
      label: 'Đơn hàng của tôi',
      description: 'Theo dõi đơn hàng'
    },
    {
      path: '/profile/wishlist',
      icon: Heart,
      label: 'Danh sách yêu thích',
      description: 'Sản phẩm đã lưu'
    },
    {
      path: '/profile/notifications',
      icon: Bell,
      label: 'Thông báo',
      description: 'Cập nhật và thông báo'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Tài khoản của tôi
        </h2>
        <p className="text-sm text-gray-600">
          Quản lý thông tin và cài đặt tài khoản
        </p>
      </div>

      {/* Menu */}
      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Button */}
      <div className="pt-4 border-t mt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full p-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>

      {/* Toaster cho thông báo */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontSize: '14px' },
        }}
      />
    </div>
  );
};

export default ProfileSidebar;
