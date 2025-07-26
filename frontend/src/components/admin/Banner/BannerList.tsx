import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Banner } from "../../../interfaces/Banner";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye } from "react-icons/fa";
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
} from "antd";
import type { ColumnsType } from "antd/es/table";

const API_URL = "http://localhost:8000/api/banner";

interface SearchParams {
  title: string;
  status: "all" | "active" | "inactive";
}

const BannerList: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    title: "",
    status: "all",
  });
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

 const fetchBanners = async () => {
  setLoading(true);
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    
    if (Array.isArray(data.banners)) {
      setBanners(data.banners);
    } else if (Array.isArray(data)) {
      setBanners(data);
    } else {
      message.error("Dữ liệu banner không đúng định dạng!");
    }
  } catch (error) {
    message.error("Lỗi khi tải danh sách banner!");
  }
  setLoading(false);
};

  useEffect(() => {
    fetchBanners();
  }, []);

 const handleHardDelete = async (id: string) => {
  const token = localStorage.getItem("token");
  if (!token) {
    message.error("Bạn cần đăng nhập!");
    navigate("/login");
    return;
  }

  Modal.confirm({
    title: "Bạn có chắc muốn xóa banner này?",
    content: "Hành động này không thể hoàn tác.",
    okText: "Xóa",
    okType: "danger",
    cancelText: "Hủy",
    onOk: async () => {
      try {
        const res = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          message.success("Xóa banner thành công!");
          fetchBanners();
        } else {
          const err = await res.json();
          message.error(err.message || "Xóa thất bại!");
        }
      } catch (err) {
        message.error("Lỗi kết nối máy chủ!");
      }
    },
  });
};


  const showBannerDetail = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsModalVisible(true);
  };

  const handleSearch = (value: string) => {
    setSearchParams((prev) => ({ ...prev, title: value }));
  };

  const handleStatusChange = (value: "all" | "active" | "inactive") => {
    setSearchParams((prev) => ({ ...prev, status: value }));
  };

  const filteredBanners = banners.filter((banner) => {
    const titleMatch = banner.title
      .toLowerCase()
      .includes(searchParams.title.toLowerCase());
    const statusMatch =
      searchParams.status === "all"
        ? true
        : searchParams.status === "active"
        ? banner.isActive
        : !banner.isActive;

    return titleMatch && statusMatch;
  });

  const columns: ColumnsType<Banner> = [
    {
      title: "STT",
      key: "index",
      render: (_text, _record, index) => index + 1,
    },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      width: 100,
     render: (image: string) => (
  <img
    src={image || "/placeholder.png"}
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
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "—",
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (date: string | null) =>
        date ? (
          new Date(date).toLocaleDateString("vi-VN")
        ) : (
          <Tag color="green">Đang hoạt động</Tag>
        ),
    },

{
  title: "Trạng thái",
  key: "status",
  render: (_: any, record: Banner) => {
    const now = new Date();

    const start = record.startDate ? new Date(record.startDate) : null;
    const end = record.endDate ? new Date(record.endDate) : null;

    const isVisible =
      record.isActive &&
      start !== null &&
      start <= now &&
      (!end || now <= end);

    return (
      <Tag color={isVisible ? "green" : "red"}>
        {isVisible ? "Đang hiển thị" : "Đã ẩn"}
      </Tag>
    );
  },
},





    {
      title: "Thao tác",
      key: "action",
      render: (_text, record: Banner) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<FaEye />}
              onClick={() => showBannerDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Link to={`/admin/banners/edit/${record._id}`}>
              <Button type="default" icon={<FaEdit />} />
            </Link>
          </Tooltip>
          <Tooltip title="Xoá">
            <Button
              danger
              icon={<FaTrash />}
              onClick={() => handleHardDelete(record._id!)}
            />
          </Tooltip>
        </Space>
      ),
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
              onClick={() => navigate("/admin/banners/add")}
            >
              Thêm banner
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
        width={700}
      >
        {selectedBanner && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Hình ảnh</h3>
              <img
                src={selectedBanner.image}
                alt={ selectedBanner.title}
                className="w-full h-48 object-cover rounded"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Tiêu đề</h3>
                <p>{selectedBanner.title}</p>
              </div>

              {selectedBanner.subtitle && (
                <div>
                  <h3 className="font-semibold">Phụ đề</h3>
                  <p>{selectedBanner.subtitle}</p>
                </div>
              )}

              {selectedBanner.badge && (
                <div>
                  <h3 className="font-semibold">Nhãn</h3>
                  <Tag color="magenta">{selectedBanner.badge}</Tag>
                </div>
              )}

              {selectedBanner.position && (
                <div>
                  <h3 className="font-semibold">Vị trí hiển thị</h3>
                  <Tag color="geekblue">{selectedBanner.position}</Tag>
                </div>
              )}

              <div>
                <h3 className="font-semibold">Trạng thái</h3>
                <Badge
                  status={selectedBanner.isActive ? "success" : "error"}
                  text={selectedBanner.isActive ? "Đang hiển thị" : "Đã ẩn"}
                />
              </div>
            </div>

            {selectedBanner.description && (
              <div>
                <h3 className="font-semibold">Mô tả</h3>
                <p>{selectedBanner.description}</p>
              </div>
            )}

            {Array.isArray(selectedBanner?.features) &&
              selectedBanner.features.length > 0 && (
                <div>
                  <h3 className="font-semibold">Tính năng nổi bật</h3>
                  <ul className="list-disc list-inside">
                    {selectedBanner.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

            {(selectedBanner.buttonText || selectedBanner.buttonLink) && (
              <div>
                <h3 className="font-semibold">Nút - Link</h3>
                {selectedBanner.buttonText && selectedBanner.buttonLink ? (
                  <a
                    href={selectedBanner.buttonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button type="primary">{selectedBanner.buttonText}</Button>
                  </a>
                ) : (
                  <span>—</span>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Ngày bắt đầu</h3>
                <p>
                  {selectedBanner.startDate
                    ? new Date(selectedBanner.startDate).toLocaleDateString(
                        "vi-VN"
                      )
                    : "—"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Ngày kết thúc</h3>
                <p>
                  {selectedBanner.endDate ? (
                    new Date(selectedBanner.endDate).toLocaleDateString("vi-VN")
                  ) : (
                    <Tag color="green">Đang hoạt động</Tag>
                  )}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Ngày tạo</h3>
                <p>
                  {selectedBanner.createdAt
                    ? new Date(selectedBanner.createdAt).toLocaleString("vi-VN")
                    : "—"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Cập nhật gần nhất</h3>
                <p>
                  {selectedBanner.updatedAt
                    ? new Date(selectedBanner.updatedAt).toLocaleString("vi-VN")
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BannerList;
