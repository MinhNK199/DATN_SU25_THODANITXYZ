import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Category } from "../../../interfaces/Category";
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch } from "react-icons/fa";
import {
  Input,
  Card,
  Badge,
  Tooltip,
  Modal,
  message,
  Table,
  Tag,
  Space,
  Select,
  Button,
  Checkbox,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const API_URL = "http://localhost:5000/api/category";

interface SearchParams {
  name: string;
  status: "all" | "active" | "inactive";
}

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    name: "",
    status: "all",
  });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deletedCategories, setDeletedCategories] = useState<Category[]>([]);
  const [showDeletedModal, setShowDeletedModal] = useState(false);
  const [selectedRestore, setSelectedRestore] = useState<string[]>([]);
  const [deletedCount, setDeletedCount] = useState(0);
  const navigate = useNavigate();

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
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

  // Fetch deleted categories
  const fetchDeletedCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/deleted`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setDeletedCategories(data || []);
        setDeletedCount(data.length || 0);
      } else {
        message.error(data.message || "Lỗi khi tải danh mục đã xóa!");
      }
    } catch (error) {
      message.error("Lỗi kết nối máy chủ!");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchDeletedCategories();
  }, []);

  // Soft delete
  const handleSoftDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Vui lòng đăng nhập lại!");
        navigate("/login");
        return;
      }
      const res = await fetch(`${API_URL}/${id}/soft-delete`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        message.success("Đã chuyển danh mục vào thùng rác!");
        fetchCategories();
        fetchDeletedCategories();
      } else {
        const err = await res.json();
        message.error(err.message || "Xóa danh mục thất bại!");
      }
    } catch (error) {
      message.error("Lỗi kết nối máy chủ!");
    }
  };

  // Hard delete
  const handleHardDelete = async (id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa vĩnh viễn?",
      content: "Danh mục sẽ bị xóa hoàn toàn khỏi hệ thống.",
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
          const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            message.success("Đã xóa vĩnh viễn danh mục!");
            fetchDeletedCategories();
          } else {
            const err = await res.json();
            message.error(err.message || "Xóa danh mục thất bại!");
          }
        } catch (error) {
          message.error("Lỗi kết nối máy chủ!");
        }
      },
    });
  };

  // Restore
  const handleRestore = async (ids: string[]) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Vui lòng đăng nhập lại!");
        navigate("/login");
        return;
      }
      for (const id of ids) {
        const res = await fetch(`${API_URL}/${id}/restore`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Khôi phục danh mục thất bại!");
        }
      }
      message.success("Khôi phục thành công!");
      setShowDeletedModal(false);
      fetchCategories();
      fetchDeletedCategories();
      setSelectedRestore([]);
    } catch (error) {
      message.error((error as Error).message || "Lỗi khi khôi phục danh mục!");
    }
  };

  const showCategoryDetail = (category: Category) => {
    setSelectedCategory(category);
    setIsModalVisible(true);
  };

  const handleSearch = (value: string) => {
    setSearchParams((prev) => ({ ...prev, name: value }));
  };

  const handleStatusChange = (value: "all" | "active" | "inactive") => {
    setSearchParams((prev) => ({ ...prev, status: value }));
  };

  const filteredCategories = categories.filter((category) => {
    const nameMatch = category.name
      .toLowerCase()
      .includes(searchParams.name.toLowerCase());
    const statusMatch =
      searchParams.status === "all"
        ? true
        : searchParams.status === "active"
        ? category.isActive
        : !category.isActive;
    return nameMatch && statusMatch;
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role;

  // Table columns giống ProductList
  const columns: ColumnsType<Category> = [
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      width: 100,
      render: (image: string, record: Category) => (
        <img
          src={image || "/placeholder.png"}
          alt="Category"
          className="w-16 h-16 object-cover rounded"
        />
      ),
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Category) => (
        <div className="space-y-1">
          <div className="font-medium">{text}</div>
          {/* {record.isFeatured && (
            <Tag color="green">Nổi bật</Tag>
          )} */}
        </div>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (desc: string) => {
        const words = desc?.split(" ");
        const shortDesc =
          words?.length > 10 ? words.slice(0, 10).join(" ") + "..." : desc;
        return <span className="text-gray-700">{shortDesc}</span>;
      },
    },

    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "success" : "error"}>
          {isActive ? "Đang hoạt động" : "Đã ẩn"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record: Category) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<FaEye />}
              onClick={() => showCategoryDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<FaEdit />}
              onClick={() => navigate(`/admin/categories/edit/${record._id}`)}
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

  const columnsDeleted = [
    {
      title: "Chọn",
      dataIndex: "_id",
      render: (_: any, record: Category) => (
        <Checkbox
          checked={selectedRestore.includes(record._id!)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRestore([...selectedRestore, record._id!]);
            } else {
              setSelectedRestore(
                selectedRestore.filter((id) => id !== record._id)
              );
            }
          }}
        />
      ),
      width: 60,
    },
    { title: "Tên danh mục", dataIndex: "name" },
    { title: "Mô tả", dataIndex: "description" },
    {
      title: "Khôi phục",
      dataIndex: "_id",
      render: (_: any, record: Category) => (
        <Button type="link" onClick={() => handleRestore([record._id!])}>
          Khôi phục
        </Button>
      ),
    },
    ...(role === "superadmin"
      ? [
          {
            title: "Xóa",
            dataIndex: "_id",
            render: (_: any, record: Category) => (
              <Button
                danger
                type="link"
                onClick={() => handleHardDelete(record._id!)}
              >
                Xóa
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
        <Space>
          <Button
            type="primary"
            onClick={() => navigate("/admin/categories/add")}
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

      <Card className="shadow-lg">
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
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} danh mục`,
          }}
        />
      </Card>

      <Modal
        title="Chi tiết danh mục"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedCategory && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Thông tin cơ bản
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Tên danh mục:</span>{" "}
                      {selectedCategory.name}
                    </p>
                    <p>
                      <span className="font-medium">Mô tả:</span>{" "}
                      {selectedCategory.description}
                    </p>
                    <p>
                      <span className="font-medium">Trạng thái:</span>{" "}
                      {selectedCategory.isActive ? "Đang hoạt động" : "Đã ẩn"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Hình ảnh</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <img
                      src={selectedCategory.image || "/placeholder.png"}
                      alt={selectedCategory.name}
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showDeletedModal}
        onCancel={() => setShowDeletedModal(false)}
        title="Danh mục đã xóa mềm"
        footer={[
          <Button
            key="all"
            onClick={() =>
              setSelectedRestore(deletedCategories.map((c) => c._id!))
            }
          >
            Chọn tất cả
          </Button>,
          <Button key="clear" onClick={() => setSelectedRestore([])}>
            Bỏ chọn
          </Button>,
          <Button
            key="restore"
            type="primary"
            disabled={selectedRestore.length === 0}
            onClick={() => handleRestore(selectedRestore)}
          >
            Khôi phục đã chọn
          </Button>,
          <Button key="close" onClick={() => setShowDeletedModal(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        <Table
          dataSource={deletedCategories}
          columns={columnsDeleted}
          rowKey="_id"
          pagination={false}
        />
      </Modal>
    </div>
  );
};

export default CategoryList;
