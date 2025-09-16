import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaArrowLeft, FaCog, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';

const AdminNotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="relative">
            <div className="w-32 h-32 mx-auto bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl">
              <FaShieldAlt className="w-16 h-16 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">!</span>
            </div>
          </div>
        </div>

        {/* 404 Text */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-gray-800 mb-4">
            4<span className="text-red-500">0</span>4
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
            Trang quản trị không tìm thấy
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Xin lỗi, trang quản trị bạn đang tìm kiếm không tồn tại hoặc bạn không có quyền truy cập.
          </p>
          <p className="text-sm text-gray-500">
            Vui lòng kiểm tra lại URL hoặc liên hệ với quản trị viên hệ thống.
          </p>
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
          
          <Link
            to="/admin"
            className="flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg"
          >
            <FaCog className="w-4 h-4 mr-2" />
            Bảng điều khiển
          </Link>
          
          <Link
            to="/"
            className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg"
          >
            <FaHome className="w-4 h-4 mr-2" />
            Về trang chủ
          </Link>
        </div>

        {/* Admin Quick Links */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Các trang quản trị phổ biến
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link
              to="/admin/products"
              className="p-3 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium text-gray-700 hover:text-red-600"
            >
              Quản lý sản phẩm
            </Link>
            <Link
              to="/admin/orders"
              className="p-3 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium text-gray-700 hover:text-red-600"
            >
              Quản lý đơn hàng
            </Link>
            <Link
              to="/admin/users"
              className="p-3 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium text-gray-700 hover:text-red-600"
            >
              Quản lý người dùng
            </Link>
            <Link
              to="/admin/categories"
              className="p-3 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium text-gray-700 hover:text-red-600"
            >
              Quản lý danh mục
            </Link>
            <Link
              to="/admin/analytics"
              className="p-3 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium text-gray-700 hover:text-red-600"
            >
              Thống kê
            </Link>
            <Link
              to="/admin/settings"
              className="p-3 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium text-gray-700 hover:text-red-600"
            >
              Cài đặt
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <FaExclamationTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <h4 className="font-semibold text-yellow-800">Thông báo bảo mật</h4>
          </div>
          <p className="text-sm text-yellow-700">
            Nếu bạn không phải là quản trị viên và vô tình truy cập vào đây, 
            vui lòng quay lại trang chủ. Tất cả hoạt động truy cập trái phép đều được ghi lại.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Cần hỗ trợ? Vui lòng{' '}
            <Link to="/contact" className="text-red-600 hover:text-red-800 font-medium">
              liên hệ với quản trị viên
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminNotFound;
