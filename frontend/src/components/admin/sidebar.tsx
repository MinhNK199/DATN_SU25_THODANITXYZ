import toast from "react-hot-toast";
import {
  FaBox,
  FaList,
  FaSignOutAlt,
  FaUser,
  FaFileInvoiceDollar,
  FaTrademark,
  FaImage,
  FaHistory,
  FaStar,
  FaCubes,
  FaChartBar,
  FaCog,
  FaTicketAlt,
  FaTruck,
  FaComments
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

const iconClass = "text-[20px] min-w-[24px]";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    toast.success("Đăng xuất thành công!");
    navigate("/login");
  };

  return (
    <div className="w-64 min-w-[256px] h-screen bg-white border-r border-gray-200 p-5 overflow-y-auto">
      {/* Logo */}
      <div className="text-center text-3xl font-extrabold tracking-wide mb-8 uppercase text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 filter drop-shadow-[4px_4px_6px_rgba(0,0,0,0.5)]">
        TECHTREND
      </div>

      {/* User Info */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.name || 'Admin'}</p>
            <p className="text-sm text-gray-600 capitalize">{user?.role || 'admin'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="space-y-2">
        {/* Dashboard */}
        <button
          onClick={() => navigate("/admin")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 
          ${
            location.pathname === "/admin"
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg border-l-4 border-white"
              : "text-gray-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white hover:shadow-md"
          }`}
        >
          <FaChartBar className={iconClass} />
          <span className="truncate">Dashboard</span>
        </button>

        {/* Detailed Stats */}
        <button
          onClick={() => navigate("/admin/detailed-stats")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 
          ${
            location.pathname === "/admin/detailed-stats"
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg border-l-4 border-white"
              : "text-gray-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white hover:shadow-md"
          }`}
        >
          <FaChartBar className={iconClass} />
          <span className="truncate">Thống kê chi tiết</span>
        </button>

        {/* Products */}
        <button
          onClick={() => navigate("/admin/products")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 
          ${
            location.pathname.includes("/admin/products")
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg border-l-4 border-white"
              : "text-gray-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white hover:shadow-md"
          }`}
        >
          <FaBox className={iconClass} />
          <span className="truncate">Sản phẩm</span>
        </button>

        {/* Variants */}
        <button
          onClick={() => navigate("/admin/variants")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 
          ${
            location.pathname.includes("/admin/variants")
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg border-l-4 border-white"
              : "text-gray-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white hover:shadow-md"
          }`}
        >
          <FaCubes className={iconClass} />
          <span className="truncate">Biến thể</span>
        </button>

        {/* Categories */}
        <button
          onClick={() => navigate("/admin/categories")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 
          ${
            location.pathname.includes("/admin/categories")
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg border-l-4 border-white"
              : "text-gray-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white hover:shadow-md"
          }`}
        >
          <FaList className={iconClass} />
          <span className="truncate">Danh mục</span>
        </button>

        {/* Brands */}
        <button
          onClick={() => navigate("/admin/brands")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 
          ${
            location.pathname.includes("/admin/brands")
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg border-l-4 border-white"
              : "text-gray-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white hover:shadow-md"
          }`}
        >
          <FaTrademark className={iconClass} />
          <span className="truncate">Thương hiệu</span>
        </button>

        {/* Banners */}
        <button
          onClick={() => navigate("/admin/banners")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 
          ${
            location.pathname.includes("/admin/banners")
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg border-l-4 border-white"
              : "text-gray-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white hover:shadow-md"
          }`}
        >
          <FaImage className={iconClass} />
          <span className="truncate">Banner</span>
        </button>

        {/* Users */}
        <button
          onClick={() => navigate("/admin/users")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 
          ${
            location.pathname.includes("/admin/users")
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg border-l-4 border-white"
              : "text-gray-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white hover:shadow-md"
          }`}
        >
          <FaUser className={iconClass} />
          <span className="truncate">Người dùng</span>
        </button>

        {/* Orders */}
        <button
          onClick={() => navigate("/admin/orders")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 
          ${
            location.pathname.includes("/admin/orders")
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg border-l-4 border-white"
              : "text-gray-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white hover:shadow-md"
          }`}
        >
          <FaFileInvoiceDollar className={iconClass} />
          <span className="truncate">Đơn hàng</span>
        </button>

        {/* Shipper */}
        <button
          onClick={() => navigate("/admin/shipper")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 
          ${
            location.pathname.includes("/admin/shipper")
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg border-l-4 border-white"
              : "text-gray-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white hover:shadow-md"
          }`}
        >
          <FaTruck className={iconClass} />
          <span className="truncate">Shipper</span>
        </button>

        {/* Chat */}
        <button
          onClick={() => navigate("/admin/chat")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 
          ${
            location.pathname.includes("/admin/chat")
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg border-l-4 border-white"
              : "text-gray-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white hover:shadow-md"
          }`}
        >
          <FaComments className={iconClass} />
          <span className="truncate">Chat</span>
        </button>

        {/* Ratings */}
        <button
          onClick={() => navigate("/admin/ratings")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 
          ${
            location.pathname.includes("/admin/ratings")
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg border-l-4 border-white"
              : "text-gray-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white hover:shadow-md"
          }`}
        >
          <FaStar className={iconClass} />
          <span className="truncate">Đánh giá</span>
        </button>

        {/* Voucher */}
        <button
          onClick={() => navigate("/admin/vouchers")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 
          ${
            location.pathname.includes("/admin/vouchers")
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg border-l-4 border-white"
              : "text-gray-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white hover:shadow-md"
          }`}
        >
          <FaTicketAlt className={iconClass} />
          <span className="truncate">Voucher</span>
        </button>

        {/* Activities - Superadmin only */}
        {user?.role === "superadmin" && (
          <button
            onClick={() => navigate("/admin/activities")}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 
            ${
              location.pathname.includes("/admin/activities")
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg border-l-4 border-white"
                : "text-gray-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white hover:shadow-md"
            }`}
          >
            <FaHistory className={iconClass} />
            <span className="truncate">Nhật Ký</span>
          </button>
        )}

        {/* Settings - Superadmin only */}
        {user?.role === "superadmin" && (
          <button
            onClick={() => navigate("/admin/settings")}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 
            ${
              location.pathname.includes("/admin/settings")
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg border-l-4 border-white"
                : "text-gray-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white hover:shadow-md"
            }`}
          >
            <FaCog className={iconClass} />
            <span className="truncate">Cài đặt</span>
          </button>
        )}

        {/* Blog công nghệ */}
        <button
          onClick={() => navigate("/admin/blogs")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 
          ${
            location.pathname.includes("/admin/blogs")
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg border-l-4 border-white"
              : "text-gray-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white hover:shadow-md"
          }`}
        >
          <i className="fa-solid fa-blog text-[20px] min-w-[24px]"></i>
          <span className="truncate">Blog công nghệ</span>
        </button>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 transition-all duration-200 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white hover:shadow-md"
        >
          <FaSignOutAlt className={iconClass} />
          <span className="truncate">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
