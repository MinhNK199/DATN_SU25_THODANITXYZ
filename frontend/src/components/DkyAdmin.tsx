import React, { useState } from "react";
import { FaUser, FaLock, FaImage, FaRegFileAlt, FaSignature, FaHome, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "./client/ToastNotification";

const RegisterAdmin = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    avatar: "",
    adminRequestImage: "",
    adminRequestContent: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/api/auth/register-admin", form);
      
      // Hiển thị toast thành công
      showToast("Đăng ký thành công! Yêu cầu của bạn sẽ được admin xem xét.", "success");
      
      setSuccess(res.data.message);
      setForm({
        name: "",
        email: "",
        password: "",
        avatar: "",
        adminRequestImage: "",
        adminRequestContent: "",
      });
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Đăng ký thất bại";
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

  const handleNavigateRegister = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-300 to-yellow-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Đăng ký xin làm Admin
        </h2>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 px-4 py-2 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 text-sm text-green-600 bg-green-100 px-4 py-2 rounded">
            {success}
          </div>
        )}

        {/* Name */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Họ và tên</label>
          <div className="flex items-center border rounded px-3 py-2">
            <FaSignature className="text-gray-400 mr-2" />
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Nhập họ tên"
              className="w-full outline-none"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Email</label>
          <div className="flex items-center border rounded px-3 py-2">
            <FaUser className="text-gray-400 mr-2" />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="@gmail.com"
              className="w-full outline-none"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Mật khẩu</label>
          <div className="flex items-center border rounded px-3 py-2">
            <FaLock className="text-gray-400 mr-2" />
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Nhập mật khẩu"
              className="w-full outline-none"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Avatar URL */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Ảnh đại diện (URL)</label>
          <div className="flex items-center border rounded px-3 py-2">
            <FaImage className="text-gray-400 mr-2" />
            <input
              name="avatar"
              type="text"
              value={form.avatar}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full outline-none"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Admin request image */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Ảnh minh chứng (URL)</label>
          <div className="flex items-center border rounded px-3 py-2">
            <FaImage className="text-gray-400 mr-2" />
            <input
              name="adminRequestImage"
              type="text"
              value={form.adminRequestImage}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full outline-none"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Admin request content */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-1">Lý do muốn làm admin</label>
          <div className="flex items-start border rounded px-3 py-2">
            <FaRegFileAlt className="text-gray-400 mt-1 mr-2" />
            <textarea
              name="adminRequestContent"
              value={form.adminRequestContent}
              onChange={handleChange}
              placeholder="Giới thiệu hoặc lý do bạn muốn trở thành admin..."
              className="w-full outline-none resize-none"
              rows={3}
              required
              disabled={isLoading}
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 rounded-lg font-semibold transition ${
            isLoading 
              ? "bg-gray-400 cursor-not-allowed text-white" 
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {isLoading ? "Đang gửi yêu cầu..." : "Gửi yêu cầu đăng ký"}
        </button>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-4 space-x-2">
          <button
            type="button"
            onClick={handleNavigateHome}
            className="flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition flex-1"
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

        <div className="flex justify-between mt-4 text-sm text-blue-700 font-medium">
          <Link to="/login" className="hover:underline">
            Đã có tài khoản?
          </Link>
          <Link to="/register" className="hover:underline">
            Đăng ký thường
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterAdmin;
