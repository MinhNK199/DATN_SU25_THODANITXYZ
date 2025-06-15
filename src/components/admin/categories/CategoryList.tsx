import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Category } from "../../../interfaces/Category";

const API_URL = "http://localhost:5000/api/category";

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        headers: getAuthHeader(),
      });
      const data = await res.json();
      setCategories(data || []);
    } catch (error) {
      setMessage("Lỗi khi tải danh mục!");
      setMessageType("error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa danh mục này?")) {
      const res = await fetch(`${API_URL}/${id}`, { 
        method: "DELETE",
        headers: getAuthHeader(),
      });
      if (res.ok) {
        setMessage("Xóa thành công!");
        setMessageType("success");
        fetchCategories();
      } else {
        setMessage("Xóa thất bại!");
        setMessageType("error");
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-700 text-center flex-grow">
          Danh sách Danh mục
        </h1>
        <Link
          to="/admin/category-add"
          className="px-8 py-3 bg-green-400 text-white text-xl font-semibold rounded-md hover:bg-green-600 transition"
        >
          + Thêm mới
        </Link>
      </div>

      {message && (
        <div
          className={`mb-4 px-4 py-2 rounded-md italic text-center shadow-md font-medium
      ${
        messageType === "success"
          ? "text-green-700 bg-green-100"
          : "text-red-700 bg-red-100"
      }`}
        >
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-20 text-gray-600 text-lg">
          Đang tải...
        </div>
      ) : (
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="py-3 px-4 border">STT</th>
              <th className="py-3 px-4 border">Tên danh mục</th>
              <th className="py-3 px-4 border">Mô tả</th>
              <th className="py-3 px-4 border">Hình ảnh</th>
              <th className="py-3 px-4 border">Trạng thái</th>
              <th className="py-3 px-4 border">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => (
              <tr
                key={category._id}
                className="border-b text-gray-700 hover:bg-gray-100"
              >
                <td className="py-3 px-4 text-center">{index + 1}</td>
                <td className="py-3 px-4 text-center">{category.name}</td>
                <td className="py-3 px-4 text-center">{category.description || "-"}</td>
                <td className="py-3 px-4 text-center align-middle">
                <img src={category.image} alt=" " width={90} className="mx-auto object-cover rounded-md"/></td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      category.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {category.isActive ? "Hoạt động" : "Ẩn"}
                  </span>
                </td>
                <td className="py-3 px-4 flex gap-2 justify-center">
                  <Link
                    to={`/admin/category-edit/${category._id}`}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                  >
                    Sửa
                  </Link>
                  <button
                    onClick={() => handleDelete(category._id!)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CategoryList; 