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
import toast from "react-hot-toast";

interface OrderItem {
  _id: string;
  product?: string;
  name: string;
  image?: string;
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
  const [reviews, setReviews] = useState<Record<string, any[]>>({});
  const [activeReviewOrderId, setActiveReviewOrderId] = useState<string | null>(
    null
  );
  const [reviewData, setReviewData] = useState<{
    rating: number;
    comment: string;
    images: File[];
  }>({
    rating: 0,
    comment: "",
    images: [],
  });

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
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

        const reviewData: Record<string, any[]> = {};

        await Promise.all(
          response.data.map(async (order: Order) => {
            const oid = order._id.toString(); // 🔑 convert luôn thành string
            try {
              const res = await axiosInstance.get(`/order/${oid}/reviews`);
              reviewData[oid] =
                res.data.reviews?.filter(
                  (r: any) => r.user?._id === localStorage.getItem("userId")
                ) || [];
            } catch {
              reviewData[oid] = [];
            }
          })
        );

        setReviews(reviewData); // luôn là mảng
      } else {
        setOrders([]);
        setReviews({});
      }
    } catch (error) {
      setOrders([]);
      setReviews({});
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
      isLatest: index === order.statusHistory.length - 1,
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

  const handleReviewOrder = (orderId: string) => {
    if (activeReviewOrderId === orderId) {
      setActiveReviewOrderId(null);
    } else {
      setActiveReviewOrderId(orderId);
      fetchReviews(orderId); // <-- thêm dòng này
      if (!reviews[orderId] || reviews[orderId].length === 0) {
        setReviewData({ rating: 0, comment: "", images: [] });
      }
    }
  };

  const submitReview = async (orderId: string) => {
    try {
      const formData = new FormData();
      formData.append("note", reviewData.comment); // sửa note
      formData.append("rating", reviewData.rating.toString());
      reviewData.images.forEach((img) => formData.append("images", img));

      const res = await axiosInstance.post(
        `/order/${orderId}/review`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("Đánh giá thành công");

      setReviews((prev) => ({
        ...prev,
        [orderId]: res.data.reviews,
      }));
    } catch (err: any) {
      console.error("Lỗi gửi đánh giá:", err); // log rõ ràng
      toast.error(err.response?.data?.message || "Gửi đánh giá thất bại");
    }
  };

  const fetchReviews = async (orderId: string) => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await axiosInstance.get(
        `/order/${orderId}/reviews?userId=${userId}`
      );
      setReviews((prev) => ({
        ...prev,
        [orderId]: res.data.reviews, // mảng review của user hiện tại
      }));
    } catch (err) {
      console.error("Lỗi khi lấy review:", err);
    }
  };

  const StarRating = ({
    rating,
    onChange,
  }: {
    rating: number;
    onChange: (val: number) => void;
  }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            onClick={() => onChange(star)}
            xmlns="http://www.w3.org/2000/svg"
            className={`w-6 h-6 cursor-pointer ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
            fill={star <= rating ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.908c.969 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.97-2.883a1 1 0 00-1.176 0l-3.97 2.883c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.083 10.1c-.783-.57-.38-1.81.588-1.81h4.908a1 1 0 00.95-.69l1.52-4.673z"
            />
          </svg>
        ))}
      </div>
    );
  };

  const handleReviewImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    orderId: string
  ) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setReviewData((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...files],
    }));
  };

  // khi xóa ảnh preview
  const removeReviewImage = (index: number, orderId: string) => {
    setReviewData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
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

              {/* Items */}
              <div className="px-6 py-4 space-y-4">
                {order.orderItems?.slice(0, 2).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 border-b pb-3 last:border-0 last:pb-0"
                  >
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
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      {item.variant && (
                        <p className="text-sm text-gray-600">
                          Phân loại: {item.variant.name}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        Số lượng: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="text-right font-medium text-gray-900">
                      {formatPrice(item.price * item.quantity)}
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
              <div className="bg-blue-50 px-6 py-4 border-t border-blue-200 flex justify-between items-center">
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

                  {/* Nút đánh giá */}
                  {["delivered_success", "completed"].includes(
                    order.status
                  ) && (
                    <button
                      onClick={() => handleReviewOrder(order._id)}
                      className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                    >
                      {reviews[order._id.toString()]?.length > 0
                        ? "Xem đánh giá"
                        : "Đánh giá đơn hàng"}
                    </button>
                  )}
                </div>
              </div>

              {/* Form hoặc hiển thị đánh giá */}
              {activeReviewOrderId === order._id && (
                <div className="mt-4 px-6 py-4 bg-gray-50 border-t border-gray-200 space-y-4">
                  {reviews[order._id] && reviews[order._id].length > 0 ? (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Đánh giá của bạn
                      </h3>
                      {reviews[order._id].map((rev, idx) => (
                        <div
                          key={idx}
                          className="p-3 border rounded mb-2 bg-white"
                        >
                          <div className="flex space-x-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                xmlns="http://www.w3.org/2000/svg"
                                className={`w-5 h-5 ${
                                  star <= rev.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                                fill={
                                  star <= rev.rating ? "currentColor" : "none"
                                }
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.908c.969 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.97-2.883a1 1 0 00-1.176 0l-3.97 2.883c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.083 10.1c-.783-.57-.38-1.81.588-1.81h4.908a1 1 0 00.95-.69l1.52-4.673z"
                                />
                              </svg>
                            ))}
                          </div>
                          <p className="text-gray-800 mb-2">{rev.note}</p>
                          {rev.images?.length > 0 && (
                            <div className="flex space-x-2">
                              {rev.images.map((img: string, i: number) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt="review-img"
                                  className="w-20 h-20 object-cover rounded border"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Đánh giá đơn hàng #{order.orderNumber}
                      </h3>
                      <StarRating
                        rating={reviewData.rating}
                        onChange={(val) =>
                          setReviewData({ ...reviewData, rating: val })
                        }
                      />
                      <textarea
                        placeholder="Viết cảm nhận của bạn..."
                        value={reviewData.comment}
                        onChange={(e) =>
                          setReviewData({
                            ...reviewData,
                            comment: e.target.value,
                          })
                        }
                        className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thêm hình ảnh (tùy chọn)
                        </label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) =>
                            handleReviewImagesChange(e, order._id)
                          }
                          className="mb-2"
                        />
                        <div className="flex space-x-2 mt-2">
                          {reviewData.images.map((file, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt="preview"
                                className="w-16 h-16 object-cover rounded border"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  removeReviewImage(index, order._id)
                                }
                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => submitReview(order._id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Gửi đánh giá
                        </button>
                        <button
                          onClick={() => setActiveReviewOrderId(null)}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
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
