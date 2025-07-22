import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Input,
  InputNumber,
  Select,
  Button,
  DatePicker,
  message,
  Card,
  Row,
  Col,
  Typography,
  Space,
} from "antd";
import { PlusOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

interface ProductOption {
  _id: string;
  name: string;
}

const VoucherAdd: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    value: undefined as number | undefined,
    usageLimit: undefined as number | undefined,
    minOrderValue: undefined as number | undefined,
    startDate: null as string | null,
    endDate: null as string | null,
    productIds: [] as string[],
  });

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
    if (!form.discountType) return "Chọn loại giảm giá!";
    if (form.value === undefined || isNaN(Number(form.value)) || Number(form.value) < 1) return "Nhập giá trị giảm hợp lệ!";
    if (form.usageLimit === undefined || isNaN(Number(form.usageLimit)) || Number(form.usageLimit) < 1) return "Nhập số lượt sử dụng tối đa hợp lệ!";
    if (form.minOrderValue === undefined || isNaN(Number(form.minOrderValue)) || Number(form.minOrderValue) < 1) return "Nhập đơn hàng tối thiểu áp dụng hợp lệ!";
    if (!form.startDate) return "Chọn ngày bắt đầu!";
    if (!form.endDate) return "Chọn ngày kết thúc!";
    if (!form.productIds || form.productIds.length < 1) return "Chọn ít nhất 1 sản phẩm!";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      message.error(error);
      return;
    }
    setLoading(true);
    try {
      const body = {
        code: form.code.trim(),
        discountType: form.discountType,
        value: Number(form.value),
        usageLimit: Number(form.usageLimit),
        minOrderValue: Number(form.minOrderValue),
        startDate: form.startDate,
        endDate: form.endDate,
        productId: form.productIds[0], // chỉ lấy 1 sản phẩm
      };
      const token = localStorage.getItem("token");
      const res = await fetch("/api/product/voucher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Tạo voucher thất bại");
      message.success("Tạo voucher thành công!");
      navigate("/admin/vouchers");
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message || "Đã xảy ra lỗi không xác định");
      } else {
        message.error("Đã xảy ra lỗi không xác định");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Card className="shadow-lg rounded-xl mb-6">
        <Title level={4}>Tạo mã khuyến mãi (Voucher)</Title>
        <form onSubmit={handleSubmit}>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <label>Mã voucher *</label>
              <Input name="code" value={form.code} onChange={handleChange} placeholder="VD: SALE2024" />
              <label>Loại giảm giá *</label>
              <Select value={form.discountType} onChange={v => handleSelectChange(v, "discountType")} style={{ width: "100%" }}>
                <Option value="percentage">Phần trăm (%)</Option>
                <Option value="fixed">Số tiền cố định</Option>
              </Select>
              <label>Giá trị giảm *</label>
              <InputNumber name="value" value={form.value} onChange={v => handleNumberChange(v, "value")} min={1} className="w-full" />
              <label>Số lượt sử dụng tối đa *</label>
              <InputNumber name="usageLimit" value={form.usageLimit} onChange={v => handleNumberChange(v, "usageLimit")} min={1} className="w-full" />
              <label>Đơn hàng tối thiểu áp dụng *</label>
              <InputNumber name="minOrderValue" value={form.minOrderValue} onChange={v => handleNumberChange(v, "minOrderValue")} min={1} className="w-full" />
            </Col>
            <Col xs={24} md={12}>
              <label>Ngày bắt đầu *</label>
              <DatePicker
                className="w-full"
                showTime
                value={form.startDate ? dayjs(form.startDate) : null}
                onChange={date => handleDateChange(date, "startDate")}
              />
              <label>Ngày kết thúc *</label>
              <DatePicker
                className="w-full"
                showTime
                value={form.endDate ? dayjs(form.endDate) : null}
                onChange={date => handleDateChange(date, "endDate")}
              />
              <label>Áp dụng cho sản phẩm *</label>
              <Select
                value={form.productIds[0] || undefined}
                onChange={v => setForm(prev => ({ ...prev, productIds: [v] }))}
                placeholder="Chọn sản phẩm áp dụng"
                style={{ width: "100%" }}
              >
                {products.map((p) => (
                  <Option key={p._id} value={p._id}>{p.name}</Option>
                ))}
              </Select>
            </Col>
          </Row>
          <Space style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={loading} icon={<PlusOutlined />}>Tạo voucher</Button>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/vouchers")}>Quay lại</Button>
          </Space>
        </form>
      </Card>
    </div>
  );
};

export default VoucherAdd; 