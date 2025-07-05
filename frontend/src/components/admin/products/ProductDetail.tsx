import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Product, ProductVariant } from "../../../interfaces/Product";
import {
  Card,
  Button,
  Modal,
  message,
  Image,
  Tag,
  Divider,
  Row,
  Col,
  Tabs,
  Spin,
  Space,
  Typography,
  Table,
  List,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { getProductById, softDeleteProduct } from "./api";
import type { ColumnsType } from "antd/es/table";

const { Title, Text, Paragraph } = Typography;

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string>("");

  useEffect(() => {
    if (!id) {
      message.error("ID sản phẩm không hợp lệ.");
      navigate("/admin/products");
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await getProductById(id);
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setMainImage(data.images[0]);
        }
      } catch (error) {
        // message handled in api.ts
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleSoftDelete = () => {
    if (!id) return;
    Modal.confirm({
      title: "Bạn có chắc muốn xóa sản phẩm này?",
      icon: <DeleteOutlined />,
      content: "Sản phẩm sẽ được chuyển vào thùng rác và có thể khôi phục sau.",
      okText: "Đồng ý",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await softDeleteProduct(id);
          message.success("Sản phẩm đã được chuyển vào thùng rác.");
          navigate("/admin/products");
        } catch (error) {
          // message handled in api.ts
        }
      },
    });
  };

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen text-center">
        <Text>Không tìm thấy sản phẩm.</Text>
      </div>
    );
  }

  const categoryName =
    typeof product.category === "object" ? product.category.name : "N/A";
  const brandName =
    typeof product.brand === "object" ? product.brand.name : "N/A";

  const variantColumns: ColumnsType<ProductVariant> = [
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { title: "Tên biến thể", dataIndex: "name", key: "name" },
    { title: "Giá", dataIndex: "price", key: "price", render: formatPrice },
    {
      title: "Giá sale",
      dataIndex: "salePrice",
      key: "salePrice",
      render: formatPrice,
    },
    { title: "Tồn kho", dataIndex: "stock", key: "stock" },
    { title: "Màu", dataIndex: "color", key: "color" },
    { title: "Kích thước", dataIndex: "size", key: "size" },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag
          icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={isActive ? "success" : "error"}
        >
          {isActive ? "Hoạt động" : "Ẩn"}
        </Tag>
      ),
    },
  ];

  const InfoItem: React.FC<{ label: string; children: React.ReactNode }> = ({
    label,
    children,
  }) => (
    <div className="mb-2">
      <Text type="secondary">{label}</Text>
      <div className="font-semibold">
        {children !== null && children !== undefined && children !== "" ? (
          children
        ) : (
          <Text type="secondary">N/A</Text>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Card className="bg-white shadow-lg rounded-xl mb-6">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} className="!m-0">
              Chi tiết sản phẩm
            </Title>
            <Text type="secondary">{product.name}</Text>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/admin/products")}
              >
                Quay lại
              </Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/admin/products/edit/${product._id}`)}
              >
                Chỉnh sửa
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleSoftDelete}
              >
                Xóa
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card className="bg-white shadow-lg rounded-xl">
              <Image
                width="100%"
                src={mainImage}
                alt={product.name}
                style={{
                  borderRadius: "8px",
                  border: "1px solid #f0f0f0",
                  marginBottom: "16px",
                }}
              />
              <Image.PreviewGroup>
                <Space wrap>
                  {product.images.map((image, index) => (
                    <Image
                      key={index}
                      src={image}
                      width={60}
                      height={60}
                      alt={`${product.name} thumbnail ${index}`}
                      onClick={() => setMainImage(image)}
                      style={{
                        borderRadius: "4px",
                        border:
                          mainImage === image
                            ? "2px solid #1890ff"
                            : "1px solid #d9d9d9",
                        cursor: "pointer",
                        objectFit: "cover",
                      }}
                      preview={{ src: image }}
                    />
                  ))}
                </Space>
              </Image.PreviewGroup>
            </Card>
            <Card className="bg-white shadow-lg rounded-xl">
              <Title level={4}>Trạng thái</Title>
              <InfoItem label="Hiển thị">
                <Tag
                  icon={
                    product.isActive ? (
                      <CheckCircleOutlined />
                    ) : (
                      <CloseCircleOutlined />
                    )
                  }
                  color={product.isActive ? "success" : "error"}
                >
                  {product.isActive ? "Đang bán" : "Ngừng bán"}
                </Tag>
              </InfoItem>
              <InfoItem label="Nổi bật">
                <Tag color={product.isFeatured ? "gold" : "default"}>
                  {product.isFeatured ? "Sản phẩm nổi bật" : "Bình thường"}
                </Tag>
              </InfoItem>
              <InfoItem label="Tồn kho">
                <Tag color={product.stock > 0 ? "success" : "error"}>
                  {product.stock > 0
                    ? `Còn hàng (${product.stock})`
                    : "Hết hàng"}
                </Tag>
              </InfoItem>
              <InfoItem label="SKU">
                {product.variants?.[0]?.sku || product.sku}
              </InfoItem>
            </Card>
          </Space>
        </Col>

        <Col xs={24} lg={16}>
          <Card className="bg-white shadow-lg rounded-xl h-full">
            <Title level={2} style={{ marginTop: 0 }}>
              {product.name}
            </Title>
            <div className="mb-4">
              {product.salePrice && product.salePrice < product.price ? (
                <Space align="baseline">
                  <Text delete type="secondary" style={{ fontSize: "1.2rem" }}>
                    {formatPrice(product.price)}
                  </Text>
                  <Text type="danger" strong style={{ fontSize: "2rem" }}>
                    {formatPrice(product.salePrice)}
                  </Text>
                  <Tag color="red">
                    -
                    {Math.round(
                      ((product.price - product.salePrice) / product.price) *
                        100
                    )}
                    %
                  </Tag>
                </Space>
              ) : (
                <Text strong style={{ fontSize: "2rem" }}>
                  {formatPrice(product.price)}
                </Text>
              )}
            </div>
            <Tabs
              defaultActiveKey="1"
              items={[
                {
                  key: "1",
                  label: "Tổng quan",
                  children: (
                    <>
                      <Row gutter={32}>
                        <Col span={12}>
                          <InfoItem label="Slug">{product.slug}</InfoItem>
                          <InfoItem label="Danh mục">
                            <Tag color="blue">{categoryName}</Tag>
                          </InfoItem>
                          <InfoItem label="Thương hiệu">
                            <Tag color="geekblue">{brandName}</Tag>
                          </InfoItem>
                          <InfoItem label="Bảo hành">
                            {product.warranty !== undefined &&
                            product.warranty !== null ? (
                              `${product.warranty} tháng`
                            ) : (
                              <Text type="secondary">N/A</Text>
                            )}
                          </InfoItem>
                          <InfoItem label="Cân nặng">
                            {product.weight !== undefined &&
                            product.weight !== null ? (
                              `${product.weight} gram`
                            ) : (
                              <Text type="secondary">N/A</Text>
                            )}
                          </InfoItem>
                          <InfoItem label="Kích thước">
                            {product.dimensions &&
                            product.dimensions.length !== undefined ? (
                              `${product.dimensions.length} x ${product.dimensions.width} x ${product.dimensions.height} (cm)`
                            ) : (
                              <Text type="secondary">N/A</Text>
                            )}
                          </InfoItem>
                          <InfoItem label="Tags">
                            {product.tags && product.tags.length > 0 ? (
                              product.tags.map((tag) => (
                                <Tag key={tag}>{tag}</Tag>
                              ))
                            ) : (
                              <Text type="secondary">Không có thẻ tag.</Text>
                            )}
                          </InfoItem>
                        </Col>
                        <Col span={12}>
                          <InfoItem label="Meta Title">
                            {product.meta?.metaTitle}
                          </InfoItem>
                          <InfoItem label="Meta Description">
                            {product.meta?.metaDescription}
                          </InfoItem>
                        </Col>
                      </Row>
                      <Divider />
                      <Title level={5}>Mô tả</Title>
                      <Paragraph>
                        {product.description ||
                          "Chưa có mô tả cho sản phẩm này."}
                      </Paragraph>
                    </>
                  ),
                },
                {
                  key: "2",
                  label: "Thông số & Tính năng",
                  children: (
                    <Row gutter={32}>
                      <Col span={12}>
                        <Title level={5}>Thông số kỹ thuật</Title>
                        {product.specifications &&
                        Object.keys(product.specifications).length > 0 ? (
                          <table className="w-full border rounded-lg overflow-hidden mb-4">
                            <thead>
                              <tr className="bg-gradient-to-r from-blue-100 to-purple-100">
                                <th className="py-2 px-4 text-left font-semibold text-blue-900 w-56">
                                  Thông số
                                </th>
                                <th className="py-2 px-4 text-center font-semibold text-blue-900">
                                  Giá trị
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(product.specifications).map(
                                ([key, value]) => (
                                  <tr
                                    key={key}
                                    className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                                  >
                                    <td className="py-2 px-4 bg-gray-50 font-medium text-gray-700">
                                      {key}
                                    </td>
                                    <td className="py-2 px-4 text-center">
                                      {value}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        ) : (
                          <Text type="secondary">
                            Không có thông số kỹ thuật.
                          </Text>
                        )}
                      </Col>
                      <Col span={12}>
                        <Title level={5}>Tính năng nổi bật</Title>
                        {product.features && product.features.length > 0 ? (
                          <List
                            dataSource={product.features}
                            renderItem={(item) => (
                              <List.Item>- {item}</List.Item>
                            )}
                          />
                        ) : (
                          <Text type="secondary">
                            Không có tính năng nổi bật.
                          </Text>
                        )}
                      </Col>
                    </Row>
                  ),
                },
                {
                  key: "3",
                  label: `Biến thể (${product.variants?.length || 0})`,
                  children: (
                    <Table
                      columns={variantColumns}
                      dataSource={product.variants}
                      rowKey="_id"
                      pagination={false}
                      size="small"
                    />
                  ),
                },
                {
                  key: "4",
                  label: "Tối ưu SEO",
                  children: (
                    <>
                      <InfoItem label="Meta Title">
                        {product.meta?.metaTitle}
                      </InfoItem>
                      <InfoItem label="Meta Description">
                        {product.meta?.metaDescription}
                      </InfoItem>
                      <InfoItem label="Tags">
                        {product.tags?.length ? (
                          product.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)
                        ) : (
                          <Text type="secondary">Không có thẻ tag.</Text>
                        )}
                      </InfoItem>
                    </>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProductDetail;
