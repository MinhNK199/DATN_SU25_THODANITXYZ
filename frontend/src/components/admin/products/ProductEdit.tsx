import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Product } from "../../../interfaces/Product";
import { FaArrowLeft, FaPlus, FaTrash, FaSave, FaExclamationCircle } from "react-icons/fa";
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
  Space
} from "antd";
import VariantManager from "./VariantManager";
import { PlusOutlined, UploadOutlined, ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import slugify from 'slugify';
import { getCategories, getBrands, getProductById, updateProduct } from './api';
import { Category } from '../../../interfaces/Category';
import { Brand } from '../../../interfaces/Brand';
import SpecificationEditor from './SpecificationEditor';

const { TextArea } = Input;
const { Panel } = Collapse;
const { TabPane } = Tabs;
const { Title, Text } = Typography;
const API_URL = "http://localhost:9000/api/product";

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  color?: string;
  size?: string;
  weight?: number;
  images: string[];
  isActive: boolean;
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
  const [specifications, setSpecifications] = useState<{ [key: string]: string }>({});
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
          getBrands()
        ]);

        setSpecifications(productData.specifications || {});
        form.setFieldsValue({
          ...productData,
          category: productData.category?._id,
          brand: productData.brand?._id,
          specifications: productData.specifications || {},
        });

        const imagesAsUploadFile = (productData.images || []).map((img, index) => ({
          uid: `${-index}`,
          name: `image-${index}.png`,
          status: 'done' as 'done',
          url: img,
        }));

        setFileList(imagesAsUploadFile);
        if (imagesAsUploadFile.length > 0) {
          setPreviewImage(imagesAsUploadFile[0].url || '');
        }

        setCategories(cats);
        setBrands(brs);
        setVariants(productData.variants || []);

      } catch (error) {
        // message handled in api.ts
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, form, navigate]);

  const categoryTree = buildCategoryTree(categories);

  const handleSubmit = async (values: any) => {
    if (!id) return;
    setSubmitting(true);
    try {
      const uploadedImageUrls = fileList.map(file => {
        // Nếu file có response từ server (file mới upload), lấy url từ response
        if (file.response && file.response.url) return file.response.url;
        // Nếu file đã có url (ảnh cũ), giữ nguyên url
        if (file.url) return file.url;
        return null;
      }).filter((url): url is string => url !== null);

      const productData: Partial<Product> = {
        ...values,
        images: uploadedImageUrls,
        variants: variants,
        slug: slugify(values.name, { lower: true, strict: true }),
        specifications: specifications || {},
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
  
  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0) {
      const firstFile = newFileList.find(f => f.status === 'done' || f.originFileObj);
      if(firstFile) {
        if (firstFile.url) {
          setPreviewImage(firstFile.url);
        } else if (firstFile.originFileObj) {
          const reader = new FileReader();
          reader.onload = (e) => setPreviewImage(e.target?.result as string);
          reader.readAsDataURL(firstFile.originFileObj);
        }
      }
    } else {
      setPreviewImage('');
    }
  };

  const uploadProps: UploadProps = {
    action: 'https://api.cloudinary.com/v1_1/your_cloudinary_name/image/upload', // THAY THẾ
    listType: "picture-card",
    fileList,
    onChange: handleUploadChange,
    multiple: true,
    data: {
      upload_preset: 'your_upload_preset', // THAY THẾ
    },
    onPreview: async file => {
      let src = file.url as string;
      if (!src) {
        src = await new Promise(resolve => {
          const reader = new FileReader();
          reader.readAsDataURL(file.originFileObj as any);
          reader.onload = () => resolve(reader.result as string);
        });
      }
      const image = new Image();
      image.src = src;
      const imgWindow = window.open(src);
      imgWindow?.document.write(image.outerHTML);
    }
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
    return <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center"><Spin size="large" /></div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onFinishFailed={() => message.error('Vui lòng kiểm tra lại các trường thông tin!')}
      >
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card className="shadow-lg rounded-xl mb-6">
              <Title level={4}>Thông tin chung</Title>
              <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
                <Input placeholder="VD: Áo thun nam" onChange={handleNameChange} />
              </Form.Item>
              <Form.Item name="slug" label="Slug (URL thân thiện)">
                <Input placeholder="VD: ao-thun-nam" readOnly />
              </Form.Item>
              <Form.Item name="description" label="Mô tả chi tiết">
                <Input.TextArea rows={6} placeholder="Nhập mô tả chi tiết cho sản phẩm..." />
              </Form.Item>
            </Card>

            <Card className="shadow-lg rounded-xl mb-6">
              <Title level={4}>Hình ảnh sản phẩm</Title>
              {images.map((img, idx) => (
                <Space key={idx} align="start" className="mb-2 w-full">
                  <Input
                    placeholder="Nhập link ảnh..."
                    value={img}
                    onChange={e => handleImageChange(e.target.value, idx)}
                    className="w-full"
                  />
                  <Button danger onClick={() => removeImageField(idx)} disabled={images.length === 1}>Xóa</Button>
                </Space>
              ))}
              <Button type="dashed" icon={<PlusOutlined />} onClick={addImageField} className="mt-2">Thêm link ảnh</Button>
              <Text type="secondary" className="block mt-2">Nhập link ảnh sản phẩm. Ảnh đầu tiên sẽ là ảnh đại diện.</Text>
            </Card>

            <Card className="shadow-lg rounded-xl mb-6">
              <Title level={4}>Giá & Kho hàng</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="price" label="Giá gốc" rules={[{ required: true }]}>
                    <InputNumber className="w-full" addonAfter="VND" min={0} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="salePrice" label="Giá khuyến mãi">
                    <InputNumber className="w-full" addonAfter="VND" min={0} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="stock" label="Số lượng tồn kho" rules={[{ required: true}]}>
                    <InputNumber className="w-full" min={0} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="sku" label="SKU">
                    <Input placeholder="VD: ATN-001" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card className="shadow-lg rounded-xl mb-6">
              <Title level={4}>Thông số kỹ thuật</Title>
              <SpecificationEditor value={specifications} onChange={setSpecifications} />
            </Card>

            <Card className="shadow-lg rounded-xl mb-6">
              <Title level={4}>Thông tin bổ sung</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="weight" label="Cân nặng (gram)">
                    <InputNumber className="w-full" min={0} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="warranty" label="Bảo hành (tháng)">
                    <InputNumber className="w-full" min={0} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="Kích thước (Dài x Rộng x Cao)">
                <Space.Compact>
                  <Form.Item name={['dimensions', 'length']} noStyle>
                    <InputNumber placeholder="Dài (cm)" min={0} />
                  </Form.Item>
                  <Form.Item name={['dimensions', 'width']} noStyle>
                    <InputNumber placeholder="Rộng (cm)" min={0} />
                  </Form.Item>
                  <Form.Item name={['dimensions', 'height']} noStyle>
                    <InputNumber placeholder="Cao (cm)" min={0} />
                  </Form.Item>
                </Space.Compact>
              </Form.Item>
              <Form.Item name="tags" label="Tags (phân cách bởi dấu phẩy)">
                <Select mode="tags" style={{ width: '100%' }} placeholder="VD: áo nam, thời trang" />
              </Form.Item>
            </Card>

            <Card className="shadow-lg rounded-xl mb-6">
              <VariantManager variants={variants} onVariantsChange={setVariants} />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card className="shadow-lg rounded-xl sticky top-6">
              <Title level={4}>Tổ chức</Title>
              <Form.Item name="category" label="Danh mục" rules={[{ required: true }]}>
                <TreeSelect treeData={categoryTree} placeholder="Chọn danh mục" treeDefaultExpandAll allowClear />
              </Form.Item>
              <Form.Item name="brand" label="Thương hiệu" rules={[{ required: true }]}>
                <Select placeholder="Chọn thương hiệu">
                  {brands.map(b => <Option key={b._id} value={b._id}>{b.name}</Option>)}
                </Select>
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="isFeatured" label="Nổi bật" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="isActive" label="Hiển thị" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
              
              <Divider />

              <Title level={4}>Xem trước ảnh</Title>
              {previewImage ? (
                <img src={previewImage} alt="Preview" style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }} />
              ) : (
                <div className="h-48 flex items-center justify-center bg-gray-200 rounded-lg mb-4">
                  <Text type="secondary">Chưa có ảnh</Text>
                </div>
              )}

              <Divider />

              <Title level={4}>Hành động</Title>
              <Space direction="vertical" className="w-full">
                <Button type="primary" htmlType="submit" loading={submitting} block icon={<SaveOutlined />}>Lưu thay đổi</Button>
                <Button block icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/products')}>Quay lại</Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

const buildCategoryTree = (categories: Category[], parentId: string | null = null): any[] => {
  return categories
    .filter(cat => (cat.parent?._id || cat.parent) === parentId)
    .map(cat => ({
      title: cat.name,
      value: cat._id,
      children: buildCategoryTree(categories, cat._id)
    }));
};

export default ProductEdit;