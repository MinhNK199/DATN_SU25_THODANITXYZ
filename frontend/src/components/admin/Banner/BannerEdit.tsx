import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  message,
  Typography,
  Spin,
  Alert,
  Space,
  Row,
  Col,
  Image,
  Upload,
} from "antd";
import { ArrowLeftOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import type { Banner } from "../../../interfaces/Banner";

const { Title } = Typography;
const { TextArea } = Input;

const API_URL = "http://localhost:8000/api/banner";

const BannerEdit: React.FC = () => {
  const [form] = Form.useForm<Banner>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [previewImage, setPreviewImage] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const watchedImageUrl = Form.useWatch("image", form);

  const getImageSrc = (image?: string) => {
    if (!image) return "/placeholder.png";
    if (image.startsWith("http")) return image;
    return `http://localhost:8000${image}`;
  };

  useEffect(() => {
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setPreviewImage(getImageSrc(watchedImageUrl || ""));
    }
  }, [watchedImageUrl, file]);

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    const fetchBanner = async () => {
      if (!id) {
        setError("ID banner không hợp lệ");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/${id}`, {
          headers: { ...getAuthHeader(), "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          const banner: Banner = data.banner || data;
          form.setFieldsValue({
            ...banner,
            features: banner.features?.length ? banner.features : [""],
          });
          setPreviewImage(getImageSrc(banner.image || ""));
        } else {
          setError("Không tìm thấy banner");
        }
      } catch (err) {
        setError("Lỗi khi tải banner");
      } finally {
        setLoading(false);
      }
    };
    fetchBanner();
  }, [id]);

  const onFinish = async (values: Banner) => {
    if (!id) return;
    setSubmitting(true);
    try {
      let res;
      if (file) {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item) => formData.append(`${key}[]`, item));
          } else {
            formData.append(key, value as any);
          }
        });
        formData.append("image", file);
res = await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: getAuthHeader(),
          body: formData,
        });
      } else {
        res = await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: {
            ...getAuthHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
      }
      if (res.ok) {
        message.success("Cập nhật banner thành công!");
        setTimeout(() => navigate("/admin/banners"), 800);
      } else {
        const err = await res.json();
        message.error(err.message || "Lỗi cập nhật banner!");
      }
    } catch {
      message.error("Không thể kết nối máy chủ");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <Alert message="Lỗi" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={() =>
          message.error("Vui lòng kiểm tra lại các trường thông tin!")
        }
      >
        <Row gutter={[24, 24]}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Card className="shadow-lg rounded-xl">
                <Title level={4}>Thông tin cơ bản</Title>
                <Form.Item
                  name="title"
                  label="Tiêu đề"
                  rules={[
                    { required: true, message: "Tiêu đề không được để trống!" },
                  ]}
                >
                  <Input placeholder="Nhập tiêu đề banner" />
                </Form.Item>
                <Form.Item name="subtitle" label="Phụ đề">
                  <Input placeholder="Nhập phụ đề banner" />
                </Form.Item>
                <Form.Item
                  name="description"
                  label="Mô tả"
                  rules={[
                    { required: true, message: "Mô tả không được để trống!" },
                  ]}
                >
                  <TextArea
                    rows={3}
                    maxLength={50}
                    showCount
                    placeholder="Mô tả ngắn gọn (<= 50 ký tự)"
                  />
                </Form.Item>
                <Form.Item
                  name="badge"
                  label="Badge"
                  rules={[
                    { required: true, message: "Badge không được để trống!" },
                  ]}
                >
<Input placeholder="Ví dụ: NEW, HOT..." />
                </Form.Item>
              </Card>

              <Card className="shadow-lg rounded-xl">
                <Title level={4}>Nút hành động</Title>
                <Form.Item
                  name="buttonText"
                  label="Nội dung nút"
                  rules={[
                    {
                      required: true,
                      message: "Nội dung nút không được để trống!",
                    },
                  ]}
                >
                  <Input placeholder="Ví dụ: Xem thêm" />
                </Form.Item>
                <Form.Item
                  name="buttonLink"
                  label="Link liên kết"
                  rules={[
                    { required: true, message: "Link không được để trống!" },
                  ]}
                >
                  <Input placeholder="https://example.com" />
                </Form.Item>
              </Card>

              <Card className="shadow-lg rounded-xl">
                <Title level={4}>Tính năng nổi bật</Title>
                <Form.List name="features">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map((field, index) => (
                        <Space
                          key={field.key}
                          align="baseline"
                          style={{ display: "flex", marginBottom: 8 }}
                        >
                          <Form.Item
                            {...field}
                            rules={[
                              {
                                required: true,
                                message: "Không được để trống",
                              },
                            ]}
                          >
                            <Input placeholder={`Tính năng ${index + 1}`} />
                          </Form.Item>
                          <Button danger onClick={() => remove(field.name)}>
                            X
                          </Button>
                        </Space>
                      ))}
                      <Button type="dashed" onClick={() => add("")} block>
                        + Thêm tính năng
                      </Button>
                    </>
                  )}
                </Form.List>
              </Card>
            </Space>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Card className="shadow-lg rounded-xl">
                <Title level={4}>Hình ảnh</Title>
                <Upload
                  name="image"
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
                <Form.Item
                  name="image"
                >
                </Form.Item>
                <Image
                  src={previewImage || "/placeholder.png"}
                  fallback="/placeholder.png"
                  alt="Xem trước banner"
                  style={{
                    width: "100%",
                    height: "auto",
               
                  }}
                />
              </Card>

              <Card className="shadow-lg rounded-xl">
                <Title level={4}>Cấu hình</Title>
                <Form.Item
                  name="position"
                  label="Vị trí"
                  rules={[
                    { required: true, message: "Vị trí không được để trống!" },
                  ]}
                >
                  <Input placeholder="Ví dụ: home-top, sidebar, footer..." />
                </Form.Item>
                <Form.Item
                  name="isActive"
                  label="Trạng thái"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Hoạt động" unCheckedChildren="Ẩn" />
                </Form.Item>
              </Card>

              <Card className="shadow-lg rounded-xl">
                <Title level={4}>Hành động</Title>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Button
                    type="primary"
                    className="admin-primary-button"
                    htmlType="submit"
                    loading={submitting}
                    icon={<PlusOutlined />}
                    shape="round"
                    size="large"
                    block
                  >
                    Lưu thay đổi
                  </Button>
                  <Button
                    type="default"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate("/admin/banners")}
                    shape="round"
                    size="large"
                    block
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

export default BannerEdit;