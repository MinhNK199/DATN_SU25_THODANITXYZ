import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      alert(res.data.message || "Đăng nhập thành công!");
      // Lưu token nếu cần: localStorage.setItem("token", res.data.token);
    } catch (err: any) {
      alert(err.response?.data?.message || "Đăng nhập thất bại!");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "0 auto" }}>
      <h2>Đăng nhập</h2>
      <div>
        <label>Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder="Nhập email của bạn"
          title="Email"
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
          title="Mật khẩu"
        />
      </div>
      <button type="submit">Đăng nhập</button>
    </form>
  );
}