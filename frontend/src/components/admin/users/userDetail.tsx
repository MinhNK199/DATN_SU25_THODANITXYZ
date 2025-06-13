import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { User, UserRole } from "../../../interfaces/User";
import { FaArrowLeft } from "react-icons/fa";

const API_URL = "http://localhost:5000/api/auth/users";

const ROLE_LABELS: Record<UserRole, string> = {
  customer: "Khách hàng",
  staff: "Nhân viên",
  admin: "Quản trị viên",
  superadmin: "Super Admin",
};

function getCurrentUser() {
  const stored = localStorage.getItem("user");
  try {
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [provinceMap, setProvinceMap] = useState<Record<number, string>>({});
  const [districtMap, setDistrictMap] = useState<Record<number, string>>({});
  const [wardMap, setWardMap] = useState<Record<number, string>>({});
  const [actionMsg, setActionMsg] = useState<string>("");
  const [actionType, setActionType] = useState<"success" | "error" | "">("");
  const [changingRole, setChangingRole] = useState<boolean>(false);

  const currentUser = getCurrentUser();

  // Lấy địa chỉ mặc định
  const defaultAddress =
    user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];

  // Lấy user đang xem
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (err: any) {
        setError(err.response?.data?.message || "Lỗi khi tải user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, actionMsg]);

  // Lấy map tỉnh/thành, quận/huyện, phường/xã
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const provinces = await axios.get(
          "https://provinces.open-api.vn/api/?depth=1"
        );
        const provinceObj: Record<number, string> = {};
        provinces.data.forEach((p: any) => {
          provinceObj[p.code] = p.name;
        });
        setProvinceMap(provinceObj);
      } catch {}
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (!defaultAddress?.province_code) return;
    const fetchDistricts = async () => {
      try {
        const res = await axios.get(
          `https://provinces.open-api.vn/api/p/${defaultAddress.province_code}?depth=2`
        );
        const districtObj: Record<number, string> = {};
        res.data.districts.forEach((d: any) => {
          districtObj[d.code] = d.name;
        });
        setDistrictMap(districtObj);
      } catch {}
    };
    fetchDistricts();
  }, [defaultAddress?.province_code]);

  useEffect(() => {
    if (!defaultAddress?.district_code) return;
    const fetchWards = async () => {
      try {
        const res = await axios.get(
          `https://provinces.open-api.vn/api/d/${defaultAddress.district_code}?depth=2`
        );
        const wardObj: Record<number, string> = {};
        res.data.wards.forEach((w: any) => {
          wardObj[w.code] = w.name;
        });
        setWardMap(wardObj);
      } catch {}
    };
    fetchWards();
  }, [defaultAddress?.district_code]);

  // Phân quyền: kiểm tra quyền đổi trạng thái
  const canToggleStatus = () => {
    if (!currentUser || !user) return false;
    if (currentUser._id === user._id) return false; // Không tự khóa chính mình
    if (currentUser.role === "superadmin") return true;
    if (
      currentUser.role === "admin" &&
      user.role !== "admin" &&
      user.role !== "superadmin"
    )
      return true;
    return false;
  };

  // Phân quyền: chỉ superadmin mới được đổi role
  const canChangeRole = () => {
    if (!currentUser || !user) return false;
    if (currentUser.role !== "superadmin") return false;
    if (currentUser._id === user._id) return false; // Không đổi quyền chính mình
    return true;
  };

  // Đổi trạng thái active
  const handleToggleStatus = async () => {
    if (!user) return;
    try {
      setActionMsg("");
      setActionType("");
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `${API_URL}/${user._id}/status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionMsg(res.data.message || "Cập nhật trạng thái thành công!");
      setActionType("success");
    } catch (err: any) {
      setActionMsg(
        err.response?.data?.message || "Cập nhật trạng thái thất bại!"
      );
      setActionType("error");
    }
  };

  // Đổi quyền
  const handleChangeRole = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!user) return;
    const newRole = e.target.value as UserRole;
    if (newRole === user.role) return;
    setChangingRole(true);
    setActionMsg("");
    setActionType("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `${API_URL}/${user._id}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionMsg(res.data.message || "Cập nhật quyền thành công!");
      setActionType("success");
    } catch (err: any) {
      setActionMsg(err.response?.data?.message || "Cập nhật quyền thất bại!");
      setActionType("error");
    } finally {
      setChangingRole(false);
    }
  };

  const borderByRole = (role: string) => {
    switch (role) {
      case "customer":
        return "border-blue-500 bg-blue-100";
      case "staff":
        return "border-teal-500 bg-teal-100";
      case "admin":
        return "border-orange-400 bg-orange-100";
      case "superadmin":
        return "border-red-500 bg-red-100";
      default:
        return "border-gray-300 bg-gray-100";
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!user) return <div className="p-6">Không tìm thấy người dùng</div>;

  const canViewEmail = (viewer: User | null, target: User) => {
    if (!viewer) return false;

    // Superadmin thấy tất cả
    if (viewer.role === "superadmin") return true;

    // Admin thấy tất cả trừ admin/superadmin, nhưng vẫn thấy chính mình
    if (viewer.role === "admin") {
      const isSelf = viewer._id === target._id;
      const isHigherOrSame = ["admin", "superadmin"].includes(target.role);
      return isSelf || !isHigherOrSame;
    }

    // Những role khác không thấy ai
    return false;
  };
  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
      <button
        onClick={() => nav(-1)}
        className="flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-800"
      >
        <FaArrowLeft /> Quay lại
      </button>

      {actionMsg && (
        <div
          className={`mb-4 px-4 py-2 rounded-md italic text-center shadow font-medium ${
            actionType === "success"
              ? "text-green-700 bg-green-100"
              : "text-red-700 bg-red-100"
          }`}
        >
          {actionMsg}
        </div>
      )}

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
          {ROLE_LABELS[user.role]}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-4">
          <p className="text-gray-700">
            <span className="font-medium text-blue-600">Email:</span>{" "}
            {canViewEmail(currentUser, user) ? (
              user.email
            ) : (
              <span className="text-orange-500 italic font-semibold">
                Không thể xem
              </span>
            )}
          </p>

          <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
            <p className="font-medium text-blue-600 mb-2">Địa chỉ:</p>
            {defaultAddress ? (
              <ul className="space-y-2">
                <li>
                  <p className="text-gray-700">
                    <span className="font-medium text-blue-600">
                      Tỉnh/Thành:
                    </span>{" "}
                    {defaultAddress.province_code &&
                    provinceMap[defaultAddress.province_code] ? (
                      provinceMap[defaultAddress.province_code]
                    ) : (
                      <span className="text-red-400">chưa cập nhật</span>
                    )}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium text-blue-600">
                      Quận/Huyện:
                    </span>{" "}
                    {defaultAddress.district_code &&
                    districtMap[defaultAddress.district_code] ? (
                      districtMap[defaultAddress.district_code]
                    ) : (
                      <span className="text-red-400">chưa cập nhật</span>
                    )}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium text-blue-600">
                      Phường/Xã:
                    </span>{" "}
                    {defaultAddress.ward_code &&
                    wardMap[defaultAddress.ward_code] ? (
                      wardMap[defaultAddress.ward_code]
                    ) : (
                      <span className="text-red-400">chưa cập nhật</span>
                    )}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium text-blue-600">
                      Đường/Số nhà:
                    </span>{" "}
                    {defaultAddress.street ? (
                      defaultAddress.street
                    ) : (
                      <span className="text-red-400">chưa cập nhật</span>
                    )}
                  </p>
                </li>
              </ul>
            ) : (
              <p className="text-red-400">chưa cập nhật</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-gray-700">
            <span className="font-medium text-blue-600">Số điện thoại:</span>{" "}
            {user.phone || <span className="text-red-400">chưa cập nhật</span>}
          </p>

          <p className="text-gray-700">
            <span className="font-medium text-blue-600">Trạng thái:</span>{" "}
            <span
              className={
                user.active
                  ? "text-green-600 font-semibold"
                  : "text-red-600 font-semibold"
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

          {/* Nút đổi trạng thái */}
          {canToggleStatus() && (
            <button
              className={`mt-2 px-4 py-2 rounded font-semibold transition ${
                user.active
                  ? "bg-yellow-500 text-white hover:bg-yellow-600"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
              onClick={handleToggleStatus}
            >
              {user.active ? "Vô hiệu hóa" : "Kích hoạt"}
            </button>
          )}

          {/* Select đổi quyền */}
          {canChangeRole() && (
            <div className="mt-4">
              <label className="block font-medium mb-1 text-blue-600">
                Đổi quyền:
              </label>
              <select
                value={user.role}
                onChange={handleChangeRole}
                disabled={changingRole}
                className={`
        w-full px-4 py-2 rounded-lg border-2
        text-gray-700 font-semibold transition
        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400
        disabled:bg-gray-100 disabled:text-gray-400
        hover:cursor-pointer hover:border-blue-300
        shadow-sm
        bg-white
      `}
              >
                <option value="customer">🧍 Khách hàng</option>
                <option value="staff">👨‍💼 Nhân viên</option>
                <option value="admin">🛠️ Quản trị viên</option>
                <option value="superadmin">👑 Super Admin</option>
              </select>
            </div>
          )}

          {/* Chỉ chính chủ mới được sửa thông tin */}
          {currentUser && currentUser._id === user._id && (
            <button
              className="mt-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
              onClick={() => nav(`/admin/user-edit/${user._id}`)}
            >
              Sửa thông tin
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
