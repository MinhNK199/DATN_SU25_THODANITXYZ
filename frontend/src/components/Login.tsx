import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaUser,
  FaCrown,
  FaUserTie,
} from "react-icons/fa";
// import LoginModeToggle from './LoginModeToggle'; // Removed - using checkbox instead
import axios from "axios";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showRoleChoice, setShowRoleChoice] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loginMode, setLoginMode] = useState<'user' | 'shipper'>('user');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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
        if (loginMode === 'shipper') {
          // Đăng nhập shipper
          const res = await axios.post("/api/shipper/login", {
            email: formData.email,
            password: formData.password,
          });

          setSuccess("Đăng nhập shipper thành công!");

          // Lưu vào localStorage
          localStorage.setItem("shipperToken", res.data.data.token);
          localStorage.setItem("shipper", JSON.stringify(res.data.data.shipper));

          console.log('🚚 Shipper login success!');
          console.log('📦 Token saved:', res.data.data.token);
          console.log('📦 Shipper data saved:', res.data.data.shipper);

          // Đợi một chút để localStorage được lưu
          setTimeout(() => {
            console.log('🔄 Redirecting to /shipper/dashboard...');
            console.log('🔍 Verify token in localStorage:', localStorage.getItem("shipperToken"));
            window.location.href = "/shipper/dashboard"; // Force reload
          }, 500);
        } else {
          // Đăng nhập user/admin
          const res = await axios.post("/api/auth/login", {
            email: formData.email,
            password: formData.password,
          });

          setSuccess(res.data.message || "Đăng nhập thành công!");
          localStorage.setItem("token", res.data.token);

          const user = res.data.user;
          localStorage.setItem("user", JSON.stringify(res.data.user));
          setCurrentUser(user);

          const role = user?.role;
          if (role === "admin" || role === "superadmin") {
            setShowRoleChoice(true);
          } else {
            setTimeout(() => {
              navigate("/");
            }, 1500);
          }
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.details?.join(", ") ||
          err.response?.data?.message ||
          "Đăng nhập thất bại!";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Logic đăng ký
      if (formData.password !== formData.confirmPassword) {
        setError("Mật khẩu xác nhận không khớp!");
        setIsLoading(false);
        return;
      }

      try {
        const res = await axios.post("/api/auth/register", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        setSuccess(res.data.message || "Đăng ký thành công!");
        setTimeout(() => {
          setIsLogin(true);
          setFormData({
            email: "",
            password: "",
            name: "",
            confirmPassword: "",
          });
        }, 2000);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.details?.join(", ") ||
          err.response?.data?.message ||
          "Đăng ký thất bại!";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRoleChoice = (choice: "admin" | "client") => {
    if (choice === "admin") {
      setTimeout(() => {
        navigate("/admin");
      }, 1000);
    } else {
      setTimeout(() => {
        navigate("/");
      }, 1000);
    }
    setShowRoleChoice(false);
  };

  // Modal chọn role
  if (showRoleChoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <FaCrown className="text-white text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Chào mừng, {currentUser?.name}!
              </h2>
              <p className="text-gray-600">
                Bạn có quyền truy cập Admin Dashboard. Bạn muốn truy cập vào
                đâu?
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleRoleChoice("admin")}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <FaCrown className="text-lg" />
                <span>Admin Dashboard</span>
              </button>

              <button
                onClick={() => handleRoleChoice("client")}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <FaUserTie className="text-lg" />
                <span>Trang chủ khách hàng</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">E</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? "Chào mừng trở lại" : "Tạo tài khoản"}
          </h2>
          <p className="text-gray-600">
            {isLogin
              ? 'Đăng nhập vào tài khoản để tiếp tục'
              : "Tham gia cùng chúng tôi và bắt đầu mua sắm ngay hôm nay"}
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
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
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
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
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
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
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

            {/* Shipper Login Checkbox - Only show during login */}
            {isLogin && (
              <div className="flex items-center justify-center py-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 w-full">
                  <div className="flex items-center justify-center space-x-3">
                    <input
                      id="shipper-login"
                      name="shipper-login"
                      type="checkbox"
                      checked={loginMode === 'shipper'}
                      onChange={(e) => setLoginMode(e.target.checked ? 'shipper' : 'user')}
                      className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-orange-300 rounded"
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="shipper-login"
                      className="text-orange-800 font-medium text-lg cursor-pointer flex items-center space-x-2"
                    >
                      <span>🚚</span>
                      <span>Đăng nhập bằng tài khoản Shipper</span>
                    </label>
                  </div>
                  <p className="text-orange-600 text-sm text-center mt-2">
                    {loginMode === 'shipper'
                      ? 'Bạn đang đăng nhập với tài khoản Shipper'
                      : 'Tích vào ô này để đăng nhập với tài khoản Shipper'
                    }
                  </p>
                </div>
              </div>
            )}

            {!isLogin && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
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
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Ghi nhớ đăng nhập
                  </label>
                </div>
                <a
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Quên mật khẩu?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${isLoading
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : loginMode === 'shipper'
                    ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                }`}
            >
              {isLoading
                ? isLogin
                  ? (loginMode === 'shipper' ? "🚚 Đang đăng nhập Shipper..." : "Đang đăng nhập...")
                  : "Đang đăng ký..."
                : isLogin
                  ? (loginMode === 'shipper' ? "🚚 Đăng nhập Shipper" : "Đăng nhập")
                  : "Tạo tài khoản"}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Hoặc tiếp tục với
                </span>
              </div>
            </div>
          </div>

          {/* Social Login */}
          <div className="mt-6">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const id_token = credentialResponse.credential;
                  const res = await axios.post(
                    "http://localhost:8000/api/auth/google",
                    { id_token }
                  );

                  const { token, user } = res.data;
                  localStorage.setItem("token", token);
                  localStorage.setItem("user", JSON.stringify(user));
                  setCurrentUser(user);
                  setSuccess("Đăng nhập Google thành công!");

                  const role = user?.role;
                  if (role === "admin" || role === "superadmin") {
                    setShowRoleChoice(true);
                  } else {
                    navigate("/");
                  }
                } catch (err) {
                  setError("Đăng nhập Google thất bại");
                }
              }}
              onError={() => {
                setError("Đăng nhập Google thất bại");
              }}
            />
          </div>

          {/* Toggle Login/Register + Admin Register Link */}
          <div className="mt-6 text-center space-y-2">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccess(null);
                setFormData({
                  email: "",
                  password: "",
                  name: "",
                  confirmPassword: "",
                });
              }}
              className="text-blue-600 hover:text-blue-500 transition-colors font-medium block w-full"
              disabled={isLoading}
            >
              {isLogin
                ? "Chưa có tài khoản? Đăng ký ngay"
                : "Đã có tài khoản? Đăng nhập"}
            </button>

            <a
              href="/admin-dky"
              className="text-purple-600 hover:text-purple-500 transition-colors font-medium block w-full"
            >
              Đăng ký tài khoản Admin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
