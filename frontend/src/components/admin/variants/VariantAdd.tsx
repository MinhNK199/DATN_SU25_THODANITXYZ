import React, { useState, useEffect } from 'react';
import { SaveOutlined, ArrowLeftOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, Select, InputNumber, Switch, Upload, Card, Row, Col, Divider, message, Spin, ColorPicker } from 'antd';
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
  color?: { code: string; name: string };
  colorName?: string;
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
  const [colorValue, setColorValue] = useState<string>('#000000');
  const [colorName, setColorName] = useState<string>('');

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

  const handleSubmit = async (values: VariantForm) => {
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

      let images: string[] = [];
      if (imageLinks.trim()) {
        images = imageLinks.split('\n').map(link => link.trim()).filter(link => link);
      } else {
        // Giả lập upload ảnh (thay bằng API thực tế)
        images = fileList.map(file => file.url || file.thumbUrl || '').filter(url => url);
        if (fileList.length > 0 && images.length === 0) {
          // Thay bằng API upload thực tế
          images = fileList.map((_, index) => `https://example.com/uploaded/image-${index}.jpg`);
        }
      }

      // Convert RGB to HEX if needed
      const convertToHex = (color: string): string => {
        if (color.startsWith('#')) return color;
        if (color.startsWith('rgb')) {
          const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          if (match) {
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);
            return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
          }
        }
        return color;
      };

      const processedColor = colorValue ? {
        code: convertToHex(colorValue),
        name: colorName || ''
      } : undefined;

      const formData = {
        ...values,
        images,
        isActive: values.isActive ?? true,
        specifications,
        color: processedColor,
        // Ensure numeric fields are numbers
        price: Number(values.price) || 0,
        salePrice: values.salePrice ? Number(values.salePrice) : undefined,
        stock: Number(values.stock) || 0,
        weight: values.weight ? Number(values.weight) : undefined,
        size: values.size ? Number(values.size) : undefined,
      };

      console.log('🚀 Sending formData:', formData);

      await axios.post('http://localhost:8000/api/variant', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      message.success('Thêm biến thể thành công');
      navigate('/admin/variants');
    } catch (error: any) {
      console.error('Error creating variant:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error details:', error.response?.data?.details);
      
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        message.error(`Lỗi validation:\n${error.response.data.details.join('\n')}`);
      } else {
        message.error(error.response?.data?.message || 'Không thể thêm biến thể');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (info: any) => {
    setFileList(info.fileList);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6 shadow-md rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Thêm biến thể mới</h1>
              <p className="text-gray-600 mt-1">Tạo biến thể mới cho sản phẩm</p>
            </div>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/variants')}>
              Quay lại
            </Button>
          </div>
        </Card>

        <Card className="shadow-md rounded-lg">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              isActive: true,
              price: 0,
              stock: 0,
              color: '#000000',
            }}
          >
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
                  rules={[
                    { required: true, message: 'Vui lòng nhập SKU' },
                    { min: 2, message: 'SKU phải từ 2 ký tự trở lên' },
                    { max: 50, message: 'SKU không được quá 50 ký tự' },
                    { 
                      pattern: /^[A-Za-z0-9\-_!@#$%^&*()]+$/, 
                      message: 'SKU chỉ được chứa chữ cái, số và các ký tự: -_!@#$%^&*()' 
                    }
                  ]}
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

            <Divider orientation="left">Thông tin bổ sung</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Màu sắc">
                  <div className="space-y-2">
                    <ColorPicker 
                      value={colorValue}
                      onChange={(color, hex) => {
                        setColorValue(hex || '#000000');
                        form.setFieldsValue({ 
                          color: { code: hex || '#000000', name: colorName || '' },
                          colorName: colorName || ''
                        });
                      }}
                      showText
                      size="middle"
                    />
                    <Form.Item name="colorName" noStyle>
                      <Input 
                        placeholder="Tên màu (VD: Đen, Trắng, Đỏ...)" 
                        onChange={(e) => {
                          setColorName(e.target.value);
                          form.setFieldsValue({ 
                            color: { code: colorValue || '#000000', name: e.target.value }
                          });
                        }}
                      />
                    </Form.Item>
                  </div>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Kích thước" name="size">
                  <Input placeholder="VD: M" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Cân nặng (gram)" name="weight">
                  <InputNumber style={{ width: '100%' }} placeholder="0" min={0} />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Thông số kỹ thuật</Divider>
            <Form.Item label="Thông số kỹ thuật">
              <SpecificationEditor value={specifications} onChange={setSpecifications} />
            </Form.Item>

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