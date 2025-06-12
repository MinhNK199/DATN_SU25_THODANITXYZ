import React from "react";
import toast from "react-hot-toast";
import { FaBox, FaList, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      localStorage.removeItem("userToken");
      navigate("/");
      toast.success("Đăng xuất thành công!");
    }
  };

  return (
    <aside className="w-80 h-screen bg-gray-800 text-white flex flex-col p-6">
      <h2 className="text-2xl font-semibold mb-10 text-center">Quản Trị</h2>

      <nav className="flex flex-col gap-0">
        <button
          onClick={() => navigate("/admin/product-list")}
          className="flex items-center gap-4 px-5 py-4 text-lg border-b border-gray-500 hover:bg-gray-500 transition"
        >
          <FaBox className="text-xl" />
          <span>Sản phẩm</span>
        </button>

        <button
          onClick={() => navigate("/admin/category-list")}
          className="flex items-center gap-4 px-5 py-4 text-lg border-b border-gray-500 hover:bg-gray-500 transition"
        >
          <FaList className="text-xl" />
          <span>Danh mục</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-5 py-4 text-lg border-b border-gray-500 hover:bg-gray-500 transition mt-auto"
        >
          <FaSignOutAlt className="text-xl" />
          <span>Đăng xuất</span>
        </button>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
