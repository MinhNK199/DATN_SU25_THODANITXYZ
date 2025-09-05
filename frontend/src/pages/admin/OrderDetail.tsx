import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getOrderById,
  updateOrderStatus,
  updateOrderPaidCOD,
  getValidOrderStatusOptions,
} from "../../services/orderApi";
import { Order } from "../../interfaces/Order";
import {
  Card,
  Spin,
  Alert,
  Row,
  Col,
  Descriptions,
  Table,
  Tag,
  Timeline,
  Button,
  Select,
  Input,
  Form,
  message,
  Steps,
  Image,
} from "antd";
import {
  FaUser,
  FaTruck,
  FaBox,
  FaMoneyBillWave,
  FaInfoCircle,
  FaRegCheckCircle,
  FaRegClock,
  FaShippingFast,
  FaBan,
} from "react-icons/fa";

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const statusOptions = {
  draft: "Đang tạo",
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  shipped: "Đang giao hàng",
  delivered_success: "Giao hàng thành công",
  delivered_failed: "Giao hàng thất bại",
  partially_delivered: "Giao hàng một phần",
  returned: "Hoàn hàng",
  on_hold: "Tạm dừng",
  completed: "Thành công",
  cancelled: "Đã hủy",
  refund_requested: "Yêu cầu hoàn tiền",
  refunded: "Hoàn tiền thành công",
  payment_failed: "Thanh toán thất bại",
};

// ✅ CẬP NHẬT: Logic transitions nhất quán với backend
const nextStatusOptions = (currentStatus: string) => {
  const transitions = {
    draft: ["pending", "cancelled"],
    pending: ["confirmed", "cancelled", "on_hold"],
    confirmed: ["processing", "cancelled", "on_hold"],
    processing: ["shipped", "cancelled", "on_hold"],
    shipped: ["delivered_success", "delivered_failed", "partially_delivered"],
    delivered_success: ["completed", "returned"],
    delivered_failed: ["shipped", "cancelled"],
    partially_delivered: ["shipped", "delivered_success"],
    returned: ["refund_requested", "refunded"],
    on_hold: ["processing", "cancelled"],
    refund_requested: ["refunded", "delivered_success"],
    completed: [],
    cancelled: [],
    refunded: [],
    payment_failed: ["cancelled"],
  };
  return transitions[currentStatus] || [];
};

// ✅ THÊM: Hàm lấy màu sắc cho từng trạng thái
const getStatusColor = (status: string) => {
  const colorMap = {
    draft: "#6B7280",
    pending: "#3B82F6",
    confirmed: "#10B981",
    processing: "#F59E0B",
    shipped: "#8B5CF6",
    delivered_success: "#059669",
    delivered_failed: "#DC2626",
    partially_delivered: "#F97316",
    returned: "#7C3AED",
    on_hold: "#6B7280",
    completed: "#059669",
    cancelled: "#DC2626",
    refund_requested: "#F59E0B",
    refunded: "#3B82F6",
    payment_failed: "#DC2626",
  };
  return colorMap[status] || "#6B7280";
};

// ✅ THÊM: Hàm lấy icon cho từng trạng thái
const getStatusIcon = (status: string) => {
  const iconMap = {
    draft: "📝",
    pending: "⏳",
    confirmed: "✅",
    processing: "📦",
    shipped: "🚚",
    delivered_success: "🎉",
    delivered_failed: "❌",
    partially_delivered: "📦",
    returned: "↩️",
    on_hold: "⏸️",
    completed: "🏆",
    cancelled: "🚫",
    refund_requested: "💰",
    refunded: "💸",
    payment_failed: "💳",
  };
  return iconMap[status] || "❓";
};

const getStepStatus = (
  orderStatus: string,
  stepStatus: string
): "finish" | "process" | "wait" | "error" => {
  // ✅ CẬP NHẬT: Các bước chính cho hiển thị tiến trình
  const statusOrder = [
    "draft",
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered_success",
    "completed",
  ];
  
  if (orderStatus === "cancelled" || orderStatus === "delivered_failed" || orderStatus === "payment_failed")
    return "error";
    
  if (orderStatus === "on_hold") return "wait";
  
  const currentIndex = statusOrder.indexOf(orderStatus);
  const stepIndex = statusOrder.indexOf(stepStatus);

  if (stepIndex < currentIndex) return "finish";
  if (stepIndex === currentIndex) return "process";
  return "wait";
};

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [form] = Form.useForm();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);
  const [validStatusOptions, setValidStatusOptions] = useState<string[]>([]);

  const fetchOrder = () => {
    if (id) {
      setLoading(true);
      getOrderById(id)
        .then(async (data) => {
          setOrder(data);
          setLoading(false);
          // Lấy danh sách trạng thái hợp lệ
          try {
            const validOptions = await getValidOrderStatusOptions(id);
            setValidStatusOptions(validOptions);
          } catch {
            setValidStatusOptions([]);
          }
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (values: {
    status: string;
    note: string;
  }) => {
    if (id) {
      setUpdating(true);
      try {
        const updatedOrder = await updateOrderStatus(
          id,
          values.status,
          values.note
        );
        setOrder(updatedOrder);
        form.resetFields();
        message.success("Cập nhật trạng thái đơn hàng thành công!");
        
        // ✅ CẬP NHẬT: Reload lại danh sách trạng thái có thể chuyển đổi
        try {
          const newValidOptions = await getValidOrderStatusOptions(id);
          setValidStatusOptions(newValidOptions);
          console.log("Đã cập nhật danh sách trạng thái mới:", newValidOptions);
        } catch (error) {
          console.error("Lỗi khi reload trạng thái:", error);
          setValidStatusOptions([]);
        }
        
        // If the final status is 'delivered', we can trigger something for statistics here if needed.
        // For now, the backend handles stats aggregation.
        if (values.status === "delivered" && !order?.isPaid) {
          // Maybe auto-update payment status for COD? Depends on business logic.
        }
      } catch (err: any) {
        message.error(err.message || "Cập nhật thất bại!");
      } finally {
        setUpdating(false);
      }
    }
  };

  if (loading) {
    return (
      <Spin
        size="large"
        className="flex justify-center items-center h-screen"
      />
    );
  }

  if (error) {
    return <Alert message="Lỗi" description={error} type="error" showIcon />;
  }

  if (!order) {
    return <Alert message="Không tìm thấy đơn hàng" type="warning" showIcon />;
  }

  const itemColumns = [
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      render: (image: string) => <Image width={60} src={image} />,
    },
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <Link to={`/product/${record.product}`}>{text}</Link>
      ),
    },
    { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price: number) => price.toLocaleString() + "₫",
    },
    {
      title: "Thành tiền",
      key: "total",
      render: (_: any, record: any) =>
        (record.quantity * record.price).toLocaleString() + "₫",
    },
  ];

  const availableNextStatuses = nextStatusOptions(order.status);
  const currentStep = [
    "draft",
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered_success",
    "completed",
  ].indexOf(order.status);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Chi tiết đơn hàng #{order._id.substring(0, 8)}
      </h1>

      <Card>
        <Steps
          current={currentStep}
          status={
            order.status === "cancelled" || order.status === "delivered_failed" || order.status === "payment_failed"
              ? "error"
              : undefined
          }
        >
          <Step
            title="Đang tạo"
            status={getStepStatus(order.status, "draft")}
            icon={<FaBox />}
          />
          <Step
            title="Chờ xác nhận"
            status={getStepStatus(order.status, "pending")}
            icon={<FaRegClock />}
          />
          <Step
            title="Đã xác nhận"
            status={getStepStatus(order.status, "confirmed")}
            icon={<FaRegCheckCircle />}
          />
          <Step
            title="Đang xử lý"
            status={getStepStatus(order.status, "processing")}
            icon={<FaBox />}
          />
          <Step
            title="Đang giao hàng"
            status={getStepStatus(order.status, "shipped")}
            icon={<FaShippingFast />}
          />
          {order.status === "cancelled" ? (
            <Step title="Đã hủy" status="error" icon={<FaBan />} />
          ) : order.status === "delivered_failed" ? (
            <Step title="Giao hàng thất bại" status="error" icon={<FaBan />} />
          ) : (
            <Step
              title="Giao hàng thành công"
              status={getStepStatus(order.status, "delivered_success")}
              icon={<FaRegCheckCircle />}
            />
          )}
          {order.status === "refund_requested" && (
            <Step
              title="Đang xử lý hoàn tiền"
              status={getStepStatus(order.status, "refund_requested")}
              icon={<FaMoneyBillWave style={{ color: "#d63384" }} />}
            />
          )}
          <Step
            title="Thành công"
            status={getStepStatus(order.status, "completed")}
            icon={<FaRegCheckCircle />}
          />
        </Steps>
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <>
                <FaBox className="mr-2" />
                Sản phẩm trong đơn
              </>
            }
            bordered={false}
            className="shadow-sm"
          >
            <Table
              dataSource={order.orderItems}
              columns={itemColumns}
              pagination={false}
              rowKey="product"
            />
          </Card>

          <Card
            title={
              <>
                <FaTruck className="mr-2" />
                Lịch sử trạng thái
              </>
            }
            bordered={false}
            className="shadow-sm mt-6"
          >
            <Timeline>
              {order.statusHistory
                .sort(
                  (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                )
                .map((s, index, arr) => {
                  let statusLabel =
                    statusOptions[s.status as keyof typeof statusOptions] ||
                    s.status;
                  // 1. paid_cod hiển thị rõ ràng
                  if (s.status === "paid_cod") {
                    statusLabel = "Đã thanh toán COD";
                  }
                  // 2. delivered_success sau refund_requested thì là từ chối hoàn tiền
                  if (
                    s.status === "delivered_success" &&
                    arr
                      .slice(0, index)
                      .some((x) => x.status === "refund_requested")
                  ) {
                    statusLabel = "Từ chối hoàn tiền";
                  }
                  return (
                    <Timeline.Item key={index}>
                      <p>
                        <strong>{statusLabel}</strong> -{" "}
                        {new Date(s.date).toLocaleString("vi-VN")}
                      </p>
                      {s.note && (
                        <p className="text-gray-500">Ghi chú: {s.note}</p>
                      )}
                    </Timeline.Item>
                  );
                })}
            </Timeline>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <>
                <FaUser className="mr-2" />
                Thông tin người đặt
              </>
            }
            bordered={false}
            className="shadow-sm mb-6"
          >
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Họ tên">
                {order.user.name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {order.user.email}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card
            title={
              <>
                <FaInfoCircle className="mr-2" />
                Thông tin đơn hàng
              </>
            }
            bordered={false}
            className="shadow-sm"
          >
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Trạng thái hiện tại">
                <Tag color={getStatusColor(order.status)}>
                  {statusOptions[order.status as keyof typeof statusOptions]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {order.paymentMethod}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái thanh toán">
                <div className="flex items-center gap-2">
                  <Tag color={order.isPaid ? "green" : "red"}>
                    {order.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                  </Tag>
                  {order.paymentMethod === "COD" && !order.isPaid && (
                    <Button
                      type="primary"
                      danger
                      size="small"
                      onClick={async () => {
                        try {
                          await updateOrderPaidCOD(order._id);
                          message.success(
                            "Cập nhật trạng thái thanh toán COD thành công!"
                          );
                          fetchOrder();
                        } catch (err: any) {
                          message.error(
                            err.message ||
                              "Cập nhật trạng thái thanh toán thất bại!"
                          );
                        }
                      }}
                      disabled={["delivered_failed", "cancelled", "payment_failed"].includes(
                        order.status
                      )}
                    >
                      Xác nhận thanh toán
                    </Button>
                  )}
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Phí vận chuyển">
                {order.shippingPrice.toLocaleString()}₫
              </Descriptions.Item>
              <Descriptions.Item label="Thuế">
                {order.taxPrice.toLocaleString()}₫
              </Descriptions.Item>
              <Descriptions.Item label="Tổng cộng">
                <span className="font-bold text-lg text-red-600">
                  {order.totalPrice.toLocaleString()}₫
                </span>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card
            title={
              <>
                <FaUser className="mr-2" />
                Thông tin người nhận
              </>
            }
            bordered={false}
            className="shadow-sm mt-6"
          >
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Họ tên">
                {order.shippingAddress.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {order.shippingAddress.address}
              </Descriptions.Item>
              <Descriptions.Item label="Thành phố">
                {order.shippingAddress.city}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {order.shippingAddress.phone}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {validStatusOptions.length > 0 && (
            <Card
              title="Cập nhật trạng thái"
              bordered={false}
              className="shadow-sm mt-6"
            >
              <Form form={form} onFinish={handleStatusUpdate} layout="vertical">
                <Form.Item
                  name="status"
                  label="Trạng thái mới"
                  rules={[
                    { required: true, message: "Vui lòng chọn trạng thái!" },
                  ]}
                >
                  <Select placeholder="Chọn trạng thái tiếp theo">
                    {validStatusOptions.map((s) => (
                      <Option key={s} value={s}>
                        {statusOptions[s as keyof typeof statusOptions]}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="note" label="Ghi chú">
                  <TextArea
                    rows={3}
                    placeholder="Thêm ghi chú cho lần cập nhật này..."
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={updating}
                    block
                  >
                    Cập nhật
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          )}
          {order.status === "refund_requested" && (
            <Card
              title={
                <span style={{ color: "#d63384" }}>Yêu cầu hoàn tiền</span>
              }
              bordered={false}
              className="shadow-sm mt-6"
            >
              <div className="mb-2 font-semibold">Lý do yêu cầu hoàn tiền:</div>
              <div className="mb-2 text-gray-700">
                {order.statusHistory?.find(
                  (s) => s.status === "refund_requested"
                )?.note || "Không có lý do"}
              </div>
              <div className="mb-4 text-xs text-gray-500">
                Thời gian:{" "}
                {order.statusHistory?.find(
                  (s) => s.status === "refund_requested"
                )
                  ? new Date(
                      order.statusHistory.find(
                        (s) => s.status === "refund_requested"
                      ).date
                    ).toLocaleString("vi-VN")
                  : ""}
              </div>
              <div className="flex gap-3">
                <Button
                  type="primary"
                  danger
                  onClick={async () => {
                    // Đếm số lần yêu cầu hoàn tiền
                    const refundCount =
                      order.statusHistory?.filter(
                        (s) => s.status === "refund_requested"
                      ).length || 0;
                    if (refundCount >= 3) {
                      await updateOrderStatus(
                        order._id,
                        "refunded",
                        "Tự động hoàn tiền do vượt quá 3 lần yêu cầu"
                      );
                      message.success(
                        "Đã hoàn tiền cho khách hàng (tự động do quá 3 lần yêu cầu)!"
                      );
                      fetchOrder();
                      return;
                    }
                    try {
                      await updateOrderStatus(
                        order._id,
                        "refunded",
                        "Chấp nhận hoàn tiền"
                      );
                      message.success("Đã hoàn tiền cho khách hàng!");
                      fetchOrder();
                    } catch (err: any) {
                      message.error(err.message || "Thao tác thất bại!");
                    }
                  }}
                >
                  Chấp nhận hoàn tiền
                </Button>
                <Button onClick={() => setShowRejectModal(true)}>
                  Từ chối
                </Button>
              </div>
            </Card>
          )}
          {/* Modal từ chối hoàn tiền */}
          {showRejectModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowRejectModal(false)}
                >
                  &times;
                </button>
                <h2 className="text-lg font-bold mb-4">
                  Lý do từ chối hoàn tiền
                </h2>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 mb-4"
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối..."
                />
                <div className="flex justify-end gap-2">
                  <Button onClick={() => setShowRejectModal(false)}>Hủy</Button>
                  <Button
                    type="primary"
                    danger
                    loading={rejectLoading}
                    disabled={!rejectReason.trim()}
                    onClick={async () => {
                      setRejectLoading(true);
                      try {
                        await updateOrderStatus(
                          order._id,
                          "delivered_success",
                          rejectReason || "Từ chối hoàn tiền"
                        );
                        message.success("Đã từ chối yêu cầu hoàn tiền!");
                        setShowRejectModal(false);
                        setRejectReason("");
                        fetchOrder();
                      } catch (err: any) {
                        message.error(err.message || "Thao tác thất bại!");
                      } finally {
                        setRejectLoading(false);
                      }
                    }}
                  >
                    Xác nhận
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default OrderDetail;
