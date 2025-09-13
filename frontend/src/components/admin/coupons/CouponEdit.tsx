import React, { useState, useEffect } from "react";
import { Form, Input, InputNumber, Select, DatePicker, Switch, Button, Card, message as antdMessage, Row, Col, Checkbox, Spin } from "antd";
import { useNotification } from "../../../hooks/useNotification";
import { useNavigate, useParams } from "react-router-dom";
import { getCouponById, updateCoupon } from "./api";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

interface Product {
  _id: string;
  name: string;
}

const CouponEdit: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();
  const { success, error } = useNotification();
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
          applyToAllProducts: coupon.applyToAllProducts || false,
          applicableProducts: coupon.applicableProducts || [],
        });
      } catch (error: any) {
        error(error.message || "Lỗi khi tải thông tin mã giảm giá");
        navigate("/admin/coupons");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCoupon();
  }, [id, form, navigate]);

  useEffect(() => {
    fetch("/api/product?pageSize=1000")
      .then(res => res.json())
      .then(data => setProducts(data.products || []));
  }, []);

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
      success("Cập nhật mã giảm giá thành công");
      navigate("/admin/coupons");
    } catch (error: any) {
      error(error.message || "Lỗi khi cập nhật mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type: string) => {
    // Reset maxDiscount when changing type if needed
    // No special handling needed for current types
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
                    placeholder="VD: 20 (cho %) hoặc 50.000 (cho VNĐ)"
                    formatter={(value) => {
                      const type = form.getFieldValue('type');
                      const formattedValue = `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                      if (type === 'percentage') {
                        return `${formattedValue}%`;
                      } else {
                        return `${formattedValue} VNĐ`;
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
                    placeholder="VD: 500.000"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VNĐ'}
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
                    placeholder="VD: 100.000"
                    formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VNĐ' : ''}
                    parser={(value) => value!.replace(/[^\d]/g, '')}
                    disabled={false}
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
                    placeholder="VD: 100"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    parser={(value) => value!.replace(/\./g, '')}
                  />
                </Form.Item>

                <Form.Item
                  label="Số lượt sử dụng tối đa per user"
                  name="userUsageLimit"
                  rules={[
                    { required: true, message: "Vui lòng nhập số lượt sử dụng per user" },
                    { type: "number", min: 1, message: "Số lượt sử dụng per user phải lớn hơn 0" },
                  ]}
                  initialValue={1}
                >
                  <InputNumber
                    min={1}
                    className="w-full"
                    placeholder="VD: 5"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    parser={(value) => value!.replace(/\./g, '')}
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

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Card title="Áp dụng sản phẩm" className="mb-6">
                <Form.Item
                  name="applyToAllProducts"
                  valuePropName="checked"
                >
                  <Checkbox>Áp dụng cho tất cả các loại sản phẩm</Checkbox>
                </Form.Item>

                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.applyToAllProducts !== currentValues.applyToAllProducts
                  }
                >
                  {({ getFieldValue }) => {
                    const applyToAll = getFieldValue('applyToAllProducts');
                    return !applyToAll ? (
                      <Form.Item
                        label="Chọn sản phẩm áp dụng"
                        name="applicableProducts"
                        rules={[
                          { required: true, message: "Vui lòng chọn ít nhất một sản phẩm" }
                        ]}
                      >
                        <Select
                          mode="multiple"
                          placeholder="Chọn một hoặc nhiều sản phẩm áp dụng"
                          showSearch
                          filterOption={(input, option) =>
                            (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                          }
                          maxTagCount="responsive"
                          tagRender={(props) => {
                            const { label, closable, onClose } = props;
                            return (
                              <span style={{
                                background: '#f0f0f0',
                                padding: '2px 8px',
                                margin: '2px',
                                borderRadius: '4px',
                                display: 'inline-block'
                              }}>
                                {label}
                                {closable && (
                                  <span
                                    onClick={onClose}
                                    style={{ marginLeft: '4px', cursor: 'pointer' }}
                                  >
                                    ×
                                  </span>
                                )}
                              </span>
                            );
                          }}
                        >
                          {products.map((p) => (
                            <Option key={p._id} value={p._id}>{p.name}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    ) : null;
                  }}
                </Form.Item>

                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.applyToAllProducts !== currentValues.applyToAllProducts ||
                    prevValues.applicableProducts !== currentValues.applicableProducts
                  }
                >
                  {({ getFieldValue }) => {
                    const applyToAll = getFieldValue('applyToAllProducts');
                    const selectedProducts = getFieldValue('applicableProducts') || [];

                    if (applyToAll) {
                      return (
                        <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                          <strong>Áp dụng cho:</strong> Tất cả sản phẩm
                        </div>
                      );
                    }

                    if (selectedProducts.length > 0) {
                      return (
                        <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                          <strong>Đã chọn:</strong> {selectedProducts.map((id: string) =>
                            products.find(p => p._id === id)?.name
                          ).join(', ')}
                        </div>
                      );
                    }

                    return null;
                  }}
                </Form.Item>
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