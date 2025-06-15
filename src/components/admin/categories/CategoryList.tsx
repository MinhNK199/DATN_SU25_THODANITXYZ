import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Category } from "../../../interfaces/Category";
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter, FaBox } from "react-icons/fa";
import { Input, Card, Badge, Tooltip, Modal, message, Table, Tag, Space, Select, Button, Popover, Checkbox, Statistic, Row, Col } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SearchProps } from "antd/es/input";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const API_URL = "http://localhost:5000/api/category?isActive=all";

interface SearchParams {
  name: string;
  status: "all" | "active" | "inactive";
}

interface Product {
  _id: string;
  name: string;
  price: number;
  isActive: boolean;
  image: string;
}

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    name: "",
    status: "all"
  });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deletedCategories, setDeletedCategories] = useState<Category[]>([]);
  const [showDeletedModal, setShowDeletedModal] = useState(false);
  const [selectedRestore, setSelectedRestore] = useState<string[]>([]);
  const [deletedCount, setDeletedCount] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsModalVisible, setProductsModalVisible] = useState(false);
  const navigate = useNavigate();

  const fetchCategories = async () => {
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
        setCategories(data);
      } else {
        message.error(data.message || "Lỗi khi tải danh mục!");
      }
    } catch (error) {
      message.error("Lỗi kết nối máy chủ!");
    }
    setLoading(false);
  };

  const fetchDeletedCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/category/deleted", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setDeletedCategories(data || []);
        setDeletedCount(data.length);
      } else {
        message.error(data.message || "Lỗi khi tải danh mục đã xóa!");
      }
    } catch (error) {
      message.error("Lỗi kết nối máy chủ!");
    }
  };

  const fetchCategoryProducts = async (categoryId: string) => {
    setLoadingProducts(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/product?category=${categoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setCategoryProducts(data);
      } else {
        message.error(data.message || "Lỗi khi tải sản phẩm!");
      }
    } catch (error) {
      message.error("Lỗi kết nối máy chủ!");
    }
    setLoadingProducts(false);
  };

  const handleProductCountClick = async (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setProductsModalVisible(true);
    await fetchCategoryProducts(categoryId);
  };

  useEffect(() => {
    fetchCategories();
    fetchDeletedCategories();
  }, []);

  const handleSoftDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Vui lòng đăng nhập lại!");
        navigate("/login");
        return;
      }
      const res = await fetch(`http://localhost:5000/api/category/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        message.success("Đã chuyển danh mục vào thùng rác!");
        fetchCategories();
        fetchDeletedCategories();
      } else if (res.status === 401) {
        message.error("Phiên đăng nhập hết hạn!");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        message.error(data.message || "Xóa danh mục thất bại!");
      }
    } catch (error) {
      message.error("Lỗi kết nối máy chủ!");
    }
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
        const res = await fetch(`http://localhost:5000/api/category/${id}/restore`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Khôi phục danh mục thất bại!");
        }
      }
      message.success("Khôi phục thành công!");
      setShowDeletedModal(false);
      fetchCategories();
    } catch (error) {
      message.error((error as Error).message || "Lỗi khi khôi phục danh mục!");
    }
  };

  const showCategoryDetail = (category: Category) => {
    setSelectedCategory(category);
    setIsModalVisible(true);
  };

  const handleSearch = (value: string) => {
    setSearchParams(prev => ({ ...prev, name: value }));
  };

  const handleStatusChange = (value: "all" | "active" | "inactive") => {
    setSearchParams(prev => ({ ...prev, status: value }));
  };

  const filteredCategories = categories.filter(category => {
    const nameMatch = category.name.toLowerCase().includes(searchParams.name.toLowerCase());
    const statusMatch = searchParams.status === "all" 
      ? true 
      : searchParams.status === "active" 
        ? category.isActive 
        : !category.isActive;
    
    return nameMatch && statusMatch;
  });

  const activeCategories = categories.filter(cat => cat.isActive).length;
  const inactiveCategories = categories.filter(cat => !cat.isActive).length;

  const productColumns: ColumnsType<Product> = [
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      render: (image: string) => (
        <img src={image} alt="Product" className="w-16 h-16 object-cover rounded" />
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price: number) => (
        <span>{price.toLocaleString('vi-VN')}đ</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Badge
          status={isActive ? "success" : "error"}
          text={isActive ? "Đang hoạt động" : "Đã ẩn"}
        />
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record: Product) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<FaEye />}
              onClick={() => navigate(`/admin/products/${record._id}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const columns: ColumnsType<Category> = [
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Category) => (
        <div className="space-y-1">
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">ID: {record._id}</div>
        </div>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text: string) => (
        <div className="max-w-xs truncate">{text}</div>
      ),
    },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      render: (image: string) => (
        <div className="w-20 h-20">
          <img 
            src={image} 
            alt="Category" 
            className="w-full h-full object-cover rounded-md"
          />
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Badge
          status={isActive ? "success" : "error"}
          text={isActive ? "Đang hoạt động" : "Đã ẩn"}
        />
      ),
    },
    {
      title: "Số lượng sản phẩm",
      key: "productCount",
      render: (_, record: Category) => (
        <Button
          type="primary"
          className="rounded font-semibold shadow"
          style={{ minWidth: 120 }}
          onClick={() => handleProductCountClick(record._id)}
        >
          {record.productCount || 0} sản phẩm
        </Button>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record: Category) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <Link to={`/admin/categories/edit/${record._id}`}>
              <Button type="text" icon={<FaEdit />} />
            </Link>
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<FaTrash />}
              onClick={() => handleSoftDelete(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const deletedColumns: ColumnsType<Category> = [
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Danh mục cha",
      dataIndex: "parent",
      key: "parent",
      render: (parent: any) => parent?.name || "-",
    },
    {
      title: "Người xóa",
      dataIndex: "deletedBy",
      key: "deletedBy",
      render: (deletedBy: any) => deletedBy ? `${deletedBy.name} (${deletedBy.email})` : "-",
    },
    {
      title: "Ngày xóa",
      dataIndex: "deletedAt",
      key: "deletedAt",
      render: (date: string) => date ? new Date(date).toLocaleString('vi-VN') : "-",
    },
  ];

  return (
    <div className="p-6">
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
          <Space>
            <Button
              type="primary"
              onClick={() => navigate('/admin/categories/add')}
              icon={<PlusOutlined />}
            >
              Thêm danh mục
            </Button>
            <Badge count={deletedCount} size="small">
              <Button
                onClick={() => setShowDeletedModal(true)}
                icon={<DeleteOutlined />}
              >
                Danh mục đã xóa
              </Button>
            </Badge>
          </Space>
        </div>

        <Row gutter={16} className="mb-6">
          <Col span={8}>
            <Card>
              <Statistic
                title="Tổng số danh mục"
                value={categories.length}
                prefix={<FaBox />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Danh mục đang hoạt động"
                value={activeCategories}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Danh mục đã ẩn"
                value={inactiveCategories}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>

        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Tìm kiếm theo tên..."
            prefix={<FaSearch className="text-gray-400" />}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            defaultValue="all"
            style={{ width: 200 }}
            onChange={handleStatusChange}
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "active", label: "Đang hoạt động" },
              { value: "inactive", label: "Đã ẩn" },
            ]}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredCategories}
          rowKey="_id"
          loading={loading}
          pagination={{
            total: filteredCategories.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} danh mục`,
          }}
        />
      </Card>

      <Modal
        title="Thùng rác"
        open={showDeletedModal}
        onCancel={() => setShowDeletedModal(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setShowDeletedModal(false)}>
            Đóng
          </Button>,
          <Button
            key="restore"
            type="primary"
            onClick={() => handleRestore(selectedRestore)}
            disabled={selectedRestore.length === 0}
          >
            Khôi phục đã chọn
          </Button>,
        ]}
      >
        <Table
          rowSelection={{
            type: "checkbox",
            onChange: (selectedRowKeys) => setSelectedRestore(selectedRowKeys as string[]),
          }}
          columns={deletedColumns}
          dataSource={deletedCategories}
          rowKey="_id"
        />
      </Modal>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <FaBox className="text-blue-500" />
            <span>Sản phẩm trong danh mục</span>
          </div>
        }
        open={productsModalVisible}
        onCancel={() => setProductsModalVisible(false)}
        footer={null}
        width={1000}
        className="products-modal"
      >
        <div className="mb-4">
          <Table
            columns={productColumns}
            dataSource={categoryProducts}
            loading={loadingProducts}
            rowKey="_id"
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} sản phẩm`,
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default CategoryList; 