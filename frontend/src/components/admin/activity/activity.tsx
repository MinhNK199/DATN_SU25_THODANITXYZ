import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spin, message } from "antd";

interface ActivityLog {
  _id: string;
  content: string;
  userName: string;
  userId: string;
   actorName?: string; 
  actorId?: string;
  createdAt: string;
}

const Activity: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/auth/nhatKy", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data.logs);
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi tải nhật ký");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
  {
    title: "Thời gian",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (text: string) =>
      new Date(text).toLocaleString("vi-VN"),
    width: 180,
  },
  {
    title: "Nội dung",
    dataIndex: "content",
    key: "content",
    width: 350,
  },
  {
    title: "Người thực hiện",
    dataIndex: "actorName",
    key: "actorName",
    width: 180,
    render: (_: any, record: ActivityLog) =>
      record.actorName || "Không xác định",
  },
];

  return (
    <div>
      <h2>Nhật ký hoạt động</h2>
      <Spin spinning={loading}>
        <Table
          dataSource={logs}
          columns={columns}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>
    </div>
  );
};

export default Activity;