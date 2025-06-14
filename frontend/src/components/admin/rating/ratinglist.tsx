import React, { useEffect, useState } from "react";
import { Table, Tag, Space, Typography, Spin, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import axios from "axios";

const { Text } = Typography;

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
}

const RatingList: React.FC = () => {
  const [data, setData] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

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
    // eslint-disable-next-line
  }, []);

  const handleTableChange = (pagination: any) => {
    fetchRatings(pagination.current, pagination.pageSize);
  };

  const columns: ColumnsType<Rating> = [
    {
      title: "Người đánh giá",
      dataIndex: ["userId", "name"],
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
      dataIndex: ["productId", "name"],
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
      render: (comment: string) => (
        <Text>{comment || <i>Không có</i>}</Text>
      ),
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
                style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }}
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
        new Date(date).toLocaleString("vi-VN"),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="_id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
        }}
        onChange={handleTableChange}
      />
    </Spin>
  );
};

export default RatingList;