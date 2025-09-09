import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Category as BaseCategory } from "../../../interfaces/Category";
import {
  Input,
  Card,
  Tooltip,
  Modal,
  message as antdMessage,
  Table,
  Tag,
  Space,
  Button,
  Avatar,
  Typography,
  ColorPicker,
  Row,
  Col,
  Badge
} from "antd";
import { useNotification } from "../../../hooks/useNotification";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  UndoOutlined,
  ExclamationCircleFilled,
  EyeOutlined,
} from "@ant-design/icons";
import * as categoryApi from "./api";
// @ts-ignore
import { debounce } from "lodash";

const { Title, Text } = Typography;
const { confirm } = Modal;

// Extend Category type locally to allow 'children' for tree rendering
type Category = BaseCategory & { children?: Category[] };

// Function to build tree data from a flat list of categories
const buildTreeData = (categories: Category[], parentId: string | null = null): any[] => {
    const items = categories
        .filter(cat => (cat.parent?._id || cat.parent) === parentId)
        .map(cat => ({
            ...cat,
            key: cat._id, // Add key for Ant Design Table
            children: buildTreeData(categories, cat._id)
        }));
    // Return empty array if no children, so Ant Design doesn't show an expand icon
    return items.map(item => ({ ...item, children: item.children.length > 0 ? item.children : undefined }));
}

const CategoryList: React.FC = () => {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useNotification();
  const [searchName, setSearchName] = useState("");
  const [deletedCategories, setDeletedCategories] = useState<Category[]>([]);
  const [isTrashVisible, setTrashVisible] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [activeData, deletedData] = await Promise.all([
        categoryApi.fetchCategories(),
        categoryApi.fetchDeletedCategories(),
      ]);
      setAllCategories(activeData || []);
      setDeletedCategories(deletedData || []);
    } catch (error) {
      // message is handled in api.ts
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSoftDelete = (id: string) => {
    confirm({
      title: "Bạn có chắc muốn đưa danh mục này vào thùng rác?",
      icon: <ExclamationCircleFilled />,
      content: "Bạn có thể khôi phục danh mục này sau.",
      okText: "Đồng ý",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await categoryApi.softDeleteCategory(id);
          success("Đã chuyển danh mục vào thùng rác!");
          fetchData();
        } catch (error: any) {
          error(error.message || "Xóa danh mục thất bại!");
        }
      },
    });
  };

  const handleHardDelete = (id: string) => {
    confirm({
      title: "Bạn có chắc muốn xóa vĩnh viễn danh mục này?",
      icon: <ExclamationCircleFilled />,
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa vĩnh viễn",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await categoryApi.hardDeleteCategory(id);
          success("Đã xóa vĩnh viễn danh mục!");
          fetchData(); // Refreshes both active and deleted lists
        } catch (error: any) {
          error(error.message || "Xóa vĩnh viễn thất bại!");
        }
      },
    });
  };

  const handleRestore = async (id: string) => {
    try {
      await categoryApi.restoreCategory(id);
      success("Khôi phục danh mục thành công!");
      fetchData(); // Refreshes both active and deleted lists
    } catch (error: any) {
      error(error.message || "Khôi phục danh mục thất bại!");
    }
  };

  const debouncedSearch = useMemo(() => debounce((value: string) => setSearchName(value.toLowerCase()), 300), []);

  const categoryTreeData = useMemo(() => buildTreeData(allCategories, null), [allCategories]);

  // Filtering function for tree data
  const filterTree = (tree: Category[], filter: string): Category[] => {
      if (!filter) return tree;
      return tree.reduce<Category[]>((acc, node) => {
          const children = node.children ? filterTree(node.children, filter) : [];
          if (node.name.toLowerCase().includes(filter) || children.length > 0) {
              acc.push({ ...node, children });
          }
          return acc;
      }, []);
  };
  
  const filteredData = useMemo(() => filterTree(categoryTreeData, searchName), [categoryTreeData, searchName]);

  const columns: ColumnsType<Category> = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (_text, _record, index) => index + 1,
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: Category) => (
        <Space>
          <Avatar 
            shape="square" 
            src={record.image || record.icon || 'https://via.placeholder.com/40x40?text=No+Image'} 
            onError={(e) => {
              console.error("Avatar image error:", record.image);
              e.currentTarget.src = 'https://via.placeholder.com/40x40?text=No+Image';
            }}
          />
          <Typography.Text strong>{name}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Ẩn"}
        </Tag>
      ),
    },
    {
      title: "Màu sắc",
      dataIndex: "color",
      key: "color",
      render: (color: string) => color ? <ColorPicker size="small" value={color} disabled /> : <Text type="secondary">N/A</Text>
    },
    {
      title: "Thứ tự",
      dataIndex: "order",
      key: "order",
      align: 'center',
      render: (order: number) => order ?? <Text type="secondary">N/A</Text>
    },
    {
      title: "Hành động",
      key: "action",
      align: "right",
      render: (_, record: Category) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={e => {
                e.stopPropagation();
                const cat = record as Category;
                if (cat && typeof cat._id === 'string') navigate(`/admin/categories/${cat._id}`);
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/categories/edit/${record._id}`)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa (Chuyển vào thùng rác)">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => {
                  e.stopPropagation();
                  handleSoftDelete(record._id!)
                }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const trashColumns: ColumnsType<Category> = [
    {
        title: "Tên danh mục",
        dataIndex: "name",
        key: "name",
    },
    {
        title: "Ngày xóa",
        dataIndex: "deletedAt",
        key: "deletedAt",
        render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'
    },
    {
        title: "Hành động",
        key: "action",
        align: "right",
        render: (_, record: Category) => (
            <Space>
                <Tooltip title="Khôi phục">
                    <Button icon={<UndoOutlined />} onClick={() => handleRestore(record._id!)} />
                </Tooltip>
                <Tooltip title="Xóa vĩnh viễn">
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleHardDelete(record._id!)} />
                </Tooltip>
            </Space>
        )
    }
  ]

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
       <Card className="bg-white shadow-lg rounded-xl">
            <Row gutter={[16, 16]} justify="space-between" align="middle" className="mb-4">
                <Col>
                    <Title level={3} className="!m-0">Quản lý Danh mục</Title>
                    <Text type="secondary">Tổng quan và quản lý các danh mục sản phẩm.</Text>
                </Col>
                <Col>
                    <Space>
                        <Button 
                            type="primary"
                    className="admin-primary-button"
                            className="admin-primary-button" 
                            icon={<PlusOutlined />} 
                            onClick={() => navigate('/admin/categories/add')}
                        >
                            Thêm danh mục
                        </Button>
                    </Space>
                </Col>
            </Row>

             <Input
                className="mb-6"
                placeholder="Tìm kiếm theo tên danh mục..."
                prefix={<SearchOutlined />}
                onChange={(e) => debouncedSearch(e.target.value)}
                allowClear
             />

            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 10, showSizeChanger: false }}
                onRow={(record) => ({
                    onClick: () => {
                        const cat = record as Category;
                        if (cat && typeof cat._id === 'string') {
                            navigate(`/admin/categories/${cat._id}`);
                        }
                    },
                    style: { cursor: 'pointer' }
                })}
            />
        </Card>

        {/* Floating Trash Button */}
        <div style={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
        }}>
            <Badge count={deletedCategories.length} showZero>
                <Button
                    type="primary"
                    className="admin-primary-button"
                    shape="circle"
                    size="large"
                    icon={<DeleteOutlined />}
                    style={{
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                        background: '#fff',
                        color: '#d4380d',
                        border: '2px solid #d4380d',
                        width: 56,
                        height: 56,
                        fontSize: 24,
                    }}
                    onClick={() => setTrashVisible(true)}
                />
            </Badge>
        </div>

      <Modal
        title="Thùng rác danh mục"
        open={isTrashVisible}
        onCancel={() => setTrashVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={trashColumns}
          dataSource={deletedCategories}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </Modal>
    </div>
  );
};

export default CategoryList;
