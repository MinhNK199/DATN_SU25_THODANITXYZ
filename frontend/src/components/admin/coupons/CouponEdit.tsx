import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Select, DatePicker, Switch, Button, Card, message, Row, Col, Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { getCouponById, updateCoupon } from "./api";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

const CouponEdit: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchCoupon = async () => {
      if (!id) return;
      
      setInitialLoading(true);
      try {
        const coupon = await getCouponById(id);
        form.setFieldsValue({
          ...coupon,
          startDate: dayjs(coupon.startDate),
          endDate: dayjs(coupon.endDate),
        });
      } catch (error: any) {
        message.error(error.message || "Lỗi khi tải thông tin mã giảm giá");
        navigate("/admin/coupons");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCoupon();
  }, [id, form, navigate]);

  const handleSubmit = async (values: any) => {
    if (!id) return;
    
    setLoading(true);
    try {
      const couponData = {
        ...values,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      };

      await updateCoupon(id, couponData);
      message.success("Cập nhật mã giảm giá thành công");
      navigate("/admin/coupons");
    } catch (error: any) {
      message.error(error.message || "Lỗi khi cập nhật mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type: string) => {
    // Reset maxDiscount when changing type
    if (type === 'shipping') {
      form.setFieldsValue({ maxDiscount: undefined });
    }
  };

  if (initialLoading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa mã giảm giá</h1>
          <p className="text-gray-600 mt-2">Cập nhật thông tin mã giảm giá</p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Card title="Thông tin cơ bản" className="mb-6">
                <Form.Item
                  label="Mã giảm giá"
                  name="code"
                  rules={[
                    { required: true, message: "Vui lòng nhập mã giảm giá" },
                    { min: 3, message: "Mã giảm giá phải có ít nhất 3 ký tự" },
                    { max: 20, message: "Mã giảm giá không được quá 20 ký tự" },
                  ]}
                >
                  <Input placeholder="VD: SALE2024" className="uppercase" />
                </Form.Item>

                <Form.Item
                  label="Tên mã giảm giá"
                  name="name"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên mã giảm giá" },
                    { max: 100, message: "Tên không được quá 100 ký tự" },
                  ]}
                >
                  <Input placeholder="VD: Giảm giá 20% cho đơn hàng đầu tiên" />
                </Form.Item>

                <Form.Item
                  label="Mô tả"
                  name="description"
                >
                  <TextArea rows={3} placeholder="Mô tả chi tiết về mã giảm giá" />
                </Form.Item>

                <Form.Item
                  label="Loại giảm giá"
                  name="type"
                  rules={[{ required: true, message: "Vui lòng chọn loại giảm giá" }]}
                >
                  <Select onChange={handleTypeChange} placeholder="Chọn loại giảm giá">
                    <Option value="percentage">Phần trăm (%)</Option>
                    <Option value="fixed">Số tiền cố định</Option>
                    <Option value="shipping">Miễn phí vận chuyển</Option>
                  </Select>
                </Form.Item>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card title="Cấu hình giảm giá" className="mb-6">
                <Form.Item
                  label="Giá trị giảm"
                  name="discount"
                  rules={[
                    { required: true, message: "Vui lòng nhập giá trị giảm" },
                    { type: "number", min: 0, message: "Giá trị giảm phải lớn hơn 0" },
                  ]}
                >
                  <InputNumber
                    min={0}
                    className="w-full"
                    placeholder="Nhập giá trị giảm"
                    formatter={(value) => {
                      const type = form.getFieldValue('type');
                      if (type === 'percentage') {
                        return `${value}%`;
                      } else if (type === 'shipping') {
                        return 'Miễn phí';
                      } else {
                        return `${value} VNĐ`;
                      }
                    }}
                    parser={(value) => value!.replace(/[^\d]/g, '')}
                  />
                </Form.Item>

                <Form.Item
                  label="Đơn hàng tối thiểu"
                  name="minAmount"
                  rules={[
                    { required: true, message: "Vui lòng nhập đơn hàng tối thiểu" },
                    { type: "number", min: 0, message: "Đơn hàng tối thiểu phải lớn hơn hoặc bằng 0" },
                  ]}
                >
                  <InputNumber
                    min={0}
                    className="w-full"
                    placeholder="0"
                    formatter={(value) => `${value} VNĐ`}
                    parser={(value) => value!.replace(/[^\d]/g, '')}
                  />
                </Form.Item>

                <Form.Item
                  label="Giảm tối đa"
                  name="maxDiscount"
                  dependencies={['type']}
                >
                  <InputNumber
                    min={0}
                    className="w-full"
                    placeholder="Không giới hạn"
                    formatter={(value) => value ? `${value} VNĐ` : ''}
                    parser={(value) => value!.replace(/[^\d]/g, '')}
                    disabled={form.getFieldValue('type') === 'shipping'}
                  />
                </Form.Item>

                <Form.Item
                  label="Số lượt sử dụng tối đa"
                  name="usageLimit"
                  rules={[
                    { required: true, message: "Vui lòng nhập số lượt sử dụng" },
                    { type: "number", min: 1, message: "Số lượt sử dụng phải lớn hơn 0" },
                  ]}
                >
                  <InputNumber
                    min={1}
                    className="w-full"
                    placeholder="1"
                  />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Card title="Thời gian áp dụng" className="mb-6">
                <Form.Item
                  label="Ngày bắt đầu"
                  name="startDate"
                  rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
                >
                  <DatePicker
                    className="w-full"
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    placeholder="Chọn ngày bắt đầu"
                  />
                </Form.Item>

                <Form.Item
                  label="Ngày kết thúc"
                  name="endDate"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày kết thúc" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || !getFieldValue('startDate')) {
                          return Promise.resolve();
                        }
                        if (value.isAfter(getFieldValue('startDate'))) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
                      },
                    }),
                  ]}
                >
                  <DatePicker
                    className="w-full"
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    placeholder="Chọn ngày kết thúc"
                  />
                </Form.Item>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card title="Cài đặt khác" className="mb-6">
                <Form.Item
                  label="Trạng thái"
                  name="isActive"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
                </Form.Item>

                <div className="text-sm text-gray-600">
                  <p>• Mã giảm giá sẽ tự động kích hoạt khi đến ngày bắt đầu</p>
                  <p>• Mã sẽ tự động vô hiệu hóa khi hết hạn</p>
                  <p>• Khách hàng chỉ có thể sử dụng 1 lần mỗi mã</p>
                </div>
              </Card>
            </Col>
          </Row>

          <div className="flex justify-end space-x-4">
            <Button onClick={() => navigate("/admin/coupons")}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading} className="bg-blue-600 hover:bg-blue-700">
              Cập nhật mã giảm giá
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default CouponEdit;
