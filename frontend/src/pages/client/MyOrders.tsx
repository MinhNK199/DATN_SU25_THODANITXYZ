import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

interface Order {
  _id: string;
  createdAt: string;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status?: string;
  paymentMethod?: string;
}

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get("/api/order/myorders");
        setOrders(res.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Không thể tải danh sách đơn hàng."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h2>
      {loading ? (
        <div className="text-center py-12 text-gray-500">Đang tải đơn hàng...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Bạn chưa có đơn hàng nào.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Mã đơn</th>
                <th className="py-2 px-4 border-b">Ngày đặt</th>
                <th className="py-2 px-4 border-b">Tổng tiền</th>
                <th className="py-2 px-4 border-b">Thanh toán</th>
                <th className="py-2 px-4 border-b">Giao hàng</th>
                <th className="py-2 px-4 border-b">Trạng thái</th>
                <th className="py-2 px-4 border-b"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="text-center">
                  <td className="py-2 px-4 border-b">{order._id.slice(-6).toUpperCase()}</td>
                  <td className="py-2 px-4 border-b">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {order.totalPrice.toLocaleString()}₫
                  </td>
                  <td className="py-2 px-4 border-b">
                    {order.isPaid ? (
                      <span className="text-green-600 font-semibold">
                        Đã thanh toán
                      </span>
                    ) : (
                      <span className="text-red-500">Chưa thanh toán</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {order.isDelivered ? (
                      <span className="text-green-600 font-semibold">
                        Đã giao
                      </span>
                    ) : (
                      <span className="text-yellow-600">Chưa giao</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {order.status || (order.isDelivered ? "Đã giao" : "Đang xử lý")}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <Link
                      to={`/myorders/${order._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Xem chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyOrders;