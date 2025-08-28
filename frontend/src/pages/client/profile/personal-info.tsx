import React, { useState, useEffect } from "react";
import { Camera, Save } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../../api/axiosInstance";

interface User {
  _id: string;
  email: string;
  name: string;
  phone: string;
  gender?: string;
  dateOfBirth?: string;
  avatar?: string;
  role: string;
}

const PersonalInfo = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  // ✅ API URL cố định
  const API_URL = "http://localhost:8000";

  // Hàm chuẩn hóa avatar thành full URL
  const formatAvatarUrl = (avatarPath?: string) => {
    if (!avatarPath) return undefined;

    // Fix trường hợp backend trả về "undefined/...."
    avatarPath = avatarPath.replace(/^undefined\//, "");

    if (avatarPath.startsWith("http")) return avatarPath;
    return `${API_URL}/${avatarPath.replace(/^\//, "")}`;
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const userData = JSON.parse(savedUser);

          userData.avatar = formatAvatarUrl(userData.avatar);

          setUser(userData);
          setFormData({
            name: userData.name || "",
            phone: userData.phone || "",
            email: userData.email || "",
          });
        } else {
          const response = await axiosInstance.get("/auth/me");
          if (response.data) {
            const userData = response.data.user || response.data;

            userData.avatar = formatAvatarUrl(userData.avatar);

            setUser(userData);
            setFormData({
              name: userData.name || "",
              phone: userData.phone || "",
              email: userData.email || "",
            });

            localStorage.setItem("user", JSON.stringify(userData));
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        toast.error("Không thể tải thông tin người dùng");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [API_URL]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.put(`/auth/users/${user?._id}`, {
        name: formData.name,
        phone: formData.phone,
      });

      if (response.data) {
        const updatedUser: User = {
          ...user!,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
        };

        updatedUser.avatar = formatAvatarUrl(updatedUser.avatar);

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setIsEditing(false);
        toast.success("Cập nhật thông tin thành công!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("avatar", file);

    try {
      const response = await axiosInstance.post(
        "/auth/upload-avatar",
        formDataUpload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data?.avatar) {
        const avatarUrl = formatAvatarUrl(response.data.avatar);
        const updatedUser = { ...user!, avatar: avatarUrl };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast.success("Cập nhật ảnh đại diện thành công!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi upload ảnh");
    }
  };

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Đang tải thông tin...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
        <p className="text-gray-600 mt-1">
          Quản lý thông tin tài khoản của bạn
        </p>
      </div>

      {/* Banner + Avatar */}
      <div className="flex flex-col items-center mb-16 rounded-lg">
        <div className="w-full h-40 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 relative flex justify-center">
          <div className="absolute -bottom-12">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center rounded-full bg-gray-300 text-gray-700 border-4 border-white shadow-lg text-sm font-semibold">
                No Avatar
              </div>
            )}

            {/* Nút upload ảnh */}
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg cursor-pointer">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Vai trò */}
        <div className="mt-16">
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
            {user?.role === "admin" ? "Quản trị viên" : "Khách hàng"}
          </span>
        </div>
      </div>

      {/* Thông tin chi tiết */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Thông tin chi tiết
          </h2>
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isEditing ? "Lưu thay đổi" : "Chỉnh sửa"}</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Họ và tên
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 text-lg"
              placeholder="Nhập họ và tên"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled={true}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-lg"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Số điện thoại
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 text-lg"
              placeholder="Nhập số điện thoại"
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: user?.name || "",
                  phone: user?.phone || "",
                  email: user?.email || "",
                });
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfo;
