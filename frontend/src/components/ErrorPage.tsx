import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaRefresh, FaExclamationTriangle, FaBug } from 'react-icons/fa';

interface ErrorPageProps {
  error?: Error;
  resetError?: () => void;
  isAdmin?: boolean;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ error, resetError, isAdmin = false }) => {
  const handleRefresh = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="relative">
            <div className="w-32 h-32 mx-auto bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
              <FaBug className="w-16 h-16 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">!</span>
            </div>
          </div>
        </div>

        {/* Error Text */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-gray-800 mb-4">
            Oops!
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
            Đã xảy ra lỗi
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Xin lỗi, đã có lỗi xảy ra trong quá trình xử lý. Chúng tôi đang khắc phục sự cố này.
          </p>
          <p className="text-sm text-gray-500">
            Vui lòng thử lại sau hoặc liên hệ với chúng tôi nếu vấn đề vẫn tiếp tục.
          </p>
        </div>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-left">
            <h3 className="font-semibold text-red-800 mb-2">Chi tiết lỗi (Development):</h3>
            <pre className="text-xs text-red-700 overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <button
            onClick={handleRefresh}
            className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-lg"
          >
            <FaRefresh className="w-4 h-4 mr-2" />
            Thử lại
          </button>
          
          <Link
            to={isAdmin ? "/admin" : "/"}
            className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg"
          >
            <FaHome className="w-4 h-4 mr-2" />
            {isAdmin ? "Bảng điều khiển" : "Về trang chủ"}
          </Link>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Cần hỗ trợ?
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Kiểm tra kết nối internet của bạn</p>
            <p>• Xóa cache trình duyệt và thử lại</p>
            <p>• Liên hệ với chúng tôi nếu vấn đề vẫn tiếp tục</p>
          </div>
        </div>

        {/* Security Notice for Admin */}
        {isAdmin && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <FaExclamationTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <h4 className="font-semibold text-yellow-800">Thông báo bảo mật</h4>
            </div>
            <p className="text-sm text-yellow-700">
              Lỗi này đã được ghi lại trong hệ thống. Nếu đây là lỗi bảo mật, 
              vui lòng liên hệ ngay với quản trị viên hệ thống.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Mã lỗi: {Date.now().toString(36).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
