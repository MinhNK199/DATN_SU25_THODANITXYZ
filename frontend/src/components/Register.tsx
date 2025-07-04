import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaImage,
  FaHome,
  FaSignInAlt,
} from "react-icons/fa";
import axios from "axios";
import { useToast } from "./client/ToastNotification";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log("Đang gửi request đăng ký:", form);
    
    try {
      const res = await axios.post("http://localhost:9000/api/auth/register", form);
      
      console.log("Response từ server:", res.data);
      
      // Hiển thị toast thành công
      showToast("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.", "success");
      
      setSuccess(res.data.message || "Đăng ký thành công!");
      setTimeout(() => {
        navigate("/login");
      }, 2000); // Tăng thời gian để user thấy toast
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
  };

  const handleNavigateHome = () => {
    navigate("/");
  };

  const handleNavigateLogin = () => {
    navigate("/login");
  };

  const handleNavigateAdminRegister = () => {
    navigate("/admin-dky");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-100 to-blue-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Tạo tài khoản mới</h2>

        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
        {success && <div className="text-green-600 text-sm mb-3">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FaUser className="absolute left-3 top-3.5 text-gray-400" />
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Họ và tên"
              required
              className="w-full border rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full border rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-3.5 text-gray-400" />
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Mật khẩu"
              required
              className="w-full border rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <FaPhone className="absolute left-3 top-3.5 text-gray-400" />
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Số điện thoại"
              className="w-full border rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full font-semibold py-2 rounded-md transition ${
              isLoading 
                ? "bg-gray-400 cursor-not-allowed text-white" 
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {isLoading ? "Đang đăng ký..." : "Đăng ký"}
          </button>

          {/* Nút chuyển sang đăng ký admin */}
          <button
            type="button"
            onClick={handleNavigateAdminRegister}
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Đăng ký làm Admin
          </button>
        </form>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-4 space-x-2">
          <button
            type="button"
            onClick={handleNavigateHome}
            className="flex items-center justify-center px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition flex-1"
          >
            <FaHome className="mr-2" />
            Trang chủ
          </button>
          
          <button
            type="button"
            onClick={handleNavigateLogin}
            className="flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition flex-1"
          >
            <FaSignInAlt className="mr-2" />
            Đăng nhập
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-blue-700 font-medium">
          <Link to="/login" className="hover:underline">Đã có tài khoản? Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
