import React from "react";
import toast from "react-hot-toast";
import { FaBox, FaList, FaSignOutAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      localStorage.removeItem("userToken");
      navigate("/");
      toast.success("Quay về trang chủ!");
    }
  };
  const handleList = () => {
    localStorage.removeItem("userToken");
    navigate("/admin/product-list");
  };
  const handleCategories = () => {
    localStorage.removeItem("userToken");
    navigate("/admin/category-list");
  };

  return (
    <div className="w-1/5 h-screen text-white p-6 flex flex-col h-full">
      <h2 className="text-xl font-bold mb-6 text-center text-black">
        Trang ADMIN
      </h2>

      <nav className="flex flex-col gap-4">
        <button
          onClick={handleList}
          className="flex items-center gap-3 px-4 py-3 bg-blue-600 rounded-lg transition-all duration-300 hover:bg-blue-700"
        >
          <FaBox />
          <span>Danh Sách Sản Phẩm</span>
        </button>

        <button
          onClick={handleCategories}
          className="flex items-center gap-3 px-4 py-3 bg-green-600 rounded-lg transition-all duration-300 hover:bg-green-700"
        >
          <FaList />
          <span>Danh Sách Danh Mục</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 bg-red-600 rounded-lg transition-all duration-300 hover:bg-red-700"
        >
          <FaSignOutAlt />
          <span>Đăng Xuất</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminSidebar;
