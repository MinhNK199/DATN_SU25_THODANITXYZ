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
        setMainImage(data.images?.[0] || "/placeholder.svg");
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
      title: "Xóa sản phẩm",
      icon: <DeleteOutlined />,
      content: "Sản phẩm sẽ được chuyển vào thùng rác và có thể khôi phục sau.",
      okText: "Xóa",
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

  // Hàm gộp thông số kỹ thuật từ product và variants
  const mergeSpecifications = (
    productSpecs?: Record<string, string>,
    variants?: ProductVariant[]
  ): Record<string, string> => {
    const merged: Record<string, Set<string>> = {};

    // Thu thập thông số từ product.specifications
    if (productSpecs && typeof productSpecs === "object") {
      Object.entries(productSpecs).forEach(([key, value]) => {
        if (!merged[key]) merged[key] = new Set();
        merged[key].add(value);
      });
    }

    // Thu thập thông số từ variants[].specifications
    variants?.forEach((variant) => {
      if (variant.specifications && typeof variant.specifications === "object") {
        Object.entries(variant.specifications).forEach(([key, value]) => {
          if (!merged[key]) merged[key] = new Set();
          merged[key].add(value);
        });
      }
    });

    // Chuyển Set thành chuỗi, nối các giá trị bằng dấu phẩy
    const result: Record<string, string> = {};
    Object.entries(merged).forEach(([key, valueSet]) => {
      result[key] = Array.from(valueSet).join(", ");
    });

    return result;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Text>Không tìm thấy sản phẩm.</Text>
      </div>
    );
  }

  const categoryName =
    typeof product.category === "object" && product.category?.name
      ? product.category.name
      : "N/A";
  const brandName =
    typeof product.brand === "object" && product.brand?.name
      ? product.brand.name
      : "N/A";

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
    // {
    //   title: "Màu",
    //   dataIndex: "color",
    //   key: "color",
    //   render: (color: string | { code: string; name: string }) => {
    //     if (typeof color === "object" && color?.code) {
    //       return (
    //         <Space>
    //           <span
    //             className="inline-block w-4 h-4 rounded border"
    //             style={{ backgroundColor: color.code }}
    //           />
    //           <span>{color.name || "N/A"}</span>
    //         </Space>
    //       );
    //     }
    //     return (
    //       <Space>
    //         <span
    //           className="inline-block w-4 h-4 rounded border"
    //           style={{ backgroundColor: color || "#000000" }}
    //         />
    //         <span>{color || "N/A"}</span>
    //       </Space>
    //     );
    //   },
    // },
    {
      title: "Kích thước",
      dataIndex: "size",
      key: "size",
      render: (size) => size || "N/A",
    },
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

  const mainVariant = product.variants?.[0];
  const length = product.dimensions?.length || mainVariant?.length || 0;
  const width = product.dimensions?.width || mainVariant?.width || 0;
  const height = product.dimensions?.height || mainVariant?.height || 0;
  const weight = product.weight || mainVariant?.weight || 0;

  // Gộp thông số kỹ thuật
  const mergedSpecifications = mergeSpecifications(
    product.specifications,
    product.variants
  );

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header Card */}
      <Card className="mb-6 shadow-md rounded-lg">
        <Row justify="space-between" align="middle">
          <Col xs={24} sm={18}>
            <Title level={3} className="!mt-0">
              {product.name}
            </Title>
            <Text type="secondary">{product.sku || "N/A"}</Text>
          </Col>
          <Col xs={24} sm={6} className="text-right mt-4 sm:mt-0">
            <Space direction="horizontal" size="middle" className="flex-wrap">
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
        <div className="mt-4">
          {product.salePrice && product.salePrice < product.price ? (
            <Space align="baseline">
              <Text delete type="secondary" className="text-lg">
                {formatPrice(product.price)}
              </Text>
              <Text type="danger" strong className="text-2xl">
                {formatPrice(product.salePrice)}
              </Text>
              <Tag color="red">
                -
                {Math.round(
                  ((product.price - product.salePrice) / product.price) * 100
                )}
                %
              </Tag>
            </Space>
          ) : (
            <Text strong className="text-2xl">
              {formatPrice(product.price)}
            </Text>
          )}
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Left Column: Images and Status */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card className="shadow-md rounded-lg">
              <Image
                width="100%"
                height={300}
                src={mainImage}
                fallback="/placeholder.svg"
                alt={product.name}
                className="rounded-lg border border-gray-200 object-cover"
              />
              <div className="mt-4">
                <Image.PreviewGroup>
                  <Space wrap>
                    {product.images?.length ? (
                      product.images.map((image, index) => (
                        <Image
                          key={index}
                          src={image}
                          width={80}
                          height={80}
                          alt={`${product.name} thumbnail ${index}`}
                          onClick={() => setMainImage(image)}
                          className={`rounded-md border-2 cursor-pointer object-cover ${
                            mainImage === image
                              ? "border-blue-500"
                              : "border-gray-200"
                          }`}
                          preview={{ src: image }}
                        />
                      ))
                    ) : (
                      <Text type="secondary">Không có hình ảnh</Text>
                    )}
                  </Space>
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
                </Col>
                <Col span={12}>
                  <InfoItem label="Nổi bật">
                    <Tag color={product.isFeatured ? "gold" : "default"}>
                      {product.isFeatured ? "Nổi bật" : "Bình thường"}
                    </Tag>
                  </InfoItem>
                </Col>
                <Col span={12}>
                  <InfoItem label="Tồn kho">
                    <Tag color={product.stock > 0 ? "success" : "error"}>
                      {product.stock > 0
                        ? `Còn hàng (${product.stock})`
                        : "Hết hàng"}
                    </Tag>
                  </InfoItem>
                </Col>
                <Col span={12}>
                  <InfoItem label="SKU">{product.sku || "N/A"}</InfoItem>
                </Col>
              </Row>
            </Card>
          </Space>
        </Col>

        {/* Right Column: Details */}
        <Col xs={24} lg={16}>
          <Card className="shadow-md rounded-lg h-full">
            <Tabs
              defaultActiveKey="1"
              items={[
                {
                  key: "1",
                  label: "Tổng quan",
                  children: (
                    <div className="space-y-6">
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                          <InfoItem label="Danh mục">
                            <Tag color="blue">{categoryName}</Tag>
                          </InfoItem>
                          <InfoItem label="Thương hiệu">
                            <Tag color="geekblue">{brandName}</Tag>
                          </InfoItem>
                          <InfoItem label="Bảo hành">
                            {product.warranty
                              ? `${product.warranty} tháng`
                              : "N/A"}
                          </InfoItem>
                          <InfoItem label="Cân nặng">
                            {weight ? `${weight} gram` : "N/A"}
                          </InfoItem>
                        </Col>
                        <Col xs={24} sm={12}>
                          <InfoItem label="Kích thước">
                            {length || width || height
                              ? `${length} x ${width} x ${height} cm`
                              : "N/A"}
                          </InfoItem>
                          <InfoItem label="Tags">
                            {product.tags?.length ? (
                              product.tags.map((tag) => (
                                <Tag key={tag}>{tag}</Tag>
                              ))
                            ) : (
                              <Text type="secondary">
                                Không có thẻ tag
                              </Text>
                            )}
                          </InfoItem>
                          <InfoItem label="Meta Title">
                            {product.meta?.metaTitle || "N/A"}
                          </InfoItem>
                          <InfoItem label="Meta Description">
                            {product.meta?.metaDescription || "N/A"}
                          </InfoItem>
                        </Col>
                      </Row>
                      <Divider />
                      <Title level={5}>Mô tả</Title>
                      <Paragraph className="text-base">
                        {product.description ||
                          "Chưa có mô tả cho sản phẩm này."}
                      </Paragraph>
                    </div>
                  ),
                },
                {
                  key: "2",
                  label: "Thông số kỹ thuật",
                  children: (
                    <div>
                      {Object.keys(mergedSpecifications).length > 0 ? (
                        <Table
                          dataSource={Object.entries(mergedSpecifications).map(
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
                      ) : (
                        <Text type="secondary">
                          Không có thông số kỹ thuật.
                        </Text>
                      )}
                    </div>
                  ),
                },
                // {
                //   key: "3",
                //   label: "Tính năng nổi bật",
                //   children: (
                //     <div>
                //       {product.features?.length ? (
                //         <List
                //           dataSource={product.features}
                //           renderItem={(item) => (
                //             <List.Item className="text-base">
                //               • {item}
                //             </List.Item>
                //           )}
                //         />
                //       ) : (
                //         <Text type="secondary">
                //           Không có tính năng nổi bật.
                //         </Text>
                //       )}
                //     </div>
                //   ),
                // },
                {
                  key: "4",
                  label: `Biến thể (${product.variants?.length || 0})`,
                  children: (
                    <div>
                      {product.variants?.length ? (
                        <Table
                          columns={variantColumns}
                          dataSource={product.variants}
                          rowKey="_id"
                          pagination={false}
                          size="small"
                          scroll={{ x: 800 }}
                        />
                      ) : (
                        <Text type="secondary">Không có biến thể.</Text>
                      )}
                    </div>
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