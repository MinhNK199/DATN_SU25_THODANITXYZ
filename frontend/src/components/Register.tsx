import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", form);
      alert(res.data.message || "Đăng ký thành công!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Đăng ký thất bại!");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "0 auto" }}>
      <h2>Đăng ký</h2>
      <div>
        <label>Họ tên</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          placeholder="Nhập họ tên"
        />
      </div>
      <div>
        <label>Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder="Nhập email"
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
          placeholder="Nhập mật khẩu"
          title="Mật khẩu"
        />
      </div>
      <div>
        <label>Số điện thoại</label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Nhập số điện thoại"
          title="Số điện thoại"
        />
      </div>
      <button type="submit">Đăng ký</button>
    </form>
  );
}