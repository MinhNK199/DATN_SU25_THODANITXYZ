import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { User, UserForm } from "../../../interfaces/User";

const API_URL = "http://localhost:5000/api/auth/users";

interface Province { code: number; name: string; }
interface District { code: number; name: string; }
interface Ward { code: number; name: string; }

const UserEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>({});
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const u = res.data.user;
        setUser(u);

        const defaultAddress = u.addresses?.find((a: any) => a.isDefault) || {};

        setForm({
          name: u.name,
          phone: u.phone,
          avatar: u.avatar,
          province_code: defaultAddress.province_code,
          district_code: defaultAddress.district_code,
          ward_code: defaultAddress.ward_code,
          street: defaultAddress.street || "",
        });
      } catch (err: any) {
        setError(err.response?.data?.message || "Lỗi khi tải user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    axios.get<Province[]>("https://provinces.open-api.vn/api/?depth=1")
      .then(r => setProvinces(r.data))
      .catch(() => setError("Không tải được danh sách tỉnh"));
  }, []);

  useEffect(() => {
    if (form.province_code) {
      axios
        .get<{ districts: District[] }>(
          `https://provinces.open-api.vn/api/p/${form.province_code}?depth=2`
        )
        .then(r => setDistricts(r.data.districts))
        .catch(() => {});
    }
  }, [form.province_code]);

  useEffect(() => {
    if (form.district_code) {
      axios
        .get<{ wards: Ward[] }>(
          `https://provinces.open-api.vn/api/d/${form.district_code}?depth=2`
        )
        .then(r => setWards(r.data.wards))
        .catch(() => {});
    }
  }, [form.district_code]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelect = (name: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = +e.target.value;
    setForm((f) => ({
      ...f,
      [name]: value,
      ...(name === "province_code" ? { district_code: undefined, ward_code: undefined } : {})
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Cập nhật thông tin thành công!");
      setTimeout(() => nav(-1), 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || "Cập nhật thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-6">
      <button onClick={() => nav(-1)} className="mb-4 text-gray-600 hover:text-gray-800">
        ← Quay lại
      </button>
      <h2 className="text-xl font-bold mb-4">Chỉnh sửa thông tin người dùng</h2>
      {success && <div className="mb-4 text-green-600 bg-green-100 px-4 py-2 rounded">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Tên</label>
          <input
            name="name"
            value={form.name || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Số điện thoại</label>
          <input
            name="phone"
            value={form.phone || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Avatar (URL)</label>
          <input
            name="avatar"
            value={form.avatar || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block font-medium mb-1">Địa chỉ:</label>
          <div className="flex gap-2 flex-wrap">
            <select
              className="border rounded px-2 py-1 flex-1"
              onChange={handleSelect("province_code")}
              value={form.province_code || ""}
              required
            >
              <option value="">Chọn tỉnh/thành</option>
              {provinces.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
            </select>

            <select
              className="border rounded px-2 py-1 flex-1"
              onChange={handleSelect("district_code")}
              value={form.district_code || ""}
              disabled={!districts.length}
              required
            >
              <option value="">Chọn quận/huyện</option>
              {districts.map((d) => <option key={d.code} value={d.code}>{d.name}</option>)}
            </select>

            <select
              className="border rounded px-2 py-1 flex-1"
              onChange={handleSelect("ward_code")}
              value={form.ward_code || ""}
              disabled={!wards.length}
              required
            >
              <option value="">Chọn phường/xã</option>
              {wards.map((w) => <option key={w.code} value={w.code}>{w.name}</option>)}
            </select>
          </div>

          {form.ward_code && (
            <input
              type="text"
              name="street"
              placeholder="Số nhà, tên đường..."
              value={form.street || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition"
          disabled={submitting}
        >
          {submitting ? "Đang cập nhật..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
};

export default UserEdit;
