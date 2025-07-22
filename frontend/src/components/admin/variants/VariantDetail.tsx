import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spin, Alert, Descriptions, Tag, Image, Space, Button, Row, Col, Typography } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { variantApi } from './api';

const { Title, Text } = Typography;

interface Variant {
  _id: string;
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
  product: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  specifications?: { [key: string]: string };
}

const VariantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [variant, setVariant] = useState<Variant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      variantApi.getVariantById(id)
        .then(data => {
          setVariant(data);
          setLoading(false);
        })
        .catch(err => {
          setError('Không thể tải chi tiết biến thể.');
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
  if (error) return <Alert message="Lỗi" description={error} type="error" showIcon />;
  if (!variant) return <Alert message="Không tìm thấy biến thể" type="warning" showIcon />;

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div style={{ padding: 24, background: '#f0f2f5' }}>
      <Card
        bordered={false}
        title={
          <Title level={3} style={{ margin: 0 }}>
            Chi tiết biến thể: {variant.name}
          </Title>
        }
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              Quay lại
            </Button>
            <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/admin/variants/edit/${variant._id}`)}>
              Chỉnh sửa
            </Button>
          </Space>
        }
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Title level={5}>Link hình ảnh</Title>
            <Space direction="vertical" align="start" style={{width: '100%'}}>
              {variant.images && variant.images.length > 0 ? (
                variant.images.map((img, index) => (
                  <a key={index} href={img} target="_blank" rel="noopener noreferrer">{img}</a>
                ))
              ) : (
                <Text type="secondary">Không có hình ảnh</Text>
              )}
            </Space>
          </Col>
          <Col xs={24} md={16}>
            <Descriptions bordered column={1} layout="horizontal">
              <Descriptions.Item label="Tên biến thể">{variant.name}</Descriptions.Item>
              <Descriptions.Item label="SKU">{variant.sku}</Descriptions.Item>
              <Descriptions.Item label="Sản phẩm gốc">
                <a onClick={() => navigate(`/admin/products/detail/${variant.product._id}`)}>{variant.product.name}</a>
              </Descriptions.Item>
              <Descriptions.Item label="Giá gốc">{formatPrice(variant.price)}</Descriptions.Item>
              <Descriptions.Item label="Giá khuyến mãi">
                {variant.salePrice ? formatPrice(variant.salePrice) : 'Không áp dụng'}
              </Descriptions.Item>
              <Descriptions.Item label="Tồn kho">
                <Tag color={variant.stock > 0 ? 'success' : 'error'}>
                  {variant.stock > 0 ? `Còn hàng (${variant.stock})` : 'Hết hàng'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={variant.isActive ? 'green' : 'red'}>
                  {variant.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Màu sắc">{variant.color || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Kích thước">{variant.size || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Cân nặng">{variant.weight ? `${variant.weight} kg` : 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{new Date(variant.createdAt).toLocaleDateString('vi-VN')}</Descriptions.Item>
              <Descriptions.Item label="Cập nhật lần cuối">{new Date(variant.updatedAt).toLocaleDateString('vi-VN')}</Descriptions.Item>
            </Descriptions>
            {/* Hiển thị thông số kỹ thuật nếu có */}
            {variant.specifications && Object.keys(variant.specifications).length > 0 && (
              <div style={{ marginTop: 24 }}>
                <Title level={5}>Thông số kỹ thuật</Title>
                <table className="w-full border rounded-lg overflow-hidden mb-4">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 text-left font-semibold">Thông số</th>
                      <th className="py-2 px-4 text-center font-semibold">Giá trị</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(variant.specifications).map(([key, value]) => (
                      <tr key={key}>
                        <td className="py-2 px-4 bg-gray-50 font-medium">{key}</td>
                        <td className="py-2 px-4 text-center">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default VariantDetail; 