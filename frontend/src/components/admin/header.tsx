import React from "react";
import { useNavigate } from "react-router-dom";

const AdminHeader = () => {
  const navigate = useNavigate();
  return (
    <header className="bg-white w-full shadow-md flex items-center justify-between p-4 relative z-50">
      <div className="logo w-1/5 flex items-center ml-10 ">
        <img src="https://png.pngtree.com/png-clipart/20230801/original/pngtree-laptop-logo-icon-vector-illustration-design-picture-image_7737666.png" className="w-14 shadow-md rounded-full" alt="Logo" />
      </div>

      <div className="right-header w-4/5 flex items-center justify-between gap-x-6">
        <form className="flex-grow">
          <input
            className="border border-gray-300 rounded-md w-[350px] px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            placeholder="🔍 Tìm kiếm..."
          />
        </form>
        <ul className="flex items-center gap-x-4 text-gray-600">
          <li className="font-medium">👤 Admin: Dự án tốt nghiệp</li>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-md"
          onClick={() => navigate("/client")}>
            Trang chủ
          </button>
        </ul>
      </div>
    </header>
  );
};

export default AdminHeader;
