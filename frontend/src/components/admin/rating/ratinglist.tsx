import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Spin,
  message,
  Button,
  Tooltip,
  Input,
  Select,
  Checkbox,
  Radio,
  DatePicker,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import axiosInstance from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { EyeOutlined } from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  images?: string[];
}

interface Rating {
  _id: string;
  userId: User;
  productId: Product;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
  reply?: string;
}

const RatingList: React.FC = () => {
  const [data, setData] = useState<Rating[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyValue, setReplyValue] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    rating: null as number | null,
    hasImage: false,
    replied: "all" as "all" | "yes" | "no",
    sortDate: "desc" as "asc" | "desc",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchRatings();
    fetchProducts();
  }, []);

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/rating");
      setData(res.data.data || res.data || []);
    } catch (err) {
      message.error("Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get("/product");
      setProducts(res.data.data || res.data || []);
    } catch (err) {
      console.error("Không thể tải danh sách sản phẩm");
    }
  };

  // ✅ Lọc dữ liệu FE
  const filteredData = useMemo(() => {
    let result = [...data];

    // Lọc theo tên sản phẩm
    if (filters.search.trim()) {
      result = result.filter((item) =>
        item.productId?.name
          ?.toLowerCase()
          .includes(filters.search.toLowerCase())
      );
    }

    // Lọc theo số sao
    if (filters.rating) {
      result = result.filter((item) => item.rating === filters.rating);
    }

    // Lọc theo có ảnh
    if (filters.hasImage) {
      result = result.filter((item) => item.images && item.images.length > 0);
    }

    // Lọc theo phản hồi
    if (filters.replied === "yes") {
      result = result.filter((item) => item.reply && item.reply.trim() !== "");
    } else if (filters.replied === "no") {
      result = result.filter((item) => !item.reply || item.reply.trim() === "");
    }

    // Sắp xếp theo ngày
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return filters.sortDate === "desc" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [data, filters]);

  const handleReply = async (ratingId: string) => {
    if (!replyValue.trim()) {
      message.warning("Vui lòng nhập nội dung phản hồi");
      return;
    }

    try {
      await axiosInstance.put(`/rating/${ratingId}/reply`, {
        reply: replyValue,
      });
      message.success("Phản hồi thành công");
      setReplyingId(null);
      setReplyValue("");
      fetchRatings();
    } catch (err) {
      message.error("Không thể gửi phản hồi");
    }
  };

  const columns: ColumnsType<Rating> = [
    {
      title: "STT",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "Sản phẩm",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          {record.productId?.images?.[0] && (
            <img
              src={record.productId.images[0]}
              alt={record.productId.name}
              className="w-14 h-14 rounded-lg object-cover border"
            />
          )}
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">
              {record.productId?.name}
            </span>
            <span className="text-gray-500 text-sm">
              {record.productId?.price?.toLocaleString("vi-VN")}₫
            </span>
          </div>
        </div>
      ),
      width: "30%",
    },
    {
      title: "Số sao",
      dataIndex: "rating",
      render: (rating: number) => (
        <span className="font-semibold text-yellow-500">{rating} ★</span>
      ),
      width: 100,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
      width: 180,
    },
    {
      title: "Phản hồi",
      render: (_, record) => {
        if (record.reply && record.reply.trim() !== "") {
          return <span className="text-green-600 font-medium">Đã phản hồi</span>;
        }
        
        if (replyingId === record._id) {
          return (
            <div className="space-y-2">
              <Input.TextArea
                value={replyValue}
                onChange={(e) => setReplyValue(e.target.value)}
                placeholder="Nhập phản hồi..."
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  size="small"
                  type="primary"
                  onClick={() => handleReply(record._id)}
                >
                  Gửi
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setReplyingId(null);
                    setReplyValue("");
                  }}
                >
                  Hủy
                </Button>
              </div>
            </div>
          );
        }
        
        return (
          <Button
            size="small"
            type="primary"
            className="admin-primary-button"
            onClick={() => {
              setReplyingId(record._id);
              setReplyValue("");
            }}
          >
            Trả lời
          </Button>
        );
      },
      width: 200,
    },
    {
      title: "Hành động",
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center">
          <Tooltip title="Xem chi tiết">
            <Button
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/admin/ratings/${record._id}`)}
            />
          </Tooltip>
        </div>
      ),
      width: 120,
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-lg rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-4">Danh sách đánh giá</h2>

        {/* Bộ lọc */}
        <div className="flex flex-wrap gap-4 mb-4">
          <Search
            placeholder="Tìm theo tên sản phẩm"
            allowClear
            onSearch={(value) => setFilters({ ...filters, search: value })}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Số sao"
            allowClear
            onChange={(value) =>
              setFilters({ ...filters, rating: value || null })
            }
            style={{ width: 120 }}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <Option key={star} value={star}>
                {star} ★
              </Option>
            ))}
          </Select>
          <Checkbox
            checked={filters.hasImage}
            onChange={(e) =>
              setFilters({ ...filters, hasImage: e.target.checked })
            }
          >
            Có ảnh
          </Checkbox>
          <Select
            defaultValue="all"
            style={{ width: 160 }}
            onChange={(value) =>
              setFilters({ ...filters, replied: value as any })
            }
          >
            <Option value="all">Tất cả</Option>
            <Option value="yes">Đã phản hồi</Option>
            <Option value="no">Chưa phản hồi</Option>
          </Select>
          <Radio.Group
            value={filters.sortDate}
            onChange={(e) =>
              setFilters({ ...filters, sortDate: e.target.value })
            }
          >
            <Radio.Button value="desc">Mới nhất</Radio.Button>
            <Radio.Button value="asc">Cũ nhất</Radio.Button>
          </Radio.Group>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </div>
    </div>
  );
};

export default RatingList;
