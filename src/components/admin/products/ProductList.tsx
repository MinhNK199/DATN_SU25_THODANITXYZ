import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Product } from "../../../interfaces/Product";
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch } from "react-icons/fa";
import { Input, Card, Badge, Tooltip, Modal, message, Table, Tag, Space, Select, Button, Checkbox } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const API_URL = "http://localhost:5000/api/product";

interface SearchParams {
  name: string;
  brand: string;
  stockStatus: "all" | "inStock" | "outOfStock";
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    name: "",
    brand: "",
    stockStatus: "all"
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [brands, setBrands] = useState<{ _id: string; name: string }[]>([]);
  const [deletedProducts, setDeletedProducts] = useState<Product[]>([]);
  const [showDeletedModal, setShowDeletedModal] = useState(false);
  const [selectedRestore, setSelectedRestore] = useState<string[]>([]);
  const [deletedCount, setDeletedCount] = useState(0);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        const activeProducts = data.products.filter((product: Product) => product.isActive);
        setProducts(activeProducts);
      } else {
        message.error(data.message || "Lỗi khi tải sản phẩm!");
      }
    } catch (error) {
      message.error("Lỗi kết nối máy chủ!");
    }
    setLoading(false);
  };

  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Vui lòng đăng nhập lại!");
        navigate("/login");
        return;
      }

      const res = await fetch("http://localhost:5000/api/brand", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setBrands(Array.isArray(data) ? data : []);
      } else if (res.status === 401) {
        message.error("Phiên đăng nhập hết hạn!");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        message.error("Lỗi khi tải danh sách thương hiệu!");
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      message.error("Lỗi kết nối máy chủ!");
    }
  };

  const fetchDeletedProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/product/deleted", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        if (Array.isArray(data)) {
          setDeletedProducts(data);
          setDeletedCount(data.length);
        } else if (Array.isArray(data.products)) {
          setDeletedProducts(data.products);
          setDeletedCount(data.products.length);
        } else {
          setDeletedProducts([]);
          setDeletedCount(0);
        }
      } else {
        message.error(data.message || "Lỗi khi tải sản phẩm đã xóa!");
      }
    } catch (error) {
      message.error("Lỗi kết nối máy chủ!");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchBrands();
    fetchDeletedProducts();
  }, []);

  // XÓA MỀM
  const handleSoftDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Vui lòng đăng nhập lại!");
        navigate("/login");
        return;
      }
      // Xóa mềm: gọi PUT /product/:id/soft-delete
      const res = await fetch(`http://localhost:5000/api/product/${id}/soft-delete`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        message.success("Đã chuyển sản phẩm vào thùng rác!");
        fetchProducts();
        fetchDeletedProducts();
      } else if (res.status === 401) {
        message.error("Phiên đăng nhập hết hạn!");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        const err = await res.json();
        message.error(err.message || "Xóa sản phẩm thất bại!");
      }
    } catch (error) {
      message.error("Lỗi kết nối máy chủ!");
    }
  };

  // XÓA CỨNG
  const handleHardDelete = async (id: string) => {
  Modal.confirm({
    title: "Xác nhận xóa vĩnh viễn?",
    content: "Sản phẩm sẽ bị xóa hoàn toàn khỏi hệ thống.",
    okText: "Xóa",
    okType: "danger",
    cancelText: "Hủy",
    onOk: async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          message.error("Vui lòng đăng nhập lại!");
          navigate("/login");
          return;
        }
        const res = await fetch(`http://localhost:5000/api/product/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          message.success("Đã xóa sản phẩm vĩnh viễn!");
          fetchDeletedProducts();
        } else {
          const err = await res.json();
          message.error(err.message || "Xóa sản phẩm thất bại!");
        }
      } catch (error) {
        message.error("Lỗi kết nối máy chủ!");
      }
    }
  });
};

  const handleRestore = async (ids: string[]) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Vui lòng đăng nhập lại!");
        navigate("/login");
        return;
      }

      for (const id of ids) {
        const res = await fetch(`http://localhost:5000/api/product/${id}/restore`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Khôi phục sản phẩm thất bại!");
        }
      }
      message.success("Khôi phục thành công!");
      setShowDeletedModal(false);
      fetchProducts();
      fetchDeletedProducts();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error("Lỗi không xác định!");
      }
    }
  };

  const showProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleSearch = (value: string) => {
    setSearchParams(prev => ({ ...prev, name: value }));
  };

  const handleBrandChange = (value: string) => {
    setSearchParams(prev => ({ ...prev, brand: value }));
  };

  const handleStockStatusChange = (value: "all" | "inStock" | "outOfStock") => {
    setSearchParams(prev => ({ ...prev, stockStatus: value }));
  };

  const filteredProducts = products.filter(product => {
    const nameMatch = product.name.toLowerCase().includes(searchParams.name.toLowerCase());
    const brandMatch = searchParams.brand ? product.brand === searchParams.brand : true;
    const stockMatch = searchParams.stockStatus === "all"
      ? true
      : searchParams.stockStatus === "inStock"
        ? product.stock > 0
        : product.stock === 0;

    return nameMatch && brandMatch && stockMatch;
  });

  const columns: ColumnsType<Product> = [
    {
      title: "Hình ảnh",
      dataIndex: "images",
      key: "images",
      width: 100,
      render: (images: string[]) => (
        <img
          src={images[0] || '/placeholder.png'}
          alt="Product"
          className="w-16 h-16 object-cover rounded"
        />
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Product) => (
        <div className="space-y-1">
          <div className="font-medium">{text}</div>
          {record.isFeatured && (
            <Tag color="green">Nổi bật</Tag>
          )}
        </div>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price: number, record: Product) => (
        <div className="space-y-1">
          <div className="font-medium text-green-600">
            {formatPrice(price)}
          </div>
          {record.salePrice && (
            <div className="text-sm text-red-600">
              {formatPrice(record.salePrice)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "stock",
      key: "stock",
      render: (stock: number) => (
        <Tag color={stock > 0 ? "success" : "error"}>
          {stock > 0 ? `Còn ${stock}` : "Hết hàng"}
        </Tag>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (category: any) => category?.name || category,
    },
    {
      title: "Thương hiệu",
      dataIndex: "brand",
      key: "brand",
      render: (brand: any) => brand?.name || brand,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record: Product) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<FaEye />}
              onClick={() => navigate(`/admin/products/detail/${record._id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<FaEdit />}
              onClick={() => navigate(`/admin/products/edit/${record._id}`)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              danger
              icon={<FaTrash />}
              onClick={() => handleSoftDelete(record._id!)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const user = JSON.parse(localStorage.getItem('user') || '{}');
const role = user.role;

const columnsDeleted = [
  {
    title: "Chọn",
    dataIndex: "_id",
    render: (_: any, record: Product) => (
      <Checkbox
        checked={selectedRestore.includes(record._id!)}
        onChange={e => {
          if (e.target.checked) {
            setSelectedRestore([...selectedRestore, record._id!]);
          } else {
            setSelectedRestore(selectedRestore.filter(id => id !== record._id));
          }
        }}
      />
    ),
    width: 60,
  },
  { title: "Tên sản phẩm", dataIndex: "name" },
  { title: "Giá", dataIndex: "price" },
  { title: "Thương hiệu", dataIndex: ["brand", "name"] },
  { title: "Danh mục", dataIndex: ["category", "name"] },
  {
    title: "Khôi phục",
    dataIndex: "_id",
    render: (_: any, record: Product) => (
      <Button type="link" onClick={() => handleRestore([record._id!])}>Khôi phục</Button>
    ),
  },
  ...(role === 'superadmin' ? [
    {
      title: "Xóa",
      dataIndex: "_id",
      render: (_: any, record: Product) => (
        <Button danger type="link" onClick={() => handleHardDelete(record._id!)}>Xóa</Button>
      ),
    }
  ] : [])
];

  const searchContent = (
    <div className="p-4 space-y-4 w-80">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tìm kiếm theo tên
        </label>
        <Input
          placeholder="Nhập tên sản phẩm..."
          value={searchParams.name}
          onChange={(e) => handleSearch(e.target.value)}
          prefix={<FaSearch className="text-gray-400" />}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Thương hiệu
        </label>
        <Select
          className="w-full"
          placeholder="Chọn thương hiệu"
          value={searchParams.brand || undefined}
          onChange={handleBrandChange}
          allowClear
        >
          {brands.map((brand) => (
            <Select.Option key={brand._id} value={brand._id}>
              {brand.name}
            </Select.Option>
          ))}
        </Select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Trạng thái tồn kho
        </label>
        <Select
          className="w-full"
          value={searchParams.stockStatus}
          onChange={handleStockStatusChange}
        >
          <Select.Option value="all">Tất cả</Select.Option>
          <Select.Option value="inStock">Còn hàng</Select.Option>
          <Select.Option value="outOfStock">Hết hàng</Select.Option>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <Space>
          <Button
            type="primary"
            onClick={() => navigate('/admin/products/add')}
            icon={<PlusOutlined />}
          >
            Thêm sản phẩm
          </Button>
          <Badge count={deletedCount} size="small">
            <Button
              onClick={() => setShowDeletedModal(true)}
              icon={<DeleteOutlined />}
            >
              Sản phẩm đã xóa
            </Button>
          </Badge>
        </Space>
      </div>

      <Card className="shadow-lg">
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} sản phẩm`,
          }}
        />
      </Card>

      <Modal
        title="Chi tiết sản phẩm"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedProduct && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Thông tin cơ bản</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Tên sản phẩm:</span> {selectedProduct.name}</p>
                    <p><span className="font-medium">Giá:</span> {formatPrice(selectedProduct.price)}</p>
                    {selectedProduct.salePrice && (
                      <p><span className="font-medium">Giá khuyến mãi:</span> {formatPrice(selectedProduct.salePrice)}</p>
                    )}
                    <p><span className="font-medium">Tồn kho:</span> {selectedProduct.stock}</p>
                    <p><span className="font-medium">Danh mục:</span> {(selectedProduct as any).category?.name || selectedProduct.category}</p>
                    <p><span className="font-medium">Thương hiệu:</span> {(selectedProduct as any).brand?.name || selectedProduct.brand}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Mô tả</h3>
                  <p className="text-gray-600">{selectedProduct.description}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Hình ảnh</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProduct.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${selectedProduct.name} - ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
                {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Thông số kỹ thuật</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium">{key}:</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedProduct.features && selectedProduct.features.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Tính năng nổi bật</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedProduct.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showDeletedModal}
        onCancel={() => setShowDeletedModal(false)}
        title="Sản phẩm đã xóa mềm"
        footer={[
          <Button key="all" onClick={() => setSelectedRestore(deletedProducts.map(p => p._id!))}>Chọn tất cả</Button>,
          <Button key="clear" onClick={() => setSelectedRestore([])}>Bỏ chọn</Button>,
          <Button key="restore" type="primary" disabled={selectedRestore.length === 0} onClick={() => handleRestore(selectedRestore)}>Khôi phục đã chọn</Button>,
          <Button key="close" onClick={() => setShowDeletedModal(false)}>Đóng</Button>,
        ]}
        width={800}
      >
        <Table
          dataSource={deletedProducts}
          columns={columnsDeleted}
          rowKey="_id"
          pagination={false}
        />
      </Modal>
    </div>
  );
};

export default ProductList;