import React, { useState, useEffect } from 'react';
import { SaveOutlined, ArrowLeftOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, Select, InputNumber, Switch, Upload, Card, Row, Col, Divider, message as antdMessage, Spin, ColorPicker, Image, Space, Typography } from 'antd';
import { useNotification } from '../../../hooks/useNotification';
import type { UploadFile } from 'antd/es/upload/interface';
import axios from 'axios';
import SpecificationEditor from '../products/SpecificationEditor';

const { Title, Text } = Typography;

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
  size?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  images: string[];
  isActive: boolean;
  product: string;
}

const { Option } = Select;

const VariantAdd: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  // Xóa nhập link ảnh, chỉ dùng file upload
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
        error('Không thể tải danh sách sản phẩm');
      }
    };
    fetchProducts();
  }, []);

  const handleSubmit = async (values: VariantForm) => {
    if (!values.product) {
      error('Vui lòng chọn sản phẩm');
      return;
    }

    if (values.salePrice && values.salePrice >= values.price) {
      error('Giá khuyến mãi phải nhỏ hơn giá gốc');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      let images: string[] = [];
      // Upload từng file lên server và lấy đường dẫn trả về
      if (fileList.length > 0) {
        for (const file of fileList) {
          if (file.originFileObj) {
            const formData = new FormData();
            formData.append('image', file.originFileObj);
            const uploadRes = await axios.post('http://localhost:8000/api/upload/image', formData, {
              headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
            });
            if (uploadRes.data && uploadRes.data.url) {
              images.push(uploadRes.data.url);
            }
          }
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
        length: values.length ? Number(values.length) : undefined,
        width: values.width ? Number(values.width) : undefined,
        height: values.height ? Number(values.height) : undefined,
      };

      console.log('🚀 Sending formData:', formData);

      await axios.post('http://localhost:8000/api/variant', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      success('Thêm biến thể thành công');
      navigate('/admin/variants');
    } catch (error: any) {
      console.error('Error creating variant:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error details:', error.response?.data?.details);

      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        error(`Lỗi validation:\n${error.response.data.details.join('\n')}`);
      } else {
        error(error.response?.data?.message || 'Không thể thêm biến thể');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (info: any) => {
    setFileList(info.fileList);
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header Card */}
        <Card className="mb-6 shadow-md rounded-lg">
          <Row justify="space-between" align="middle">
            <Col xs={24} sm={18}>
              <Title level={3} className="!mt-0">
                Thêm biến thể mới
              </Title>
              <Text type="secondary">Tạo biến thể mới cho sản phẩm</Text>
            </Col>
            <Col xs={24} sm={6} className="text-right mt-4 sm:mt-0">
              <Space direction="horizontal" size="middle" className="flex-wrap">
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/admin/variants')}
                >
                  Quay lại
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]}>
          {/* Left Column: Main Form */}
          <Col xs={24} lg={16}>
            <Card className="shadow-md rounded-lg h-full">
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
                <Title level={4} className="!mb-4">Thông tin cơ bản</Title>
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
                <Form.Item label="Size (inch)" name="size">
                  <InputNumber
                    placeholder="Size (inch)"
                    min={1}
                    addonAfter="inch"
                    style={{ width: '100%' }}
                    step={0.1}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Cân nặng (gram)" name="weight">
                  <InputNumber style={{ width: '100%' }} placeholder="0" min={0} />
                </Form.Item>
              </Col>
            </Row>

            <Title level={5} className="!mb-4">Kích thước (cm)</Title>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Dài" name="length">
                  <InputNumber
                    placeholder="Dài (cm)"
                    min={0}
                    addonAfter="cm"
                    style={{ width: '100%' }}
                    step={0.1}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Rộng" name="width">
                  <InputNumber
                    placeholder="Rộng (cm)"
                    min={0}
                    addonAfter="cm"
                    style={{ width: '100%' }}
                    step={0.1}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Cao" name="height">
                  <InputNumber
                    placeholder="Cao (cm)"
                    min={0}
                    addonAfter="cm"
                    style={{ width: '100%' }}
                    step={0.1}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Thông số kỹ thuật</Divider>
            <Form.Item label="Thông số kỹ thuật">
              <SpecificationEditor value={specifications} onChange={setSpecifications} />
            </Form.Item>

                <Title level={4} className="!mb-4">Ảnh biến thể</Title>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item label="Upload ảnh biến thể">
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
                      {/* Hiển thị preview ảnh đã chọn */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                        {fileList.map((file, idx) => (
                          <Image
                            key={idx}
                            src={file.thumbUrl || file.url}
                            width={100}
                            height={100}
                            style={{ borderRadius: 8, border: '1px solid #eee' }}
                            alt={`Ảnh biến thể ${idx + 1}`}
                          />
                        ))}
                      </div>
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
                    className="admin-primary-button"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    {loading ? 'Đang lưu...' : 'Lưu biến thể'}
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>

          {/* Right Column: Preview and Settings */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Card className="shadow-md rounded-lg">
                <Title level={4} className="!mb-4">Cài đặt</Title>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Text strong>Hiển thị</Text>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Text strong>Nổi bật</Text>
                    <Switch />
                  </div>
                </div>
              </Card>

              <Card className="shadow-md rounded-lg">
                <Title level={4} className="!mb-4">Xem trước</Title>
                <div className="text-center">
                  {fileList.length > 0 ? (
                    <Image
                      src={fileList[0].thumbUrl || fileList[0].url}
                      width="100%"
                      height={200}
                      style={{ borderRadius: 8, border: '1px solid #eee' }}
                      alt="Preview"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Text type="secondary">Chưa có ảnh</Text>
                    </div>
                  )}
                </div>
              </Card>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default VariantAdd;