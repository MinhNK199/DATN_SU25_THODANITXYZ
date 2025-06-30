import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Order } from "../../../interfaces/Order";
import { FaEye } from "react-icons/fa";
import { Button, Card, Tag, Tooltip, Table, Input, Select, Row, Col, Modal, message as antdMessage } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined } from "@ant-design/icons";

const API_URL = "http://localhost:5000/api/order";

const getToken = () => {
    return localStorage.getItem('token') || '';
}

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
  
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const params = new URLSearchParams();
      if (customerName) params.append("customerName", customerName);
      if (orderId) params.append("orderId", orderId);
      if (status) params.append("status", status);
      const res = await fetch(`${API_URL}?${params.toString()}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      const ordersData = Array.isArray(data.orders) ? data.orders : [];
      setOrders(ordersData);

    } catch (error) {
      setMessage("Lỗi khi tải danh sách đơn hàng!");
      setMessageType("error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [customerName, orderId, status]);

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
      case "pending":
        return "orange";
      case "processing":
        return "blue";
      case "shipped":
        return "purple";
      case "delivered":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
        case "pending":
            return "Chờ xử lý";
        case "processing":
            return "Đang xử lý";
        case "shipped":
            return "Đang giao";
        case "delivered":
            return "Đã giao";
        case "cancelled":
            return "Đã hủy";
        default:
            return "Không xác định";
    }
  }

  const columns: ColumnsType<Order> = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (_text, _record, index) => index + 1,
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
          {amount.toLocaleString()}₫
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
            <Option value="delivered">Đã giao</Option>
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
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} đơn hàng`,
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
    </Card>
  );
};

export default OrderList;
