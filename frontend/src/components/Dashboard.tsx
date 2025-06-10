import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div>
      <h2>Chào mừng bạn đến trang Dashboard!</h2>
      <p>Hãy đăng nhập.</p>
      <div style={{ marginTop: 20 }}>
        <Link to="/login">
          <button className="btn btn-primary" style={{ marginRight: 10, padding: "8px 16px" }}>Đăng nhập</button>
        </Link>
        <Link to="/register">
          <button className="btn btn-secondary" style={{ padding: "8px 16px" }}>Đăng ký</button>
        </Link>
      </div>
    </div>
  );
}