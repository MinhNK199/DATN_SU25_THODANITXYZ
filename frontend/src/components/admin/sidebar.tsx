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
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Đăng xuất thành công!");
    navigate("/");
  };

  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4">
      <div className="text-2xl font-bold mb-8 text-center">Admin Panel</div>

      <div className="space-y-2">
        <button
          onClick={() => navigate("/admin/product-list")}
          className="flex items-center gap-4 px-5 py-4 text-lg border-b border-gray-500 hover:bg-gray-500 hover:text-white transition"
        >
          <FaBox className="text-xl" />
          <span>Sản phẩm</span>
        </button>

        <button
          onClick={() => navigate("/admin/category-list")}
          className="flex items-center gap-4 px-5 py-4 text-lg border-b border-gray-500 hover:bg-gray-500 hover:text-white transition"
        >
          <FaList className="text-xl" />
          <span>Danh mục</span>
        </button>

        <button
          onClick={() => navigate("/admin/banner-list")}
          className="flex items-center gap-4 px-5 py-4 text-lg border-b border-gray-500 hover:bg-gray-500 hover:text-white transition"
        >
          <FaImage className="text-xl" />
          <span>Banner</span>
        </button>

        <button
          onClick={() => navigate("/admin/user-list")}
          className="flex items-center gap-4 px-5 py-4 text-lg border-b border-gray-500 hover:bg-gray-500 hover:text-white transition"
        >
          <FaUser className="text-xl" />
          <span>Người dùng</span>
        </button>

        <button
          onClick={() => navigate("/admin/bill-list")}
          className="flex items-center gap-4 px-5 py-4 text-lg border-b border-gray-500 hover:bg-gray-500 hover:text-white transition"
        >
          <FaFileInvoiceDollar className="text-xl" />
          <span>Hóa đơn</span>
        </button>

        <button
          onClick={() => navigate("/admin/brand")}
          className="flex items-center gap-4 px-5 py-4 text-lg border-b border-gray-500 hover:bg-gray-500 hover:text-white transition"
        >
          <FaTrademark className="text-xl" />
          <span>Thương hiệu</span>
        </button>
        <button
          onClick={() => navigate("/admin/rating-list")}
          className="flex items-center gap-4 px-5 py-4 text-lg border-b border-gray-500 hover:bg-gray-500 hover:text-white transition"
        >
          <FaTrademark className="text-xl" />
          <span>Đánh giá</span>
        </button>
        {/* Chỉ hiển thị nếu là admin hoặc superadmin */}
        {( user?.role === "superadmin") && (
          <button
            onClick={() => navigate("/admin/activity-list")}
            className="flex items-center gap-4 px-5 py-4 text-lg border-b border-gray-500 hover:bg-gray-500 hover:text-white transition"
          >
            <FaHistory className="text-xl" />
            <span>Nhật Ký</span>
          </button>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-5 py-4 text-lg border-b border-gray-500 hover:bg-gray-500 hover:text-white transition"
        >
          <FaSignOutAlt className="text-xl" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
