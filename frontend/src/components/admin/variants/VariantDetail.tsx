import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spin, Alert, Descriptions, Tag, Image, Space, Button, Row, Col, Typography, Modal, Table, Divider } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
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
  size?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
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

  const handleSoftDelete = () => {
    if (!id) return;
    Modal.confirm({
      title: 'Xóa biến thể',
      icon: <DeleteOutlined />,
      content: 'Biến thể sẽ được chuyển vào thùng rác và có thể khôi phục sau.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await variantApi.softDeleteVariant(id);
          message.success('Biến thể đã được chuyển vào thùng rác.');
          navigate('/admin/variants');
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Không thể xóa biến thể');
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Alert message="Lỗi" description={error} type="error" showIcon />
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Alert message="Không tìm thấy biến thể" type="warning" showIcon />
      </div>
    );
  }

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Chuẩn hóa specifications nếu null hoặc undefined
  const specs = variant.specifications || {};

  const InfoItem: React.FC<{ label: string; children: React.ReactNode }> = ({
    label,
    children,
  }) => (
    <div className="mb-4">
      <Text type="secondary" className="block text-sm">
        {label}
      </Text>
      <div className="text-base font-medium">
        {children !== null && children !== undefined && children !== ""
          ? children
          : <Text type="secondary">N/A</Text>}
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header Card */}
      <Card className="mb-6 shadow-md rounded-lg">
        <Row justify="space-between" align="middle">
          <Col xs={24} sm={18}>
            <Title level={3} className="!mt-0">
              {variant.name}
            </Title>
            <Text type="secondary">{variant.sku || "N/A"}</Text>
          </Col>
          <Col xs={24} sm={6} className="text-right mt-4 sm:mt-0">
            <Space direction="horizontal" size="middle" className="flex-wrap">
              <Button
                type="primary"
                className="admin-primary-button"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/admin/variants")}
              >
                Quay lại
              </Button>
              <Button
                type="primary"
                className="admin-primary-button"
                icon={<EditOutlined />}
                onClick={() => navigate(`/admin/variants/edit/${variant._id}`)}
              >
                Chỉnh sửa
              </Button>
              <Button
                type="primary"
                className="admin-primary-button"
                icon={<DeleteOutlined />}
                onClick={handleSoftDelete}
              >
                Xóa
              </Button>
            </Space>
          </Col>
        </Row>
        <div className="mt-4">
          {variant.salePrice && variant.salePrice < variant.price ? (
            <Space align="baseline">
              <Text delete type="secondary" className="text-lg">
                {formatPrice(variant.price)}
              </Text>
              <Text type="danger" strong className="text-2xl">
                {formatPrice(variant.salePrice)}
              </Text>
              <Tag color="red">
                -
                {Math.round(
                  ((variant.price - variant.salePrice) / variant.price) * 100
                )}
                %
              </Tag>
            </Space>
          ) : (
            <Text strong className="text-2xl">
              {formatPrice(variant.price)}
            </Text>
          )}
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Left Column: Images and Status */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card className="shadow-md rounded-lg">
              {/* Ảnh chính */}
              {variant.images && variant.images.length > 0 ? (
                <Image
                  width="100%"
                  height={400}
                  src={variant.images[0]}
                  fallback="/placeholder.svg"
                  alt={variant.name}
                  className="rounded-lg border border-gray-200 object-cover mb-4"
                />
              ) : (
                <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <Text type="secondary">Chưa có hình ảnh</Text>
                </div>
              )}
              
              {/* Tất cả ảnh */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <Title level={5} className="!mb-0 text-gray-700">
                    Tất cả ảnh biến thể ({variant.images?.length || 0} ảnh)
                  </Title>
                </div>
                
                <Image.PreviewGroup>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {variant.images?.map((image, index) => (
                      <div key={index} className="relative flex-shrink-0">
                        <Image
                          src={image}
                          width={120}
                          height={120}
                          alt={`${variant.name} thumbnail ${index}`}
                          className="rounded-lg border-2 border-gray-200 object-cover"
                          preview={{ src: image }}
                        />
                        <div className="absolute top-1 left-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </Image.PreviewGroup>
              </div>
            </Card>
            
            <Card className="shadow-md rounded-lg">
              <Title level={4} className="!mb-4">
                Trạng thái
              </Title>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <InfoItem label="Hiển thị">
                    <Tag
                      icon={
                        variant.isActive ? (
                          <CheckCircleOutlined />
                        ) : (
                          <CloseCircleOutlined />
                        )
                      }
                      color={variant.isActive ? "success" : "error"}
                    >
                      {variant.isActive ? "Đang bán" : "Ngừng bán"}
                    </Tag>
                  </InfoItem>
                </Col>
                <Col span={12}>
                  <InfoItem label="Tồn kho">
                    <Tag color={variant.stock > 0 ? "success" : "error"}>
                      {variant.stock > 0
                        ? `Còn hàng (${variant.stock})`
                        : "Hết hàng"}
                    </Tag>
                  </InfoItem>
                </Col>
                <Col span={12}>
                  <InfoItem label="SKU">{variant.sku || "N/A"}</InfoItem>
                </Col>
                <Col span={12}>
                  <InfoItem label="Sản phẩm">
                    <Button 
                      type="link" 
                      onClick={() => navigate(`/admin/products/detail/${variant.product._id}`)}
                      className="p-0 h-auto font-medium text-blue-600 hover:text-blue-800"
                    >
                      {variant.product.name}
                    </Button>
                  </InfoItem>
                </Col>
              </Row>
            </Card>
          </Space>
        </Col>

        {/* Right Column: Details */}
        <Col xs={24} lg={16}>
          <Card className="shadow-md rounded-lg h-full">
            <div className="space-y-6">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <InfoItem label="Tên biến thể">
                    {variant.name}
                  </InfoItem>
                  <InfoItem label="SKU">
                    {variant.sku || "N/A"}
                  </InfoItem>
                  <InfoItem label="Giá gốc">
                    {formatPrice(variant.price)}
                  </InfoItem>
                  <InfoItem label="Giá sale">
                    {variant.salePrice && variant.salePrice < variant.price ? (
                      <Space>
                        <Text type="danger" strong>
                          {formatPrice(variant.salePrice)}
                        </Text>
                        <Tag color="red">
                          -{Math.round(((variant.price - variant.salePrice) / variant.price) * 100)}%
                        </Tag>
                      </Space>
                    ) : (
                      "Không có"
                    )}
                  </InfoItem>
                  <InfoItem label="Tồn kho">
                    <Tag color={variant.stock > 0 ? "success" : "error"}>
                      {variant.stock > 0 ? `Còn hàng (${variant.stock})` : "Hết hàng"}
                    </Tag>
                  </InfoItem>
                </Col>
                <Col xs={24} sm={12}>
                  <InfoItem label="Màu sắc">
                    {typeof variant.color === 'object' && variant.color ? (
                      <Space>
                        <span
                          className="inline-block w-4 h-4 rounded border"
                          style={{ backgroundColor: variant.color.code }}
                        />
                        <span>{variant.color.name}</span>
                      </Space>
                    ) : (
                      variant.color || "N/A"
                    )}
                  </InfoItem>
                  <InfoItem label="Size (inch)">
                    {variant.size ? `${variant.size} inch` : "N/A"}
                  </InfoItem>
                  <InfoItem label="Kích thước (cm)">
                    {variant.length || variant.width || variant.height
                      ? `${variant.length || 0} x ${variant.width || 0} x ${variant.height || 0} cm`
                      : "N/A"}
                  </InfoItem>
                  <InfoItem label="Cân nặng">
                    {variant.weight ? `${variant.weight} gram` : "N/A"}
                  </InfoItem>
                  <InfoItem label="Trạng thái hiển thị">
                    <Tag
                      icon={variant.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                      color={variant.isActive ? "success" : "error"}
                    >
                      {variant.isActive ? "Đang bán" : "Ngừng bán"}
                    </Tag>
                  </InfoItem>
                  <InfoItem label="Sản phẩm gốc">
                    <Button 
                      type="link" 
                      onClick={() => navigate(`/admin/products/detail/${variant.product._id}`)}
                      className="p-0 h-auto font-medium text-blue-600 hover:text-blue-800"
                    >
                      {variant.product.name}
                    </Button>
                  </InfoItem>
                </Col>
              </Row>
              
              {/* Thông số kỹ thuật nếu có */}
              {Object.keys(specs).length > 0 && (
                <>
                  <Divider />
                  <Title level={5}>Thông số kỹ thuật</Title>
                  <Table
                    dataSource={Object.entries(specs).map(
                      ([key, value]) => ({
                        key,
                        value,
                      })
                    )}
                    columns={[
                      {
                        title: "Thông số",
                        dataIndex: "key",
                        key: "key",
                        width: "40%",
                      },
                      { title: "Giá trị", dataIndex: "value", key: "value" },
                    ]}
                    pagination={false}
                    size="small"
                    className="border rounded-lg"
                  />
                </>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VariantDetail;