import React, { useEffect, useState } from "react";
import type { User } from "../../../interfaces/User";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Table,
  Input,
  Typography,
  Tag,
  Button,
  Spin,
  Alert,
  Space,
  Tooltip,
  Modal,
  Select,
} from "antd";
import { FaCheck, FaTimes, FaEye, FaArrowLeft } from "react-icons/fa";

const { Title } = Typography;
const { Option } = Select;

const API_URL = "http://localhost:8000/api/auth/admin-requests";

const Listadmin: React.FC = () => {
  const [requests, setRequests] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [message, setMessage] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [filteredRequests, setFilteredRequests] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  // Fetch admin requests
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data.requests || []);
    } catch {
      setMessage("Lỗi khi tải danh sách yêu cầu admin!");
      setMessageType("error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    let filtered = requests;
    if (searchEmail) {
      filtered = filtered.filter((user) =>
        user.email.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }
    if (filterStatus !== "all") {
      filtered = filtered.filter((user) => user.adminRequestStatus === filterStatus);
    }
    setFilteredRequests(filtered);
  }, [searchEmail, filterStatus, requests]);

  // Xử lý duyệt hoặc từ chối quyền admin
  const handleApprove = async (id: string, approve: boolean) => {
    Modal.confirm({
      title: approve ? "Duyệt quyền admin?" : "Từ chối quyền admin?",
      content: approve
        ? "Bạn chắc chắn muốn duyệt quyền admin cho người này?"
        : "Bạn chắc chắn muốn từ chối quyền admin cho người này?",
      okText: approve ? "Duyệt" : "Từ chối",
      okType: approve ? "primary" : "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const token = localStorage.getItem("token");
          await axios.patch(
            `http://localhost:8000/api/auth/admin-requests/${id}/approve`,
            { approve },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setMessageType("success");
          setMessage(
            approve
              ? "Đã duyệt quyền admin thành công!"
              : "Đã từ chối quyền admin!"
          );
          fetchRequests();
        } catch (err: any) {
          setMessageType("error");
          setMessage(
            err?.response?.data?.message ||
              "Có lỗi xảy ra khi cập nhật trạng thái yêu cầu!"
          );
        }
      },
    });
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
      width: 60,
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => <span>{email}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "adminRequestStatus",
      key: "adminRequestStatus",
      render: (status: string) => (
        <Tag
          color={
            status === "pending"
              ? "orange"
              : status === "approved"
              ? "green"
              : "red"
          }
        >
          {status === "pending"
            ? "Chờ duyệt"
            : status === "approved"
            ? "Đã duyệt"
            : "Từ chối"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: User) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<FaEye />}
              onClick={() => {
                setSelectedUser(record);
                setIsModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Duyệt admin">
            <Button
              type="primary"
              icon={<FaCheck />}
              onClick={() => handleApprove(record._id!, true)}
              disabled={record.adminRequestStatus !== "pending"}
            />
          </Tooltip>
          <Tooltip title="Từ chối">
            <Button
              danger
              icon={<FaTimes />}
              onClick={() => handleApprove(record._id!, false)}
              disabled={record.adminRequestStatus !== "pending"}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow relative">
      {/* Nút back ở góc trên cùng bên phải */}
      <Button
        icon={<FaArrowLeft />}
        onClick={() => navigate(-1)}
        className="absolute right-6 top-6"
        type="default"
      >
        Quay lại
      </Button>

      <Title level={3} style={{ textAlign: "center" }}>
        Danh sách yêu cầu
      </Title>

      {/* Bộ lọc */}
      <div className="flex gap-4 items-center mb-6">
        <Input
          placeholder="Lọc theo email..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          style={{ width: 240 }}
        />
        <Select
          value={filterStatus}
          onChange={(value) => setFilterStatus(value)}
          style={{ width: 180 }}
        >
          <Option value="all">Tất cả trạng thái</Option>
          <Option value="pending">Chờ duyệt</Option>
          <Option value="approved">Đã duyệt</Option>
          <Option value="rejected">Từ chối</Option>
        </Select>
      </div>

      {message && (
        <Alert
          message={message}
          type={messageType as "success" | "error" | "info" | "warning"}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          dataSource={filteredRequests}
          columns={columns}
          rowKey="_id"
          pagination={{ pageSize: 8 }}
        />
      )}

      <Modal
        title="Chi tiết yêu cầu admin"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedUser && (
          <div className="space-y-4">
            <div>
              <strong>Tên:</strong> {selectedUser.name}
            </div>
            <div>
              <strong>Email:</strong> {selectedUser.email}
            </div>
            <div>
              <strong>Nội dung xin làm admin:</strong>{" "}
              {selectedUser.adminRequestContent || "Không có"}
            </div>
            <div>
              <strong>Ảnh minh chứng:</strong>
              {selectedUser.adminRequestImage ? (
                <img
                  src={selectedUser.adminRequestImage}
                  alt="minh chứng"
                  className="w-32 h-32 object-cover rounded mt-2"
                />
              ) : (
                <span className="italic text-gray-400 ml-2">Không có</span>
              )}
            </div>
            <div>
              <strong>Trạng thái:</strong>{" "}
              <Tag
                color={
                  selectedUser.adminRequestStatus === "pending"
                    ? "orange"
                    : selectedUser.adminRequestStatus === "approved"
                    ? "green"
                    : "red"
                }
              >
                {selectedUser.adminRequestStatus === "pending"
                  ? "Chờ duyệt"
                  : selectedUser.adminRequestStatus === "approved"
                  ? "Đã duyệt"
                  : "Từ chối"}
              </Tag>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Listadmin;