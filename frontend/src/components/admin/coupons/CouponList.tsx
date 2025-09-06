import React, { useEffect, useState } from "react";
import { Table, Button, Space, Tag, Modal, message, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getCoupons, deleteCoupon } from "./api";
import { Coupon } from "./api";

const CouponList: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await getCoupons();
      setCoupons(response.coupons || []);
    } catch (error) {
      message.error("Lỗi khi tải danh sách mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteCoupon(id);
      message.success("Xóa mã giảm giá thành công");
      fetchCoupons();
    } catch (error) {
      message.error("Lỗi khi xóa mã giảm giá");
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'percentage': return 'blue';
      case 'fixed': return 'green';
      case 'shipping': return 'orange';
      default: return 'default';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'percentage': return 'Phần trăm';
      case 'fixed': return 'Cố định';
      case 'shipping': return 'Vận chuyển';
      default: return type;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const columns = [
    {
      title: "Mã",
      dataIndex: "code",
      key: "code",
      render: (code: string) => (
        <span className="font-mono font-bold text-blue-600">{code}</span>
      ),
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <span className="font-medium">{name}</span>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>{getTypeText(type)}</Tag>
      ),
    },
    {
      title: "Giá trị",
      dataIndex: "discount",
      key: "discount",
      render: (discount: number, record: Coupon) => {
        if (record.type === 'percentage') {
          return `${discount}%`;
        } else if (record.type === 'shipping') {
          return "Miễn phí ship";
        } else {
          return formatPrice(discount);
        }
      },
    },
    {
      title: "Đơn tối thiểu",
      dataIndex: "minAmount",
      key: "minAmount",
      render: (minAmount: number) => formatPrice(minAmount),
    },
    {
      title: "Giảm tối đa",
      dataIndex: "maxDiscount",
      key: "maxDiscount",
      render: (maxDiscount: number) => maxDiscount ? formatPrice(maxDiscount) : "-",
    },
    {
      title: "Đã sử dụng",
      key: "usage",
      render: (record: Coupon) => (
        <span>
          {record.usedCount || 0}/{record.usageLimit || 1}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (record: Coupon) => {
        const now = new Date();
        const startDate = new Date(record.startDate);
        const endDate = new Date(record.endDate);
        const isActive = record.isActive && now >= startDate && now <= endDate;
        
        return (
          <Tag color={isActive ? "green" : "red"}>
            {isActive ? "Hoạt động" : "Không hoạt động"}
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      render: (record: Coupon) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => navigate(`/admin/coupons/edit/${record._id}`)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa mã giảm giá này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý mã giảm giá</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/admin/coupons/add")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Thêm mã giảm giá
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={coupons}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} mã giảm giá`,
          }}
          scroll={{ x: 1000 }}
        />
      </div>
    </div>
  );
};

export default CouponList;
