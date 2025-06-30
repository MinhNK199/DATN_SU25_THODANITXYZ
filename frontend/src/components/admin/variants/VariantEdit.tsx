import React, { useState, useEffect } from 'react';
import { SaveOutlined, ArrowLeftOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Form, Input, Select, InputNumber, Switch, Upload, Card, Row, Col, Divider, message, Spin } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import axios from 'axios';

interface Product {
  _id: string;
  name: string;
}

interface VariantForm {
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
  product: string;
}

const { Option } = Select;

const VariantEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Fetch variant data
  useEffect(() => {
    const fetchVariant = async () => {
      try {
        setInitialLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/variant/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const variant = response.data;
        
        // Convert images to fileList format
        const imageFiles: UploadFile[] = (variant.images || []).map((image: string, index: number) => ({
          uid: `-${index}`,
          name: `image-${index}`,
          status: 'done',
          url: image,
          thumbUrl: image
        }));
        setFileList(imageFiles);
        
        form.setFieldsValue({
          name: variant.name || '',
          sku: variant.sku || '',
          price: variant.price || 0,
          salePrice: variant.salePrice,
          stock: variant.stock || 0,
          color: variant.color || '#000000',
          size: variant.size || '',
          weight: variant.weight,
          isActive: variant.isActive !== undefined ? variant.isActive : true,
          product: variant.product?._id || variant.product || ''
        });
      } catch (error) {
        console.error('Error fetching variant:', error);
        message.error('Không thể tải thông tin biến thể');
        navigate('/admin/variants');
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      fetchVariant();
    }
  }, [id, navigate, form]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/product');
        setProducts(response.data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        message.error('Không thể tải danh sách sản phẩm');
      }
    };
    fetchProducts();
  }, []);

  // Handle form submission
  const handleSubmit = async (values: any) => {
    if (!values.product) {
      message.error('Vui lòng chọn sản phẩm');
      return;
    }

    if (values.salePrice && values.salePrice >= values.price) {
      message.error('Giá khuyến mãi phải nhỏ hơn giá gốc');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Convert fileList to image URLs
      const images = fileList.map(file => file.url || file.thumbUrl || '').filter(url => url);
      
      const formData = {
        ...values,
        images,
        isActive: values.isActive !== undefined ? values.isActive : true
      };

      await axios.put(`http://localhost:5000/api/variant/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      message.success('Cập nhật biến thể thành công');
      navigate('/admin/variants');
    } catch (error: any) {
      console.error('Error updating variant:', error);
      message.error(error.response?.data?.message || 'Không thể cập nhật biến thể');
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (info: any) => {
    setFileList(info.fileList);
  };

  if (initialLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Đang tải thông tin biến thể...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa biến thể</h1>
              <p className="text-gray-600 mt-1">Cập nhật thông tin biến thể sản phẩm</p>
            </div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/variants')}
            >
              Quay lại
            </Button>
          </div>
        </Card>

        {/* Form */}
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            {/* Basic Information */}
            <Divider orientation="left">Thông tin cơ bản</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Sản phẩm"
                  name="product"
                  rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
                >
                  <Select placeholder="Chọn sản phẩm">
                    {products.map((product) => (
                      <Option key={product._id} value={product._id}>
                        {product.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Tên biến thể"
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập tên biến thể' }]}
                >
                  <Input placeholder="VD: iPhone 15 Pro Max - Titan tự nhiên - 256GB" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="SKU"
                  name="sku"
                  rules={[{ required: true, message: 'Vui lòng nhập SKU' }]}
                >
                  <Input placeholder="VD: IP15PM-TITAN-256" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Trạng thái"
                  name="isActive"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Kích hoạt" unCheckedChildren="Ẩn" />
                </Form.Item>
              </Col>
            </Row>

            {/* Pricing */}
            <Divider orientation="left">Thông tin giá</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Giá gốc"
                  name="price"
                  rules={[
                    { required: true, message: 'Vui lòng nhập giá' },
                    { type: 'number', min: 0, message: 'Giá phải lớn hơn 0' }
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="0"
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Giá khuyến mãi"
                  name="salePrice"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="0"
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Tồn kho"
                  name="stock"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số lượng tồn kho' },
                    { type: 'number', min: 0, message: 'Số lượng phải lớn hơn hoặc bằng 0' }
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="0"
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Specifications */}
            <Divider orientation="left">Thông số kỹ thuật</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Màu sắc"
                  name="color"
                >
                  <Input type="color" style={{ height: 40 }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Kích thước"
                  name="size"
                >
                  <Input placeholder="VD: 256GB, XL, 42mm" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Cân nặng (g)"
                  name="weight"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="0"
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Images */}
            <Divider orientation="left">Hình ảnh</Divider>
            <Form.Item>
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={handleImageUpload}
                beforeUpload={() => false}
                multiple
              >
                {fileList.length >= 8 ? null : (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Tải ảnh</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            {/* Actions */}
            <Divider />
            <div className="flex justify-end space-x-4">
              <Button onClick={() => navigate('/admin/variants')}>
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                {loading ? 'Đang lưu...' : 'Cập nhật biến thể'}
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default VariantEdit; 