import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  message,
  Typography,
  Space,
  Row,
  Col,
  Upload,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { Banner } from "../../../interfaces/Banner";

const { Title } = Typography;
const { TextArea } = Input;

const API_URL = "http://localhost:8000/api/banner";

const BannerAdd: React.FC = () => {
  const [form] = Form.useForm<Banner>();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const navigate = useNavigate();

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const onFinish = async (values: Banner) => {
    if (!file) {
      message.error("❌ Vui lòng chọn ảnh!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      // thêm dữ liệu text
      Object.entries(values).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(`${key}[]`, item));
        } else {
          formData.append(key, value as any);
        }
      });

      // thêm ảnh
      formData.append("image", file);

      const res = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeader(),
        body: formData,
      });

      if (res.ok) {
        message.success("✅ Thêm banner thành công!");
        navigate("/admin/banners");
      } else {
        const err = await res.json();
        message.error(`❌ Thêm thất bại: ${err.message || "Lỗi máy chủ"}`);
      }
    } catch (error) {
      message.error("❌ Lỗi kết nối máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          isActive: true,
          features: [""],
        }}
      >
        <Row gutter={[24, 24]}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Thông tin cơ bản */}
              <Card className="shadow-lg rounded-xl">
                <Title level={4}>Thông tin cơ bản</Title>
                <Form.Item
                  name="title"
                  label="Tiêu đề"
                  rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
                >
                  <Input placeholder="Nhập tiêu đề" />
                </Form.Item>

                <Form.Item name="subtitle" label="Phụ đề">
<Input placeholder="Nhập phụ đề" />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Mô tả"
                  rules={[
                    { required: true, message: "Mô tả không được để trống!" },
                    { max: 50, message: "Mô tả không vượt quá 50 ký tự" },
                  ]}
                >
                  <TextArea rows={3} placeholder="Nhập mô tả ngắn" />
                </Form.Item>

                <Form.Item
                  name="badge"
                  label="Badge"
                  rules={[{ required: true, message: "Badge không được để trống!" }]}
                >
                  <Input placeholder="Ví dụ: HOT, NEW..." />
                </Form.Item>
              </Card>

              {/* Nút & Liên kết */}
              <Card className="shadow-lg rounded-xl">
                <Title level={4}>Nút & Liên kết</Title>
                <Form.Item
                  name="buttonText"
                  label="Nội dung nút"
                  rules={[{ required: true, message: "Nội dung nút không được để trống!" }]}
                >
                  <Input placeholder="VD: Xem ngay" />
                </Form.Item>
                <Form.Item
                  name="buttonLink"
                  label="Đường dẫn"
                  rules={[{ required: true, message: "Link không được để trống!" }]}
                >
                  <Input placeholder="https://example.com" />
                </Form.Item>
              </Card>

              {/* Features */}
              <Card className="shadow-lg rounded-xl">
                <Title level={4}>Tính năng nổi bật</Title>
               <Form.List name="features">
  {(fields, { add, remove }) => (
    <>
      {fields.map((field, index) => (
        <Space key={field.key} align="baseline">
          <Form.Item
            name={field.name}
            fieldKey={field.fieldKey}
            rules={[{ required: true, message: "Không được để trống" }]}
          >
            <Input placeholder={`Tính năng ${index + 1}`} />
          </Form.Item>
          <MinusCircleOutlined
            onClick={() => remove(field.name)}
            style={{ color: "red" }}
          />
        </Space>
      ))}
      <Form.Item>
        <Button type="dashed" onClick={() => add()} block>
          + Thêm tính năng
        </Button>
      </Form.Item>
    </>
  )}
</Form.List>

              </Card>
            </Space>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Ảnh */}
           <Card className="shadow-lg rounded-xl">
  <Title level={4}>Ảnh</Title>
  <Upload
    name="image" // <-- Thêm dòng này để tên trường là "image"
    beforeUpload={(file) => {
      setFile(file);
setPreviewImage(URL.createObjectURL(file));
      return false;
    }}
    maxCount={1}
    accept="image/*"
    showUploadList={false}
  >
    <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
  </Upload>
  {previewImage && (
    <img
      src={previewImage}
      alt="Xem trước hình ảnh"
      style={{
        width: "100%",
        
        height: "auto",
      }}
    />
  )}
</Card>

              {/* Vị trí & Trạng thái */}
              <Card className="shadow-lg rounded-xl">
                <Title level={4}>Vị trí & Trạng thái</Title>
                <Form.Item
                  name="position"
                  label="Vị trí hiển thị"
                  rules={[{ required: true, message: "Vị trí không được để trống!" }]}
                >
                  <Input placeholder="VD: homepage-top, sidebar, ..." />
                </Form.Item>
                <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
                  <Switch checkedChildren="Hoạt động" unCheckedChildren="Ẩn" />
                </Form.Item>
              </Card>

              {/* Action */}
              <Card className="shadow-lg rounded-xl">
                <Title level={4}>Hành động</Title>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<PlusOutlined />}
                    shape="round"
                    size="large"
                    block
                    style={{
                      background: "#fff",
                      color: "#1677ff",
                      border: "2px solid #1677ff",
                      fontWeight: 600,
                      boxShadow: "0 2px 8px rgba(22,119,255,0.08)",
                    }}
                  >
                    Lưu banner
                  </Button>
                  <Button
                    type="default"
                    icon={<ArrowLeftOutlined />}
                    htmlType="button"
                    onClick={() => navigate("/admin/banners")}
                    shape="round"
                    size="large"
                    block
                    style={{
                      background: "#fff",
                      color: "#888",
                      border: "2px solid #bbb",
                      fontWeight: 500,
                    }}
                  >
                    Quay lại
                  </Button>
                </Space>
              </Card>
            </Space>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default BannerAdd;