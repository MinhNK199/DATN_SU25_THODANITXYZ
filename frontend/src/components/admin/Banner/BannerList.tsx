import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Banner } from "../../../interfaces/Banner";

const API_URL = "http://localhost:5000/api/banner";

const BannerList: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
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

  const fetchBanners = async () => {
  setLoading(true);
  try {
    const res = await fetch(API_URL, {
      headers: getAuthHeader(),
    });

    if (!res.ok) throw new Error("Lỗi khi tải danh sách banner!");

    const data = await res.json();
    console.log("Dữ liệu từ API:", data); // Gỡ lỗi khi cần

    const banners = Array.isArray(data) ? data : data.banners || [];

    // Sắp xếp theo ngày bắt đầu mới nhất
    const sorted = banners.sort(
      (a: Banner, b: Banner) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    setBanners(sorted);
  } catch (error: any) {
    console.error("Lỗi khi fetch banner:", error);
    setMessage(error.message || "Lỗi khi tải banner!");
    setMessageType("error");
  }
  setLoading(false);
};

  useEffect(() => {
    fetchBanners();
  }, []);

  // Tự động ẩn thông báo
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa banner này?")) {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
      if (res.ok) {
        setMessage("Xóa banner thành công!");
        setMessageType("success");
        fetchBanners();
      } else {
        setMessage("Xóa banner thất bại!");
        setMessageType("error");
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-700 text-center flex-grow">
          Danh sách Banner
        </h1>
        <Link
          to="/admin/banner-add"
          className="px-8 py-3 bg-green-500 text-white text-xl font-semibold rounded-md hover:bg-green-700 transition"
        >
          + Thêm mới
        </Link>
      </div>

      {message && (
        <div
          className={`mb-4 px-4 py-2 rounded-md italic text-center font-medium shadow
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
              <th className="py-3 px-4 border">Tiêu đề</th>
              <th className="py-3 px-4 border">Hình ảnh</th>
              <th className="py-3 px-4 border">Liên kết</th>
              <th className="py-3 px-4 border">Thời gian</th>
              <th className="py-3 px-4 border">Trạng thái</th>
              <th className="py-3 px-4 border">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {banners.map((banner, index) => (
              <tr key={banner._id} className="border-b text-gray-700 hover:bg-gray-100">
                <td className="py-3 px-4 text-center">{index + 1}</td>
                <td className="py-3 px-4 text-center">{banner.title}</td>
                <td className="py-3 px-4 text-center">
                  <img
                    src={banner.image?.url || "/fallback.jpg"}
                    alt={banner.image?.alt || ""}
                    width={90}
                    onError={(e) => {
                      e.currentTarget.src = "/fallback.jpg";
                    }}
                    className="mx-auto rounded-md object-cover"
                  />
                </td>
                <td className="py-3 px-4 text-center">
                  {banner.link ? (
                    <a
                      href={banner.link}
                      className="text-blue-500 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Xem liên kết
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="py-3 px-4 text-center text-sm">
                  {new Date(banner.startDate).toLocaleDateString("vi-VN")} →{" "}
                  {new Date(banner.endDate).toLocaleDateString("vi-VN")}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      banner.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {banner.isActive ? "Hiển thị" : "Ẩn"}
                  </span>
                </td>
                <td className="py-3 px-4 flex gap-2 justify-center">
                  <Link
                    to={`/admin/banner-edit/${banner._id}`}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                  >
                    Sửa
                  </Link>
                  <button
                    onClick={() => handleDelete(banner._id!)}
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

export default BannerList;
