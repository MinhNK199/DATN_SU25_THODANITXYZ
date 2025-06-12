import { Link } from "react-router-dom";

export default function Hello() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-100 to-blue-100">
      <div className="bg-white p-10 rounded-xl shadow-xl text-center max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Chào mừng bạn đến Dashboard!</h2>
        <p className="text-gray-600 mb-6">Vui lòng đăng nhập để tiếp tục.</p>
        <div className="flex justify-center space-x-4">
          <Link to="/login">
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200">
              Đăng nhập
            </button>
          </Link>
          <Link to="/register">
            <button className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition duration-200">
              Đăng ký
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
