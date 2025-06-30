import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Bill } from "../../../interfaces/Bill";
import { FaFilePdf, FaEnvelope, FaEdit, FaEye } from "react-icons/fa";
import { Button, Card, Tag, Tooltip, Select, Modal, message } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import BillDetailModal from "./BillDetailModal";

const API_URL = "http://localhost:5000/api/bill";

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

const BillList: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Định nghĩa các trạng thái và thứ tự
  const statusOptions = [
    { value: 'pending', label: 'Chờ xác nhận', color: 'orange' },
    { value: 'confirmed', label: 'Đã xác nhận', color: 'blue' },
    { value: 'ready_for_pickup', label: 'Chờ lấy hàng', color: 'cyan' },
    { value: 'shipping', label: 'Đang vận chuyển', color: 'purple' },
    { value: 'delivering', label: 'Đang giao hàng', color: 'geekblue' },
    { value: 'delivered', label: 'Đã giao hàng', color: 'green' },
    { value: 'paid', label: 'Đã thanh toán', color: 'success' },
    { value: 'cancelled', label: 'Đã hủy', color: 'red' }
  ];

  const statusOrder = [
    'pending',
    'confirmed',
    'ready_for_pickup',
    'shipping',
    'delivering',
    'delivered',
    'paid'
  ];

  const fetchBills = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data: ApiResponse = await res.json();
      setBills(Array.isArray(data.data) ? data.data : []);
      // Log kiểm tra
      console.log("Bills:", data.data);
    } catch (error) {
      setStatusMessage("Lỗi khi tải hóa đơn!");
      setMessageType("error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleViewDetail = async (bill: Bill) => {
    setDetailLoading(true);
    setSelectedBill(bill);
    setDetailModalVisible(true);

    try {
      // Fetch chi tiết hóa đơn từ server
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/${bill._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data: ApiResponse = await res.json();
        if (data.success && data.data) {
          setSelectedBill(data.data);
        }
      }
    } catch (error) {
      message.error("Lỗi khi tải chi tiết hóa đơn!");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleExportPDF = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/${id}/pdf`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bill-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setStatusMessage("Xuất PDF thành công!");
        setMessageType("success");
      } else {
        setStatusMessage("Xuất PDF thất bại!");
        setMessageType("error");
      }
    } catch (error) {
      setStatusMessage("Lỗi khi xuất PDF!");
      setMessageType("error");
    }
  };

  const handleSendEmail = async (id: string) => {
    setSendingId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/${id}/export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({}),
      });

      const data: ApiResponse = await res.json();
      if (res.ok && data.success) {
        setStatusMessage("Gửi email thành công!");
        setMessageType("success");
      } else {
        setStatusMessage(data.error || "Gửi email thất bại!");
        setMessageType("error");
      }
    } catch (error) {
      setStatusMessage("Lỗi khi gửi email!");
      setMessageType("error");
    } finally {
      setSendingId(null);
    }
  };

  const handleStatusEdit = (bill: Bill) => {
    setEditingStatus(bill._id!);
    setSelectedStatus(bill.status);
  };

  const handleStatusUpdate = async () => {
    if (!editingStatus || !selectedStatus) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/${editingStatus}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: selectedStatus }),
      });

      const data: ApiResponse = await res.json();

      if (res.ok && data.success) {
        message.success("Cập nhật trạng thái thành công!");
        setEditingStatus(null);
        setSelectedStatus("");
        fetchBills(); // Refresh danh sách
      } else {
        message.error(data.error || "Cập nhật trạng thái thất bại!");
      }
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái!");
    }
  };

  const getAvailableStatusOptions = (currentStatus: string) => {
    const currentIndex = statusOrder.indexOf(currentStatus);

    return statusOptions.filter(option => {
      if (option.value === 'cancelled') return true; // Luôn cho phép hủy
      if (option.value === currentStatus) return true; // Cho phép giữ nguyên

      const optionIndex = statusOrder.indexOf(option.value);
      if (optionIndex === -1) return false; // Trạng thái không hợp lệ

      // Cho phép chuyển sang trạng thái tiếp theo hoặc trước đó 1 bước
      return optionIndex <= currentIndex + 1 && optionIndex >= currentIndex - 1;
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string): string => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption?.color || "gray";
  };

  const getStatusLabel = (status: string): string => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption?.label || status;
  };

  const getPaymentMethodLabel = (method: string): string => {
    switch (method) {
      case 'cash': return 'Tiền mặt';
      case 'credit_card': return 'Thẻ tín dụng';
      case 'bank_transfer': return 'Chuyển khoản';
      default: return method;
    }
  };

  const getPaymentStatusLabel = (status: string): string => {
    switch (status) {
      case 'unpaid': return 'Chưa thanh toán';
      case 'paid': return 'Đã thanh toán';
      case 'refunded': return 'Đã hoàn tiền';
      default: return status;
    }
  };

  // Helper function để kiểm tra customer có phải là object không
  const isCustomerObject = (customer: any): customer is { _id: string; name: string; email: string } => {
    return typeof customer === 'object' && customer !== null && 'name' in customer;
  };

  // Helper function để lấy tên khách hàng
  const getCustomerName = (customer: any): string => {
    if (isCustomerObject(customer)) {
      return customer.name;
    }
    return "Không rõ";
  };

  // Helper function để lấy email khách hàng
  const getCustomerEmail = (customer: any): string => {
    if (isCustomerObject(customer)) {
      return customer.email;
    }
    return "Không rõ";
  };

  // Helper function để lấy ID khách hàng
  const getCustomerId = (customer: any): string => {
    if (isCustomerObject(customer)) {
      return customer._id;
    }
    return customer || 'N/A';
  };

  // Helper function để kiểm tra product có phải là object không
  const isProductObject = (product: any): product is { _id: string; name: string; price: number } => {
    return typeof product === 'object' && product !== null && 'name' in product;
  };

  // Helper function để lấy tên sản phẩm
  const getProductName = (product: any): string => {
    if (isProductObject(product)) {
      return product.name;
    }
    return "Không rõ";
  };

  // Helper function để lấy ID sản phẩm
  const getProductId = (product: any): string => {
    if (isProductObject(product)) {
      return product._id;
    }
    return product || 'N/A';
  };

  const columns: ColumnsType<Bill> = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (_text, _record, index) => index + 1,
    },
    {
      title: "Mã hóa đơn",
      dataIndex: "billNumber",
      key: "billNumber",
      render: (text: string) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      render: (customer: any) => getCustomerName(customer),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
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
      render: (status: string, record: Bill) => (
        <div className="flex items-center gap-2">
          <Tag color={getStatusColor(status)}>
            {getStatusLabel(status)}
          </Tag>
          <Tooltip title="Chỉnh sửa trạng thái">
            <Button
              type="text"
              size="small"
              icon={<FaEdit />}
              onClick={() => handleStatusEdit(record)}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method: string) => getPaymentMethodLabel(method),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => formatDate(new Date(date)),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: Bill) => (
        <div className="flex gap-2 justify-center">
          <Tooltip title="Xem chi tiết">
            <Button
              type="default"
              icon={<FaEye />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Xuất PDF">
            <Button
              type="primary"
              icon={<FaFilePdf />}
              onClick={() => handleExportPDF(record._id!)}
            />
          </Tooltip>
          <Tooltip title="Gửi Email">
            <Button
              type="default"
              icon={<FaEnvelope />}
              onClick={() => handleSendEmail(record._id!)}
              disabled={sendingId === record._id}
              loading={sendingId === record._id}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <Card className="p-6 rounded-lg shadow-md bg-white">
      <h1 className="text-2xl font-bold mb-4 text-gray-700">
        Danh sách Hóa đơn
      </h1>

      {statusMessage && (
        <div
          className={`mb-4 px-4 py-2 rounded-md italic text-center shadow-md font-medium
      ${messageType === "success"
              ? "text-green-700 bg-green-100"
              : "text-red-700 bg-red-100"
            }`}
        >
          {statusMessage}
        </div>
      )}

      <Table
        dataSource={bills}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} hóa đơn`,
        }}
      />

      {/* Modal chỉnh sửa trạng thái */}
      <Modal
        title="Chỉnh sửa trạng thái hóa đơn"
        open={!!editingStatus}
        onOk={handleStatusUpdate}
        onCancel={() => {
          setEditingStatus(null);
          setSelectedStatus("");
        }}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Chọn trạng thái mới cho hóa đơn:
          </p>
          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            style={{ width: '100%' }}
            placeholder="Chọn trạng thái"
          >
            {editingStatus &&
              getAvailableStatusOptions(
                bills.find(bill => bill._id === editingStatus)?.status || 'pending'
              ).map(option => (
                <Select.Option key={option.value} value={option.value}>
                  <Tag color={option.color}>{option.label}</Tag>
                </Select.Option>
              ))
            }
          </Select>
          <div className="text-sm text-gray-500">
            <p>Lưu ý: Chỉ có thể chuyển sang trạng thái tiếp theo hoặc trước đó 1 bước.</p>
            <p>Có thể hủy hóa đơn từ bất kỳ trạng thái nào.</p>
          </div>
        </div>
      </Modal>

      {/* Modal chi tiết hóa đơn */}
      <BillDetailModal
        visible={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedBill(null);
        }}
        bill={selectedBill}
        loading={detailLoading}
        getStatusColor={getStatusColor}
        getStatusLabel={getStatusLabel}
        getPaymentMethodLabel={getPaymentMethodLabel}
        getPaymentStatusLabel={getPaymentStatusLabel}
        formatDate={formatDate}
        getCustomerName={getCustomerName}
        getCustomerEmail={getCustomerEmail}
        getCustomerId={getCustomerId}
        getProductName={getProductName}
        getProductId={getProductId}
      />
    </Card>
  );
};

export default BillList;
