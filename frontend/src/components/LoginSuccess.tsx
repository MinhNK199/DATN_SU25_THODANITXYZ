// src/pages/LoginSuccess.tsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function LoginSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      // Bạn có thể gọi API lấy thông tin user nếu cần ở đây
      navigate("/");
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <div className="text-center mt-10 text-blue-500 font-semibold">
      Đang xử lý đăng nhập bằng Facebook...
    </div>
  );
}
