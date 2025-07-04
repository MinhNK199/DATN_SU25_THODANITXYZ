import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook, FaApple, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import axios from 'axios';
import { useToast } from '../../components/client/ToastNotification';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (isLogin) {
      // Logic đăng nhập
      try {
        console.log("Đang gửi request đăng nhập:", { email: formData.email, password: formData.password });
        
        const res = await axios.post(
          "http://localhost:9000/api/auth/login",
          { email: formData.email, password: formData.password }
        );
        
        console.log("Response từ server:", res.data);
        
        // Hiển thị toast thành công
        showToast("Đăng nhập thành công! Chào mừng bạn trở lại!", "success");
        
        setSuccess(res.data.message || "Đăng nhập thành công!");
        localStorage.setItem("token", res.data.token);

        const user = res.data.user;
        localStorage.setItem("user", JSON.stringify(res.data.user));

        console.log("User data:", user);
        console.log("User role:", user?.role);

        const role = user?.role;
        
        // Đợi một chút để user thấy thông báo thành công
        setTimeout(() => {
          if (role === "admin" || role === "superadmin") {
            console.log("Chuyển hướng đến admin dashboard");
            navigate("/admin");
          } else {
            console.log("Chuyển hướng đến trang chủ");
            navigate("/");
          }
        }, 1500);
        
      } catch (err: any) {
        console.error("Lỗi đăng nhập:", err);
        console.error("Error response:", err.response?.data);
        
        const errorMessage = err.response?.data?.details?.join(", ") ||
          err.response?.data?.message ||
          "Đăng nhập thất bại!";
        
        setError(errorMessage);
        showToast(errorMessage, "error");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Logic đăng ký
      if (formData.password !== formData.confirmPassword) {
        setError("Mật khẩu xác nhận không khớp!");
        showToast("Mật khẩu xác nhận không khớp!", "error");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Đang gửi request đăng ký:", { 
          name: formData.name, 
          email: formData.email, 
          password: formData.password 
        });
        
        const res = await axios.post("http://localhost:9000/api/auth/register", {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        
        console.log("Response từ server:", res.data);
        
        // Hiển thị toast thành công
        showToast("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.", "success");
        
        setSuccess(res.data.message || "Đăng ký thành công!");
        setTimeout(() => {
          setIsLogin(true);
          setFormData({ email: '', password: '', name: '', confirmPassword: '' });
        }, 2000);
        
      } catch (err: any) {
        console.error("Lỗi đăng ký:", err);
        console.error("Error response:", err.response?.data);
        
        const errorMessage = err.response?.data?.details?.join(", ") ||
          err.response?.data?.message ||
          "Đăng ký thất bại!";
        
        setError(errorMessage);
        showToast(errorMessage, "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">E</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản'}
          </h2>
          <p className="text-gray-600">
            {isLogin 
              ? 'Đăng nhập vào tài khoản để tiếp tục' 
              : 'Tham gia cùng chúng tôi và bắt đầu mua sắm ngay hôm nay'
            }
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Nhập họ và tên của bạn"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Nhập email của bạn"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Nhập mật khẩu của bạn"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required={!isLogin}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Xác nhận mật khẩu của bạn"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Ghi nhớ đăng nhập
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${
                isLoading 
                  ? "bg-gray-400 cursor-not-allowed text-white" 
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              }`}
            >
              {isLoading 
                ? (isLogin ? "Đang đăng nhập..." : "Đang đăng ký...") 
                : (isLogin ? 'Đăng nhập' : 'Tạo tài khoản')
              }
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc tiếp tục với</span>
              </div>
            </div>
          </div>

          {/* Social Login */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <button 
              type="button"
              disabled={isLoading}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaGoogle className="h-5 w-5" />
            </button>
            <button 
              type="button"
              disabled={isLoading}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaFacebook className="h-5 w-5" />
            </button>
            <button 
              type="button"
              disabled={isLoading}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaApple className="h-5 w-5" />
            </button>
          </div>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccess(null);
                setFormData({ email: '', password: '', name: '', confirmPassword: '' });
              }}
              className="text-blue-600 hover:text-blue-500 transition-colors font-medium"
              disabled={isLoading}
            >
              {isLogin 
                ? "Chưa có tài khoản? Đăng ký ngay" 
                : "Đã có tài khoản? Đăng nhập"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 