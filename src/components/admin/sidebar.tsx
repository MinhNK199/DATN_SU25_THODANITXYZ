import React from "react";
import toast from "react-hot-toast";
import {
  FaBox,
  FaList,
  FaSignOutAlt,
  FaUser,
  FaFileInvoiceDollar,
  FaTrademark,
  FaImage,
  FaHistory,
  FaStar,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user"); // Xoá thông tin người dùng
  toast.success("Đăng xuất thành công!");
  navigate("/");
};


  const navItem = (label: string, icon: JSX.Element, path: string) => {
    const isActive = location.pathname.includes(path);
    return (
      <button
        onClick={() => navigate(path)}
        className={`flex items-center gap-4 w-full px-4 py-3 text-base rounded-xl transition
          ${
            isActive
              ? "bg-blue-50 text-blue-600 font-semibold"
              : "text-gray-600 hover:bg-gray-100"
          }`}
      >
        <span className="text-lg">{icon}</span>
        {label}
      </button>
    );
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 p-5">
      <div className="text-center text-3xl font-extrabold tracking-wide mb-8 uppercase text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 filter drop-shadow-[4px_4px_6px_rgba(0,0,0,0.5)]">
        TECHTREND
      </div>

      <div className="space-y-2 text-[17px] font-medium text-gray-800">
        <button
          onClick={() => navigate("/admin/products")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition 
          ${
            location.pathname.includes("/admin/products")
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
              : "hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white"
          }`}
        >
          <FaBox className="text-[20px]" />
          Sản phẩm
        </button>

        <button
          onClick={() => navigate("/admin/categories")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition 
          ${
            location.pathname.includes("/admin/categories")
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
              : "hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white"
          }`}
        >
          <FaList className="text-[20px]" />
          Danh mục
        </button>

        <button
          onClick={() => navigate("/admin/banners")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition 
          ${
            location.pathname.includes("/admin/banners")
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
              : "hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white"
          }`}
        >
          <FaImage className="text-[20px]" />
          Banner
        </button>

        <button
          onClick={() => navigate("/admin/users")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition 
          ${
            location.pathname.includes("/admin/users")
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
              : "hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white"
          }`}
        >
          <FaUser className="text-[20px]" />
          Người dùng
        </button>

        <button
          onClick={() => navigate("/admin/bills")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition 
          ${
            location.pathname.includes("/admin/bills")
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
              : "hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white"
          }`}
        >
          <FaFileInvoiceDollar className="text-[20px]" />
          Hóa đơn
        </button>

        <button
          onClick={() => navigate("/admin/brands")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition 
          ${
            location.pathname.includes("/admin/brands")
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
              : "hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white"
          }`}
        >
          <FaTrademark className="text-[20px]" />
          Thương hiệu
        </button>

        <button
          onClick={() => navigate("/admin/ratings")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition 
          ${
            location.pathname.includes("/admin/ratings")
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
              : "hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white"
          }`}
        >
          <FaStar className="text-[20px]" />
          Đánh giá
        </button>

        {user?.role === "superadmin" && (
          <button
            onClick={() => navigate("/admin/activities")}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition 
            ${
              location.pathname.includes("/admin/activities")
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                : "hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white"
            }`}
          >
            <FaHistory className="text-[20px]" />
            Nhật Ký
          </button>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 transition hover:text-white hover:bg-gradient-to-r hover:from-purple-400 hover:to-red-500"
        >
          <FaSignOutAlt className="text-[20px]" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
