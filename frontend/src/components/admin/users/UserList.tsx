import React, { useEffect, useState } from "react";
import type { User } from "../../../interfaces/User";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Table,
  Input,
  Select,
  Typography,
  Tag,
  Button,
  Spin,
  Alert,
  Space,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { FaEye } from "react-icons/fa";

const { Title } = Typography;
const { Option } = Select;

const API_URL = "http://localhost:5000/api/auth/users";

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [message, setMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchType, setSearchType] = useState<"name" | "email" | "role">("name");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setCurrentUser(res.data.user);
      } catch {
        setCurrentUser(null);
      }
    };
    fetchCurrentUser();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setMessage("Lỗi khi tải người dùng!");
      setMessageType("error");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser) fetchUsers();
  }, [currentUser]);

  useEffect(() => {
    if (users.length > 0) {
      const filtered = users.filter((user) => {
        const keyword = searchKeyword.toLowerCase();
        switch (searchType) {
          case "name":
            return user.name.toLowerCase().includes(keyword);
          case "email":
            return user.email.toLowerCase().includes(keyword);
          case "role":
            return user.role.toLowerCase().includes(keyword);
          default:
            return true;
        }
      });
      setFilteredUsers(filtered);
    }
  }, [searchKeyword, searchType, users]);

  const canViewEmail = (viewer: User | null, target: User) => {
    if (!viewer) return false;
    if (viewer.role === "superadmin") return true;
    if (viewer.role === "admin") {
      const isSelf = viewer._id === target._id;
      const isHigherOrSame = ["admin", "superadmin"].includes(target.role);
      return isSelf || !isHigherOrSame;
    }
    return false;
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
      render: (_: string, record: User) =>
        canViewEmail(currentUser, record) ? (
          <span>{record.email}</span>
        ) : (
          <span style={{ fontStyle: "italic", color: "#fa8c16" }}>
            Không thể xem
          </span>
        ),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: string) => {
        let color: string = "";
        switch (role) {
          case "customer":
            color = "blue";
            break;
          case "admin":
            color = "orange";
            break;
          case "superadmin":
            color = "red";
            break;
        }
        return <Tag color={color}>{role}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      render: (active: boolean) =>
        active ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Khóa</Tag>
        ),
    },
    {
  title: "Thao tác",
  key: "actions",
  render: (_: any, record: User) => (
    <Button
      type="primary" // Nền xanh, chữ/icon trắng
      icon={<FaEye style={{ color: "#fff" }} />} // Đảm bảo icon trắng
      onClick={() => navigate(`/admin/users/${record._id}`)}
    />
  ),
}

  ];

  return (
   <div className="p-6 bg-white rounded-lg shadow">
    <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
      Danh sách Người dùng
    </Title>
     <div className="flex items-center justify-between mb-6">
      <Space direction="horizontal">
        <Select
          value={searchType}
          onChange={(value) =>
            setSearchType(value as "name" | "email" | "role")
          }
          style={{ width: 160 }}
        >
          <Option value="name">Tìm theo tên</Option>
          <Option value="email">Tìm theo email</Option>
          <Option value="role">Tìm theo vai trò</Option>
        </Select>
        <Input
          placeholder="Nhập từ khóa tìm kiếm..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ width: 300 }}
        />
      </Space>
      {/* Chỉ superadmin mới thấy nút này */}
      {currentUser?.role === "superadmin" && (
        <Button
          type="primary"
          onClick={() => navigate("admin-list")}
          style={{ background: "blue-400", borderColor: "gray", marginLeft: 16 }}
        >
          Danh sách đăng ký admin
        </Button>
      )}
    </div>

    {message && (
      <Alert
        message={message}
        type={messageType as "success" | "error" | "info" | "warning"}
        showIcon
      />
    )}

    {loading ? (
      <div className="flex justify-center items-center h-40">
        <Spin size="large" />
      </div>
    ) : (
      <Table
        dataSource={filteredUsers}
        columns={columns}
        rowKey="_id"
        pagination={{ pageSize: 8 }}
      />
    )}
  </div>
  );
};

export default UserList;
