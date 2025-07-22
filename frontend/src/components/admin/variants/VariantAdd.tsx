import React, { useState, useEffect } from 'react';
import { SaveOutlined, ArrowLeftOutlined, PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, Select, InputNumber, Switch, Upload, Card, Row, Col, Divider, message, Spin } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import axios from 'axios';
import SpecificationEditor from '../products/SpecificationEditor';

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

const VariantAdd: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageLinks, setImageLinks] = useState('');
  const [specifications, setSpecifications] = useState<Record<string, string>>({});

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/product');
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
      
      // Ưu tiên lấy link ảnh từ textarea nếu có
      let images: string[] = [];
      if (imageLinks.trim()) {
        images = imageLinks.split('\n').map(link => link.trim()).filter(link => link);
      } else {
        // Convert fileList to image URLs (in real app, upload to server first)
        images = fileList.map(file => file.url || file.thumbUrl || '').filter(url => url);
      }
      
      const formData = {
        ...values,
        images,
        isActive: values.isActive !== undefined ? values.isActive : true,
        specifications,
        color: (typeof values.color === 'object' && typeof values.color.code === 'string' && typeof values.color.name === 'string')
          ? { code: values.color.code, name: values.color.name }
          : (typeof values.color === 'string' ? { code: values.color, name: values.colorName || '' } : { code: '', name: '' }),
      };

      await axios.post('http://localhost:8000/api/variant', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      message.success('Thêm biến thể thành công');
      navigate('/admin/variants');
    } catch (error: any) {
      console.error('Error creating variant:', error);
      message.error(error.response?.data?.message || 'Không thể thêm biến thể');
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (info: any) => {
    setFileList(info.fileList);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Thêm biến thể mới</h1>
              <p className="text-gray-600 mt-1">Tạo biến thể mới cho sản phẩm</p>
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
            initialValues={{
              isActive: true,
              price: 0,
              stock: 0
            }}
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
            <Form.Item label="Thông số kỹ thuật">
              <SpecificationEditor value={specifications} onChange={setSpecifications} />
            </Form.Item>

            {/* Ảnh sản phẩm */}
            <Divider orientation="left">Ảnh sản phẩm</Divider>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="Link ảnh (mỗi dòng 1 link, ưu tiên dùng nếu có)">
                  <Input.TextArea
                    rows={4}
                    placeholder="https://example.com/image1.jpg\nhttps://example.com/image2.jpg"
                    value={imageLinks}
                    onChange={e => setImageLinks(e.target.value)}
                  />
                  <div style={{ color: '#888', fontSize: 12 }}>
                    Nếu nhập link ảnh ở đây, hệ thống sẽ dùng các link này làm ảnh cho biến thể. Nếu để trống, sẽ dùng ảnh upload bên dưới.
                  </div>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Upload ảnh (không bắt buộc, chỉ dùng nếu không nhập link ảnh)">
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onChange={handleImageUpload}
                    beforeUpload={() => false}
                    multiple
                  >
                    {fileList.length < 8 && (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </div>
                    )}
                  </Upload>
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
                {loading ? 'Đang lưu...' : 'Lưu biến thể'}
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default VariantAdd; 