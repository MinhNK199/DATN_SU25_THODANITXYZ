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
  Upload,
  InputNumber,
  ColorPicker,
  TreeSelect,
  Image,
} from "antd";
import { ArrowLeftOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import slugify from "slugify";
import { getCategoryById, updateCategory, fetchCategories } from "./api";
import { Category } from "../../../interfaces/Category";

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

type FieldType = Omit<
  Category,
  "_id" | "createdAt" | "updatedAt" | "deletedAt" | "deletedBy" | "parent"
> & {
  parent?: string | null;
};

const buildCategoryTree = (categories: Category[], parentId: string | null = null): any[] => {
  return categories
    .filter((cat) => (typeof cat.parent === "string" ? cat.parent : cat.parent?._id) === parentId)
    .map((cat) => ({
      title: cat.name,
      value: cat._id,
      children: buildCategoryTree(categories, cat._id),
    }));
};

const getImageSrc = (image?: string) => {
  if (!image) return "/placeholder.png";
  if (image.startsWith("http")) return image;
  return `http://localhost:8000${image}`;
};

const CategoryEdit: React.FC = () => {
  const [form] = Form.useForm<FieldType>();
  const [submitting, setSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");

  useEffect(() => {
    const fetchAndSetCategory = async () => {
      if (!id) {
        setError("ID danh mục không hợp lệ.");
        setPageLoading(false);
        return;
      }
      try {
        const [categoryData, allCategories] = await Promise.all([
          getCategoryById(id),
          fetchCategories(),
        ]);

        if (categoryData) {
          const parentId =
            typeof categoryData.parent === "object" ? categoryData.parent?._id : categoryData.parent;
          form.setFieldsValue({ ...categoryData, parent: parentId });
          setCategories(allCategories.filter((cat) => cat._id !== id));
          setPreviewImage(getImageSrc(categoryData.image));
        } else {
          setError("Không tìm thấy danh mục.");
        }
      } catch (err) {
        setError("Lỗi khi tải dữ liệu danh mục.");
      } finally {
        setPageLoading(false);
      }
    };

    fetchAndSetCategory();
  }, [id, form]);

  const onFinish = async (values: FieldType) => {
    if (!id) return;
    setSubmitting(true);
    try {
      let res: any;
      if (file) {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value as any);
          }
        });
        formData.set(
          "slug",
          String(values.slug || slugify(values.name, { lower: true, strict: true }))
        );
        formData.append("image", file);

        res = await updateCategory(id, formData, true);
      } else {
        const finalValues = {
          ...values,
          slug: slugify(values.name, { lower: true, strict: true }),
        };
        res = await updateCategory(id, finalValues);
      }

      if (res && (res.success || res.status === 200)) {
        message.success(res.message || "Cập nhật danh mục thành công!");
        navigate("/admin/categories");
      } else {
        message.error(res?.message || "Cập nhật danh mục thất bại!");
      }
    } catch (error: any) {
      console.error("Update category error:", error);
      message.error(error?.response?.data?.message || error.message || "Cập nhật danh mục thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = slugify(name, { lower: true, strict: true });
    form.setFieldsValue({ slug });
  };

  const categoryTree = buildCategoryTree(categories, null);

  if (pageLoading) {
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
                  name="name"
                  label="Tên danh mục"
                  rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}
                >
                  <Input placeholder="Nhập tên danh mục" onChange={handleNameChange} />
                </Form.Item>
                <Form.Item
                  name="slug"
                  label="Slug (URL thân thiện)"
                  rules={[{ required: true, message: "Slug không được để trống!" }]}
                >
                  <Input placeholder="vi-du-slug" readOnly />
                </Form.Item>
                <Form.Item name="description" label="Mô tả">
                  <TextArea rows={4} placeholder="Nhập mô tả chi tiết cho danh mục" />
                </Form.Item>
              </Card>

              {/* Upload ảnh + Icon */}
              <Card className="shadow-lg rounded-xl">
                <Title level={4}>Hình ảnh & Icon</Title>
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
                <Form.Item name="image">
                  <Image
                    src={previewImage || "/placeholder.png"}
                    fallback="/placeholder.png"
                    alt="Xem trước ảnh danh mục"
                    style={{ width: "100%", height: "auto", marginTop: 12 }}
                  />
                </Form.Item>

                <Form.Item name="icon" label="Icon" style={{ marginTop: 16 }}>
                  <Input placeholder="Ví dụ: shopping-cart (Tên icon từ thư viện)" />
                </Form.Item>
              </Card>

              <Card className="shadow-lg rounded-xl">
                <Title level={4}>Tối ưu SEO</Title>
                <Paragraph type="secondary">
                  Cung cấp tiêu đề và mô tả meta để cải thiện thứ hạng tìm kiếm.
                </Paragraph>
                <Form.Item name="metaTitle" label="Meta Title">
                  <Input placeholder="Tiêu đề SEO (<= 60 ký tự)" maxLength={60} showCount />
                </Form.Item>
                <Form.Item name="metaDescription" label="Meta Description">
                  <TextArea
                    rows={2}
                    placeholder="Mô tả SEO (<= 160 ký tự)"
                    maxLength={160}
                    showCount
                  />
                </Form.Item>
              </Card>
            </Space>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Card className="shadow-lg rounded-xl">
                <Title level={4}>Tổ chức</Title>
                <Form.Item name="parent" label="Danh mục cha">
                  <TreeSelect
                    style={{ width: "100%" }}
                    treeData={categoryTree}
                    placeholder="Chọn danh mục cha (trống = gốc)"
                    treeDefaultExpandAll
                    allowClear
                  />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="order" label="Thứ tự">
                      <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="color" label="Màu sắc">
                      <ColorPicker showText />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
                  <Switch checkedChildren="Hoạt động" unCheckedChildren="Ẩn" />
                </Form.Item>
              </Card>

              <Card className="shadow-lg rounded-xl">
                <Title level={4}>Hành động</Title>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Button
                    type="primary"
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
                    onClick={() => navigate("/admin/categories")}
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

export default CategoryEdit;
