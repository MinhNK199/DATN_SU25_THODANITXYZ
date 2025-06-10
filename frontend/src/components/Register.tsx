import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    avatar: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", form);
      setSuccess(res.data.message || "Đăng ký thành công!");
    } catch (err: any) {
      setError(
        err.response?.data?.details?.join(", ") ||
        err.response?.data?.message ||
        "Đăng ký thất bại!"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="container mt-5" style={{ maxWidth: 500 }}>
      <h2 className="mb-4 text-center">Đăng ký</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <div className="mb-3">
        <label className="form-label">Họ tên</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          placeholder="Nhập họ tên"
          className="form-control"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder="Nhập email"
          className="form-control"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Mật khẩu</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          placeholder="Nhập mật khẩu"
          className="form-control"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Số điện thoại</label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Nhập số điện thoại"
          className="form-control"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Avatar (URL)</label>
        <input
          name="avatar"
          value={form.avatar}
          onChange={handleChange}
          placeholder="Nhập URL ảnh đại diện"
          className="form-control"
        />
      </div>
      <button type="submit" className="btn btn-primary w-100">Đăng ký</button>
    </form>
  );
}