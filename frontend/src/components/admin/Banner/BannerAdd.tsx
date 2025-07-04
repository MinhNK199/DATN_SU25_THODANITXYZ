import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { Banner } from "../../../interfaces/Banner";

const API_URL = "http://localhost:9000/api/banner";

const BannerAdd: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Banner>({
    defaultValues: {
      title: "",
      image: { url: "", alt: "" },
      link: "",
      startDate: new Date(),
      endDate: new Date(),
      isActive: true,
      position: "",
    },
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

  const onSubmit = async (data: Banner) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setMessage("✅ Thêm banner thành công!");
        setTimeout(() => navigate("/admin/banners"), 1000);
      } else {
        const err = await res.json();
        setMessage(`❌ Thêm thất bại: ${err.message || "Lỗi máy chủ"}`);
      }
    } catch (error) {
      setMessage("❌ Lỗi kết nối máy chủ!");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white mt-10 rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        ➕ Thêm banner mới
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tiêu đề
          </label>
          <input
            {...register("title", { required: "Tiêu đề không được để trống" })}
            className="w-full border px-4 py-2 rounded-lg"
            placeholder="Tiêu đề banner"
          />
          {errors.title && (
            <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link liên kết (nếu có)
          </label>
          <input
            {...register("link")}
            className="w-full border px-4 py-2 rounded-lg"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL hình ảnh
          </label>
          <input
            {...register("image.url", { required: "Ảnh không được để trống" })}
            className="w-full border px-4 py-2 rounded-lg"
            placeholder="https://image.url"
          />
          {errors.image?.url && (
            <p className="text-red-600 text-sm mt-1">{errors.image.url.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Văn bản thay thế ảnh (alt)
          </label>
          <input
            {...register("image.alt")}
            className="w-full border px-4 py-2 rounded-lg"
            placeholder="Alt text"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày bắt đầu
            </label>
            <input
              type="date"
              {...register("startDate", { required: "Bắt buộc chọn ngày bắt đầu" })}
              className="w-full border px-4 py-2 rounded-lg"
            />
            {errors.startDate && (
              <p className="text-red-600 text-sm mt-1">{errors.startDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày kết thúc
            </label>
            <input
              type="date"
              {...register("endDate", { required: "Bắt buộc chọn ngày kết thúc" })}
              className="w-full border px-4 py-2 rounded-lg"
            />
            {errors.endDate && (
              <p className="text-red-600 text-sm mt-1">{errors.endDate.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vị trí hiển thị
          </label>
          <input
            {...register("position", { required: "Vị trí không được để trống" })}
            className="w-full border px-4 py-2 rounded-lg"
            placeholder="home, footer, sidebar,..."
          />
          {errors.position && (
            <p className="text-red-600 text-sm mt-1">{errors.position.message}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            {...register("isActive")}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">Kích hoạt banner</label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Thêm banner
        </button>
      </form>
    </div>
  );
};

export default BannerAdd;
