import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { User } from "../../../interfaces/User";
import { FaArrowLeft } from "react-icons/fa";

const API_URL = "http://localhost:5000/api/auth/users";

interface Address {
  province_code?: number;
  district_code?: number;
  ward_code?: number;
  street?: string;
  isDefault?: boolean;
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

  const defaultAddress: Address | undefined =
    user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];

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
  }, [id]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const provinces = await axios.get("https://provinces.open-api.vn/api/?depth=1");
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
        const res = await axios.get(`https://provinces.open-api.vn/api/p/${defaultAddress.province_code}?depth=2`);
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
        const res = await axios.get(`https://provinces.open-api.vn/api/d/${defaultAddress.district_code}?depth=2`);
        const wardObj: Record<number, string> = {};
        res.data.wards.forEach((w: any) => {
          wardObj[w.code] = w.name;
        });
        setWardMap(wardObj);
      } catch {}
    };
    fetchWards();
  }, [defaultAddress?.district_code]);

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

  return (
  <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
  <button onClick={() => nav(-1)} className="flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-800">
    <FaArrowLeft /> Quay lại
  </button>

  <div className="flex flex-col items-center mb-6">
    {user.avatar ? (
      <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full object-cover mb-4" />
    ) : (
      <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
        <span className="text-gray-500 text-xl">No Avatar</span>
      </div>
    )}
    <h2 className="text-2xl font-bold">{user.name}</h2>
    <span className={`mt-2 px-3 py-1 rounded-full border ${borderByRole(user.role)} font-semibold`}>
      {user.role.toUpperCase()}
    </span>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    {/* Cột trái: Email + Địa chỉ */}
    <div className="space-y-4">
      <p className="text-gray-700">
        <span className="font-medium text-blue-600">Email:</span>{" "}
        {user.email || <span className="text-red-400">chưa cập nhật</span>}
      </p>

      <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
        <p className="font-medium text-blue-600 mb-2">Địa chỉ:</p>
        {defaultAddress ? (
          <ul className="space-y-2">
            <li>
              <p className="text-gray-700">
                <span className="font-medium text-blue-600">Tỉnh/Thành:</span>{" "}
                {defaultAddress.province_code && provinceMap[defaultAddress.province_code]
                  ? provinceMap[defaultAddress.province_code]
                  : <span className="text-red-400">chưa cập nhật</span>}
              </p>
              <p className="text-gray-700">
                <span className="font-medium text-blue-600">Quận/Huyện:</span>{" "}
                {defaultAddress.district_code && districtMap[defaultAddress.district_code]
                  ? districtMap[defaultAddress.district_code]
                  : <span className="text-red-400">chưa cập nhật</span>}
              </p>
              <p className="text-gray-700">
                <span className="font-medium text-blue-600">Phường/Xã:</span>{" "}
                {defaultAddress.ward_code && wardMap[defaultAddress.ward_code]
                  ? wardMap[defaultAddress.ward_code]
                  : <span className="text-red-400">chưa cập nhật</span>}
              </p>
              <p className="text-gray-700">
                <span className="font-medium text-blue-600">Đường/Số nhà:</span>{" "}
                {defaultAddress.street
                  ? defaultAddress.street
                  : <span className="text-red-400">chưa cập nhật</span>}
              </p>
            </li>
          </ul>
        ) : (
          <p className="text-red-400">chưa cập nhật</p>
        )}
      </div>
    </div>

    {/* Cột phải: SĐT, trạng thái, ngày tạo, button */}
    <div className="space-y-4">
      <p className="text-gray-700">
        <span className="font-medium text-blue-600">Số điện thoại:</span>{" "}
        {user.phone || <span className="text-red-400">chưa cập nhật</span>}
      </p>

      <p className="text-gray-700">
        <span className="font-medium text-blue-600">Trạng thái:</span>{" "}
        <span className={user.active ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
          {user.active ? "Hoạt động" : "Đã khóa"}
        </span>
      </p>

      <p className="text-gray-700">
        <span className="font-medium text-blue-600">Ngày tạo:</span>{" "}
        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : (
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
