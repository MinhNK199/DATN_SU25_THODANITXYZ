import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { set } from "mongoose";

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
          navigate("/dashboard");
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
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "0 auto" }}>
      <h2>Đăng nhập</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>{success}</div>}
      <div>
        <label>Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder="Nhập email của bạn"
        />
      </div>
      <div>
        <label>Mật khẩu</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          placeholder="Nhập mật khẩu của bạn"
        />
      </div>
      <button type="submit">Đăng nhập</button>
    </form>
  );
}