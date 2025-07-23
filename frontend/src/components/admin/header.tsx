import { useNavigate } from "react-router-dom";
import { FaCog, FaUserCircle } from "react-icons/fa";

const AdminHeader = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role?.toUpperCase() || "";
  const name = user?.name || "";

  return (
    <header className="bg-white w-full shadow-md flex items-center justify-between px-6 py-3 z-50">
      {/* Cài đặt */}
      <button
        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
        title="Cài đặt"
        onClick={() => navigate("/admin/settings")}
      >
        <FaCog className="text-xl text-gray-600" />
      </button>

      <div className="flex-1 mx-6 flex items-center justify-between">
        {/* Search Bar */}
        <form className="flex-grow max-w-lg">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm..."
            className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </form>

        <div className="flex items-center gap-6">
          {/* Role & Name */}
          {role && name && (
            <div className="flex items-center space-x-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-lg shadow-sm">
              <FaUserCircle className="text-lg" />
              <span className="text-sm font-semibold uppercase">
                {role}: {name}
              </span>
            </div>
          )}

          {/* Button Trang chủ */}
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-shadow shadow-md"
            onClick={() => navigate("/")}
          >
            Trang chủ
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
