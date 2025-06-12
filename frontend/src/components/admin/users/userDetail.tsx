import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { Card, Spin, Tag } from 'antd'
import { User } from '../../../interfaces/User'
import { FaArrowLeft } from 'react-icons/fa'

const API_URL = 'http://localhost:5000/api/auth/users';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Lỗi khi tải user');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const borderByRole = (role: string) => {
    switch (role) {
      case 'customer': return 'border-blue-500';
      case 'staff': return 'border-teal-500';
      case 'admin': return 'border-orange-400';
      case 'superadmin': return 'border-red-500';
      default: return 'border-gray-300';
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!user) return <div className="p-6">Không tìm thấy người dùng</div>;

  return (
  <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
    <button
      onClick={() => nav(-1)}
      className="flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-800"
    >
      <FaArrowLeft /> Quay lại
    </button>

    {/* Avatar + Tên + Vai trò */}
    <div className="flex flex-col items-center mb-6">
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-32 h-32 rounded-full object-cover mb-4"
        />
      ) : (
        <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <span className="text-gray-500 text-xl">No Avatar</span>
        </div>
      )}
      <h2 className="text-2xl font-bold">{user.name}</h2>
      <span
        className={`mt-2 px-3 py-1 rounded-full border ${borderByRole(
          user.role
        )} font-semibold`}
      >
        {user.role.toUpperCase()}
      </span>
    </div>

    {/* Grid 2 cột */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Cột trái */}
      <div className="space-y-4">
        <p className="text-gray-700">
          <span className="font-medium text-blue-600">Email:</span>{" "}
          {user.email || <span className="text-red-400">chưa cập nhật</span>}
        </p>
        <p className="text-gray-700">
          <span className="font-medium text-blue-600">Số điện thoại:</span>{" "}
          {user.phone || <span className="text-red-400">chưa cập nhật</span>}
        </p>
        <div>
          <p className="font-medium text-blue-600 mb-1">Địa chỉ:</p>
          {user.addresses && user.addresses.length > 0 ? (
            <ul className="space-y-2">
              {user.addresses.map((addr, idx) => (
                <li
                  key={idx}
                  className={`p-2 rounded border ${
                    addr.isDefault ? "border-blue-500" : "border-gray-300"
                  }`}
                >
                  <p className="text-gray-700">
                    <span className="font-medium text-blue-600">Đường:</span>{" "}
                    {addr.street || <span className="text-red-400">chưa cập nhật</span>}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium text-blue-600">Thành phố:</span>{" "}
                    {addr.city || <span className="text-red-400">chưa cập nhật</span>}
                  </p>
                  {addr.isDefault && (
                    <span className="text-sm text-blue-600 font-semibold">
                      (Mặc định)
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-red-400">chưa cập nhật</p>
          )}
        </div>
      </div>

      {/* Cột phải */}
      <div className="space-y-4">
        <p className="text-gray-700">
          <span className="font-medium text-blue-600">Trạng thái:</span>{" "}
          <span
            className={
              user.active ? "text-green-600 font-semibold" : "text-red-600 font-semibold"
            }
          >
            {user.active ? "Hoạt động" : "Đã khóa"}
          </span>
        </p>
        <p className="text-gray-700">
          <span className="font-medium text-blue-600">Ngày tạo:</span>{" "}
          {user.createdAt ? (
            new Date(user.createdAt).toLocaleDateString("vi-VN")
          ) : (
            <span className="text-red-400">chưa cập nhật</span>
          )}
        </p>

        <button
          className="mt-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
          onClick={() => nav(`/admin/user-edit/${user._id}`)}
        >
          Sửa thông tin
        </button>
      </div>
    </div>
  </div>
);

};

export default UserDetail;