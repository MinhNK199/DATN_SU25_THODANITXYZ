import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import type { Banner } from "../../../interfaces/Banner";

const API_URL = "http://localhost:8000/api/banner";

const formatDateInput = (dateStr?: string | Date | null): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const offset = date.getTimezoneOffset();
  date.setMinutes(date.getMinutes() - offset);
  return date.toISOString().split("T")[0];
};

const BannerEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<Banner>({
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      badge: "",
      buttonText: "",
      buttonLink: "",
      features: [""],
      image: " ",
      isActive: true,
      position: "",
      startDate: "",
      endDate: "",
    },
  });

  const { fields, append, remove } = useFieldArray<any>({
    control,
    name: "features",
  });

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch(`${API_URL}/${id}`, {
          headers: getAuthHeader(),
        });
        if (res.ok) {
          const data = await res.json();
          const banner: Banner = data.banner || data;
          reset({
            ...banner,
            startDate: formatDateInput(banner.startDate),
            endDate: formatDateInput(banner.endDate),

            image: banner.image || "",

            features: banner.features?.length ? banner.features : [""],
          });
        } else {
          setMessage("❌ Không tìm thấy banner!");
        }
      } catch {
        setMessage("❌ Lỗi kết nối máy chủ!");
      }
    };
    if (id) fetchBanner();
  }, [id, reset]);

  const onSubmit = async (data: Banner) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setMessage("✅ Cập nhật banner thành công!");
        setTimeout(() => navigate("/admin/banners"), 1000);
      } else {
        const err = await res.json();
        setMessage(`❌ Cập nhật thất bại: ${err.message || "Lỗi máy chủ"}`);
      }
    } catch {
      setMessage("❌ Lỗi kết nối máy chủ!");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white mt-10 rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        ✏️ Chỉnh sửa banner
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
          <label className="block text-sm font-medium">Tiêu đề</label>
          <input
            {...register("title", { required: "Tiêu đề không được để trống" })}
            className="w-full border px-4 py-2 rounded"
          />
          {errors.title && (
            <p className="text-red-600 text-sm">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Phụ đề</label>
          <input
            {...register("subtitle")}
            className="w-full border px-4 py-2 rounded"
          />
        </div>
        <textarea
          {...register("description", {
            required: "Mô tả không được để trống",
            validate: (value) => {
              if (!value) return "Mô tả không được để trống";
              return (
                value.trim().length <= 50 ||
                "Mô tả không được vượt quá 50 ký tự"
              );
            },
          })}
          className="w-full border px-4 py-2 rounded"
        />
        {errors.description && (
          <p className="text-red-600 text-sm">{errors.description.message}</p>
        )}
        <div>
          <label className="block text-sm font-medium">Nhãn Badge</label>
          <input
            {...register("badge", { required: "Badge không được để trống" })}
            className="w-full border px-4 py-2 rounded"
          />
          {errors.badge && (
            <p className="text-red-600 text-sm">{errors.badge.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Nút link</label>
          <input
            {...register("buttonText", {
              required: "Nội dung nút link không được để trống",
            })}
            className="w-full border px-4 py-2 rounded"
          />
          {errors.buttonText && (
            <p className="text-red-600 text-sm">{errors.buttonText.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Link liên kết</label>
          <input
            {...register("buttonLink", {
              required: "Link liên kết không được để trống",
            })}
            className="w-full border px-4 py-2 rounded"
          />
          {errors.buttonLink && (
            <p className="text-red-600 text-sm">{errors.buttonLink.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Tính năng nổi bật</label>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <input
                {...register(`features.${index}` as const, {
                  required: "Không được để trống",
                })}
                className="w-full border px-4 py-2 rounded"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-500"
              >
                X
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append("")}
            className="text-blue-600 text-sm underline"
          >
            + Thêm tính năng
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium">Ảnh</label>
          <input
            {...register("image", {
              required: "Ảnh không được để trống",
            })}
            className="w-full border px-4 py-2 rounded"
          />
          {errors.image && (
            <p className="text-red-600 text-sm">{errors.image.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Vị trí hiển thị</label>
          <input
            {...register("position", {
              required: "Vị trí không được để trống",
            })}
            className="w-full border px-4 py-2 rounded"
          />
          {errors.position && (
            <p className="text-red-600 text-sm">{errors.position.message}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            {...register("isActive")}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm">Kích hoạt banner</label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
        >
          Cập nhật banner
        </button>
      </form>
    </div>
  );
};

export default BannerEdit;
