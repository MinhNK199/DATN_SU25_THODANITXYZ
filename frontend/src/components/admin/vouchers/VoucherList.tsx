import React, { useEffect, useState } from "react";
import { Table, Button, Modal, message, Popconfirm, Space, Tag, Card, Row, Col, Statistic, Divider, Badge } from "antd";
import { useNavigate } from "react-router-dom";
import { getCoupons, deleteCoupon } from "../coupons/api";
import { Coupon } from "../../../interfaces/Coupon";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  DollarOutlined,
  PercentageOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";

const VoucherList: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await getCoupons(1, 1000);
      setCoupons(response.coupons);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setDetailModalVisible(true);
  };

  const handleEdit = (coupon: Coupon) => {
    navigate(`/admin/vouchers/edit/${coupon._id}`, { state: { coupon } });
  };

  const handleSoftDelete = async (coupon: Coupon) => {
    try {
      await deleteCoupon(coupon._id, false); // Soft delete
      message.success("Đã tạm dừng voucher thành công");
      fetchCoupons();
    } catch (error) {
      message.error("Có lỗi xảy ra khi tạm dừng voucher");
    }
  };

  const handleHardDelete = async (coupon: Coupon) => {
    try {
      await deleteCoupon(coupon._id, true); // Hard delete
      message.success("Đã xóa voucher thành công");
      fetchCoupons();
    } catch (error) {
      message.error("Có lỗi xảy ra khi xóa voucher");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Voucher</h1>
        <Button
          type="primary"
          size="large"
          onClick={() => navigate("/admin/vouchers/add")}
          className="bg-gradient-to-r from-blue-500 to-purple-500 border-none hover:from-blue-600 hover:to-purple-600 shadow-lg"
        >
          Thêm voucher
        </Button>
      </div>
      <Table
        className="mt-4"
        dataSource={coupons}
        loading={loading}
        columns={[
          { title: "Mã", dataIndex: "code" },
          { title: "Tên", dataIndex: "name" },
          { title: "Loại", dataIndex: "type", render: (type: string) => type === "percentage" ? "Phần trăm" : "Cố định" },
          {
            title: "Giá trị", dataIndex: "discount", render: (discount: number, record: Coupon) =>
              record.type === "percentage" ? `${discount}%` : `${discount.toLocaleString()}đ`
          },
          {
            title: "Giá trị tối đa", dataIndex: "maxDiscount", render: (maxDiscount: number) =>
              maxDiscount ? `${maxDiscount.toLocaleString()}đ` : "Không giới hạn"
          },
          { title: "Đơn tối thiểu", dataIndex: "minAmount", render: (minAmount: number) => `${minAmount.toLocaleString()}đ` },
          { title: "Ngày bắt đầu", dataIndex: "startDate", render: (d: string) => d ? new Date(d).toLocaleString() : "" },
          { title: "Ngày kết thúc", dataIndex: "endDate", render: (d: string) => d ? new Date(d).toLocaleString() : "" },
          {
            title: "Trạng thái", dataIndex: "isActive", render: (isActive: boolean) =>
              <span className={isActive ? "text-green-600" : "text-red-600"}>
                {isActive ? "Hoạt động" : "Tạm dừng"}
              </span>
          },
          {
            title: "Áp dụng", dataIndex: "applyToAllProducts", render: (applyToAll: boolean) =>
              applyToAll ? "Tất cả sản phẩm" : "Sản phẩm cụ thể"
          },
          {
            title: "Thao tác",
            key: "actions",
            width: 200,
            render: (_, record: Coupon) => (
              <Space size="small">
                <Button
                  type="primary"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetail(record)}
                  title="Xem chi tiết"
                  className="bg-blue-500 hover:bg-blue-600 border-blue-500"
                />
                <Button
                  type="default"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                  title="Sửa"
                  className="border-orange-500 text-orange-500 hover:bg-orange-50"
                />
                <Popconfirm
                  title="Tạm dừng voucher"
                  description="Bạn có chắc muốn tạm dừng voucher này?"
                  onConfirm={() => handleSoftDelete(record)}
                  okText="Có"
                  cancelText="Không"
                  okButtonProps={{ className: "bg-yellow-500 hover:bg-yellow-600 border-yellow-500" }}
                >
                  <Button
                    type="default"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    title="Tạm dừng"
                    className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                  />
                </Popconfirm>
                <Popconfirm
                  title="Xóa vĩnh viễn"
                  description="Bạn có chắc muốn xóa voucher này vĩnh viễn? Hành động này không thể hoàn tác."
                  onConfirm={() => handleHardDelete(record)}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{
                    danger: true,
                    className: "bg-red-500 hover:bg-red-600 border-red-500"
                  }}
                >
                  <Button
                    type="default"
                    size="small"
                    danger
                    title="Xóa vĩnh viễn"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    Xóa
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <InfoCircleOutlined className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Chi tiết voucher
            </span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            className="bg-gradient-to-r from-blue-500 to-purple-500 border-none hover:from-blue-600 hover:to-purple-600"
            onClick={() => setDetailModalVisible(false)}
          >
            Đóng
          </Button>
        ]}
        width={900}
        className="voucher-detail-modal"
        styles={{
          body: { maxHeight: '80vh', overflowY: 'auto' },
          header: { borderBottom: '1px solid #f0f0f0' }
        }}
      >
        {selectedCoupon && (
          <div className="space-y-6">
            {/* Header Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-l-blue-500">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {selectedCoupon.code.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{selectedCoupon.name}</h3>
                      <p className="text-sm text-gray-600 font-mono bg-white px-2 py-1 rounded border">
                        {selectedCoupon.code}
                      </p>
                    </div>
                  </div>
                </Col>
                <Col span={12} className="text-right">
                  <Badge
                    status={selectedCoupon.isActive ? "success" : "error"}
                    text={
                      <span className={`font-semibold ${selectedCoupon.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedCoupon.isActive ? "Đang hoạt động" : "Tạm dừng"}
                      </span>
                    }
                  />
                </Col>
              </Row>
            </Card>

            {/* Description */}
            {selectedCoupon.description && (
              <Card>
                <div className="flex items-start space-x-3">
                  <InfoCircleOutlined className="text-blue-500 text-lg mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Mô tả</h4>
                    <p className="text-gray-600 leading-relaxed">{selectedCoupon.description}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Discount Information */}
            <Card title={
              <div className="flex items-center space-x-2">
                {selectedCoupon.type === "percentage" ?
                  <PercentageOutlined className="text-blue-500" /> :
                  <DollarOutlined className="text-green-500" />
                }
                <span>Thông tin giảm giá</span>
              </div>
            }>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Statistic
                    title="Loại giảm giá"
                    value={selectedCoupon.type === "percentage" ? "Phần trăm" : "Cố định"}
                    prefix={selectedCoupon.type === "percentage" ?
                      <PercentageOutlined className="text-blue-500" /> :
                      <DollarOutlined className="text-green-500" />
                    }
                    valueStyle={{
                      color: selectedCoupon.type === "percentage" ? "#1890ff" : "#52c41a",
                      fontSize: "16px"
                    }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Giá trị giảm"
                    value={selectedCoupon.type === "percentage" ?
                      `${selectedCoupon.discount}%` :
                      `${selectedCoupon.discount.toLocaleString()}đ`
                    }
                    valueStyle={{
                      color: "#fa8c16",
                      fontSize: "20px",
                      fontWeight: "bold"
                    }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Giá trị tối đa"
                    value={selectedCoupon.maxDiscount ?
                      `${selectedCoupon.maxDiscount.toLocaleString()}đ` :
                      "Không giới hạn"
                    }
                    valueStyle={{
                      color: "#722ed1",
                      fontSize: "16px"
                    }}
                  />
                </Col>
              </Row>
            </Card>

            {/* Usage Information */}
            <Card title={
              <div className="flex items-center space-x-2">
                <UserOutlined className="text-purple-500" />
                <span>Thông tin sử dụng</span>
              </div>
            }>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Statistic
                    title="Giới hạn tổng"
                    value={selectedCoupon.usageLimit}
                    suffix="lần"
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Đã sử dụng"
                    value={selectedCoupon.usedCount || 0}
                    suffix="lần"
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Giới hạn/user"
                    value={selectedCoupon.userUsageLimit || 1}
                    suffix="lần"
                    valueStyle={{ color: "#fa8c16" }}
                  />
                </Col>
              </Row>
            </Card>

            {/* Conditions */}
            <Card title={
              <div className="flex items-center space-x-2">
                <ShoppingCartOutlined className="text-orange-500" />
                <span>Điều kiện áp dụng</span>
              </div>
            }>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <ShoppingCartOutlined className="text-orange-500 text-lg" />
                    <div>
                      <p className="text-sm text-gray-600">Đơn tối thiểu</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {selectedCoupon.minAmount.toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {selectedCoupon.applyToAllProducts ?
                      <CheckCircleOutlined className="text-green-500 text-lg" /> :
                      <CloseCircleOutlined className="text-orange-500 text-lg" />
                    }
                    <div>
                      <p className="text-sm text-gray-600">Áp dụng cho</p>
                      <Tag color={selectedCoupon.applyToAllProducts ? "green" : "orange"}>
                        {selectedCoupon.applyToAllProducts ? "Tất cả sản phẩm" : "Sản phẩm cụ thể"}
                      </Tag>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Date Information */}
            <Card title={
              <div className="flex items-center space-x-2">
                <CalendarOutlined className="text-blue-500" />
                <span>Thời gian hiệu lực</span>
              </div>
            }>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <ClockCircleOutlined className="text-blue-500 text-lg" />
                    <div>
                      <p className="text-sm text-gray-600">Ngày bắt đầu</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {new Date(selectedCoupon.startDate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                    <ClockCircleOutlined className="text-red-500 text-lg" />
                    <div>
                      <p className="text-sm text-gray-600">Ngày kết thúc</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {new Date(selectedCoupon.endDate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Applicable Products */}
            {selectedCoupon.applicableProducts && selectedCoupon.applicableProducts.length > 0 && (
              <Card title={
                <div className="flex items-center space-x-2">
                  <ShoppingCartOutlined className="text-green-500" />
                  <span>Sản phẩm áp dụng</span>
                </div>
              }>
                <div className="flex flex-wrap gap-2">
                  {selectedCoupon.applicableProducts.map((productId, index) => (
                    <Tag key={index} color="blue" className="mb-2">
                      {productId}
                    </Tag>
                  ))}
                </div>
              </Card>
            )}

            {/* Metadata */}
            <Card title={
              <div className="flex items-center space-x-2">
                <InfoCircleOutlined className="text-gray-500" />
                <span>Thông tin hệ thống</span>
              </div>
            }>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Ngày tạo</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {new Date(selectedCoupon.createdAt || Date.now()).toLocaleString()}
                    </p>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Cập nhật cuối</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {new Date(selectedCoupon.updatedAt || Date.now()).toLocaleString()}
                    </p>
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VoucherList; 