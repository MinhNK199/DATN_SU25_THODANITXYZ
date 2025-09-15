import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaArrowLeft, FaShieldAlt, FaExclamationTriangle, FaUser } from 'react-icons/fa';

const AdminAccessDenied: React.FC = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check user role from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (error) {
        setUserRole(null);
      }
    }
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  const isAdmin = userRole === 'admin' || userRole === 'superadmin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Access Denied Icon */}
        <div className="mb-8">
          <div className="relative">
            <div className="w-32 h-32 mx-auto bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
              <FaShieldAlt className="w-16 h-16 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">!</span>
            </div>
          </div>
        </div>

        {/* Access Denied Text */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-gray-800 mb-4">
            4<span className="text-purple-500">0</span>4
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
            {isAdmin ? 'Trang không tìm thấy' : 'Truy cập bị từ chối'}
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            {isAdmin 
              ? 'Trang quản trị bạn đang tìm kiếm không tồn tại.'
              : 'Bạn không có quyền truy cập vào khu vực quản trị này.'
            }
          </p>
          <p className="text-sm text-gray-500">
            {isAdmin 
              ? 'Vui lòng kiểm tra lại URL hoặc sử dụng menu điều hướng.'
              : 'Chỉ có quản trị viên mới có thể truy cập vào khu vực này.'
            }
          </p>
        </div>

        {/* User Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-center mb-4">
            <FaUser className="w-6 h-6 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-700">Trạng thái tài khoản</h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Vai trò:</span> {userRole || 'Chưa đăng nhập'}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Quyền truy cập:</span> 
              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                isAdmin 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isAdmin ? 'Quản trị viên' : 'Khách hàng'}
              </span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors shadow-lg"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </button>
          
          {isAdmin ? (
            <Link
              to="/admin"
              className="flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-lg"
            >
              <FaShieldAlt className="w-4 h-4 mr-2" />
              Bảng điều khiển
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg"
            >
              <FaUser className="w-4 h-4 mr-2" />
              Đăng nhập
            </Link>
          )}
          
          <Link
            to="/"
            className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-lg"
          >
            <FaHome className="w-4 h-4 mr-2" />
            Về trang chủ
          </Link>
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-center mb-2">
            <FaExclamationTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <h4 className="font-semibold text-yellow-800">Thông báo bảo mật</h4>
          </div>
          <p className="text-sm text-yellow-700">
            {isAdmin 
              ? 'Tất cả hoạt động truy cập đều được ghi lại để đảm bảo bảo mật hệ thống.'
              : 'Việc cố gắng truy cập trái phép vào khu vực quản trị có thể dẫn đến việc khóa tài khoản.'
            }
          </p>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Các trang có thể truy cập
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/products"
              className="p-3 bg-gray-50 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium text-gray-700 hover:text-purple-600"
            >
              Sản phẩm
            </Link>
            <Link
              to="/about"
              className="p-3 bg-gray-50 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium text-gray-700 hover:text-purple-600"
            >
              Giới thiệu
            </Link>
            <Link
              to="/contact"
              className="p-3 bg-gray-50 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium text-gray-700 hover:text-purple-600"
            >
              Liên hệ
            </Link>
            <Link
              to="/faq"
              className="p-3 bg-gray-50 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium text-gray-700 hover:text-purple-600"
            >
              FAQ
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Cần hỗ trợ? Vui lòng{' '}
            <Link to="/contact" className="text-purple-600 hover:text-purple-800 font-medium">
              liên hệ với chúng tôi
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAccessDenied;
