import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Product, ProductVariant } from "../../../interfaces/Product";
import {
  Card,
  Button,
  Modal,
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
  Input,
  Upload,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SaveOutlined,
  PlusOutlined,
  UploadOutlined,
  EyeOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import { getProductById, softDeleteProduct, updateVariantStock } from "./api";
import { useNotification } from "../../../hooks/useNotification";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string>("");
  const [editingStock, setEditingStock] = useState<{ [key: string]: number }>({});
  const [savingStock, setSavingStock] = useState<string | null>(null);
  const [showAdditionalImagesModal, setShowAdditionalImagesModal] = useState(false);
  const [additionalImageFileList, setAdditionalImageFileList] = useState<any[]>([]);

  useEffect(() => {
    if (!id) {
      error("ID sản phẩm không hợp lệ.");
      navigate("/admin/products");
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await getProductById(id);
        console.log("🔍 ProductDetail - Product data:", data);
        console.log("🔍 ProductDetail - Additional images:", data.additionalImages);
        console.log("🔍 ProductDetail - Additional images type:", typeof data.additionalImages);
        console.log("🔍 ProductDetail - Additional images isArray:", Array.isArray(data.additionalImages));
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
          success("Sản phẩm đã được chuyển vào thùng rác.");
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

  // ✅ FUNCTION CẬP NHẬT STOCK CỦA VARIANT
  const handleStockChange = (variantId: string, value: number) => {
    setEditingStock(prev => ({
      ...prev,
      [variantId]: value
    }));
  };

  const handleSaveStock = async (variantId: string) => {
    if (!product) return;

    const newStock = editingStock[variantId];
    if (newStock === undefined || newStock < 0) {
      error("Số lượng tồn kho không hợp lệ!");
      return;
    }

    setSavingStock(variantId);
    try {
      await updateVariantStock(product._id!, variantId, newStock);

      // Cập nhật state local
      setProduct(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          variants: prev.variants?.map(variant =>
            variant._id === variantId
              ? { ...variant, stock: newStock }
              : variant
          )
        };
      });

      // Xóa khỏi editing state
      setEditingStock(prev => {
        const newState = { ...prev };
        delete newState[variantId];
        return newState;
      });

      success("Cập nhật tồn kho thành công!");
    } catch (err) {
      error("Có lỗi xảy ra khi cập nhật tồn kho.");
    } finally {
      setSavingStock(null);
    }
  };

  // Xử lý upload ảnh phụ
  const handleAdditionalImagesUpload = (info: any) => {
    const { fileList } = info;
    setAdditionalImageFileList(fileList);
  };

  // Xóa ảnh phụ
  const handleRemoveAdditionalImage = (indexToRemove: number) => {
    if (!product || !product.additionalImages) return;
    
    const updatedImages = product.additionalImages.filter((_, index) => index !== indexToRemove);
    setProduct({...product, additionalImages: updatedImages});
  };

  // Lưu ảnh phụ mới
  const handleSaveAdditionalImages = async () => {
    if (!product || !id) return;

    try {
      const formData = new FormData();
      
      console.log("🔍 Frontend debug:");
      console.log("additionalImageFileList:", additionalImageFileList);
      console.log("product.additionalImages:", product.additionalImages);
      
      // Thêm ảnh phụ mới
      additionalImageFileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('additionalImages', file.originFileObj);
          console.log("📤 Added new image:", file.originFileObj.name);
        }
      });

      // Thêm ảnh phụ hiện có từ database (không phải từ state đã bị thay đổi)
      // Lấy lại dữ liệu fresh từ server để đảm bảo không mất ảnh cũ
      const currentProduct = await getProductById(id);
      if (currentProduct.additionalImages && currentProduct.additionalImages.length > 0) {
        formData.append('existingAdditionalImages', JSON.stringify(currentProduct.additionalImages));
        console.log("📁 Added existing images from fresh data:", currentProduct.additionalImages);
      }

      // Chỉ gửi các field cần thiết cho validation (không gửi images để tránh conflict)
      formData.append('name', product.name);
      formData.append('price', product.price.toString());
      formData.append('stock', product.stock.toString());
      formData.append('description', product.description || 'Mô tả sản phẩm');
      formData.append('category', typeof product.category === 'object' ? product.category._id : product.category || '');
      formData.append('brand', typeof product.brand === 'object' ? product.brand?._id || '' : product.brand || '');
      // KHÔNG gửi images để tránh đè lên ảnh đại diện
      // formData.append('images', JSON.stringify(product.images || []));
      formData.append('variants', JSON.stringify(product.variants || []));
      formData.append('isActive', product.isActive.toString());
      formData.append('isFeatured', (product.isFeatured || false).toString());

      const token = localStorage.getItem("token");
      
      // Retry logic for connection issues
      let response;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          response = await fetch(`http://localhost:8000/api/product/${id}/additional-images`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });
          break; // Success, exit retry loop
        } catch (fetchError) {
          retryCount++;
          if (retryCount >= maxRetries) {
            throw fetchError;
          }
          console.log(`🔄 Retry ${retryCount}/${maxRetries} for additional images update`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
        }
      }

      if (!response.ok) {
        let errorMessage = "Cập nhật ảnh phụ thất bại";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error("❌ Server error:", errorData);
        } catch (parseError) {
          console.error("❌ Could not parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      const updatedProduct = await response.json();
      console.log("✅ Updated product:", updatedProduct);
      console.log("✅ Updated additionalImages:", updatedProduct.additionalImages);
      
      setProduct(updatedProduct);
      setShowAdditionalImagesModal(false);
      setAdditionalImageFileList([]);
      success("Cập nhật ảnh phụ thành công!");
    } catch (err) {
      console.error("Error updating additional images:", err);
      
      if (err instanceof Error) {
        if (err.message.includes('ERR_CONNECTION_REFUSED')) {
          error("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.");
        } else {
          error(err.message);
        }
      } else {
        error("Có lỗi xảy ra khi cập nhật ảnh phụ.");
      }
    }
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
    {
      title: "Tồn kho",
      dataIndex: "stock",
      key: "stock",
      width: 150,
      render: (stock: number, record: ProductVariant) => (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            value={editingStock[record._id!] !== undefined ? editingStock[record._id!] : stock}
            onChange={(e) => handleStockChange(record._id!, parseInt(e.target.value) || 0)}
            className="w-16"
            size="small"
          />
          <Button
            type="primary"
            size="small"
            icon={<SaveOutlined />}
            loading={savingStock === record._id}
            onClick={() => handleSaveStock(record._id!)}
            className="bg-green-500 hover:bg-green-600 border-green-500"
            disabled={editingStock[record._id!] === undefined || editingStock[record._id!] === stock}
          />
        </div>
      )
    },
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
          </Col>Ảnh phụ sản phẩm (0)
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
              {/* Ảnh chính to */}
              <Image
                width="100%"
                height={400}
                src={mainImage}
                fallback="/placeholder.svg"
                alt={product.name}
                className="rounded-lg border border-gray-200 object-cover mb-4"
              />
              
              {/* Thumbnails ảnh chính */}
              <div className="mb-4">
                <Text strong className="text-sm text-gray-600 mb-2 block">Ảnh đại diện:</Text>
                <Image.PreviewGroup>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {product.images?.length ? (
                      product.images.map((image, index) => (
                        <Image
                          key={index}
                          src={image}
                          width={80}
                          height={80}
                          alt={`${product.name} thumbnail ${index}`}
                          onClick={() => setMainImage(image)}
                          className={`rounded-md border-2 cursor-pointer object-cover flex-shrink-0 ${mainImage === image
                              ? "border-blue-500"
                              : "border-gray-200"
                            }`}
                          preview={{ src: image }}
                        />
                      ))
                    ) : (
                      <Text type="secondary">Không có hình ảnh</Text>
                    )}
                  </div>
                </Image.PreviewGroup>
              </div>

              {/* Ảnh phụ có thể scroll ngang */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Title level={5} className="!mb-0 text-gray-700">
                    Ảnh phụ sản phẩm {product.additionalImages ? `(${product.additionalImages.length})` : '(0)'}
                  </Title>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setShowAdditionalImagesModal(true)}
                    size="small"
                  >
                    {product.additionalImages && product.additionalImages.length > 0 ? 'Sửa ảnh phụ' : 'Thêm ảnh phụ'}
                  </Button>
                </div>
                
                {/* Hiển thị ảnh phụ với scroll ngang */}
                {product.additionalImages && product.additionalImages.length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {product.additionalImages.map((image, index) => (
                      <div key={`additional-${index}`} className="relative group flex-shrink-0">
                        <Image
                          src={image}
                          width={120}
                          height={120}
                          alt={`Additional image ${index + 1}`}
                          className="rounded-lg border border-gray-200 object-cover"
                          preview={{
                            src: image,
                            mask: (
                              <div className="flex items-center justify-center">
                                <EyeOutlined className="text-white text-lg" />
                              </div>
                            ),
                          }}
                        />
                        <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileImageOutlined className="text-4xl mb-2" />
                    <p>Chưa có ảnh phụ nào</p>
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={() => setShowAdditionalImagesModal(true)}
                      className="mt-2"
                    >
                      Thêm ảnh phụ
                    </Button>
                  </div>
                )}
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
                      <div className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {product.description ||
                          "Chưa có mô tả cho sản phẩm này."}
                      </div>
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

      {/* Modal quản lý ảnh phụ */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <span>Quản lý ảnh phụ sản phẩm</span>
            <span className="text-sm text-gray-500">
              ({product.additionalImages?.length || 0} ảnh hiện có)
            </span>
          </div>
        }
        open={showAdditionalImagesModal}
        onCancel={() => {
          setShowAdditionalImagesModal(false);
          setAdditionalImageFileList([]);
        }}
        onOk={handleSaveAdditionalImages}
        okText="Lưu ảnh phụ"
        cancelText="Hủy"
        width={700}
        okButtonProps={{
          disabled: additionalImageFileList.length === 0,
        }}
      >
        <div className="space-y-6">
          {/* Ảnh phụ hiện tại */}
          <div>
            <Text strong className="text-base">Ảnh phụ hiện tại:</Text>
            {product.additionalImages && product.additionalImages.length > 0 ? (
              <div className="mt-3">
                <div className="grid grid-cols-4 gap-3">
                  {product.additionalImages.map((image, index) => (
                    <div key={`current-${index}`} className="relative group">
                      <Image
                        src={image}
                        width={120}
                        height={120}
                        alt={`Current additional image ${index + 1}`}
                        className="rounded-lg border border-gray-200 object-cover"
                        preview={{
                          src: image,
                          mask: (
                            <div className="flex items-center justify-center">
                              <EyeOutlined className="text-white text-lg" />
                            </div>
                          ),
                        }}
                      />
                      <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAdditionalImage(index);
                        }}
                        className="absolute top-1 left-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        title="Xóa ảnh này"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-3 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <FileImageOutlined className="text-4xl text-gray-400 mb-2" />
                <Text type="secondary">Chưa có ảnh phụ</Text>
              </div>
            )}
          </div>

          <Divider />

          {/* Thêm ảnh phụ mới */}
          <div>
            <Text strong className="text-base">Thêm ảnh phụ mới:</Text>
            <div className="mt-3">
              <Upload
                listType="picture-card"
                fileList={additionalImageFileList}
                onChange={handleAdditionalImagesUpload}
                beforeUpload={() => false}
                maxCount={5}
                multiple
                className="w-full"
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: true,
                }}
              >
                {additionalImageFileList.length < 5 && (
                  <div className="flex flex-col items-center justify-center h-24 w-full">
                    <PlusOutlined className="text-2xl text-gray-400 mb-2" />
                    <div className="text-sm text-gray-500">Thêm ảnh</div>
                    <div className="text-xs text-gray-400">
                      {additionalImageFileList.length}/5
                    </div>
                  </div>
                )}
              </Upload>
            </div>
            <div className="mt-2 space-y-1">
              <Text type="secondary" className="text-xs block">
                • Tối đa 5 ảnh phụ mới mỗi lần upload
              </Text>
              <Text type="secondary" className="text-xs block">
                • Ảnh mới sẽ được thêm vào ảnh hiện có
              </Text>
              <Text type="secondary" className="text-xs block">
                • Định dạng: JPG, PNG, JPEG (tối đa 5MB/ảnh)
              </Text>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductDetail;