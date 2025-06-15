import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Banner } from "../../../interfaces/Banner";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from "react-icons/fa";
import { Input, Card, Badge, Tooltip, Modal, message, Table, Tag, Space, Select, Button, Popover, Checkbox } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SearchProps } from "antd/es/input";

const API_URL = "http://localhost:5000/api/banner";

interface SearchParams {
  title: string;
  status: "all" | "active" | "inactive";
}

const BannerList: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    title: "",
    status: "all"
  });
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deletedBanners, setDeletedBanners] = useState<Banner[]>([]);
  const [showDeletedModal, setShowDeletedModal] = useState(false);
  const [selectedRestore, setSelectedRestore] = useState<string[]>([]);
  const navigate = useNavigate();

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setBanners(data.banners || []);
    } catch (error) {
      message.error("Lỗi khi tải banner!");
    }
    setLoading(false);
  };

  const fetchDeletedBanners = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/banner?isActive=false", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setDeletedBanners(data.banners || []);
    } catch (error) {
      message.error("Lỗi khi tải banner đã xóa!");
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSoftDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Vui lòng đăng nhập lại!");
        navigate("/login");
        return;
      }
      const res = await fetch(`http://localhost:5000/api/banner/${id}/soft-delete`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        message.success("Đã chuyển banner vào thùng rác!");
        fetchBanners();
      } else if (res.status === 401) {
        message.error("Phiên đăng nhập hết hạn!");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        const err = await res.json();
        message.error(err.message || "Xóa banner thất bại!");
      }
    } catch (error) {
      message.error("Lỗi kết nối máy chủ!");
    }
  };

  const handleRestore = async (ids: string[]) => {
    try {
      const token = localStorage.getItem("token");
      for (const id of ids) {
        await fetch(`http://localhost:5000/api/banner/${id}/restore`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      message.success("Khôi phục thành công!");
      setShowDeletedModal(false);
      fetchBanners();
    } catch (error) {
      message.error("Lỗi khi khôi phục banner!");
    }
  };

  const showBannerDetail = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsModalVisible(true);
  };

  const handleSearch = (value: string) => {
    setSearchParams(prev => ({ ...prev, title: value }));
  };

  const handleStatusChange = (value: "all" | "active" | "inactive") => {
    setSearchParams(prev => ({ ...prev, status: value }));
  };

  const filteredBanners = banners.filter(banner => {
    const titleMatch = banner.title.toLowerCase().includes(searchParams.title.toLowerCase());
    const statusMatch = searchParams.status === "all" 
      ? true 
      : searchParams.status === "active" 
        ? banner.isActive 
        : !banner.isActive;
    
    return titleMatch && statusMatch;
  });

  const columns: ColumnsType<Banner> = [
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      width: 100,
      render: (image: string) => (
        <img
          src={image || '/placeholder.png'}
          alt="Banner"
          className="w-16 h-16 object-cover rounded"
        />
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: Banner) => (
        <div className="space-y-1">
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">ID: {record._id}</div>
        </div>
      ),
    },
    {
      title: "Link",
      dataIndex: "link",
      key: "link",
      render: (text: string) => (
        <div className="max-w-xs truncate">
          <a href={text} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            {text}
          </a>
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
          text={isActive ? "Đang hiển thị" : "Đã ẩn"}
        />
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record: Banner) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<FaEye />}
              onClick={() => showBannerDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Link to={`/admin/banner/edit/${record._id}`}>
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

  const deletedColumns: ColumnsType<Banner> = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Link",
      dataIndex: "link",
      key: "link",
    },
    {
      title: "Ngày xóa",
      dataIndex: "deletedAt",
      key: "deletedAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div className="p-6">
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Quản lý banner</h1>
          <div className="flex gap-2">
            <Button
              type="primary"
              icon={<FaPlus />}
              onClick={() => navigate("/admin/banner/add")}
            >
              Thêm banner
            </Button>
            <Button
              onClick={() => {
                fetchDeletedBanners();
                setShowDeletedModal(true);
              }}
            >
              Thùng rác
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Tìm kiếm theo tiêu đề..."
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
              { value: "active", label: "Đang hiển thị" },
              { value: "inactive", label: "Đã ẩn" },
            ]}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredBanners}
          rowKey="_id"
          loading={loading}
          pagination={{
            total: filteredBanners.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} banner`,
          }}
        />
      </Card>

      <Modal
        title="Chi tiết banner"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedBanner && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Hình ảnh</h3>
              <img
                src={selectedBanner.image}
                alt={selectedBanner.title}
                className="w-full h-48 object-cover rounded"
              />
            </div>
            <div>
              <h3 className="font-semibold">Tiêu đề</h3>
              <p>{selectedBanner.title}</p>
            </div>
            <div>
              <h3 className="font-semibold">Link</h3>
              <a href={selectedBanner.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {selectedBanner.link}
              </a>
            </div>
            <div>
              <h3 className="font-semibold">Trạng thái</h3>
              <Badge
                status={selectedBanner.isActive ? "success" : "error"}
                text={selectedBanner.isActive ? "Đang hiển thị" : "Đã ẩn"}
              />
            </div>
          </div>
        )}
      </Modal>

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
          dataSource={deletedBanners}
          rowKey="_id"
        />
      </Modal>
    </div>
  );
};

export default BannerList;
