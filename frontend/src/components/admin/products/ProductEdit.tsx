import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Product } from "../../../interfaces/Product";


const API_URL = "http://localhost:5000/api/products";

const ProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await fetch(`${API_URL}/${id}`);
      const data = await res.json();
      setForm({
        name: data.name || "",
        price: data.price || 0,
        description: data.description || "",
        images: data.images || [],
        category: data.category?._id || data.category || "",
        brand: data.brand?._id || data.brand || "",
        stock: data.stock || 0,
        _id: data._id,
      });
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, images: e.target.value ? [e.target.value] : [] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.images.length) {
      setMessage("Vui lòng nhập link ảnh sản phẩm!");
      return;
    }
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setMessage("Cập nhật thành công!");
      setTimeout(() => navigate("/admin"), 1000);
    } else {
      setMessage("Cập nhật thất bại!");
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", background: "#fff", borderRadius: 8, padding: 24, boxShadow: "0 2px 8px #eee" }}>
      <h2 style={{ textAlign: "center" }}>Sửa sản phẩm</h2>
      {message && <div style={{ color: message.includes("thành công") ? "green" : "red", marginBottom: 12 }}>{message}</div>}
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Tên sản phẩm" value={form.name} onChange={handleChange} required style={{ width: "100%", marginBottom: 12, padding: 8 }} />
        <input name="price" type="number" placeholder="Giá" value={form.price} onChange={handleChange} required style={{ width: "100%", marginBottom: 12, padding: 8 }} />
        <textarea name="description" placeholder="Mô tả" value={form.description} onChange={handleChange} required style={{ width: "100%", marginBottom: 12, padding: 8 }} />
        <input name="images" placeholder="Link ảnh (1 link)" value={form.images[0] || ""} onChange={handleImages} required style={{ width: "100%", marginBottom: 12, padding: 8 }} />
        <input name="category" placeholder="ID danh mục" value={form.category} onChange={handleChange} required style={{ width: "100%", marginBottom: 12, padding: 8 }} />
        <input name="brand" placeholder="ID thương hiệu" value={form.brand} onChange={handleChange} required style={{ width: "100%", marginBottom: 12, padding: 8 }} />
        <input name="stock" type="number" placeholder="Tồn kho" value={form.stock} onChange={handleChange} required style={{ width: "100%", marginBottom: 12, padding: 8 }} />
        <button type="submit" style={{ width: "100%", padding: 10, background: "#1890ff", color: "#fff", border: "none", borderRadius: 4 }}>Lưu</button>
      </form>
    </div>
  );
};

export default ProductEdit;