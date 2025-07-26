import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spin, Alert, Descriptions, Tag, Image, Space, Button, Row, Col, Typography, Modal, Table } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { variantApi } from './api';
import { message } from 'antd';

const { Title, Text } = Typography;

interface Variant {
  _id: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  color?: string | { code: string; name: string };
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
          console.log('Variant data from API:', data); // Debug: Kiểm tra dữ liệu từ API
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

  const handleDelete = () => {
    if (!id) return;
    Modal.confirm({
      title: 'Xóa biến thể',
      icon: <DeleteOutlined />,
      content: 'Bạn có chắc muốn xóa biến thể này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await variantApi.deleteVariant(id);
          message.success('Xóa biến thể thành công');
          navigate('/admin/variants');
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Không thể xóa biến thể');
        }
      },
    });
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
  if (error) return <Alert message="Lỗi" description={error} type="error" showIcon />;
  if (!variant) return <Alert message="Không tìm thấy biến thể" type="warning" showIcon />;

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  // Chuẩn hóa specifications nếu null hoặc undefined
  const specs = variant.specifications || {};

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card className="shadow-lg rounded-xl mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <Title level={3} className="text-gray-900 mb-2">
              Chi tiết biến thể: {variant.name}
            </Title>
            <Text type="secondary" className="block mb-4">
              SKU: {variant.sku}
            </Text>
            <Space size="middle" className="mb-4">
              <Tag color={variant.isActive ? 'success' : 'error'}>
                {variant.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
              </Tag>
              <Tag color={variant.stock > 0 ? 'success' : 'warning'}>
                {variant.stock > 0 ? `Còn ${variant.stock} sản phẩm` : 'Hết hàng'}
              </Tag>
            </Space>
            <Text strong className="text-xl">
              {variant.salePrice && variant.salePrice < variant.price
                ? formatPrice(variant.salePrice)
                : formatPrice(variant.price)}
            </Text>
            {variant.salePrice && variant.salePrice < variant.price && (
              <Text delete type="secondary" className="ml-2">
                {formatPrice(variant.price)}
              </Text>
            )}
          </div>
          <Space size="middle" className="mt-4 sm:mt-0">
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/variants')}>
              Quay lại
            </Button>
            <Button
              type="default"
              onClick={() => navigate(`/admin/products/edit/${variant.product._id}`)}
            >
              Chỉnh sửa sản phẩm
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
              Xóa
            </Button>
          </Space>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Title level={5} className="text-gray-700 mb-4">
              Hình ảnh
            </Title>
            <Image.PreviewGroup>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                {variant.images?.length ? (
                  variant.images.map((img, index) => (
                    <Image
                      key={index}
                      src={img}
                      width={150}
                      height={150}
                      alt={`Hình ảnh ${index + 1}`}
                      fallback="/placeholder.svg"
                      className="rounded-lg border border-gray-200 object-cover hover:shadow-md transition-shadow"
                      preview={{ src: img }}
                    />
                  ))
                ) : (
                  <Text type="secondary">Không có hình ảnh</Text>
                )}
              </Space>
            </Image.PreviewGroup>
          </Col>
          <Col xs={24} md={16}>
            <Title level={5} className="text-gray-700 mb-4">
              Thông tin chi tiết
            </Title>
            <Descriptions
              bordered
              column={{ xs: 1, sm: 2, md: 1 }}
              layout="vertical"
              className="mb-6"
            >
              <Descriptions.Item label="Sản phẩm gốc">
                <a onClick={() => navigate(`/admin/products/detail/${variant.product._id}`)} className="text-blue-600 hover:underline">
                  {variant.product.name}
                </a>
              </Descriptions.Item>
              {/* <Descriptions.Item label="Màu sắc">
                {typeof variant.color === 'object' && variant.color?.code ? (
                  <Space>
                    <span
                      className="inline-block w-4 h-4 rounded-full border"
                      style={{ backgroundColor: variant.color.code }}
                    />
                    <span>{variant.color.name || variant.color.code}</span>
                  </Space>
                ) : (
                  <span>{variant.color || 'N/A'}</span>
                )}
              </Descriptions.Item> */}
              <Descriptions.Item label="Kích thước">{variant.size || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Cân nặng">{variant.weight ? `${variant.weight} gram` : 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{new Date(variant.createdAt).toLocaleDateString('vi-VN')}</Descriptions.Item>
              <Descriptions.Item label="Cập nhật lần cuối">{new Date(variant.updatedAt).toLocaleDateString('vi-VN')}</Descriptions.Item>
            </Descriptions>

            <div className="mt-6">
              <Title level={5} className="text-gray-700 mb-4">
                Thông số kỹ thuật
              </Title>
              <Table
                dataSource={Object.entries(specs).length > 0 ? Object.entries(specs).map(([key, value]) => ({ key, value })) : [{ key: '', value: 'Không có thông số kỹ thuật' }]}
                columns={[
                  { title: 'Thông số', dataIndex: 'key', key: 'key', width: '40%', className: 'font-medium' },
                  { title: 'Giá trị', dataIndex: 'value', key: 'value', className: 'text-center' },
                ]}
                pagination={false}
                size="middle"
                className="border rounded-lg shadow-sm"
                rowClassName="hover:bg-gray-50"
                locale={{ emptyText: 'Không có dữ liệu' }}
              />
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default VariantDetail;