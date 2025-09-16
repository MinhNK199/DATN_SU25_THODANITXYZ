import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Order } from "../../../interfaces/Order";
import { FaEye } from "react-icons/fa";
import { Button, Card, Tag, Tooltip, Table, Input, Select, Row, Col, Modal, message as antdMessage } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined } from "@ant-design/icons";
import AssignShipperModal from "./AssignShipperModal";
import OrderDetailModal from "./OrderDetailModal";
import axiosInstance from "../../../api/axiosInstance";
import { useErrorNotification } from "../../../hooks/useErrorNotification";
import AdminPagination from "../common/AdminPagination";
import { useOrder } from "../../../contexts/OrderContext";

const API_URL = '/api/order';

const { Option } = Select;

const OrderList: React.FC = () => {
  const { handleError } = useErrorNotification();
  const { orders: contextOrders, updateOrder, addOrder } = useOrder();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [filterCustomerName, setFilterCustomerName] = useState("");
  const [filterOrderId, setFilterOrderId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState("");
  const [showOrderIdModal, setShowOrderIdModal] = useState(false);
  const [modalOrderId, setModalOrderId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningOrderId, setAssigningOrderId] = useState("");

  const fetchOrders = async (pageNumber = page, size = pageSize) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (customerName) params.append("search", customerName);
      if (orderId) params.append("search", orderId);
      if (status) params.append("status", status);
      params.append("page", pageNumber.toString());
      params.append("limit", size.toString());

      const response = await axiosInstance.get(`/order?${params.toString()}`);
      const data = response.data;
      console.log('📊 Admin Orders API Response:', data);

      // Backend trả về data.data.orders
      const ordersData = Array.isArray(data.data?.orders) ? data.data.orders : [];
      console.log('📋 Orders details:', ordersData.map(o => ({
        id: o._id?.slice(-6),
        status: o.status,
        totalPrice: o.totalPrice,
        totalAmount: o.totalAmount,
        hasShipper: !!o.shipper,
        shipperName: o.shipper?.fullName
      })));

      setOrders(ordersData);
      setTotal(data.data?.total || 0);

    } catch (error) {
      console.error("Error fetching orders:", error);
      handleError(error, "Lỗi khi tải danh sách đơn hàng!");
      setMessage("Lỗi khi tải danh sách đơn hàng!");
      setMessageType("error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders(page);
  }, [customerName, orderId, status, page]);

  const handlePageChange = (newPage: number, size?: number) => {
    setPage(newPage);
    if (size && size !== pageSize) {
      setPageSize(size);
    }
    fetchOrders(newPage, size || pageSize);
  };

  const handlePageSizeChange = (current: number, size: number) => {
    setPage(1);
    setPageSize(size);
    fetchOrders(1, size);
  };

  // Sync with context orders for realtime updates
  useEffect(() => {
    if (contextOrders.length > 0) {
      // Merge context orders with current orders, prioritizing context data
      setOrders(prevOrders => {
        const contextOrderMap = new Map(contextOrders.map(order => [order._id, order]));
        return prevOrders.map(order => contextOrderMap.get(order._id) || order);
      });
    }
  }, [contextOrders]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "draft": return "gray";
      case "pending": return "orange";
      case "confirmed": return "blue";
      case "processing": return "purple";
      case "assigned": return "cyan";
      case "picked_up": return "blue";
      case "in_transit": return "purple";
      case "arrived": return "orange";
      case "shipped": return "cyan";
      case "delivered": return "green";
      case "delivered_success": return "green";
      case "delivered_failed": return "red";
      case "partially_delivered": return "orange";
      case "returned": return "volcano";
      case "return_requested": return "orange";
      case "on_hold": return "gray";
      case "completed": return "green";
      case "cancelled": return "red";
      case "refund_requested": return "gold";
      case "refunded": return "lime";
      case "payment_failed": return "red";
      default: return "gray";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "draft": return "Đang tạo";
      case "pending": return "Chờ xác nhận";
      case "confirmed": return "Đã xác nhận";
      case "processing": return "Đang xử lý";
      case "assigned": return "Đã phân công";
      case "picked_up": return "Đã nhận hàng";
      case "in_transit": return "Đang giao hàng";
      case "arrived": return "Đã đến điểm giao";
      case "shipped": return "Đang giao hàng";
      case "delivered": return "Đã giao";
      case "delivered_success": return "Giao hàng thành công";
      case "delivered_failed": return "Giao hàng thất bại";
      case "partially_delivered": return "Giao hàng một phần";
      case "returned": return "Hoàn hàng";
      case "return_requested": return "Yêu cầu hoàn hàng";
      case "on_hold": return "Tạm dừng";
      case "completed": return "Thành công";
      case "cancelled": return "Đã hủy";
      case "refund_requested": return "Yêu cầu hoàn tiền";
      case "refunded": return "Hoàn tiền thành công";
      case "payment_failed": return "Thanh toán thất bại";
      default: return "Không xác định";
    }
  };

  const columns: ColumnsType<Order> = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (_text, _record, index) => index + 1,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "_id",
      key: "_id",
      width: 140,
      render: (id: string) =>
        id.length > 12 ? (
          <span>
            {id.slice(0, 6)}...{id.slice(-4)}
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setModalOrderId(id);
                setShowOrderIdModal(true);
              }}
              style={{ paddingLeft: 4 }}
            >
              Xem
            </Button>
          </span>
        ) : (
          <span>{id}</span>
        ),
    },
    {
      title: "Khách hàng",
      dataIndex: "user",
      key: "user",
      render: (user: any) => user?.name || "Không rõ",
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (amount: number) => (
        <span className="text-green-600 font-semibold">
          {amount?.toLocaleString() || 0}₫
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "isPaid",
      key: "isPaid",
      render: (isPaid: boolean) => (
        <Tag color={isPaid ? 'green' : 'red'}>
          {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
        </Tag>
      )
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => formatDate(date),
    },

    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: Order) => (
        <div className="flex gap-2 justify-center">
          <Tooltip title="Xem chi tiết">
            <Link to={`/admin/orders/${record._id}`}>
              <Button
                type="primary"
                className="admin-primary-button"
                icon={<FaEye />}
              />
            </Link>
          </Tooltip>
          {record.status === 'pending' && (
            <Tooltip title="Xác nhận đơn hàng">
              <Button
                type="primary"
                className="admin-primary-button"
                onClick={() => handleConfirmOrder(record._id)}
              >
                ✅ Xác nhận
              </Button>
            </Tooltip>
          )}
          {(record.status === 'confirmed' || record.status === 'processing') && !record.shipper && (
            <Tooltip title="Phân công Shipper">
              <Button
                type="primary"
                className="admin-primary-button"
                onClick={() => handleAssignShipper(record._id, setAssigningOrderId, setShowAssignModal)}
              >
                🚚 Phân công
              </Button>
            </Tooltip>
          )}
          {record.shipper && (
            <Tooltip title={`Đã phân công cho: ${record.shipper.fullName || 'Shipper'}`}>
              <Button
                type="default"
                disabled
                style={{ backgroundColor: '#f0f0f0', borderColor: '#d9d9d9', color: '#00b96b' }}
              >
                ✅ Đã phân công
              </Button>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];
  return (
    <Card className="p-6 rounded-lg shadow-md bg-white">
      <h1 className="text-2xl font-bold mb-4 text-gray-700">
        Danh sách Đơn hàng
      </h1>

      {/* Bộ lọc */}
      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Input
            placeholder="Tìm theo tên khách hàng"
            value={filterCustomerName}
            onChange={e => setFilterCustomerName(e.target.value)}
            allowClear
          />
        </Col>
        <Col span={6}>
          <Input
            placeholder="Tìm theo mã đơn hàng"
            value={filterOrderId}
            onChange={e => setFilterOrderId(e.target.value)}
            allowClear
          />
        </Col>
        <Col span={6}>
          <Select
            placeholder="Tất cả trạng thái"
            value={filterStatus || undefined}
            onChange={value => setFilterStatus(value)}
            allowClear
            style={{ width: '100%' }}
          >
            <Option value="draft">Đang tạo</Option>
            <Option value="pending">Chờ xác nhận</Option>
            <Option value="confirmed">Đã xác nhận</Option>
            <Option value="processing">Đang xử lý</Option>
            <Option value="assigned">Đã phân công</Option>
            <Option value="picked_up">Đã nhận hàng</Option>
            <Option value="in_transit">Đang giao hàng</Option>
            <Option value="arrived">Đã đến điểm giao</Option>
            <Option value="shipped">Đang giao hàng</Option>
            <Option value="delivered">Đã giao</Option>
            <Option value="delivered_success">Giao hàng thành công</Option>
            <Option value="delivered_failed">Giao hàng thất bại</Option>
            <Option value="partially_delivered">Giao hàng một phần</Option>
            <Option value="returned">Hoàn hàng</Option>
            <Option value="return_requested">Yêu cầu hoàn hàng</Option>
            <Option value="on_hold">Tạm dừng</Option>
            <Option value="completed">Thành công</Option>
            <Option value="cancelled">Đã hủy</Option>
            <Option value="refund_requested">Yêu cầu hoàn tiền</Option>
            <Option value="refunded">Hoàn tiền thành công</Option>
            <Option value="payment_failed">Thanh toán thất bại</Option>
          </Select>
        </Col>
        <Col span={6}>
          <Button type="primary" className="admin-primary-button" onClick={() => {
            setCustomerName(filterCustomerName);
            setOrderId(filterOrderId);
            setStatus(filterStatus);
          }}>Lọc</Button>
          <Button style={{ marginLeft: 8 }} onClick={() => {
            setFilterCustomerName("");
            setFilterOrderId("");
            setFilterStatus("");
            setCustomerName("");
            setOrderId("");
            setStatus("");
          }} className="admin-bg-blue-light hover:admin-bg-blue text-white">Xóa bộ lọc</Button>
        </Col>
      </Row>

      {message && (
        <div
          className={`mb-4 px-4 py-2 rounded-md italic text-center shadow-md font-medium
      ${messageType === "success"
              ? "text-green-700 bg-green-100"
              : "text-red-700 bg-red-100"
            }`}
        >
          {message}
        </div>
      )}

      <Table
        dataSource={orders}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={false}
      />
      <AdminPagination
        current={page}
        pageSize={pageSize}
        total={total}
        onChange={handlePageChange}
        onShowSizeChange={handlePageSizeChange}
        itemText="đơn hàng"
      />
      <Modal
        open={showOrderIdModal}
        onCancel={() => setShowOrderIdModal(false)}
        footer={null}
        title="Chi tiết đơn hàng"
        width={1000}
        className="order-detail-modal"
      >
        {modalOrderId && <OrderDetailModal orderId={modalOrderId} />}
      </Modal>

      <AssignShipperModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onAssign={(shipperId) => {
          handleAssignConfirm(shipperId, assigningOrderId, page, fetchOrders);
          setShowAssignModal(false);
        }}
        orderId={assigningOrderId}
      />
    </Card>
  );
};

// Add functions before the component
const handleAssignShipper = (orderId: string, setAssigningOrderId: (id: string) => void, setShowAssignModal: (show: boolean) => void) => {
  setAssigningOrderId(orderId);
  setShowAssignModal(true);
};

const handleConfirmOrder = async (orderId: string) => {
  try {
    const response = await axiosInstance.put(`/order/${orderId}/confirm`);

    if (response.status === 200) {
      antdMessage.success('Xác nhận đơn hàng thành công!');
      window.location.reload(); // Refresh để cập nhật danh sách
    } else {
      const errorData = response.data;
      antdMessage.error(errorData.message || 'Có lỗi xảy ra khi xác nhận đơn hàng');
    }
  } catch (error) {
    console.error('Error confirming order:', error);
    handleError(error, 'Có lỗi xảy ra khi xác nhận đơn hàng');
  }
};

const handleAssignConfirm = async (shipperId: string, assigningOrderId: string, page: number, fetchOrders: (page: number) => void) => {
  try {
    const response = await axiosInstance.post('/admin/shipper/assign-order', {
      orderId: assigningOrderId,
      shipperId: shipperId
    });

    if (response.status === 200) {
      antdMessage.success('Phân công shipper thành công!');
      fetchOrders(page);
    } else {
      const errorData = response.data;
      antdMessage.error(errorData.message || 'Có lỗi xảy ra khi phân công shipper');
    }
  } catch (error) {
    console.error('Error assigning shipper:', error);
    handleError(error, 'Có lỗi xảy ra khi phân công shipper');
  }
};

export default OrderList;
