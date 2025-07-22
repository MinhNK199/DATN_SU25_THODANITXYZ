import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Product } from "../../../interfaces/Product";
import {
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaSave,
  FaExclamationCircle,
} from "react-icons/fa";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  message,
  Card,
  Switch,
  Divider,
  Row,
  Col,
  Collapse,
  Alert,
  Tabs,
  Spin,
  Upload,
  TreeSelect,
  Typography,
  Space,
  UploadFile,
  UploadProps,
} from "antd";
import VariantManager from "./VariantManager";
import {
  PlusOutlined,
  UploadOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import slugify from "slugify";
import { getCategories, getBrands, getProductById, updateProduct } from "./api";
import { Category } from "../../../interfaces/Category";
import { Brand } from "../../../interfaces/Brand";
import SpecificationEditor from "./SpecificationEditor";

const { TextArea } = Input;
const { Panel } = Collapse;
const { TabPane } = Tabs;
const { Title, Text } = Typography;
const API_URL = "http://localhost:8000/api/product";

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  color?: { code: string; name: string };
  size?: number;
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  images: string[];
  isActive: boolean;
  specifications?: { [key: string]: string };
}

const ProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [images, setImages] = useState<string[]>([""]);
  const [specifications, setSpecifications] = useState<{
    [key: string]: string;
  }>({});
  const [features, setFeatures] = useState<string[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = slugify(name, { lower: true, strict: true });
    form.setFieldsValue({ slug });
  };

  useEffect(() => {
    if (!id) {
      message.error("ID Sản phẩm không hợp lệ.");
      navigate("/admin/products");
      return;
    }

    const fetchData = async () => {
      try {
        const [productData, cats, brs] = await Promise.all([
          getProductById(id),
          getCategories(),
          getBrands(),
        ]);
        setCategories(cats);
        setBrands(brs);
        setSpecifications({ ...(productData.specifications || {}) });
        // Khi setVariants từ productData.variants, map lại các trường cho đúng kiểu
        setVariants((productData.variants || []).map((v: any) => ({
          ...v,
          id: v.id || v._id || String(Date.now() + Math.random()),
          color: typeof v.color === 'object' && v.color !== null ? v.color : { code: '#000000', name: '' },
          size: typeof v.size === 'number' ? v.size : (parseFloat(v.size) || 0),
          length: typeof v.length === 'number' ? v.length : (parseFloat(v.length) || 0),
          width: typeof v.width === 'number' ? v.width : (parseFloat(v.width) || 0),
          height: typeof v.height === 'number' ? v.height : (parseFloat(v.height) || 0),
          specifications: v.specifications || {},
        })));
        setImages(productData.images || []);
        if (productData.images?.length > 0) {
          setPreviewImage(productData.images[0]);
        }
        form.setFieldsValue({
          name: productData.name,
          slug: productData.slug,
          description: productData.description,
          price: productData.price,
          salePrice: productData.salePrice,
          stock: productData.stock,
          sku: productData.sku,
          brand: (typeof productData.brand === 'object' && productData.brand !== null && '_id' in productData.brand) ? (productData.brand as any)._id : productData.brand,
          category: (typeof productData.category === 'object' && productData.category !== null && '_id' in productData.category) ? (productData.category as any)._id : productData.category,
          weight: productData.weight,
          warranty: productData.warranty,
          tags: productData.tags || [],
          isActive: productData.isActive,
          isFeatured: productData.isFeatured,
          dimensions: {
            length: productData.dimensions?.length || 0,
            width: productData.dimensions?.width || 0,
            height: productData.dimensions?.height || 0,
          },
          specifications: productData.specifications
            ? Object.entries(productData.specifications)
              .map(([k, v]) => `${k}: ${v}`)
              .join('\n')
            : '',
        });
      } catch (error) {
        message.error("Không thể tải dữ liệu sản phẩm.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, form, navigate]);

  const categoryTree = buildCategoryTree(categories);

  const handleSubmit = async (values: any) => {
    if (!id) return;
    if (variants.length < 1) {
      message.error("Sản phẩm phải có ít nhất 1 biến thể!");
      return;
    }
    setSubmitting(true);
    try {
      const uploadedImageUrls = fileList
        .map((file) => {
          if (file.response && file.response.url) return file.response.url;
          if (file.url) return file.url;
          return null;
        })
        .filter((url): url is string => url !== null);

      // Log variants trước khi gửi
      variants.forEach((v, idx) => {
        console.log(`--- Variant ${idx} ---`);
        console.log('typeof color:', typeof v.color, v.color, JSON.stringify(v.color));
        console.log('typeof specifications:', typeof v.specifications, v.specifications, JSON.stringify(v.specifications));
        console.log('typeof images:', typeof v.images, v.images);
        console.log('typeof size:', typeof v.size, v.size);
        console.log('typeof length:', typeof v.length, v.length);
        console.log('typeof width:', typeof v.width, v.width);
        console.log('typeof height:', typeof v.height, v.height);
      });
      console.log('Variants gửi lên:', variants);

      // Ensure variants match ProductVariant interface (with optional _id)
      const safeVariants = variants.map((v) => ({
        _id: (typeof v === 'object' && v !== null && '_id' in v) ? (v as any)._id : undefined,
        id: v.id,
        name: v.name,
        sku: v.sku,
        price: v.price,
        salePrice: v.salePrice,
        stock: v.stock,
        color: (v.color && typeof v.color === 'object' && typeof v.color.code === 'string' && typeof v.color.name === 'string')
          ? { code: v.color.code, name: v.color.name }
          : { code: '', name: '' },
        specifications: (v.specifications && typeof v.specifications === 'object') ? { ...v.specifications } : {},
        size: typeof v.size === 'number' ? v.size : parseFloat(v.size) || 0,
        length: typeof v.length === 'number' ? v.length : parseFloat(v.length) || 0,
        width: typeof v.width === 'number' ? v.width : parseFloat(v.width) || 0,
        height: typeof v.height === 'number' ? v.height : parseFloat(v.height) || 0,
        weight: typeof v.weight === 'number' ? v.weight : parseFloat(v.weight) || 0,
        images: Array.isArray(v.images) ? v.images : [],
        isActive: !!v.isActive,
      }));

      // Log safeVariants trước khi gửi
      console.log('safeVariants gửi lên:', safeVariants);

      const getId = (val: any) => (typeof val === 'object' && val !== null && '_id' in val ? val._id : val);

      const specificationsObj: Record<string, string> = {};
      (values.specifications || '').split('\n').forEach((line: string) => {
        const [key, ...rest] = line.split(':');
        if (key && rest.length) specificationsObj[key.trim()] = rest.join(':').trim();
      });
      const productData: Partial<Product> = {
        // Thông tin chung giữ lại
        name: values.name,
        slug: slugify(values.name, { lower: true, strict: true }),
        description: values.description,
        images: images.filter((img) => img.trim() !== ""),
        tags: values.tags || [],
        // Thông tin bổ sung
        warranty: values.warranty,
        specifications: specificationsObj,
        // Liên kết
        brand: getId(values.brand),
        category: getId(values.category),
        // Bổ sung cho backend
        price: safeVariants[0]?.price,
        stock: safeVariants.reduce((sum, v) => sum + (v.stock || 0), 0),
        // Biến thể
        variants: safeVariants,
        isActive: values.isActive,
        isFeatured: values.isFeatured,
      };
      await updateProduct(id, productData);
      message.success("Cập nhật sản phẩm thành công!");
      navigate("/admin/products");
    } catch (error) {
      // message is handled in api.ts
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadChange: UploadProps["onChange"] = ({
    fileList: newFileList,
  }) => {
    setFileList(newFileList);
    if (newFileList.length > 0) {
      const firstFile = newFileList.find(
        (f) => f.status === "done" || f.originFileObj
      );
      if (firstFile) {
        if (firstFile.url) {
          setPreviewImage(firstFile.url);
        } else if (firstFile.originFileObj) {
          const reader = new FileReader();
          reader.onload = (e) => setPreviewImage(e.target?.result as string);
          reader.readAsDataURL(firstFile.originFileObj);
        }
      }
    } else {
      setPreviewImage("");
    }
  };

  const uploadProps: UploadProps = {
    action: "https://api.cloudinary.com/v1_1/your_cloudinary_name/image/upload", // THAY THẾ
    listType: "picture-card",
    fileList,
    onChange: handleUploadChange,
    multiple: true,
    data: {
      upload_preset: "your_upload_preset", // THAY THẾ
    },
    onPreview: async (file) => {
      let src = file.url as string;
      if (!src) {
        src = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file.originFileObj as any);
          reader.onload = () => resolve(reader.result as string);
        });
      }
      const image = new Image();
      image.src = src;
      const imgWindow = window.open(src);
      imgWindow?.document.write(image.outerHTML);
    },
  };

  const handleImageChange = (value: string, idx: number) => {
    const newImages = [...images];
    newImages[idx] = value;
    setImages(newImages);
    if (idx === 0) setPreviewImage(value);
  };

  const addImageField = () => setImages([...images, ""]);

  const removeImageField = (idx: number) => {
    const newImages = images.filter((_, i) => i !== idx);
    setImages(newImages);
    if (idx === 0 && newImages.length > 0) setPreviewImage(newImages[0]);
    if (newImages.length === 0) setPreviewImage("");
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onFinishFailed={() =>
          message.error("Vui lòng kiểm tra lại các trường thông tin!")
        }
      >
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card className="shadow-lg rounded-xl mb-6">
              <Title level={4}>Thông tin chung</Title>
              <Form.Item
                name="name"
                label="Tên sản phẩm"
                rules={[{ required: true }]}
              >
                <Input
                  placeholder="VD: Áo thun nam"
                  onChange={handleNameChange}
                />
              </Form.Item>
              <Form.Item name="sku" label="SKU">
                <Input placeholder="VD: ATN-001" />
              </Form.Item>
              <Form.Item name="description" label="Mô tả chi tiết">
                <Input.TextArea
                  rows={6}
                  placeholder="Nhập mô tả chi tiết cho sản phẩm..."
                />
              </Form.Item>
            </Card>

            <Card className="shadow-lg rounded-xl mb-6">
              <Title level={4}>Thông tin bổ sung</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="warranty" label="Bảo hành (tháng)">
                    <InputNumber className="w-full" min={0} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="tags" label="Tags (phân cách bởi dấu phẩy)">
                    <Select mode="tags" style={{ width: "100%" }} placeholder="VD: iphone, apple" />
                  </Form.Item>
                </Col>
              </Row>
             
            </Card>

            <Card className="shadow-lg rounded-xl mb-6">
              <VariantManager
                variants={variants}
                onVariantsChange={setVariants}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card className="shadow-lg rounded-xl sticky top-6">
              <Title level={4}>Tổ chức</Title>
              <Form.Item
                name="category"
                label="Danh mục"
                rules={[{ required: true }]}
              >
                <TreeSelect
                  treeData={categoryTree}
                  placeholder="Chọn danh mục"
                  treeDefaultExpandAll
                  allowClear
                />
              </Form.Item>
              <Form.Item
                name="brand"
                label="Thương hiệu"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Chọn thương hiệu"
                  options={brands.map((b) => ({ label: b.name, value: b._id }))}
                  allowClear
                />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="isFeatured"
                    label="Nổi bật"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="isActive"
                    label="Hiển thị"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Title level={4}>Xem trước ảnh</Title>
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                  }}
                />
              ) : (
                <div className="h-48 flex items-center justify-center bg-gray-200 rounded-lg mb-4">
                  <Text type="secondary">Chưa có ảnh</Text>
                </div>
              )}

              <Divider />

              <Title level={4}>Hành động</Title>
              <Space direction="vertical" className="w-full">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  block
                  icon={<SaveOutlined />}
                >
                  Lưu thay đổi
                </Button>
                <Button
                  block
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate("/admin/products")}
                >
                  Quay lại
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

const buildCategoryTree = (
  categories: Category[],
  parentId: string | null = null
): any[] => {
  return categories
    .filter((cat) => {
      if (typeof cat.parent === "object" && cat.parent !== null && "_id" in cat.parent) {
        return (cat.parent as any)._id === parentId;
      }
      return cat.parent === parentId;
    })
    .map((cat) => ({
      title: cat.name,
      value: cat._id,
      children: buildCategoryTree(categories, cat._id),
    }));
};

export default ProductEdit;
