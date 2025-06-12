import React, { useEffect, useState } from "react";
import type { User } from "../../../interfaces/User";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye } from "react-icons/fa";

const API_URL = "http://localhost:5000/api/auth/users";

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [message, setMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Lấy user hiện tại
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setCurrentUser(res.data.user);
      } catch {
        setCurrentUser(null);
      }
    };
    fetchCurrentUser();
  }, []);

  // Lấy danh sách user
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setMessage("Lỗi khi tải người dùng!");
      setMessageType("error");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser) fetchUsers();
  }, [currentUser]);

  // Toggle active status
  const handleToggleActive = async (id?: string, active?: boolean) => {
    if (!id) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active: !active }),
      });
      if (res.ok) {
        setMessage("Cập nhật trạng thái thành công!");
        setMessageType("success");
        fetchUsers();
      } else {
        setMessage("Cập nhật trạng thái thất bại!");
        setMessageType("error");
      }
    } catch {
      setMessage("Cập nhật trạng thái thất bại!");
      setMessageType("error");
    }
  };

  // Chỉ admin/superadmin mới được thao tác
  const canToggle =
    currentUser &&
    (currentUser.role === "admin" || currentUser.role === "superadmin");

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-700 text-center mb-4">
        Danh sách Người dùng
      </h1>
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

      {loading ? (
        <div className="flex justify-center items-center h-20 text-gray-600 text-lg">
          Đang tải...
        </div>
      ) : (
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="py-3 px-4 border">STT</th>
              <th className="py-3 px-4 border">Tên</th>
              <th className="py-3 px-4 border">Email</th>
              <th className="py-3 px-4 border">Vai trò</th>
              <th className="py-3 px-4 border">Trạng thái</th>
              <th className="py-3 px-4 border">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, index) => (
              <tr
                key={u._id}
                className="border-b text-gray-700 hover:bg-gray-100"
              >
                <td className="py-3 px-4 text-center">{index + 1}</td>
                <td className="py-3 px-4 text-center">{u.name}</td>
                <td className="py-3 px-4 text-center">{u.email}</td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`px-2 py-1 rounded-md font-semibold border
      ${
        u.role === "customer"
          ? "border-blue-500 text-blue-600 bg-blue-50"
          : u.role === "admin"
          ? "border-orange-400 text-orange-500 bg-orange-50"
          : "border-red-500 text-red-600 bg-red-50"
      }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  {u.active ? (
                    <span className="text-green-600 font-semibold">
                      Hoạt động
                    </span>
                  ) : (
                    <span className="text-red-500 font-semibold">Khóa</span>
                  )}
                </td>
                
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => navigate(`/admin/user-detail/${u._id}`)}
                    className="text-gray-600 hover:text-red-500 transition text-2xl"
                    title="Xem chi tiết"
                  >
                    <FaEye />
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

export default UserList;
