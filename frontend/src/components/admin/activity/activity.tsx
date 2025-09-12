import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spin, message, DatePicker, Input, Select, Button } from "antd";
import dayjs from "dayjs";
import type { RangePickerProps } from "antd/es/date-picker";

interface ActivityLog {
  _id: string;
  content: string;
  userName: string;
  userId: string;
  actorName?: string;
  actorId?: string;
  createdAt: string;
}

const { RangePicker } = DatePicker;
const { Option } = Select;

const Activity: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchType, setSearchType] = useState<"content" | "actorName">("content");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8000/api/auth/nhatKy", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data.logs);
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi tải nhật ký");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = logs;

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter((log) => {
        if (searchType === "content") {
          return log.content.toLowerCase().includes(keyword);
        }
        if (searchType === "actorName") {
          return (log.actorName || "").toLowerCase().includes(keyword);
        }
        return true;
      });
    }

    if (dateRange[0] && dateRange[1]) {
      const from = dateRange[0].startOf("day").toDate().getTime();
      const to = dateRange[1].endOf("day").toDate().getTime();
      filtered = filtered.filter((log) => {
        const created = new Date(log.createdAt).getTime();
        return created >= from && created <= to;
      });
    }

    setFilteredLogs(filtered);
  }, [logs, searchKeyword, searchType, dateRange]);

  const columns = [
    
    {
      title: "🕒 Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleString("vi-VN"),
      width: 180,
    },
    {
      title: "📄 Nội dung",
      dataIndex: "content",
      key: "content",
      width: 350,
    },
    {
      title: "👤 Người thực hiện",
      dataIndex: "actorName",
      key: "actorName",
      width: 180,
      render: (_: any, record: ActivityLog) => record.actorName || "Không xác định",
    },
  ];

  const handleReset = () => {
    setSearchKeyword("");
    setDateRange([null, null]);
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-2xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">📋 Nhật ký hoạt động</h2>

      {/* Bộ lọc */}
      <div className="grid md:grid-cols-5 gap-4 mb-6">
        <Select
          value={searchType}
          onChange={(v) => setSearchType(v)}
          className="w-full"
        >
          <Option value="content">🔍 Theo nội dung</Option>
          <Option value="actorName">👤 Theo người thực hiện</Option>
        </Select>
        <Input
          placeholder="Nhập từ khóa..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="w-full"
        />
        <RangePicker
          value={dateRange}
          onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
          format="DD/MM/YYYY"
          className="w-full"
        />
        <Button onClick={handleReset} className="w-full admin-bg-blue-light hover:admin-bg-blue text-white">
          Đặt lại
        </Button>
        <Button type="primary" className="admin-primary-button w-full" onClick={fetchLogs}>
          Tải lại
        </Button>
      </div>

      <Spin spinning={loading}>
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <Table
            dataSource={filteredLogs}
            columns={columns}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        </div>
      </Spin>
    </div>
  );
};

export default Activity;
