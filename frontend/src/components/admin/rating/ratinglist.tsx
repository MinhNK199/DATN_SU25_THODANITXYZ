import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Typography,
  Spin,
  message,
  Input,
  Button,
  Form,
  Select,
  DatePicker,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import axios from "axios";
import dayjs from "dayjs";

const { Text } = Typography;
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

interface FilterOptions {
  star?: number | null;
  productId?: string | null;
  dateRange?: [dayjs.Dayjs | null, dayjs.Dayjs | null];
  replyStatus?: "all" | "replied" | "not_replied";
}

const RatingList: React.FC = () => {
  const [data, setData] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyValue, setReplyValue] = useState<string>("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const [filter, setFilter] = useState<FilterOptions>({
    star: null,
    productId: null,
    dateRange: [null, null],
    replyStatus: "all",
  });

  useEffect(() => {
    fetchRatings(pagination.current, pagination.pageSize);
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/product?pageSize=1000");
      if (res.data && Array.isArray(res.data.products)) {
        setProducts(res.data.products);
      } else {
        setProducts([]);
        message.warning("Không lấy được danh sách sản phẩm hoặc dữ liệu trả về không đúng định dạng.");
        console.error("API /api/product trả về dữ liệu không đúng định dạng:", res.data);
      }
    } catch (err) {
      setProducts([]);
      message.error("Lỗi khi lấy danh sách sản phẩm");
      console.error("Lỗi khi fetch /api/product:", err);
    }
  };

  const fetchRatings = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/api/rating", {
        params: { page, limit: pageSize },
      });
      if (res.data && Array.isArray(res.data.data) && res.data.pagination) {
        setData(res.data.data);
        setPagination({
          current: page,
          pageSize,
          total: res.data.pagination.total,
        });
      } else {
        setData([]);
        setPagination({ current: 1, pageSize: 10, total: 0 });
        message.warning("Không lấy được danh sách đánh giá hoặc dữ liệu trả về không đúng định dạng.");
        console.error("API /api/rating trả về dữ liệu không đúng định dạng:", res.data);
      }
    } catch (err) {
      setData([]);
      setPagination({ current: 1, pageSize: 10, total: 0 });
      message.error("Không thể tải danh sách đánh giá");
      console.error("Lỗi khi fetch /api/rating:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination: any) => {
    fetchRatings(pagination.current, pagination.pageSize);
  };

  const handleReply = async (id: string) => {
  if (!replyValue.trim()) {
    message.warning("Vui lòng nhập phản hồi");
    return;
  }
  const token = localStorage.getItem("token");
  if (!token) {
    message.error("Bạn chưa đăng nhập");
    return;
  }
  setReplyLoading(true);
  try {
    await axios.post(
      `http://localhost:5000/api/rating/${id}/reply`,
      { reply: replyValue },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    message.success("Phản hồi thành công");
    setReplyingId(null);
    setReplyValue("");
    fetchRatings(pagination.current, pagination.pageSize);
  } catch (err: any) {
    if (err.response?.status === 401) {
      message.error("Phiên hết hạn, vui lòng đăng nhập lại");
      // nếu cần: navigate("/login");
    } else if (err.response?.data?.error?.code === "ALREADY_REPLIED") {
      message.error("Đánh giá này đã được trả lời và không thể sửa");
    } else {
      message.error("Phản hồi thất bại");
    }
  } finally {
    setReplyLoading(false);
  }
};


  const filterRatings = (ratings: Rating[]) => {
    return ratings.filter((item) => {
      if (filter.star && item.rating !== filter.star) return false;
      if (filter.productId && item.productId._id !== filter.productId) return false;
      if (filter.dateRange && filter.dateRange[0] && filter.dateRange[1]) {
        const created = dayjs(item.createdAt);
        if (
          created.isBefore(filter.dateRange[0].startOf("day")) ||
          created.isAfter(filter.dateRange[1].endOf("day"))
        )
          return false;
      }
      if (filter.replyStatus === "replied" && (!item.reply || item.reply.trim() === "")) return false;
      if (filter.replyStatus === "not_replied" && item.reply && item.reply.trim() !== "") return false;
      return true;
    });
  };

  const columns: ColumnsType<Rating> = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (_text, _record, index) => index + 1,
    },
    {
      title: "Người đánh giá",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">{record.userId?.name}</span>
          <span className="text-gray-500 text-sm">{record.userId?.email}</span>
        </div>
      ),
    },
    {
      title: "Sản phẩm",
      render: (_, record) => (
        <div>
          <div className="text-gray-900">{record.productId?.name}</div>
          <div className="text-gray-500 text-sm">
            {record.productId?.price?.toLocaleString()}₫
          </div>
        </div>
      ),
    },
    {
      title: "Số sao",
      dataIndex: "rating",
      render: (rating: number) => (
        <Tag color={rating >= 4 ? "green" : rating === 3 ? "orange" : "red"}>
          {rating} ★
        </Tag>
      ),
    },
    {
      title: "Bình luận",
      dataIndex: "comment",
      render: (comment: string) => <span>{comment || <i>Không có</i>}</span>,
    },
    {
      title: "Ảnh",
      dataIndex: "images",
      render: (images?: string[]) =>
        images && images.length > 0 ? (
          <div className="flex gap-2">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="img"
                className="w-10 h-10 rounded object-cover border"
              />
            ))}
          </div>
        ) : (
          <span className="text-gray-400">Không có</span>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      render: (date: string) =>
        new Date(date).toLocaleString("vi-VN", {
          dateStyle: "short",
          timeStyle: "short",
        }),
    },
    {
      title: "Phản hồi",
      dataIndex: "reply",
      render: (reply: string, record) =>
        reply && reply.trim() !== "" ? (
          <div className="text-gray-700">{reply}</div>
        ) : replyingId === record._id ? (
          <Form
            onFinish={() => handleReply(record._id)}
            className="flex gap-2"
          >
            <Input
              value={replyValue}
              onChange={(e) => setReplyValue(e.target.value)}
              className="w-60"
              placeholder="Nhập phản hồi"
              disabled={replyLoading}
            />
            <Button type="primary" htmlType="submit" loading={replyLoading}>
              Gửi
            </Button>
            <Button
              onClick={() => {
                setReplyingId(null);
                setReplyValue("");
              }}
              disabled={replyLoading}
            >
              Hủy
            </Button>
          </Form>
        ) : (
          <Button
            size="small"
            type="primary"
            onClick={() => {
              setReplyingId(record._id);
              setReplyValue("");
            }}
          >
            Trả lời
          </Button>
        ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex flex-wrap gap-4 mb-4">
        <Select
          allowClear
          placeholder="Số sao"
          className="w-32"
          value={filter.star}
          onChange={(v) => setFilter((f) => ({ ...f, star: v ?? null }))}
        >
          {[5, 4, 3, 2, 1].map((star) => (
            <Select.Option key={star} value={star}>
              {star} sao
            </Select.Option>
          ))}
        </Select>
        <Select
          allowClear
          placeholder="Sản phẩm"
          className="w-48"
          value={filter.productId}
          onChange={(v) => setFilter((f) => ({ ...f, productId: v ?? null }))}
        >
          {products.map((p) => (
            <Select.Option key={p._id} value={p._id}>
              {p.name}
            </Select.Option>
          ))}
        </Select>
        <RangePicker
          value={filter.dateRange}
          onChange={(dates) =>
            setFilter((f) => ({
              ...f,
              dateRange: dates as [dayjs.Dayjs | null, dayjs.Dayjs | null],
            }))
          }
          format="DD/MM/YYYY"
        />
        <Select
          className="w-40"
          value={filter.replyStatus}
          onChange={(v) => setFilter((f) => ({ ...f, replyStatus: v }))}
        >
          <Select.Option value="all">Tất cả</Select.Option>
          <Select.Option value="replied">Đã trả lời</Select.Option>
          <Select.Option value="not_replied">Chưa trả lời</Select.Option>
        </Select>
        <Button
        type="primary"
          onClick={() =>
            setFilter({
              star: null,
              productId: null,
              dateRange: [null, null],
              replyStatus: "all",
            })
          }
        >
          Đặt lại
        </Button>
      </div>
      <Spin spinning={loading}>
        <div className="bg-white rounded-xl shadow p-4">
          <Table
            columns={columns}
            dataSource={filterRatings(data)}
            rowKey="_id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
            }}
            onChange={handleTableChange}
          />
        </div>
      </Spin>
    </div>
  );
};

export default RatingList;
