import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Bill } from "../../../interfaces/Bill";
import { FaFilePdf, FaEnvelope } from "react-icons/fa";
import { Button, Card, Tag, Tooltip } from "antd";
import Table, { ColumnsType } from "antd/es/table";

const API_URL = "http://localhost:5000/api/bill";

const BillList: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [sendingId, setSendingId] = useState<string | null>(null);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setBills(Array.isArray(data.data) ? data.data : []);
      // Log kiểm tra
      console.log("Bills:", data.data);
    } catch (error) {
      setMessage("Lỗi khi tải hóa đơn!");
      setMessageType("error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleExportPDF = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/${id}/pdf`, {
        method: "GET",
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

        setMessage("Xuất PDF thành công!");
        setMessageType("success");
      } else {
        setMessage("Xuất PDF thất bại!");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Lỗi khi xuất PDF!");
      setMessageType("error");
    }
  };

  const handleSendEmail = async (id: string) => {
    setSendingId(id);
    try {
      const res = await fetch(`${API_URL}/${id}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage("Gửi email thành công!");
        setMessageType("success");
      } else {
        setMessage(data.error || "Gửi email thất bại!");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Lỗi khi gửi email!");
      setMessageType("error");
    } finally {
      setSendingId(null);
    }
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
    switch (status) {
      case "pending":
        return "orange";
      case "paid":
        return "green";
      case "cancelled":
      case "canceled":
        return "red";
      default:
        return "gray";
    }
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
      render: (customer: any) => customer?.name || "Không rõ",
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
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status === "pending"
            ? "Chờ xử lý"
            : status === "paid"
            ? "Đã thanh toán"
            : "Đã hủy"}
        </Tag>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method: string) =>
        method === "cash"
          ? "Tiền mặt"
          : method === "credit_card"
          ? "Thẻ tín dụng"
          : "Chuyển khoản",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => formatDate(new Date(date)), // 👈 fix lỗi
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: Bill) => (
        <div className="flex gap-2 justify-center">
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
    </Card>
  );
};

export default BillList;
