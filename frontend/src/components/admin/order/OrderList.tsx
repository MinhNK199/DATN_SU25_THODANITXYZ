import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Order } from "../../../interfaces/Order";
import { FaEye } from "react-icons/fa";
import { Button, Card, Tag, Tooltip, Table, Input, Select, Row, Col, Modal, message as antdMessage } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined } from "@ant-design/icons";
import AssignShipperModal from "./AssignShipperModal";

const getToken = () => {
    return localStorage.getItem('token') || '';
}

const API_URL = '/api/order';

const { Option } = Select;

const OrderList: React.FC = () => {
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
  const [total, setTotal] = useState(0);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningOrderId, setAssigningOrderId] = useState("");
  
  const fetchOrders = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const token = getToken();
      const params = new URLSearchParams();
      if (customerName) params.append("customerName", customerName);
      if (orderId) params.append("orderId", orderId);
      if (status) params.append("status", status);
      params.append("page", pageNumber.toString());
      const res = await fetch(`${API_URL}?${params.toString()}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      console.log('📊 Admin Orders API Response:', data);
      
      // Backend trả về data.data.orders
      const ordersData = Array.isArray(data.data?.orders) ? data.data.orders : [];
      console.log('📋 Orders details:', ordersData.map(o => ({
        id: o._id?.slice(-6),
        status: o.status,
        hasShipper: !!o.shipper,
        shipperName: o.shipper?.fullName
      })));
      
      setOrders(ordersData);
      setTotal(data.data?.total || 0);

    } catch (error) {
      setMessage("Lỗi khi tải danh sách đơn hàng!");
      setMessageType("error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders(page);
  }, [customerName, orderId, status, page]);

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
      case "shipped": return "cyan";
      case "delivered": return "green";
      case "delivered_success": return "green";
      case "delivered_failed": return "red";
      case "completed": return "green";
      case "cancelled": return "red";
      case "returned": return "volcano";
      case "refund_requested": return "gold";
      case "refunded": return "lime";
      case "payment_failed": return "red";
      default: return "gray";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "draft": return "Đơn hàng tạm";
      case "pending": return "Chờ xác nhận";
      case "confirmed": return "Đã xác nhận";
      case "processing": return "Đang xử lý";
      case "shipped": return "Đang giao";
      case "delivered": return "Đã giao";
      case "delivered_success": return "Giao hàng thành công";
      case "delivered_failed": return "Giao hàng thất bại";
      case "completed": return "Thành công";
      case "cancelled": return "Đã hủy";
      case "returned": return "Hoàn hàng";
      case "refund_requested": return "Yêu cầu hoàn tiền";
      case "refunded": return "Hoàn tiền thành công";
      case "payment_failed": return "Thanh toán thất bại";
      default: return status || "Không xác định";
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
      dataIndex: "totalAmount",
      key: "totalAmount",
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
                icon={<FaEye />}
                />
            </Link>
          </Tooltip>
          {record.status === 'pending' && (
            <Tooltip title="Xác nhận đơn hàng">
              <Button
                type="default"
                onClick={() => handleConfirmOrder(record._id)}
                style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', color: 'white' }}
              >
                ✅ Xác nhận
              </Button>
            </Tooltip>
          )}
          {(record.status === 'confirmed' || record.status === 'processing') && !record.shipper && (
            <Tooltip title="Phân công Shipper">
              <Button
                type="default"
                onClick={() => handleAssignShipper(record._id, setAssigningOrderId, setShowAssignModal)}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
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
            <Option value="pending">Chờ xác nhận</Option>
            <Option value="processing">Đang xử lý</Option>
            <Option value="shipped">Đang giao</Option>
            <Option value="delivered_success">Đã giao</Option>
            <Option value="cancelled">Đã hủy</Option>
          </Select>
        </Col>
        <Col span={6}>
          <Button type="primary" onClick={() => {
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
          }}>Xóa bộ lọc</Button>
        </Col>
      </Row>

      {message && (
        <div
          className={`mb-4 px-4 py-2 rounded-md italic text-center shadow-md font-medium
      ${
        messageType === "success"
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
        pagination={{
          current: page,
          pageSize: 10,
          total: total,
          showSizeChanger: false,
          showTotal: (total) => `Tổng ${total} đơn hàng`,
          onChange: (newPage) => setPage(newPage),
        }}
      />
      <Modal
        open={showOrderIdModal}
        onCancel={() => setShowOrderIdModal(false)}
        footer={null}
        title="Mã đơn hàng"
      >
        <div style={{ wordBreak: "break-all", fontSize: 16, fontWeight: 600 }}>
          {modalOrderId}
          <Button
            type="link"
            size="small"
            style={{ marginLeft: 8 }}
            onClick={() => {
              navigator.clipboard.writeText(modalOrderId);
              antdMessage.success("Đã copy mã đơn hàng!");
            }}
          >
            Copy
          </Button>
        </div>
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
    const response = await fetch(`/api/order/${orderId}/confirm`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      antdMessage.success('Xác nhận đơn hàng thành công!');
      window.location.reload(); // Refresh để cập nhật danh sách
    } else {
      const errorData = await response.json();
      antdMessage.error(errorData.message || 'Có lỗi xảy ra khi xác nhận đơn hàng');
    }
  } catch (error) {
    console.error('Error confirming order:', error);
    antdMessage.error('Có lỗi xảy ra khi xác nhận đơn hàng');
  }
};

const handleAssignConfirm = async (shipperId: string, assigningOrderId: string, page: number, fetchOrders: (page: number) => void) => {
  try {
    const response = await fetch('/api/admin/shipper/assign-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        orderId: assigningOrderId,
        shipperId: shipperId
      })
    });

    if (response.ok) {
      antdMessage.success('Phân công shipper thành công!');
      fetchOrders(page);
    } else {
      const errorData = await response.json();
      antdMessage.error(errorData.message || 'Có lỗi xảy ra khi phân công shipper');
    }
  } catch (error) {
    console.error('Error assigning shipper:', error);
    antdMessage.error('Có lỗi xảy ra khi phân công shipper');
  }
};

export default OrderList;
