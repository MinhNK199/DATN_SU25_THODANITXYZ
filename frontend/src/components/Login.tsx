import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form
      );
      setSuccess(res.data.message || "Đăng nhập thành công!");
      localStorage.setItem("token", res.data.token);

      const user = res.data.user;
      // Sau khi gọi API đăng nhập thành công
      localStorage.setItem("user", JSON.stringify(res.data.user));


      const role = user?.role;
      setTimeout(() => {
        if (role === "admin" || role === "superadmin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, );
    } catch (err: any) {
      setError(
        err.response?.data?.details?.join(", ") ||
          err.response?.data?.message ||
          "Đăng nhập thất bại!"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-300 to-yellow-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Chào mừng bạn !
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
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-1">Password</label>
          <div className="flex items-center border rounded px-3 py-2">
            <FaLock className="text-gray-400 mr-2" />
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Nhập mật khẩu của bạn"
              className="w-full outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition"
        >
          Đăng nhập
        </button>

        <div className="flex justify-between mt-4 text-sm text-blue-700 font-medium">
          <Link to="/register" className="hover:underline">
            Bạn chưa có tài khoản?
          </Link>
        </div>
      </form>
    </div>
  );
}
