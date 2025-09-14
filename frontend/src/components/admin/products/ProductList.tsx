import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "../../../interfaces/Product";
import { Brand } from "../../../interfaces/Brand";
import {
  getProducts,
  getDeletedProducts,
  softDeleteProduct,
  restoreProduct,
  hardDeleteProduct,
  getBrands,
} from "./api";
import {
  Card,
  Table,
  Typography,
  Button,
  Space,
  Input,
  Select,
  Avatar,
  Tag,
  Modal,
  Tooltip,
  message,
  Row,
  Col,
  Badge,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  SearchOutlined,
  UndoOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { debounce } from "lodash";
import { useErrorNotification } from "../../../hooks/useErrorNotification";

const { Title, Text } = Typography;
const { confirm } = Modal;

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const getTotalStock = (product: Product) => {
  let total = product.stock || 0;
  if (product.variants && product.variants.length > 0) {
    for (const v of product.variants) {
      total += v.stock || 0;
    }
  }
  return total;
};

const ProductListPage: React.FC = () => {
  const { handleError } = useErrorNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [deletedProducts, setDeletedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTrashVisible, setTrashVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState<string | undefined>(undefined);
  const [filterStock, setFilterStock] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(
    undefined
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  const navigate = useNavigate();

  const fetchData = async (page = currentPage, size = pageSize) => {
    setLoading(true);
    try {
      const filters = {
        keyword: searchTerm || undefined,
        brand: filterBrand,
        isActive: filterStatus === 'active' ? true : filterStatus === 'inactive' ? false : undefined,
      };

      const [productsResponse, deletedProductsData, brandsData] = await Promise.all([
        getProducts('-createdAt', page, size, filters),
        getDeletedProducts(),
        getBrands()
      ]);

      console.log("🔍 ProductList - Raw productsResponse:", productsResponse);
      console.log("🔍 ProductList - First product:", productsResponse.products[0]);
      console.log("🔍 ProductList - First product images:", productsResponse.products[0]?.images);

      setProducts(productsResponse.products);
      setTotalPages(productsResponse.pages);
      setTotalProducts(productsResponse.total);
      setDeletedProducts(deletedProductsData);
      setBrands(brandsData);
    } catch (error) {
      // message is handled in api.ts
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Refetch data when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchData(1, pageSize);
  }, [searchTerm, filterBrand, filterStatus, filterStock]);

  const handleSoftDelete = (id: string) => {
    confirm({
      title: "Bạn có chắc muốn đưa sản phẩm này vào thùng rác?",
      icon: <ExclamationCircleFilled />,
      content: "Sản phẩm sẽ được chuyển vào thùng rác và có thể khôi phục sau.",
      okText: "Đồng ý",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await softDeleteProduct(id);
          message.success("Đã chuyển vào thùng rác!");
          fetchData();
        } catch (error) {
          handleError(error, "Thao tác thất bại!");
        }
      },
    });
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreProduct(id);
      message.success("Khôi phục sản phẩm thành công!");
      fetchData();
    } catch (error) {
      handleError(error, "Khôi phục thất bại!");
    }
  };

  const handleHardDelete = (id: string) => {
    confirm({
      title: "Bạn có chắc muốn xóa vĩnh viễn sản phẩm này?",
      icon: <ExclamationCircleFilled />,
      content:
        "Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa hoàn toàn.",
      okText: "Xóa vĩnh viễn",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await hardDeleteProduct(id);
          message.success("Đã xóa sản phẩm vĩnh viễn!");
          fetchData(); // Refetch để cập nhật lại danh sách thùng rác
        } catch (error) {
          handleError(error, "Xóa vĩnh viễn thất bại!");
        }
      },
    });
  };

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  // Pagination handlers
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
      fetchData(page, size);
    } else {
      fetchData(page, pageSize);
    }
  };

  const handlePageSizeChange = (current: number, size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    fetchData(1, size);
  };

  // Client-side filtering for stock (backend doesn't support stock filtering yet)
  const filteredProducts = products.filter((p) => {
    if (filterStock === "inStock") return p.stock > 0;
    if (filterStock === "outOfStock") return p.stock === 0;
    return true;
  });

  const columns: ColumnsType<Product> = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (_text, _record, index) => index + 1,
    },
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      width: "30%",
      render: (_, record) => {
        console.log("🔍 ProductList - Rendering product:", record.name);
        console.log("🔍 ProductList - Product images array:", record.images);
        console.log("🔍 ProductList - Images type:", typeof record.images);
        console.log("🔍 ProductList - Images length:", record.images?.length);
        console.log("🔍 ProductList - First image:", record.images?.[0]);
        
        const mainImage = record.images && record.images.length > 0 ? record.images[0] : '/placeholder-product.png';
        console.log("🔍 ProductList - Final image URL:", mainImage);
        
        return (
          <Space>
            <div style={{ position: "relative" }}>
              <Avatar 
                shape="square" 
                size={64} 
                src={mainImage}
                onError={() => {
                  console.error("Image load error for product:", record.name, "Image URL:", mainImage);
                }}
              />
              {/* Hiển thị số lượng ảnh phụ */}
              {record.additionalImages && record.additionalImages.length > 0 && (
                <Badge 
                  count={record.additionalImages.length} 
                  style={{ 
                    position: "absolute", 
                    top: -8, 
                    right: -8,
                    backgroundColor: "#52c41a",
                    fontSize: "10px"
                  }} 
                />
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Text strong>{record.name}</Text>
              <Text type="secondary">
                SKU: {record.sku || record.variants?.[0]?.sku || "N/A"}
              </Text>
              {/* Hiển thị thông tin ảnh phụ */}
              {record.additionalImages && record.additionalImages.length > 0 && (
                <Text type="secondary" style={{ fontSize: "11px" }}>
                  +{record.additionalImages.length} ảnh phụ
                </Text>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: "15%",
      render: (price, record) => (
        <div>
          {record.salePrice && record.salePrice < price ? (
            <>
              <Text delete type="secondary">
                {formatPrice(price)}
              </Text>
              <br />
              <Text type="danger" strong>
                {formatPrice(record.salePrice)}
              </Text>
            </>
          ) : (
            <Text strong>{formatPrice(price)}</Text>
          )}
        </div>
      ),
    },
    {
      title: "Kho hàng",
      dataIndex: "stock",
      key: "stock",
      align: "center",
      width: "12%",
      render: (_, record) => {
        const totalStock = getTotalStock(record);
        return (
          <Tag color={totalStock > 0 ? "green" : "red"}>
            {totalStock > 0 ? `Còn hàng (${totalStock})` : "Hết hàng"}
          </Tag>
        );
      },
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (category) =>
        typeof category === "object" && category !== null
          ? category.name
          : typeof category === "string"
            ? category
            : "N/A",
    },
    {
      title: "Trạng thái",
      key: "status",
      align: "center",
      width: "12%",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Tag color={record.isActive ? "success" : "error"}>
            {record.isActive ? "Đang bán" : "Ngừng bán"}
          </Tag>
          {record.isFeatured && <Tag color="gold">Nổi bật</Tag>}
        </Space>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "right",
      width: "15%",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/products/detail/${record._id}`);
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/products/edit/${record._id}`);
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa (Thùng rác)">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleSoftDelete(record._id);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const trashColumns: ColumnsType<Product> = [
    {
      title: "Sản phẩm",
      key: "product",
      render: (_, record) => <Typography.Text>{record.name}</Typography.Text>,
    },
    {
      title: "Hành động",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="Khôi phục">
            <Button
              icon={<UndoOutlined />}
              onClick={() => handleRestore(record._id)}
            />
          </Tooltip>
          <Tooltip title="Xóa vĩnh viễn">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleHardDelete(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Card className="bg-white shadow-lg rounded-xl">
        <Row
          gutter={[16, 16]}
          justify="space-between"
          align="middle"
          className="mb-4"
        >
          <Col>
            <Title level={3} className="!m-0">
              Quản lý Sản phẩm
            </Title>
            <Text type="secondary">
              Tổng quan và quản lý các sản phẩm. Hiển thị {filteredProducts.length} / {totalProducts} sản phẩm
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              className="admin-primary-button"
              icon={<PlusOutlined />}
              onClick={() => navigate("/admin/products/add")}
            >
              Thêm sản phẩm
            </Button>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={10} lg={8}>
            <Input
              placeholder="Tìm kiếm theo tên, SKU..."
              prefix={<SearchOutlined />}
              onChange={(e) => debouncedSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={5} lg={4}>
            <Select
              placeholder="Thương hiệu"
              style={{ width: "100%" }}
              onChange={setFilterBrand}
              allowClear
              options={brands.map((brand) => ({
                label: brand.name,
                value: brand._id,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={5} lg={4}>
            <Select
              placeholder="Tồn kho"
              style={{ width: "100%" }}
              onChange={setFilterStock}
              allowClear
              options={[
                { value: "inStock", label: "Còn hàng" },
                { value: "outOfStock", label: "Hết hàng" },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={4} lg={4}>
            <Select
              placeholder="Hiển thị"
              style={{ width: "100%" }}
              onChange={setFilterStatus}
              allowClear
              options={[
                { value: "active", label: "Đang bán" },
                { value: "inactive", label: "Ngừng bán" },
              ]}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="_id"
          loading={loading}
          onRow={(record) => ({
            onClick: () => navigate(`/admin/products/detail/${record._id}`),
            style: { cursor: "pointer" },
          })}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalProducts,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} sản phẩm`,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: handlePageChange,
            onShowSizeChange: handlePageSizeChange,
            responsive: true,
          }}
        />
      </Card>

      <Modal
        title="Thùng rác sản phẩm"
        open={isTrashVisible}
        onCancel={() => setTrashVisible(false)}
        footer={null}
        width={600}
      >
        <Table
          columns={trashColumns}
          dataSource={deletedProducts}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
        />
      </Modal>

      {/* Floating Trash Button */}
      <div
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        <Badge count={deletedProducts.length} showZero>
          <Button
            type="primary"
            className="admin-primary-button"
            shape="circle"
            size="large"
            icon={<DeleteOutlined />}
            style={{
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              background: "#fff",
              color: "#d4380d",
              border: "2px solid #d4380d",
              width: 56,
              height: 56,
              fontSize: 24,
            }}
            onClick={() => setTrashVisible(true)}
          />
        </Badge>
      </div>
    </div>
  );
};

export default ProductListPage;
