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
     <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-700 text-center flex-grow">
          Danh sách Sản phẩm
        </h1>
        <Link
          to="/admin/product-add"
          className="px-8 py-3 bg-green-400 text-white text-xl text-gray-400 font-semibold rounded-md hover:bg-green-600 transition"
        >
          + Thêm mới
        </Link>
      </div>

      {message && (
        <div className="mb-4 text-green-600 font-medium text-center">{message}</div>
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
              <th className="py-3 px-4 border">Tên sản phẩm</th>
              <th className="py-3 px-4 border">Giá</th>
              <th className="py-3 px-4 border">Tồn kho</th>
              <th className="py-3 px-4 border">Danh mục</th>
              <th className="py-3 px-4 border">Thương hiệu</th>
              <th className="py-3 px-4 border">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, index) => (
              <tr
                key={p._id}
                className="border-b text-gray-700 hover:bg-gray-100"
              >
                <td className="py-3 px-4 text-center">{index + 1}</td>
                <td className="py-3 px-4 text-center">{p.name}</td>
                <td className="py-3 px-4 text-center text-green-600 font-semibold">
                  {p.price.toLocaleString()}₫
                </td>
                <td className="py-3 px-4 text-center">{p.stock}</td>
                <td className="py-3 px-4 text-center">
                  {(p as any).category?.name || p.category}
                </td>
                <td className="py-3 px-4 text-center">
                  {(p as any).brand?.name || p.brand}
                </td>
                <td className="py-3 px-4 flex gap-2 justify-center">
                  <Link
                    to={`/admin/product-edit/${p._id}`}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                  >
                    Sửa
                  </Link>
                  <button
                    onClick={() => handleDelete(p._id!)}
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

export default ProductList;
