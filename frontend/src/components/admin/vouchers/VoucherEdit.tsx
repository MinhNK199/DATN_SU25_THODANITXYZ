import React, { useEffect, useState } from "react";
import { Form, Input, Select, DatePicker, InputNumber, Switch, Button, message as antdMessage, Card, Row, Col } from "antd";
import { useNotification } from "../../../hooks/useNotification";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { updateCoupon, getCouponById } from "../coupons/api";
import { Coupon, UpdateCouponData } from "../../../interfaces/Coupon";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

const VoucherEdit: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [coupon, setCoupon] = useState<Coupon | null>(null);
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { success, error } = useNotification();
    const location = useLocation();

    useEffect(() => {
        if (id) {
            fetchCoupon();
        } else if (location.state?.coupon) {
            // Nếu có data từ navigation state
            setCoupon(location.state.coupon);
            populateForm(location.state.coupon);
        }
    }, [id, location.state]);

    const fetchCoupon = async () => {
        if (!id) return;

        setLoading(true);
        try {
            const couponData = await getCouponById(id);
            setCoupon(couponData);
            populateForm(couponData);
        } catch (error) {
            error("Không thể tải thông tin voucher");
            navigate("/admin/vouchers");
        } finally {
            setLoading(false);
        }
    };

    const populateForm = (couponData: Coupon) => {
        form.setFieldsValue({
            code: couponData.code,
            name: couponData.name,
            description: couponData.description,
            type: couponData.type,
            discount: couponData.discount,
            maxDiscount: couponData.maxDiscount,
            minAmount: couponData.minAmount,
            usageLimit: couponData.usageLimit,
            userUsageLimit: couponData.userUsageLimit,
            startDate: dayjs(couponData.startDate),
            endDate: dayjs(couponData.endDate),
            isActive: couponData.isActive,
            applyToAllProducts: couponData.applyToAllProducts,
            applicableProducts: couponData.applicableProducts || [],
        });
    };

    const handleSubmit = async (values: any) => {
        if (!id) return;

        setLoading(true);
        try {
            const updateData: UpdateCouponData = {
                ...values,
                startDate: values.startDate.toISOString(),
                endDate: values.endDate.toISOString(),
            };

            await updateCoupon(id, updateData);
            success("Cập nhật voucher thành công");
            navigate("/admin/vouchers");
        } catch (error: any) {
            error(error.message || "Có lỗi xảy ra khi cập nhật voucher");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/admin/vouchers");
    };

    if (loading && !coupon) {
        return <div className="p-6">Đang tải...</div>;
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <Card title="Sửa voucher" className="max-w-4xl mx-auto">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    className="space-y-4"
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Mã voucher"
                                name="code"
                                rules={[{ required: true, message: "Vui lòng nhập mã voucher" }]}
                            >
                                <Input placeholder="Nhập mã voucher" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Tên voucher"
                                name="name"
                                rules={[{ required: true, message: "Vui lòng nhập tên voucher" }]}
                            >
                                <Input placeholder="Nhập tên voucher" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Mô tả"
                        name="description"
                    >
                        <TextArea rows={3} placeholder="Nhập mô tả voucher" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label="Loại giảm giá"
                                name="type"
                                rules={[{ required: true, message: "Vui lòng chọn loại giảm giá" }]}
                            >
                                <Select placeholder="Chọn loại giảm giá">
                                    <Option value="percentage">Phần trăm</Option>
                                    <Option value="fixed">Cố định</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Giá trị giảm"
                                name="discount"
                                rules={[{ required: true, message: "Vui lòng nhập giá trị giảm" }]}
                            >
                                <InputNumber
                                    placeholder="Nhập giá trị giảm"
                                    style={{ width: "100%" }}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                    parser={(value) => value!.replace(/\$\s?|(.*)/g, '').replace(/\./g, '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Giá trị tối đa"
                                name="maxDiscount"
                            >
                                <InputNumber
                                    placeholder="Nhập giá trị tối đa"
                                    style={{ width: "100%" }}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                    parser={(value) => value!.replace(/\$\s?|(.*)/g, '').replace(/\./g, '')}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label="Đơn tối thiểu"
                                name="minAmount"
                                rules={[{ required: true, message: "Vui lòng nhập đơn tối thiểu" }]}
                            >
                                <InputNumber
                                    placeholder="Nhập đơn tối thiểu"
                                    style={{ width: "100%" }}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                    parser={(value) => value!.replace(/\$\s?|(.*)/g, '').replace(/\./g, '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Giới hạn sử dụng"
                                name="usageLimit"
                                rules={[{ required: true, message: "Vui lòng nhập giới hạn sử dụng" }]}
                            >
                                <InputNumber
                                    placeholder="Nhập giới hạn sử dụng"
                                    style={{ width: "100%" }}
                                    min={1}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Giới hạn/user"
                                name="userUsageLimit"
                                rules={[{ required: true, message: "Vui lòng nhập giới hạn/user" }]}
                            >
                                <InputNumber
                                    placeholder="Nhập giới hạn/user"
                                    style={{ width: "100%" }}
                                    min={1}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Ngày bắt đầu"
                                name="startDate"
                                rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    showTime
                                    format="DD/MM/YYYY HH:mm"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Ngày kết thúc"
                                name="endDate"
                                rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc" }]}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    showTime
                                    format="DD/MM/YYYY HH:mm"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Trạng thái"
                                name="isActive"
                                valuePropName="checked"
                            >
                                <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Áp dụng cho tất cả sản phẩm"
                                name="applyToAllProducts"
                                valuePropName="checked"
                            >
                                <Switch checkedChildren="Có" unCheckedChildren="Không" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Sản phẩm áp dụng"
                        name="applicableProducts"
                        extra="Chỉ hiển thị khi không áp dụng cho tất cả sản phẩm"
                    >
                        <Select
                            mode="multiple"
                            placeholder="Chọn sản phẩm áp dụng"
                            disabled={form.getFieldValue('applyToAllProducts')}
                        >
                            {/* TODO: Load products from API */}
                            <Option value="product1">Sản phẩm 1</Option>
                            <Option value="product2">Sản phẩm 2</Option>
                        </Select>
                    </Form.Item>

                    <div className="flex justify-end space-x-4">
                        <Button onClick={handleCancel}>
                            Hủy
                        </Button>
                        <Button type="primary" className="admin-primary-button" htmlType="submit" loading={loading}>
                            Cập nhật voucher
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default VoucherEdit;
