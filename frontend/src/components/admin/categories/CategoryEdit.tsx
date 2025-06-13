import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Category } from "../../../interfaces/Category";

const API_URL = "http://localhost:5000/api/category";

const CategoryEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<Category>({
    name: "",
    description: "",
    image: "",
    isActive: true,
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch(`${API_URL}/${id}`, {
          headers: getAuthHeader(),
        });
        if (res.ok) {
          const data = await res.json();
          setForm(data);
        } else {
          setMessage("❌ Không tìm thấy danh mục!");
        }
      } catch (error) {
        setMessage("❌ Lỗi kết nối máy chủ!");
      }
    };

    fetchCategory();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage("✅ Cập nhật danh mục thành công!");
        setTimeout(() => navigate("/admin/category-list"), 1000);
      } else {
        const err = await res.json();
        setMessage(`❌ Cập nhật thất bại: ${err.message || "Lỗi máy chủ"}`);
      }
    } catch (error) {
      setMessage("❌ Lỗi kết nối máy chủ!");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white mt-10 rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        ✏️ Chỉnh sửa danh mục
      </h2>

      {message && (
        <div
          className={`mb-4 text-sm text-center py-2 px-4 rounded ${
            message.includes("✅")
              ? "text-green-700 bg-green-100"
              : "text-red-700 bg-red-100"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên danh mục
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Nhập tên danh mục"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Nhập mô tả danh mục"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hình ảnh
          </label>
          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Nhập URL hình ảnh"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Kích hoạt danh mục
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Cập nhật danh mục
        </button>
      </form>
    </div>
  );
};

export default CategoryEdit; 