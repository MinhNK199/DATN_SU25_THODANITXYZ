import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      setSuccess(res.data.message || "Đăng nhập thành công!");
      localStorage.setItem("token", res.data.token);
      setTimeout(() => {
        navigate("/admin");
      },);
    } catch (err: any) {
      setError(
        err.response?.data?.details?.join(", ") ||
        err.response?.data?.message ||
        "Đăng nhập thất bại!"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="container mt-5" style={{ maxWidth: 400 }}>
      <h2 className="text-center mb-4">Đăng nhập</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <div className="mb-3">
        <label className="form-label">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder="Nhập email của bạn"
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
          placeholder="Nhập mật khẩu của bạn"
          className="form-control"
        />
      </div>
      <button type="submit" className="btn btn-primary w-100">Đăng nhập</button>
    </form>
  );
}