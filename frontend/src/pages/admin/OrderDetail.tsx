import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOrderById, updateOrderStatus } from '../../services/orderApi';
import { Order } from '../../interfaces/Order';
import { Card, Spin, Alert, Row, Col, Descriptions, Table, Tag, Timeline, Button, Select, Input, Form, message, Steps, Image } from 'antd';
import { FaUser, FaTruck, FaBox, FaMoneyBillWave, FaInfoCircle, FaRegCheckCircle, FaRegClock, FaShippingFast, FaBan } from 'react-icons/fa';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const statusOptions = {
    pending: 'Chờ xác nhận',
    processing: 'Đang xử lý',
    shipped: 'Đang giao hàng',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
};

const nextStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
        case 'pending':
            return ['processing', 'cancelled'];
        case 'processing':
            return ['shipped', 'cancelled'];
        case 'shipped':
            return ['delivered', 'cancelled'];
        default:
            return [];
    }
}

const getStepStatus = (orderStatus: string, stepStatus: string): "finish" | "process" | "wait" | "error" => {
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    if (orderStatus === 'cancelled') return 'error';
    const currentIndex = statusOrder.indexOf(orderStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (stepIndex < currentIndex) return 'finish';
    if (stepIndex === currentIndex) return 'process';
    return 'wait';
}

const OrderDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [form] = Form.useForm();

    const fetchOrder = () => {
        if (id) {
            setLoading(true);
            getOrderById(id)
                .then(data => {
                    setOrder(data);
                    setLoading(false);
                })
                .catch(err => {
                    setError(err.message);
                    setLoading(false);
                });
        }
    }

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const handleStatusUpdate = async (values: { status: string; note: string }) => {
        if (id) {
            setUpdating(true);
            try {
                const updatedOrder = await updateOrderStatus(id, values.status, values.note);
                setOrder(updatedOrder);
                form.resetFields();
                message.success('Cập nhật trạng thái đơn hàng thành công!');
                // If the final status is 'delivered', we can trigger something for statistics here if needed.
                // For now, the backend handles stats aggregation.
                if (values.status === 'delivered' && !order?.isPaid) {
                     // Maybe auto-update payment status for COD? Depends on business logic.
                }

            } catch (err: any) {
                message.error(err.message || 'Cập nhật thất bại!');
            } finally {
                setUpdating(false);
            }
        }
    };

    if (loading) {
        return <Spin size="large" className="flex justify-center items-center h-screen" />;
    }

    if (error) {
        return <Alert message="Lỗi" description={error} type="error" showIcon />;
    }

    if (!order) {
        return <Alert message="Không tìm thấy đơn hàng" type="warning" showIcon />;
    }

    const itemColumns = [
        { 
            title: 'Hình ảnh', 
            dataIndex: 'image', 
            key: 'image', 
            render: (image: string) => <Image width={60} src={image} />
        },
        { 
            title: 'Sản phẩm', 
            dataIndex: 'name', 
            key: 'name',
            render: (text: string, record: any) => <Link to={`/product/${record.product}`}>{text}</Link>
        },
        { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
        { title: 'Giá', dataIndex: 'price', key: 'price', render: (price: number) => price.toLocaleString() + '₫' },
        { title: 'Thành tiền', key: 'total', render: (_: any, record: any) => (record.quantity * record.price).toLocaleString() + '₫' },
    ];
    
    const availableNextStatuses = nextStatusOptions(order.status);
    const currentStep = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Chi tiết đơn hàng #{order._id.substring(0,8)}</h1>
            
            <Card>
                <Steps current={currentStep} status={order.status === 'cancelled' ? 'error' : undefined}>
                    <Step title="Chờ xác nhận" status={getStepStatus(order.status, 'pending')} icon={<FaRegClock />} />
                    <Step title="Đang xử lý" status={getStepStatus(order.status, 'processing')} icon={<FaBox />} />
                    <Step title="Đang giao hàng" status={getStepStatus(order.status, 'shipped')} icon={<FaShippingFast />} />
                    {order.status === 'cancelled' 
                        ? <Step title="Đã hủy" status="error" icon={<FaBan />} />
                        : <Step title="Đã giao" status={getStepStatus(order.status, 'delivered')} icon={<FaRegCheckCircle />} />
                    }
                </Steps>
            </Card>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card title={<><FaBox className="mr-2" />Sản phẩm trong đơn</>} bordered={false} className="shadow-sm">
                        <Table dataSource={order.orderItems} columns={itemColumns} pagination={false} rowKey="product" />
                    </Card>

                    <Card title={<><FaTruck className="mr-2" />Lịch sử trạng thái</>} bordered={false} className="shadow-sm mt-6">
                        <Timeline>
                            {order.statusHistory.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((s, index) => (
                                <Timeline.Item key={index}>
                                    <p><strong>{statusOptions[s.status as keyof typeof statusOptions]}</strong> - {new Date(s.date).toLocaleString('vi-VN')}</p>
                                    {s.note && <p className="text-gray-500">Ghi chú: {s.note}</p>}
                                </Timeline.Item>
                            ))}
                        </Timeline>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title={<><FaUser className="mr-2" />Thông tin người đặt</>} bordered={false} className="shadow-sm mb-6">
                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Họ tên">{order.user.name}</Descriptions.Item>
                            <Descriptions.Item label="Email">{order.user.email}</Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Card title={<><FaInfoCircle className="mr-2" />Thông tin đơn hàng</>} bordered={false} className="shadow-sm">
                         <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Trạng thái hiện tại"><Tag color="blue">{statusOptions[order.status as keyof typeof statusOptions]}</Tag></Descriptions.Item>
                            <Descriptions.Item label="Phương thức thanh toán">{order.paymentMethod}</Descriptions.Item>
                            <Descriptions.Item label="Trạng thái thanh toán">
                                <Tag color={order.isPaid ? 'green' : 'red'}>{order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Phí vận chuyển">{order.shippingPrice.toLocaleString()}₫</Descriptions.Item>
                            <Descriptions.Item label="Thuế">{order.taxPrice.toLocaleString()}₫</Descriptions.Item>
                            <Descriptions.Item label="Tổng cộng">
                                <span className="font-bold text-lg text-red-600">{order.totalPrice.toLocaleString()}₫</span>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Card title={<><FaUser className="mr-2" />Thông tin người nhận</>} bordered={false} className="shadow-sm mt-6">
                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Họ tên">{order.shippingAddress.fullName}</Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ">{order.shippingAddress.address}</Descriptions.Item>
                            <Descriptions.Item label="Thành phố">{order.shippingAddress.city}</Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">{order.shippingAddress.phone}</Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {availableNextStatuses.length > 0 && (
                        <Card title="Cập nhật trạng thái" bordered={false} className="shadow-sm mt-6">
                            <Form form={form} onFinish={handleStatusUpdate} layout="vertical">
                                <Form.Item name="status" label="Trạng thái mới" rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}>
                                    <Select placeholder="Chọn trạng thái tiếp theo">
                                        {availableNextStatuses.map(s => <Option key={s} value={s}>{statusOptions[s as keyof typeof statusOptions]}</Option>)}
                                    </Select>
                                </Form.Item>
                                <Form.Item name="note" label="Ghi chú">
                                    <TextArea rows={3} placeholder="Thêm ghi chú cho lần cập nhật này..." />
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" loading={updating} block>
                                        Cập nhật
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default OrderDetail; 