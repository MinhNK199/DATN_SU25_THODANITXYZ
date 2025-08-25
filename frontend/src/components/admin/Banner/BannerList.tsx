import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Banner } from "../../../interfaces/Banner";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye } from "react-icons/fa";
import {
  Input,
  Card,
  Tooltip,
  Modal,
  message,
  Table,
  Tag,
  Space,
  Select,
  Button,
  Row,
  Col,
  Typography,
  Divider,
  Image,
} from "antd";
import type { ColumnsType } from "antd/es/table";

const { Title, Text, Paragraph } = Typography;

const API_URL = "http://localhost:8000/api/banner";

interface SearchParams {
  title: string;
  status: "all" | "active" | "inactive";
}

// Component nhỏ hiển thị nhãn + giá trị
const InfoItem: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="mb-2">
    <Text strong>{label}: </Text>
    {children}
  </div>
);

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

    const now = new Date();
    const start = banner.startDate ? new Date(banner.startDate) : null;
    const end = banner.endDate ? new Date(banner.endDate) : null;

    // banner hiển thị khi: isActive=true, đã tới ngày start, và chưa hết end
    const isVisible =
      banner.isActive && start !== null && start <= now && (!end || now <= end);

    const statusMatch =
      searchParams.status === "all"
        ? true
        : searchParams.status === "active"
        ? isVisible
        : !isVisible;

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
          <Button
            type="primary"
            icon={<FaPlus />}
            onClick={() => navigate("/admin/banners/add")}
          >
            Thêm banner
          </Button>
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

      {/* Modal chi tiết banner */}
      <Modal
        title={null}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={900}
      >
        {selectedBanner && (
          <div className="p-4 bg-gray-100">
            <Card className="bg-white shadow-lg rounded-xl mb-6">
              <Row justify="space-between" align="middle">
                <Col>
                  <Title level={3} className="!m-0">
                    Chi tiết banner:&nbsp;{selectedBanner.title}
                  </Title>
                </Col>
                <Col>
                  <Space>
                    <Button onClick={() => setIsModalVisible(false)}>
                      Đóng
                    </Button>
                    <Button
                      type="primary"
                      icon={<FaEdit />}
                      onClick={() =>
                        navigate(`/admin/banners/edit/${selectedBanner._id}`)
                      }
                    >
                      Chỉnh sửa
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>

            <Row gutter={[24, 24]}>
              {/* Hình ảnh + mô tả */}
              <Col xs={24} lg={10}>
                <Card className="bg-white shadow-lg rounded-xl h-full">
                  <Title level={4}>Hình ảnh</Title>
                  <Image
                    width="100%"
                    src={selectedBanner.image || "/placeholder.png"}
                    alt={selectedBanner.title}
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #f0f0f0",
                      aspectRatio: "4/3",
                      objectFit: "cover",
                    }}
                  />
                  <Divider />
                  <Paragraph>
                    {selectedBanner.description || (
                      <Text type="secondary">
                        Chưa có mô tả cho banner này.
                      </Text>
                    )}
                  </Paragraph>
                </Card>
              </Col>

              {/* Thông tin chi tiết */}
              <Col xs={24} lg={14}>
                <Space
                  direction="vertical"
                  size="large"
                  style={{ width: "100%" }}
                >
                  {/* Thông tin chung */}
                  <Card className="bg-white shadow-lg rounded-xl">
                    <Title level={4}>Thông tin chung</Title>
                    <Row gutter={16}>
                      <Col span={12}>
                        <InfoItem label="Phụ đề">
                          {selectedBanner.subtitle || (
                            <Text type="secondary">N/A</Text>
                          )}
                        </InfoItem>
                      </Col>
                      <Col span={12}>
                        <InfoItem label="Trạng thái">
                          <Tag
                            color={selectedBanner.isActive ? "green" : "red"}
                          >
                            {selectedBanner.isActive
                              ? "Đang hiển thị"
                              : "Đã ẩn"}
                          </Tag>
                        </InfoItem>
                      </Col>
                      <Col span={12}>
                        <InfoItem label="Vị trí hiển thị">
                          <Tag color="geekblue">
                            {selectedBanner.position || "N/A"}
                          </Tag>
                        </InfoItem>
                      </Col>
                    </Row>
                  </Card>

                  {/* Thông tin hiển thị */}
                  <Card className="bg-white shadow-lg rounded-xl">
                    <Title level={4}>Thông tin hiển thị</Title>
                    <Row gutter={16}>
                      <Col span={12}>
                        <InfoItem label="Ngày bắt đầu">
                          {selectedBanner.startDate
                            ? new Date(
                                selectedBanner.startDate
                              ).toLocaleDateString("vi-VN")
                            : "—"}
                        </InfoItem>
                      </Col>
                      <Col span={12}>
                        <InfoItem label="Ngày kết thúc">
                          {selectedBanner.endDate ? (
                            new Date(selectedBanner.endDate).toLocaleDateString(
                              "vi-VN"
                            )
                          ) : (
                            <Tag color="green">Đang hoạt động</Tag>
                          )}
                        </InfoItem>
                      </Col>
                    </Row>
                  </Card>

                  {/* Button + Link */}
                  <Card className="bg-white shadow-lg rounded-xl">
                    <Title level={4}>Nút & Liên kết</Title>
                    {selectedBanner.buttonText && selectedBanner.buttonLink ? (
                      <a
                        href={selectedBanner.buttonLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button type="primary">
                          {selectedBanner.buttonText}
                        </Button>
                      </a>
                    ) : (
                      <Text type="secondary">Chưa có nút hoặc link</Text>
                    )}
                  </Card>

                  {/* Tính năng nổi bật */}
                  {Array.isArray(selectedBanner.features) &&
                    selectedBanner.features.length > 0 && (
                      <Card className="bg-white shadow-lg rounded-xl">
                        <Title level={4}>Tính năng nổi bật</Title>
                        <ul className="list-disc list-inside">
                          {selectedBanner.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </Card>
                    )}
                </Space>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BannerList;
