import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Pause,
  DollarSign,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import RatingForm from "./components/RatingForm";
import toast from "react-hot-toast";

interface OrderItem {
  _id: string;
  product?: string;
  name: string;
  image?: string;
  variantId?: string;
  variantInfo?: {
    _id?: string;
    name?: string;
    price?: number;
    salePrice?: number;
    stock?: number;
    images?: string[];
    sku?: string;
    color?: {
      name?: string;
      code?: string;
    };
    size?: number;
    specifications?: Record<string, string>;
  };
  // Giữ lại variant cũ để tương thích ngược
  variant?: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber?: string;
  orderItems: OrderItem[];
  totalPrice: number;
  status:
    | "draft"
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered_success"
    | "delivered_failed"
    | "partially_delivered"
    | "returned"
    | "on_hold"
    | "completed"
    | "cancelled"
    | "refund_requested"
    | "refunded"
    | "payment_failed";
  paymentStatus: "pending" | "paid" | "failed" | "awaiting_payment";
  paymentMethod: string;
  isPaid?: boolean;
  paidAt?: string;
  shippingAddress: {
    fullName: string;
    phone?: string;
    address: string;
    city: string;
    district?: string;
    ward?: string;
  };
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryDate?: string;
  deliveryPerson?: string;
  deliveryNotes?: string;
  statusHistory?: {
    status: string;
    date: string;
    note?: string;
  }[];
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const ordersPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    const handleOrderUpdated = () => {
      fetchOrders();
    };
    window.addEventListener("orderUpdated", handleOrderUpdated);
    return () => {
      window.removeEventListener("orderUpdated", handleOrderUpdated);
    };
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/order/myorders");
      if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Clock className="w-4 h-4 text-gray-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "processing":
        return <Package className="w-4 h-4 text-purple-500" />;
      case "shipped":
        return <Truck className="w-4 h-4 text-orange-500" />;
      case "delivered_success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "delivered_failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "partially_delivered":
        return <Package className="w-4 h-4 text-orange-500" />;
      case "returned":
        return <RotateCcw className="w-4 h-4 text-purple-500" />;
      case "on_hold":
        return <Pause className="w-4 h-4 text-gray-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "refund_requested":
        return <DollarSign className="w-4 h-4 text-yellow-500" />;
      case "refunded":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "payment_failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "draft":
        return "Đang tạo";
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "processing":
        return "Đang xử lý";
      case "shipped":
        return "Đang giao hàng";
      case "delivered_success":
        return "Giao hàng thành công";
      case "delivered_failed":
        return "Giao hàng thất bại";
      case "partially_delivered":
        return "Giao hàng một phần";
      case "returned":
        return "Hoàn hàng";
      case "on_hold":
        return "Tạm dừng";
      case "completed":
        return "Thành công";
      case "cancelled":
        return "Đã hủy";
      case "refund_requested":
        return "Yêu cầu hoàn tiền";
      case "refunded":
        return "Hoàn tiền thành công";
      case "payment_failed":
        return "Thanh toán thất bại";
      default:
        return "Không xác định";
    }
  };

  const getPaymentStatusText = (order: Order) => {
    if (order.paymentMethod === "COD") {
      return order.paymentStatus === "paid"
        ? "Đã thanh toán COD"
        : "Chưa thanh toán COD";
    } else {
      if (order.paymentStatus === "paid") {
        return `Đã thanh toán ${order.paymentMethod.toUpperCase()}`;
      } else if (order.paymentStatus === "failed") {
        return "Thanh toán thất bại";
      } else if (order.paymentStatus === "awaiting_payment") {
        return "Chưa thanh toán";
      } else if (order.paymentStatus === "pending") {
        return "Chưa thanh toán";
      } else {
        return "Chưa thanh toán";
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-orange-100 text-orange-800";
      case "delivered_success":
        return "bg-green-100 text-green-800";
      case "delivered_failed":
        return "bg-red-100 text-red-800";
      case "partially_delivered":
        return "bg-orange-100 text-orange-800";
      case "returned":
        return "bg-purple-100 text-purple-800";
      case "on_hold":
        return "bg-gray-100 text-gray-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "refund_requested":
        return "bg-yellow-100 text-yellow-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      case "payment_failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDeliveryInfo = (order: Order) => {
    if (order.status === "shipped" && order.estimatedDeliveryDate) {
      return {
        estimatedDate: new Date(order.estimatedDeliveryDate).toLocaleDateString(
          "vi-VN"
        ),
        deliveryPerson: order.deliveryPerson,
        notes: order.deliveryNotes,
      };
    }
    return null;
  };

  const getOrderTimeline = (order: Order) => {
  if (!order.statusHistory || order.statusHistory.length === 0) return [];
  return order.statusHistory.map((history, index) => ({
    id: index,
    status: history.status,
    text: getStatusText(history.status),
    date: new Date(history.date).toLocaleString("vi-VN"),
    note: history.note || "",
    isLatest: index === (order.statusHistory?.length ?? 0) - 1,
  }));
};


  const filteredOrders = React.useMemo(() => {
    if (!Array.isArray(orders)) return [];
    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderItems?.some((item) =>
          item.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / ordersPerPage)
  );
  const startIndex = (currentPage - 1) * ordersPerPage;
  const currentOrders = filteredOrders.slice(
    startIndex,
    startIndex + ordersPerPage
  );

  const handlePageChange = (page: number) => setCurrentPage(page);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
    try {
      await axiosInstance.put(`/order/${orderId}/cancel`);
      toast.success("Hủy đơn hàng thành công!");
      fetchOrders();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi hủy đơn hàng"
      );
    }
  };

  const handleConfirmDelivery = async (orderId: string) => {
    if (!window.confirm("Bạn có chắc chắn đã nhận được hàng?")) return;

    try {
      await axiosInstance.put(`/order/${orderId}/confirm-delivery`);
      toast.success("Xác nhận đã nhận hàng thành công!");
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleReturnRequest = async (orderId: string) => {
    const reason = window.prompt(
      "Vui lòng nhập lý do yêu cầu hoàn hàng/hoàn tiền:"
    );
    if (!reason || reason.trim() === "") return;

    try {
      await axiosInstance.put(`/order/${orderId}/return-request`, {
        reason: reason.trim(),
      });
      toast.success("Yêu cầu hoàn hàng/hoàn tiền đã được gửi thành công!");
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleConfirmSatisfaction = async (orderId: string) => {
    if (!window.confirm("Bạn có chắc chắn hài lòng với đơn hàng này?")) return;

    try {
      await axiosInstance.put(`/order/${orderId}/confirm-satisfaction`);
      toast.success("Xác nhận hài lòng thành công! Đơn hàng đã hoàn thành.");
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Đang tải đơn hàng...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Đơn hàng của tôi</h1>
        <p className="text-gray-600 mt-1">
          Theo dõi và quản lý đơn hàng của bạn
        </p>
      </div>

      {/* Thanh tìm kiếm + filter */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="processing">Đang xử lý</option>
              <option value="shipped">Đang giao hàng</option>
              <option value="delivered_success">Đã giao</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Nếu không có đơn */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== "all"
              ? "Không tìm thấy đơn hàng"
              : "Chưa có đơn hàng nào"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== "all"
              ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
              : "Hãy bắt đầu mua sắm để tạo đơn hàng đầu tiên"}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Bắt đầu mua sắm
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {currentOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white border border-blue-200 rounded-lg shadow-sm hover:shadow-lg transition-all overflow-hidden"
            >
              {/* Header */}
              <div className="bg-blue-50 px-6 py-4 border-b border-blue-200 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Đơn hàng #{order.orderNumber || order._id?.slice(-8)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Đặt lúc: {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusIcon(order.status)}
                    <span className="ml-2">{getStatusText(order.status)}</span>
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      order.paymentStatus === "paid"
                        ? "bg-green-100 text-green-800"
                        : order.paymentStatus === "failed"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    <span className="ml-2">{getPaymentStatusText(order)}</span>
                  </span>
                  <Link
                    to={`/profile/orders/${order._id}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4 mr-1" /> Xem chi tiết
                  </Link>
                </div>
              </div>

              {/* Items (chỉ preview) */}
              <div className="px-6 py-4 space-y-4">
                {order.orderItems?.slice(0, 2).map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image || "/placeholder-product.png"}
                        alt={item.name || "Sản phẩm"}
                        className="w-16 h-16 object-cover rounded-md border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/64x64?text=IMG";
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.name}
                        </h4>
                        {(item.variantInfo && item.variantInfo.name) || (item.variant && item.variant.name) ? (
                          <p className="text-sm text-blue-600 font-medium">
                            Phân loại: {item.variantInfo?.name || item.variant?.name}
                          </p>
                        ) : null}
                        <p className="text-sm text-gray-600">
                          Số lượng: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <div className="text-right font-medium text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
                {(order.orderItems?.length || 0) > 2 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    ... và {order.orderItems.length - 2} sản phẩm khác
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="bg-blue-50 px-6 py-4 border-t border-blue-200 flex justify-between items-start sm:items-center">
                <div className="text-sm text-gray-700">
                  <span>Giao đến: </span>
                  <span className="font-medium">
                    {order.shippingAddress?.fullName} -{" "}
                    {order.shippingAddress?.phone}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Tổng tiền:</p>
                  <p className="text-lg font-bold text-blue-700">
                    {formatPrice(order.totalPrice)}
                  </p>

                  {/* Nút hành động */}
                  {order.status === "pending" && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                    >
                      Hủy đơn hàng
                    </button>
                  )}

                  {order.status === "shipped" && (
                    <>
                      <button
                        onClick={() => handleConfirmDelivery(order._id)}
                        className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm mr-2"
                      >
                        Đã nhận được hàng
                      </button>
                      <button
                        onClick={() => handleReturnRequest(order._id)}
                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm mr-2"
                      >
                        {order.paymentMethod === "COD"
                          ? "Yêu cầu hoàn hàng"
                          : "Yêu cầu hoàn tiền"}
                      </button>
                    </>
                  )}

                  {order.status === "delivered_success" && order.isPaid && (
                    <button
                      onClick={() => navigate(`/profile/orders/${order._id}`)}
                      className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm mr-2"
                    >
                      Yêu cầu hoàn tiền
                    </button>
                  )}

                  {order.status === "delivered_success" && (
                    <button
                      onClick={() => handleConfirmSatisfaction(order._id)}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm mr-2"
                    >
                      Hài lòng với đơn hàng
                    </button>
                  )}

                  {(order.status === "completed" ||
                    order.status === "delivered_success") && (
                    <button
                      onClick={() =>
                        setExpandedOrderId(
                          expandedOrderId === order._id ? null : order._id
                        )
                      }
                      className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm"
                    >
                      {expandedOrderId === order._id
                        ? "Ẩn đánh giá"
                        : "Xem / Đánh giá sản phẩm"}
                    </button>
                  )}
                </div>
              </div>

              {/* RatingForm hiển thị khi mở */}
              {expandedOrderId === order._id && (
                <div className="px-6 py-4 bg-gray-200 border-t">
                  {order.orderItems.map((item) => (
                    <div key={item._id} className="mb-4">
                      <p className="font-medium">{item.name}</p>
                      <RatingForm
                        productId={item.product!}
                        orderId={order._id}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? "bg-blue-600 text-white border border-blue-600"
                        : "text-blue-600 bg-white border border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
