import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../../../interfaces/Product";

const API_URL = "http://localhost:5000/api/products";

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    const res = await fetch(API_URL);
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage("Xóa thành công!");
        fetchProducts();
      } else {
        setMessage("Xóa thất bại!");
      }
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", background: "#fff", borderRadius: 8, padding: 24, boxShadow: "0 2px 8px #eee" }}>
      <h2 style={{ textAlign: "center" }}>Quản lý sản phẩm</h2>
      <div style={{ marginBottom: 16, textAlign: "right" }}>
        <Link to="/admin/product/add" style={{ padding: "8px 16px", background: "#1890ff", color: "#fff", borderRadius: 4, textDecoration: "none" }}>+ Thêm sản phẩm</Link>
      </div>
      {message && <div style={{ color: "green", marginBottom: 12 }}>{message}</div>}
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f5f5f5" }}>
            <tr>
              <th style={{ padding: 8, border: "1px solid #eee" }}>Tên</th>
              <th style={{ padding: 8, border: "1px solid #eee" }}>Giá</th>
              <th style={{ padding: 8, border: "1px solid #eee" }}>Tồn kho</th>
              <th style={{ padding: 8, border: "1px solid #eee" }}>Danh mục</th>
              <th style={{ padding: 8, border: "1px solid #eee" }}>Thương hiệu</th>
              <th style={{ padding: 8, border: "1px solid #eee" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td style={{ padding: 8, border: "1px solid #eee" }}>{p.name}</td>
                <td style={{ padding: 8, border: "1px solid #eee" }}>{p.price.toLocaleString()}₫</td>
                <td style={{ padding: 8, border: "1px solid #eee" }}>{p.stock}</td>
                <td style={{ padding: 8, border: "1px solid #eee" }}>{(p as any).category?.name || p.category}</td>
                <td style={{ padding: 8, border: "1px solid #eee" }}>{(p as any).brand?.name || p.brand}</td>
                <td style={{ padding: 8, border: "1px solid #eee" }}>
                  <Link to={`/admin/product/edit/${p._id}`} style={{ marginRight: 8, color: "#1890ff" }}>Sửa</Link>
                  <button onClick={() => handleDelete(p._id!)} style={{ color: "#f5222d", border: "none", background: "none", cursor: "pointer" }}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductList;