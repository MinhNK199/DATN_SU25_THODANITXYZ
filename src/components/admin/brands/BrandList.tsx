import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Brand } from "../../../interfaces/Brand";

const API_URL = "http://localhost:5000/api/brand";

const BrandList: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [newBrand, setNewBrand] = useState<Partial<Brand>>({
    name: "",
    description: "",
    logo: "",
    isActive: true,
  });
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        headers: getAuthHeader(),
      });
      if (!res.ok) {
        throw new Error("Failed to fetch brands");
      }
      const data = await res.json();
      // Ensure data is an array
      setBrands(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching brands:", error);
      setMessage("Lỗi khi tải thương hiệu!");
      setMessageType("error");
      setBrands([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa thương hiệu này?")) {
      try {
        const res = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
          headers: getAuthHeader(),
        });
        if (res.ok) {
          setMessage("Xóa thành công!");
          setMessageType("success");
          fetchBrands();
        } else {
          throw new Error("Failed to delete brand");
        }
      } catch (error) {
        console.error("Error deleting brand:", error);
        setMessage("Xóa thất bại!");
        setMessageType("error");
      }
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Format data to match API requirements
      const brandData = {
        name: newBrand.name,
        description: newBrand.description || "",
        logo: newBrand.logo,
        isActive: newBrand.isActive,
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify(brandData),
      });

      if (res.ok) {
        setMessage("Thêm thương hiệu thành công!");
        setMessageType("success");
        setIsAdding(false);
        setNewBrand({
          name: "",
          description: "",
          logo: "",
          isActive: true,
        });
        fetchBrands();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add brand");
      }
    } catch (error) {
      console.error("Error adding brand:", error);
      setMessage(error instanceof Error ? error.message : "Thêm thương hiệu thất bại!");
      setMessageType("error");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand?._id) return;

    try {
      const res = await fetch(`${API_URL}/${editingBrand._id}`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify(editingBrand),
      });
      if (res.ok) {
        setMessage("Cập nhật thương hiệu thành công!");
        setMessageType("success");
        setEditingBrand(null);
        fetchBrands();
      } else {
        throw new Error("Failed to update brand");
      }
    } catch (error) {
      console.error("Error updating brand:", error);
      setMessage("Cập nhật thương hiệu thất bại!");
      setMessageType("error");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-700 text-center flex-grow">
          Danh sách Thương hiệu
        </h1>
        <button
          onClick={() => setIsAdding(true)}
          className="px-8 py-3 bg-green-400 text-white text-xl font-semibold rounded-md hover:bg-green-600 transition"
        >
          + Thêm mới
        </button>
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

      {isAdding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Thêm thương hiệu mới</h2>
            <form onSubmit={handleAdd}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Tên thương hiệu
                </label>
                <input
                  type="text"
                  value={newBrand.name}
                  onChange={(e) =>
                    setNewBrand({ ...newBrand, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Mô tả
                </label>
                <textarea
                  value={newBrand.description}
                  onChange={(e) =>
                    setNewBrand({ ...newBrand, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Link logo
                </label>
                <input
                  type="url"
                  value={newBrand.logo}
                  onChange={(e) =>
                    setNewBrand({ ...newBrand, logo: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newBrand.isActive}
                    onChange={(e) =>
                      setNewBrand({ ...newBrand, isActive: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span className="text-gray-700 text-sm font-bold">
                    Hiển thị thương hiệu
                  </span>
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  {newBrand.isActive
                    ? "Thương hiệu sẽ được hiển thị cho khách hàng"
                    : "Thương hiệu sẽ bị ẩn khỏi giao diện khách hàng"}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingBrand && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Sửa thương hiệu</h2>
            <form onSubmit={handleEdit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Tên thương hiệu
                </label>
                <input
                  type="text"
                  value={editingBrand.name}
                  onChange={(e) =>
                    setEditingBrand({ ...editingBrand, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Mô tả
                </label>
                <textarea
                  value={editingBrand.description}
                  onChange={(e) =>
                    setEditingBrand({
                      ...editingBrand,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Link logo
                </label>
                <input
                  type="url"
                  value={editingBrand.logo}
                  onChange={(e) =>
                    setEditingBrand({ ...editingBrand, logo: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingBrand.isActive}
                    onChange={(e) =>
                      setEditingBrand({
                        ...editingBrand,
                        isActive: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-gray-700 text-sm font-bold">
                    Hiển thị thương hiệu
                  </span>
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  {editingBrand.isActive
                    ? "Thương hiệu sẽ được hiển thị cho khách hàng"
                    : "Thương hiệu sẽ bị ẩn khỏi giao diện khách hàng"}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBrand(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-20 text-gray-600 text-lg">
          Đang tải...
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          Không có thương hiệu nào
        </div>
      ) : (
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="py-3 px-4 border">STT</th>
              <th className="py-3 px-4 border">Logo</th>
              <th className="py-3 px-4 border">Tên thương hiệu</th>
              <th className="py-3 px-4 border">Mô tả</th>
              <th className="py-3 px-4 border">Trạng thái</th>
              <th className="py-3 px-4 border">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand, index) => (
              <tr
                key={brand._id}
                className={`border-b text-gray-700 hover:bg-gray-100 ${
                  !brand.isActive ? "bg-gray-50" : ""
                }`}
              >
                <td className="py-3 px-4 text-center">{index + 1}</td>
                <td className="py-3 px-4 text-center">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-10 w-10 object-contain mx-auto"
                  />
                </td>
                <td className="py-3 px-4 text-center">{brand.name}</td>
                <td className="py-3 px-4 text-center">{brand.description || "-"}</td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      brand.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {brand.isActive ? "Đang hiển thị" : "Đang ẩn"}
                  </span>
                </td>
                <td className="py-3 px-4 flex gap-2 justify-center">
                  <button
                    onClick={() => setEditingBrand(brand)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(brand._id!)}
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

export default BrandList; 