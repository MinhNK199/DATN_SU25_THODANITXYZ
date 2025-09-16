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
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);
  const [showTextModal, setShowTextModal] = useState(false);
  const [modalText, setModalText] = useState({ title: "", content: "" });
  const [variantPage, setVariantPage] = useState(1);
  const [variantPageSize, setVariantPageSize] = useState(10);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);

  // ✅ FUNCTION TÍNH TỔNG STOCK TỪ CÁC BIẾN THỂ
  const getTotalStock = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((total, variant) => total + (variant.stock || 0), 0);
    }
    return 0;
  };

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

  // ✅ FUNCTION MỞ MODAL CẬP NHẬT STOCK
  const handleOpenStockModal = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setNewStockValue(variant.stock || 0);
    setShowStockModal(true);
  };

  // ✅ FUNCTION ĐÓNG MODAL
  const handleCloseStockModal = () => {
    setShowStockModal(false);
    setSelectedVariant(null);
    setNewStockValue(0);
  };

  // ✅ FUNCTION CẬP NHẬT STOCK QUA MODAL
  const handleSaveStockModal = async () => {
    if (!product || !selectedVariant) return;

    if (newStockValue < 0) {
      error("Số lượng tồn kho không hợp lệ!");
      return;
    }

    setSavingStock(selectedVariant._id!);
    try {
      await updateVariantStock(product._id!, selectedVariant._id!, newStockValue);

      // Cập nhật state local
      setProduct(prev => {
        if (!prev) return null;
        return {
          ...prev,
          variants: prev.variants?.map(variant =>
            variant._id === selectedVariant._id
              ? { ...variant, stock: newStockValue }
              : variant
          )
        };
      });

      success("Cập nhật tồn kho thành công!");
      handleCloseStockModal();
    } catch (err) {
      error("Có lỗi xảy ra khi cập nhật tồn kho.");
    } finally {
      setSavingStock(null);
    }
  };

  // ✅ FUNCTION MỞ MODAL XEM TEXT ĐẦY ĐỦ
  const handleShowTextModal = (title: string, content: string) => {
    setModalText({ title, content });
    setShowTextModal(true);
  };

  // ✅ FUNCTION ĐÓNG MODAL TEXT
  const handleCloseTextModal = () => {
    setShowTextModal(false);
    setModalText({ title: "", content: "" });
  };

  // ✅ FUNCTION XỬ LÝ PHÂN TRANG BIẾN THỂ
  const handleVariantPageChange = (page: number, pageSize?: number) => {
    setVariantPage(page);
    if (pageSize && pageSize !== variantPageSize) {
      setVariantPageSize(pageSize);
    }
  };

  // ✅ FUNCTION XỬ LÝ MODAL MÔ TẢ
  const handleShowDescriptionModal = () => {
    setShowDescriptionModal(true);
  };

  const handleCloseDescriptionModal = () => {
    setShowDescriptionModal(false);
  };

  // Xử lý upload ảnh phụ
  const handleAdditionalImagesUpload = (info: any) => {
    const { fileList } = info;
    setAdditionalImageFileList(fileList);
  };

  // Xóa ảnh phụ và update database
  const handleRemoveAdditionalImage = async (indexToRemove: number) => {
    if (!product || !product.additionalImages || !id) return;
    
    try {
      const updatedImages = product.additionalImages.filter((_, index) => index !== indexToRemove);
      
      // Tạo FormData để gửi ảnh phụ còn lại
      const formData = new FormData();
      formData.append('existingAdditionalImages', JSON.stringify(updatedImages));
      
      // Thêm các field bắt buộc cho validation
      formData.append('name', product.name);
      formData.append('price', product.price.toString());
      formData.append('stock', product.stock.toString());
      formData.append('description', product.description || 'Mô tả sản phẩm');
      formData.append('category', typeof product.category === 'object' ? product.category._id : product.category || '');
      formData.append('brand', typeof product.brand === 'object' ? product.brand?._id || '' : product.brand || '');
      formData.append('variants', JSON.stringify(product.variants || []));
      formData.append('isActive', product.isActive.toString());
      formData.append('isFeatured', (product.isFeatured || false).toString());

      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:8000/api/product/${id}/additional-images`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Lỗi không xác định" }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const updatedProduct = await response.json();
      console.log("✅ Removed additional image, updated product:", updatedProduct);
      
      setProduct(updatedProduct);
      success(`Đã xóa ảnh phụ thành công!`);
      
    } catch (error) {
      console.error("❌ Error removing additional image:", error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa ảnh phụ";
      error("Xóa ảnh phụ thất bại: " + errorMessage);
    }
  };

  // Lưu ảnh phụ mới
  const handleSaveAdditionalImages = async () => {
    if (!product || !id) return;

    // Kiểm tra giới hạn tối đa 5 ảnh phụ
    const currentAdditionalImages = product.additionalImages?.length || 0;
    const newAdditionalImages = additionalImageFileList.filter(file => file.originFileObj).length;
    const totalImages = currentAdditionalImages + newAdditionalImages;
    
    if (totalImages > 5) {
      error(`Tối đa chỉ được 5 ảnh phụ. Hiện tại có ${currentAdditionalImages} ảnh, bạn đang thêm ${newAdditionalImages} ảnh mới.`);
      return;
    }

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
    { 
      title: "SKU", 
      dataIndex: "sku", 
      key: "sku",
      width: 120,
      align: "center",
      render: (sku: string) => {
        const displaySku = sku || "N/A";
        const isLong = displaySku.length > 5;
        const truncatedSku = isLong ? displaySku.substring(0, 5) + "..." : displaySku;
        
        return (
          <div className="flex flex-col items-center justify-center text-center w-full">
            <div className="font-mono text-sm mb-1">{truncatedSku}</div>
            {isLong && (
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleShowTextModal("SKU", displaySku)}
                className="p-0 h-auto text-xs text-blue-500 hover:text-blue-700"
              >
                Xem
              </Button>
            )}
          </div>
        );
      }
    },
    { 
      title: "Tên biến thể", 
      dataIndex: "name", 
      key: "name",
      width: 200,
      align: "center",
      render: (name: string) => {
        const isLong = name.length > 5;
        const truncatedName = isLong ? name.substring(0, 5) + "..." : name;
        
        return (
          <div className="flex flex-col items-center justify-center text-center w-full">
            <div className="font-medium text-sm mb-1">{truncatedName}</div>
            {isLong && (
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleShowTextModal("Tên biến thể", name)}
                className="p-0 h-auto text-xs text-blue-500 hover:text-blue-700"
              >
                Xem
              </Button>
            )}
          </div>
        );
      }
    },
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
      render: (stock: number, record: ProductVariant) => {
        return (
          <div className="text-center space-y-2">
            {/* Hiển thị số lượng hiện tại */}
            <Tag color={stock > 0 ? "green" : "red"} className="text-sm px-3 py-1">
              {stock} sản phẩm
            </Tag>
            
            {/* Nút mở modal */}
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenStockModal(record)}
              className="admin-primary-button w-full"
            >
              Cập nhật
            </Button>
          </div>
        );
      }
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
    {
      title: "Hành động",
      key: "action",
      width: 120,
      render: (_, record: ProductVariant) => (
        <Button
          type="primary"
          size="small"
          className="admin-primary-button"
          onClick={() => navigate(`/admin/variants/detail/${record._id}`)}
          icon={<EyeOutlined />}
        >
          Xem chi tiết
        </Button>
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
      <Card className="mb-6 shadow-md rounded-lg sticky top-0 z-50 bg-white">
        <Row justify="space-between" align="top">
          <Col xs={24} sm={18}>
            <Title level={3} className="!mt-0">
              {product.name}
            </Title>
          </Col>
          <Col xs={24} sm={6} className="text-right">
            <Space direction="horizontal" size="middle" className="justify-end">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/admin/products")}
              >
                Quay lại
              </Button>
              <Button
                type="primary"
                className="admin-primary-button"
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

      <Row gutter={[16, 16]}>
        {/* Left Column: Images and Status */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card className="shadow-md rounded-lg">
              {/* Ảnh chính to */}
              <Image
                width="100%"
                height={500}
                src={mainImage}
                fallback="/placeholder.svg"
                alt={product.name}
                className="rounded-lg border border-gray-200 object-contain mb-4"
                style={{ maxHeight: '500px' }}
              />
              
              {/* Tất cả ảnh - ảnh đại diện và ảnh phụ */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <Title level={5} className="!mb-0 text-gray-700">
                    Tất cả ảnh sản phẩm ({product.additionalImages?.length || 0} ảnh phụ)
                  </Title>
                  <Button
                    type="primary"
                    className="admin-primary-button"
                    icon={<PlusOutlined />}
                    onClick={() => setShowAdditionalImagesModal(true)}
                    size="small"
                  >
                    Quản lý ảnh phụ
                  </Button>
                </div>
                
                <Image.PreviewGroup>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto">
                    {/* Ảnh đại diện */}
                    {product.images?.length ? (
                      product.images.map((image, index) => (
                        <div key={`main-${index}`} className="relative">
                          <Image
                            src={image}
                            width="100%"
                            height={100}
                            alt={`${product.name} thumbnail ${index}`}
                            onClick={() => setMainImage(image)}
                            className={`rounded-lg border-2 cursor-pointer object-cover ${mainImage === image
                                ? "border-blue-500"
                                : "border-gray-200"
                              }`}
                            preview={{ src: image }}
                          />
                          <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                            Chính
                          </div>
                        </div>
                      ))
                    ) : null}
                    
                    {/* Ảnh phụ */}
                    {product.additionalImages?.length ? (
                      product.additionalImages.map((image, index) => (
                        <div key={`additional-${index}`} className="relative group">
                          <Image
                            src={image}
                            width="100%"
                            height={100}
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
                          <div className="absolute bottom-1 right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                            Phụ
                          </div>
                          {/* Button xóa ảnh phụ */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveAdditionalImage(index);
                            }}
                            className="absolute top-1 left-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            title="Xóa ảnh phụ này"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : null}
                    
                    {/* Nếu không có ảnh nào */}
                    {(!product.images?.length && !product.additionalImages?.length) && (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        <FileImageOutlined className="text-4xl mb-2" />
                        <p>Chưa có ảnh nào</p>
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
                </Image.PreviewGroup>
              </div>
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
                    <div className="flex flex-col h-full">
                      {/* Phần thông tin cơ bản */}
                      <div className="space-y-6 flex-shrink-0">
                        <Row gutter={[16, 16]}>
                          <Col xs={24} sm={12}>
                            <InfoItem label="Danh mục">
                              <Tag color="blue">{categoryName}</Tag>
                            </InfoItem>
                            <InfoItem label="Thương hiệu">
                              <Tag color="geekblue">{brandName}</Tag>
                            </InfoItem>
                          </Col>
                          <Col xs={24} sm={12}>
                            <InfoItem label="Bảo hành">
                              {product.warranty
                                ? `${product.warranty} tháng`
                                : "N/A"}
                            </InfoItem>
                            <InfoItem label="SKU">
                              {product.sku || "N/A"}
                            </InfoItem>
                          </Col>
                        </Row>
                        <Divider />
                      </div>

                      {/* Phần mô tả - chiếm không gian còn lại */}
                      <div className="flex-1 flex flex-col">
                        <Title level={5}>Mô tả</Title>
                        <div className="text-base text-gray-700 leading-relaxed flex-1">
                          {(() => {
                            const description = product.description || "Chưa có mô tả cho sản phẩm này.";
                            const isLong = description.length > 50;
                            const truncatedDescription = isLong ? description.substring(0, 50) + "..." : description;
                            
                            return (
                              <div>
                                <div className="whitespace-pre-wrap">{truncatedDescription}</div>
                                {isLong && (
                                  <Button
                                    type="link"
                                    size="small"
                                    onClick={handleShowDescriptionModal}
                                    className="p-0 h-auto text-blue-500 hover:text-blue-700 mt-2"
                                  >
                                    Xem thêm...
                                  </Button>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                      
                      {/* Khối trạng thái - luôn ở dưới cùng */}
                      <div className="mt-6 flex-shrink-0">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Tồn kho tổng */}
                            <div className="text-center">
                              <div className="text-sm text-gray-600 mb-2">Tồn kho tổng</div>
                              <Tag 
                                color={getTotalStock(product) > 0 ? "success" : "error"}
                                className="text-base px-4 py-2"
                              >
                                {getTotalStock(product) > 0 ? `Còn hàng (${getTotalStock(product)})` : "Hết hàng"}
                              </Tag>
                            </div>
                            
                            {/* Trạng thái hiển thị */}
                            <div className="text-center">
                              <div className="text-sm text-gray-600 mb-2">Trạng thái hiển thị</div>
                              <Tag
                                icon={product.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                                color={product.isActive ? "success" : "error"}
                                className="text-base px-4 py-2"
                              >
                                {product.isActive ? "Đang bán" : "Ngừng bán"}
                              </Tag>
                            </div>
                            
                            {/* Trạng thái nổi bật */}
                            <div className="text-center">
                              <div className="text-sm text-gray-600 mb-2">Trạng thái nổi bật</div>
                              <Tag 
                                color={product.isFeatured ? "gold" : "default"}
                                className="text-base px-4 py-2"
                              >
                                {product.isFeatured ? "Nổi bật" : "Bình thường"}
                              </Tag>
                            </div>
                            
                            {/* Tags */}
                            <div className="text-center">
                              <div className="text-sm text-gray-600 mb-2">Tags</div>
                              <div className="flex flex-wrap justify-center gap-1">
                                {product.tags?.length ? (
                                  product.tags.map((tag) => (
                                    <Tag key={tag} className="text-sm px-2 py-1">{tag}</Tag>
                                  ))
                                ) : (
                                  <Text type="secondary" className="text-sm">Không có</Text>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
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
                  key: "2",
                  label: `Biến thể (${product.variants?.length || 0})`,
                  children: (
                    <div>
                      {product.variants?.length ? (
                        <Table
                          columns={variantColumns}
                          dataSource={product.variants}
                          rowKey="_id"
                          pagination={{
                            current: variantPage,
                            pageSize: variantPageSize,
                            total: product.variants.length,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => 
                              `${range[0]}-${range[1]} của ${total} biến thể`,
                            pageSizeOptions: ['5', '10', '20', '50'],
                            onChange: handleVariantPageChange,
                            onShowSizeChange: handleVariantPageChange,
                          }}
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
              ({product.additionalImages?.length || 0}/5 ảnh hiện có)
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
                {(additionalImageFileList.length + (product.additionalImages?.length || 0)) < 5 && (
                  <div className="flex flex-col items-center justify-center h-24 w-full">
                    <PlusOutlined className="text-2xl text-gray-400 mb-2" />
                    <div className="text-sm text-gray-500">Thêm ảnh</div>
                    <div className="text-xs text-gray-400">
                      {(additionalImageFileList.length + (product.additionalImages?.length || 0))}/5
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

      {/* Modal cập nhật số lượng tồn kho */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <EditOutlined className="text-blue-600" />
            <span>Cập nhật số lượng tồn kho</span>
          </div>
        }
        open={showStockModal}
        onCancel={handleCloseStockModal}
        footer={null}
        width={600}
        className="stock-update-modal"
      >
        {selectedVariant && (
          <div className="space-y-6">
            {/* Thông tin biến thể */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">
                    {selectedVariant.name?.charAt(0) || "V"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-lg text-gray-800 mb-1 truncate" title={selectedVariant.name}>
                    {selectedVariant.name}
                  </div>
                  <div className="text-sm text-gray-600 truncate" title={selectedVariant.sku || "N/A"}>
                    SKU: {selectedVariant.sku || "N/A"}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Trạng thái */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 text-center">Trạng thái</div>
                  <Tag color={selectedVariant.isActive ? "green" : "red"} className="text-base px-4 py-2 w-full justify-center">
                    {selectedVariant.isActive ? "Hoạt động" : "Tạm dừng"}
                  </Tag>
                </div>

                {/* Tồn kho hiện tại */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                  <div className="text-xs text-green-600 uppercase tracking-wide mb-2 text-center">Tồn kho hiện tại</div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">📦</span>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-700">{selectedVariant.stock}</div>
                      <div className="text-xs text-green-600">sản phẩm</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phần cập nhật số lượng */}
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                <span className="text-lg font-semibold text-gray-800">Cập nhật tồn kho</span>
              </div>
              
              {/* Input số lượng mới */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <div className="text-center mb-4">
                  <div className="text-sm text-blue-600 uppercase tracking-wide mb-2">Nhập số lượng mới</div>
                  <Input
                    type="number"
                    min={0}
                    value={newStockValue}
                    onChange={(e) => setNewStockValue(parseInt(e.target.value) || 0)}
                    className="text-xl font-semibold text-center"
                    size="large"
                    placeholder="Nhập số lượng..."
                  />
                </div>
              </div>

              {/* Hiển thị thay đổi */}
              {newStockValue !== selectedVariant.stock && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">⚡</span>
                      </div>
                      <span className="text-sm font-medium text-amber-700">Thay đổi</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-3xl font-bold ${newStockValue > selectedVariant.stock ? "text-green-600" : "text-red-600"}`}>
                        {newStockValue > selectedVariant.stock ? "+" : ""}{newStockValue - selectedVariant.stock}
                      </span>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${newStockValue > selectedVariant.stock ? "text-green-600" : "text-red-600"}`}>
                          {newStockValue > selectedVariant.stock ? "Tăng" : "Giảm"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {newStockValue > selectedVariant.stock ? "Bổ sung kho" : "Trừ kho"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Nút hành động */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  onClick={handleCloseStockModal}
                  size="large"
                  className="px-6"
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<SaveOutlined />}
                  loading={savingStock === selectedVariant._id}
                  onClick={handleSaveStockModal}
                  className="admin-primary-button px-6"
                  disabled={newStockValue === selectedVariant.stock}
                >
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal xem text đầy đủ */}
      <Modal
        title={modalText.title}
        open={showTextModal}
        onCancel={handleCloseTextModal}
        footer={[
          <Button key="close" onClick={handleCloseTextModal}>
            Đóng
          </Button>
        ]}
        width={400}
        centered
      >
        <div className="p-4">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="text-sm text-gray-600 mb-2">{modalText.title}:</div>
            <div className="font-mono text-base break-all">{modalText.content}</div>
          </div>
        </div>
      </Modal>

      {/* Modal xem mô tả đầy đủ */}
      <Modal
        title="Mô tả sản phẩm"
        open={showDescriptionModal}
        onCancel={handleCloseDescriptionModal}
        footer={[
          <Button key="close" onClick={handleCloseDescriptionModal}>
            Đóng
          </Button>
        ]}
        width={600}
        centered
      >
        <div className="p-4">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
              {product?.description || "Chưa có mô tả cho sản phẩm này."}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductDetail;