import React, { useEffect, useState } from "react";
import { Table, Tag, Space, Typography, Spin, message, Input, Button, Form, Select, DatePicker } from "antd";
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

  // Bộ lọc
  const [filter, setFilter] = useState<FilterOptions>({
    star: null,
    productId: null,
    dateRange: [null, null],
    replyStatus: "all",
  });

  // Danh sách sản phẩm để lọc (giả sử bạn có API lấy danh sách sản phẩm)
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products?limit=1000");
      setProducts(res.data.data || []);
    } catch {
      setProducts([]);
    }
  };

  const fetchRatings = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/rating", {
        params: { page, limit: pageSize },
      });
      setData(res.data.data);
      setPagination({
        current: page,
        pageSize,
        total: res.data.pagination.total,
      });
    } catch (err) {
      message.error("Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings(pagination.current, pagination.pageSize);
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  const handleTableChange = (pagination: any) => {
    fetchRatings(pagination.current, pagination.pageSize);
  };

  const handleReply = async (id: string) => {
    if (!replyValue.trim()) {
      message.warning("Vui lòng nhập nội dung phản hồi!");
      return;
    }
    setReplyLoading(true);
    try {
      await axios.post(`http://localhost:5000/api/rating/${id}/reply`, { reply: replyValue });
      message.success("Phản hồi thành công");
      setReplyingId(null);
      setReplyValue("");
      fetchRatings(pagination.current, pagination.pageSize);
    } catch (err: any) {
      if (err?.response?.data?.error?.code === "ALREADY_REPLIED") {
        message.error("Đánh giá này đã được trả lời và không thể sửa");
      } else {
        message.error("Phản hồi thất bại");
      }
    } finally {
      setReplyLoading(false);
    }
  };

  // Hàm lọc đánh giá
  const filterRatings = (ratings: Rating[]) => {
    return ratings.filter((item) => {
      // Lọc theo số sao
      if (filter.star && item.rating !== filter.star) return false;
      // Lọc theo sản phẩm
      if (filter.productId && item.productId._id !== filter.productId) return false;
      // Lọc theo ngày đánh giá
      if (filter.dateRange && filter.dateRange[0] && filter.dateRange[1]) {
        const created = dayjs(item.createdAt);
        if (
          created.isBefore(filter.dateRange[0].startOf("day")) ||
          created.isAfter(filter.dateRange[1].endOf("day"))
        )
          return false;
      }
      // Lọc theo trạng thái trả lời
      if (filter.replyStatus === "replied" && (!item.reply || item.reply.trim() === "")) return false;
      if (filter.replyStatus === "not_replied" && item.reply && item.reply.trim() !== "") return false;
      return true;
    });
  };

  const columns: ColumnsType<Rating> = [
    {
      title: "Người đánh giá",
      key: "user",
      render: (_, record) => (
        <span>
          <Text strong>{record.userId?.name}</Text>
          <br />
          <Text type="secondary">{record.userId?.email}</Text>
        </span>
      ),
    },
    {
      title: "Sản phẩm",
      key: "product",
      render: (_, record) => (
        <span>
          <Text>{record.productId?.name}</Text>
          <br />
          <Text type="secondary">{record.productId?.price?.toLocaleString()}₫</Text>
        </span>
      ),
    },
    {
      title: "Số sao",
      dataIndex: "rating",
      key: "rating",
      render: (rating: number) => (
        <Tag color={rating >= 4 ? "green" : rating === 3 ? "orange" : "red"}>
          {rating} ★
        </Tag>
      ),
    },
    {
      title: "Bình luận",
      dataIndex: "comment",
      key: "comment",
      render: (comment: string) => <Text>{comment || <i>Không có</i>}</Text>,
    },
    {
      title: "Ảnh",
      dataIndex: "images",
      key: "images",
      render: (images?: string[]) =>
        images && images.length > 0 ? (
          <Space>
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="rating"
                style={{
                  width: 40,
                  height: 40,
                  objectFit: "cover",
                  borderRadius: 4,
                }}
              />
            ))}
          </Space>
        ) : (
          <Text type="secondary">Không có</Text>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) =>
        new Date(date).toLocaleString("vi-VN", {
          dateStyle: "short",
          timeStyle: "short",
        }),
    },
    {
      title: "Phản hồi",
      dataIndex: "reply",
      key: "reply",
      render: (reply: string, record) =>
        // Nếu đã có phản hồi thì chỉ hiển thị, không cho sửa
        reply && reply.trim() !== "" ? (
          <Text>{reply}</Text>
        ) : replyingId === record._id ? (
          <Form
            onFinish={() => handleReply(record._id)}
            style={{ display: "flex", gap: 8 }}
          >
            <Input
              value={replyValue}
              onChange={(e) => setReplyValue(e.target.value)}
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
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="Số sao"
          style={{ width: 120 }}
          value={filter.star}
          onChange={(v) => setFilter((f) => ({ ...f, star: v ?? null }))}
        >
          <Select.Option value={5}>5 sao</Select.Option>
          <Select.Option value={4}>4 sao</Select.Option>
          <Select.Option value={3}>3 sao</Select.Option>
          <Select.Option value={2}>2 sao</Select.Option>
          <Select.Option value={1}>1 sao</Select.Option>
        </Select>
        <Select
          allowClear
          placeholder="Sản phẩm"
          style={{ width: 180 }}
          value={filter.productId}
          onChange={(v) => setFilter((f) => ({ ...f, productId: v ?? null }))}
        >
          {products.map((product) => (
            <Select.Option key={product._id} value={product._id}>
              {product.name}
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
          value={filter.replyStatus}
          style={{ width: 150 }}
          onChange={(v) => setFilter((f) => ({ ...f, replyStatus: v }))}
        >
          <Select.Option value="all">Tất cả</Select.Option>
          <Select.Option value="replied">Đã trả lời</Select.Option>
          <Select.Option value="not_replied">Chưa trả lời</Select.Option>
        </Select>
        <Button onClick={() => setFilter({
          star: null,
          productId: null,
          dateRange: [null, null],
          replyStatus: "all"
        })}>
          Đặt lại
        </Button>
      </div>
      <Spin spinning={loading}>
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
      </Spin>
    </div>
  );
};

export default RatingList;