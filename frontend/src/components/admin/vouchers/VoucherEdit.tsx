import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Input,
  InputNumber,
  Select,
  Button,
  DatePicker,
  message as antdMessage,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Checkbox,
  Spin,
} from "antd";
import { useNotification } from "../../../hooks/useNotification";
import { ArrowLeftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { updateCoupon, getCouponById } from "../coupons/api";
import { Coupon } from "../../../interfaces/Coupon";

const { Title } = Typography;
const { Option } = Select;

interface ProductOption {
  _id: string;
  name: string;
}

const VoucherEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { success, error } = useNotification();
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    type: "percentage" as "percentage" | "fixed",
    discount: undefined as number | undefined,
    maxDiscount: undefined as number | undefined,
    minAmount: undefined as number | undefined,
    usageLimit: undefined as number | undefined,
    userUsageLimit: 1,
    startDate: null as string | null,
    endDate: null as string | null,
    applicableProducts: [] as string[],
    applyToAllProducts: false,
    isActive: true,
  });

  useEffect(() => {
    const fetchCoupon = async () => {
      if (!id) return;

      setInitialLoading(true);
      try {
        const couponData = await getCouponById(id);
        setForm({
          code: couponData.code || "",
          name: couponData.name || "",
          description: couponData.description || "",
          type: couponData.type || "percentage",
          discount: couponData.discount,
          maxDiscount: couponData.maxDiscount,
          minAmount: couponData.minAmount,
          usageLimit: couponData.usageLimit,
          userUsageLimit: couponData.userUsageLimit || 1,
          startDate: couponData.startDate || null,
          endDate: couponData.endDate || null,
          applicableProducts: couponData.applicableProducts || [],
          applyToAllProducts: couponData.applyToAllProducts || false,
          isActive: couponData.isActive !== undefined ? couponData.isActive : true,
        });
      } catch (error) {
        error("Không thể tải thông tin voucher");
        navigate("/admin/vouchers");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCoupon();
  }, [id, navigate]);

  useEffect(() => {
    fetch("/api/product?pageSize=1000")
      .then(res => res.json())
      .then(data => setProducts(data.products || []));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (value: number | null, name: string) => {
    setForm(prev => ({ ...prev, [name]: value === null ? undefined : value }));
  };

  const handleSelectChange = (value: string | string[], name: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: dayjs.Dayjs | null, name: string) => {
    setForm(prev => ({ ...prev, [name]: date ? date.toISOString() : null }));
  };

  const validate = () => {
    if (!form.code.trim()) return "Nhập mã voucher!";
    if (!form.name.trim()) return "Nhập tên voucher!";
    if (!form.type) return "Chọn loại giảm giá!";
    if (form.discount === undefined || isNaN(Number(form.discount)) || Number(form.discount) < 1) return "Nhập giá trị giảm hợp lệ!";
    if (form.usageLimit === undefined || isNaN(Number(form.usageLimit)) || Number(form.usageLimit) < 1) return "Nhập số lượt sử dụng tối đa hợp lệ!";
    if (form.minAmount === undefined || isNaN(Number(form.minAmount)) || Number(form.minAmount) < 0) return "Nhập đơn hàng tối thiểu áp dụng hợp lệ!";
    if (!form.startDate) return "Chọn ngày bắt đầu!";
    if (!form.endDate) return "Chọn ngày kết thúc!";
    if (!form.applyToAllProducts && (!form.applicableProducts || form.applicableProducts.length < 1)) {
      return "Chọn ít nhất 1 sản phẩm hoặc chọn áp dụng cho tất cả!";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = validate();
    if (errorMsg) {
      error(errorMsg);
      return;
    }
    setLoading(true);
    try {
      const couponData = {
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        type: form.type,
        discount: Number(form.discount),
        minAmount: Number(form.minAmount),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        isActive: form.isActive,
        startDate: form.startDate!,
        endDate: form.endDate!,
        usageLimit: Number(form.usageLimit),
        userUsageLimit: Number(form.userUsageLimit),
        applicableProducts: form.applyToAllProducts ? [] : form.applicableProducts,
        applyToAllProducts: form.applyToAllProducts,
      };

      await updateCoupon(id!, couponData);
      success("Cập nhật voucher thành công!");
      navigate("/admin/vouchers");
    } catch (error) {
      if (error instanceof Error) {
        error(error.message || "Đã xảy ra lỗi không xác định");
      } else {
        error("Đã xảy ra lỗi không xác định");
      }
    } finally {
      setLoading(false);
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
      <Card className="shadow-lg rounded-xl mb-6">
        <Title level={4}>Chỉnh sửa mã khuyến mãi (Voucher)</Title>
        <form onSubmit={handleSubmit}>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <div style={{ marginBottom: 16 }}>
                <label>Mã voucher *</label>
                <Input name="code" value={form.code} onChange={handleChange} placeholder="VD: SALE2024" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Tên voucher *</label>
                <Input name="name" value={form.name} onChange={handleChange} placeholder="VD: Giảm giá 20%" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Mô tả</label>
                <Input.TextArea name="description" value={form.description} onChange={handleChange} placeholder="Mô tả voucher" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Loại giảm giá *</label>
                <Select value={form.type} onChange={v => handleSelectChange(v, "type")} style={{ width: "100%" }}>
                  <Option value="percentage">Phần trăm (%)</Option>
                  <Option value="fixed">Số tiền cố định</Option>
                </Select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Giá trị giảm *</label>
                <InputNumber
                  name="discount"
                  value={form.discount}
                  onChange={v => handleNumberChange(v, "discount")}
                  min={1}
                  className="w-full"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={(value) => value!.replace(/\./g, '')}
                  placeholder="VD: 20 (cho %) hoặc 50.000 (cho VNĐ)"
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Giá trị giảm tối đa</label>
                <InputNumber
                  name="maxDiscount"
                  value={form.maxDiscount}
                  onChange={v => handleNumberChange(v, "maxDiscount")}
                  min={0}
                  className="w-full"
                  placeholder="VD: 100.000"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={(value) => value!.replace(/\./g, '')}
                />
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ marginBottom: 16 }}>
                <label>Ngày bắt đầu *</label>
                <DatePicker
                  className="w-full"
                  showTime
                  value={form.startDate ? dayjs(form.startDate) : null}
                  onChange={date => handleDateChange(date, "startDate")}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Ngày kết thúc *</label>
                <DatePicker
                  className="w-full"
                  showTime
                  value={form.endDate ? dayjs(form.endDate) : null}
                  onChange={date => handleDateChange(date, "endDate")}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Đơn hàng tối thiểu áp dụng *</label>
                <InputNumber
                  name="minAmount"
                  value={form.minAmount}
                  onChange={v => handleNumberChange(v, "minAmount")}
                  min={0}
                  className="w-full"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={(value) => value!.replace(/\./g, '')}
                  placeholder="VD: 500.000"
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Số lượt sử dụng tối đa *</label>
                <InputNumber
                  name="usageLimit"
                  value={form.usageLimit}
                  onChange={v => handleNumberChange(v, "usageLimit")}
                  min={1}
                  className="w-full"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={(value) => value!.replace(/\./g, '')}
                  placeholder="VD: 100"
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Số lượt sử dụng tối đa per user</label>
                <InputNumber
                  name="userUsageLimit"
                  value={form.userUsageLimit}
                  onChange={v => handleNumberChange(v, "userUsageLimit")}
                  min={1}
                  className="w-full"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={(value) => value!.replace(/\./g, '')}
                  placeholder="VD: 5"
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <Checkbox
                  checked={form.applyToAllProducts}
                  onChange={e => setForm(prev => ({ ...prev, applyToAllProducts: e.target.checked }))}
                >
                  Áp dụng cho tất cả các loại sản phẩm
                </Checkbox>
              </div>
              {!form.applyToAllProducts && (
                <div style={{ marginBottom: 16 }}>
                  <label>Áp dụng cho sản phẩm *</label>
                  <Select
                    mode="multiple"
                    value={form.applicableProducts}
                    onChange={v => setForm(prev => ({ ...prev, applicableProducts: v }))}
                    placeholder="Chọn một hoặc nhiều sản phẩm áp dụng"
                    style={{ width: "100%" }}
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
                  {form.applicableProducts.length > 0 && (
                    <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                      <strong>Đã chọn:</strong> {form.applicableProducts.map(id =>
                        products.find(p => p._id === id)?.name
                      ).join(', ')}
                    </div>
                  )}
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <Checkbox
                  checked={form.isActive}
                  onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                >
                  Kích hoạt voucher
                </Checkbox>
              </div>
            </Col>
          </Row>
          <Space style={{ marginTop: 24 }}>
            <Button type="primary" className="admin-primary-button" htmlType="submit" loading={loading}>
              Cập nhật voucher
            </Button>
            <Button 
              type="primary"
              className="admin-primary-button"
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate("/admin/vouchers")}
            >
              Quay lại
            </Button>
          </Space>
        </form>
      </Card>
    </div>
  );
};

export default VoucherEdit;