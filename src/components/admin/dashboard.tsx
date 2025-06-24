export default function Dashboard() {
  return (
    <div className="flex h-screen">
      <main className="flex-1 bg-gray-100 p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Chào mừng trở lại!</h1>
        </header>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2">Tổng doanh thu</h3>
            <p className="text-2xl font-bold text-green-600">12,000,000 đ</p>
          </div>
          <div className="bg-white shadow rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2">Sản phẩm đã bán</h3>
            <p className="text-2xl font-bold text-blue-600">324</p>
          </div>
          <div className="bg-white shadow rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2">Khách hàng mới</h3>
            <p className="text-2xl font-bold text-purple-600">45</p>
          </div>
        </div>
      </main>
    </div>
  );
}
