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
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      setMessage("Lỗi khi tải sản phẩm!");
    }
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
    <div className="w-full mt-10 bg-white shadow-md rounded-lg p-6 mx-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Quản lý sản phẩm
        </h2>
        <Link
          to="/admin/product/add"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          + Thêm sản phẩm
        </Link>
      </div>

      {message && (
        <div className="mb-4 text-green-600 font-medium">{message}</div>
      )}

      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 border">Tên</th>
                <th className="px-4 py-2 border">Giá</th>
                <th className="px-4 py-2 border">Tồn kho</th>
                <th className="px-4 py-2 border">Danh mục</th>
                <th className="px-4 py-2 border">Thương hiệu</th>
                <th className="px-4 py-2 border">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{p.name}</td>
                  <td className="px-4 py-2 border">
                    {p.price.toLocaleString()}₫
                  </td>
                  <td className="px-4 py-2 border">{p.stock}</td>
                  <td className="px-4 py-2 border">
                    {(p as any).category?.name || p.category}
                  </td>
                  <td className="px-4 py-2 border">
                    {(p as any).brand?.name || p.brand}
                  </td>
                  <td className="px-4 py-2 border space-x-2">
                    <Link
                      to={`/admin/product/edit/${p._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(p._id!)}
                      className="text-red-600 hover:underline"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductList;
