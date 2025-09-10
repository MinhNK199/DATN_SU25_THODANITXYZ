import React, { useEffect, useState } from "react";
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
  InputNumber,
  ColorPicker,
  Row,
  Col,
  TreeSelect,
  Upload,
} from "antd";
import {
  ArrowLeftOutlined,
  UploadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { createCategory, fetchCategories } from "./api";
import { Category } from "../../../interfaces/Category";
import slugify from "slugify";
import type { Color } from "antd/es/color-picker";

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

type FieldType = Omit<
  Category,
  "_id" | "createdAt" | "updatedAt" | "deletedAt" | "deletedBy" | "parent"
> & {
  parent?: string | null;
  color?: string | Color;
};

const buildCategoryTree = (
  categories: Category[],
  parentId: string | null = null
): any[] => {
  return categories
    .filter(
      (cat) =>
        (typeof cat.parent === "string" ? cat.parent : cat.parent?._id) ===
        parentId
    )
    .map((cat) => ({
      title: cat.name,
      value: cat._id,
      children: buildCategoryTree(categories, cat._id),
    }));
};

const CategoryAdd: React.FC = () => {
  const [form] = Form.useForm<FieldType>();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        // handled in api
      }
    };
    loadCategories();
  }, []);

  const onFinish = async (values: FieldType) => {
    setLoading(true);
    try {
      if (values.color && typeof values.color === "object") {
        const colorObj = values.color as { toHexString: () => string };
        if (colorObj.toHexString) {
          values.color = colorObj.toHexString();
        }
      }
      if (!values.parent || values.parent === "null" || values.parent === "") {
        delete values.parent;
      }
      if (Array.isArray(values.slug)) {
        values.slug = values.slug[0];
      }
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value as any);
      });
      formData.set(
        "slug",
        String(
          values.slug || slugify(values.name, { lower: true, strict: true })
        )
      );
      if (file) {
        formData.append("image", file);
      }
      await createCategory(formData);
      message.success("Thêm danh mục thành công!");
      navigate("/admin/categories");
    } catch (error: any) {
      message.error(error.message || "Thêm danh mục thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = slugify(name, { lower: true, strict: true });
    form.setFieldsValue({ slug });
  };

  const categoryTree = buildCategoryTree(categories, null);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={() =>
          message.error("Vui lòng kiểm tra lại các trường thông tin!")
        }
        initialValues={{ isActive: true, parent: null, order: 0 }}
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
                  rules={[
                    { required: true, message: "Vui lòng nhập tên danh mục!" },
                  ]}
                >
                  <Input
                    placeholder="Nhập tên danh mục"
                    onChange={handleNameChange}
                  />
                </Form.Item>
                <Form.Item
                  name="slug"
                  label="Slug (URL thân thiện)"
                  rules={[
                    { required: true, message: "Slug không được để trống!" },
                  ]}
                >
                  <Input placeholder="vi-du-slug" readOnly />
                </Form.Item>
                <Form.Item name="description" label="Mô tả">
                  <TextArea
                    rows={4}
                    placeholder="Nhập mô tả chi tiết cho danh mục"
                  />
                </Form.Item>
              </Card>

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
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="Xem trước hình ảnh"
                    style={{
                      width: "100%",
                      aspectRatio: "16/9",
                      objectFit: "cover",
                      borderRadius: "8px",
                      marginTop: 12,
                    }}
                  />
                )}
                <Form.Item name="icon" label="Icon" style={{ marginTop: 12 }}>
                  <Input placeholder="Ví dụ: ShoppingCartOutlined (tên icon Ant Design)" />
                </Form.Item>
              </Card>

              <Card className="shadow-lg rounded-xl">
                <Title level={4}>Tối ưu hóa công cụ tìm kiếm (SEO)</Title>
                <Paragraph type="secondary">
                  Cung cấp tiêu đề và mô tả meta để cải thiện thứ hạng trên công
                  cụ tìm kiếm.
                </Paragraph>
                <Form.Item name="metaTitle" label="Meta Title">
                  <Input
                    placeholder="Tiêu đề SEO (tối đa 60 ký tự)"
                    maxLength={60}
                    showCount
                  />
                </Form.Item>
                <Form.Item name="metaDescription" label="Meta Description">
                  <TextArea
                    rows={2}
                    placeholder="Mô tả SEO (tối đa 160 ký tự)"
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
                    placeholder="Chọn danh mục cha (để trống nếu là danh mục gốc)"
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
                    <Form.Item
                      name="color"
                      label="Màu sắc"
                      getValueFromEvent={(color: any) =>
                        typeof color === "string" ? color : color?.toHexString()
                      }
                    >
                      <ColorPicker showText />
                    </Form.Item>
                  </Col>
                </Row>
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
                    Lưu danh mục
                  </Button>
                  <Button
                    type="default"
                    icon={<ArrowLeftOutlined />}
                    htmlType="button"
                    onClick={() => navigate("/admin/categories")}
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

export default CategoryAdd;
