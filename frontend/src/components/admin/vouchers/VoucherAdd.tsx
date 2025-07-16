import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
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
//import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

//const API_URL = "/api/product/voucher";

interface ProductOption {
  _id: string;
  name: string;
}

const VoucherAdd: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Lấy danh sách sản phẩm để chọn áp dụng voucher
    fetch("/api/product?pageSize=1000")
      .then(res => res.json())
      .then(data => setProducts(data.products || []));
  }, []);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const body = {
        code: values.code,
        discountType: values.discountType,
        value: values.value,
        startDate: values.startDate ? values.startDate.toISOString() : undefined,
        endDate: values.endDate ? values.endDate.toISOString() : undefined,
        usageLimit: values.usageLimit,
        minOrderValue: values.minOrderValue,
        productIds: values.productIds, // gửi đúng tên productIds (mảng)
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
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Card className="shadow-lg rounded-xl mb-6">
        <Title level={4}>Tạo mã khuyến mãi (Voucher)</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={() => message.error("Vui lòng kiểm tra lại các trường!")}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item name="code" label="Mã voucher" rules={[{ required: true, message: "Nhập mã voucher!" }]}> <Input placeholder="VD: SALE2024" /> </Form.Item>
              <Form.Item name="discountType" label="Loại giảm giá" initialValue="percentage" rules={[{ required: true }]}> <Select> <Option value="percentage">Phần trăm (%)</Option> <Option value="fixed">Số tiền cố định</Option> </Select> </Form.Item>
              <Form.Item name="value" label="Giá trị giảm" rules={[{ required: true, message: "Nhập giá trị giảm!" }]}> <InputNumber className="w-full" min={1} /> </Form.Item>
              <Form.Item name="usageLimit" label="Số lượt sử dụng tối đa"> <InputNumber className="w-full" min={0} placeholder="0 = không giới hạn" /> </Form.Item>
              <Form.Item name="minOrderValue" label="Đơn hàng tối thiểu áp dụng"> <InputNumber className="w-full" min={0} placeholder="0 = không giới hạn" /> </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="startDate" label="Ngày bắt đầu"> <DatePicker className="w-full" showTime /> </Form.Item>
              <Form.Item name="endDate" label="Ngày kết thúc"> <DatePicker className="w-full" showTime /> </Form.Item>
              <Form.Item name="productIds" label="Áp dụng cho sản phẩm"> <Select mode="multiple" allowClear placeholder="Chọn sản phẩm áp dụng"> {products.map((p) => (<Option key={p._id} value={p._id}>{p.name}</Option>))} </Select> </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} icon={<PlusOutlined />}>Tạo voucher</Button>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/vouchers")}>Quay lại</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default VoucherAdd; 