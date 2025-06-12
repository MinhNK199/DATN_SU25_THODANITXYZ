import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "../../../interfaces/Product";

const API_URL = "http://localhost:5000/api/products";

const ProductAdd: React.FC = () => {
  const [form, setForm] = useState<Product>({
    name: "",
    price: 0,
    description: "",
    images: [],
    category: "",
    brand: "",
    stock: 0,
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, images: e.target.value ? [e.target.value] : [] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.images.length) {
      setMessage("❌ Vui lòng nhập link ảnh sản phẩm!");
      return;
    }
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setMessage("✅ Thêm sản phẩm thành công!");
      setTimeout(() => navigate("/admin"), 1000);
    } else {
      const err = await res.json();
      setMessage(`❌ Thêm thất bại: ${err.message || "Lỗi máy chủ"}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white mt-10 rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        ➕ Thêm sản phẩm
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
        <input
          name="name"
          placeholder="Tên sản phẩm"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          name="price"
          type="number"
          placeholder="Giá"
          value={form.price}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
        />
        <textarea
          name="description"
          placeholder="Mô tả"
          value={form.description}
          onChange={handleChange}
          required
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
        />
        <input
          name="images"
          placeholder="Link ảnh (1 link)"
          value={form.images[0] || ""}
          onChange={handleImages}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
        />
        <input
          name="category"
          placeholder="ID danh mục"
          value={form.category}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
        />
        <input
          name="brand"
          placeholder="ID thương hiệu"
          value={form.brand}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
        />
        <input
          name="stock"
          type="number"
          placeholder="Tồn kho"
          value={form.stock}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Thêm sản phẩm
        </button>
      </form>
    </div>
  );
};

export default ProductAdd;
