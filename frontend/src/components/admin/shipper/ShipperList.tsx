import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Button, Space, Avatar, Image, Modal, message, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { Shipper } from '../../../interfaces/Shipper';

interface ShipperListProps {
  onEdit: (shipper: Shipper) => void;
  onDelete: (id: string) => void;
  onAssignOrder: (shipper: Shipper) => void;
}

const ShipperList: React.FC<ShipperListProps> = ({ onEdit, onDelete, onAssignOrder }) => {
  const [shippers, setShippers] = useState<Shipper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    fetchShippers();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchShippers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:8000/api/admin/shipper?page=${currentPage}&search=${searchTerm}&status=${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setShippers(data.data.shippers);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching shippers:', error);
      message.error('Có lỗi xảy ra khi tải danh sách shipper');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (shipperId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/shipper/${shipperId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        message.success('Cập nhật trạng thái thành công!');
        fetchShippers();
      } else {
        message.error('Có lỗi xảy ra khi cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error updating shipper status:', error);
      message.error('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Hoạt động';
      case 'inactive':
        return 'Không hoạt động';
      case 'suspended':
        return 'Tạm khóa';
      default:
        return status;
    }
  };

  const getVehicleTypeText = (type: string) => {
    switch (type) {
      case 'motorbike':
        return 'Xe máy';
      case 'car':
        return 'Ô tô';
      case 'bicycle':
        return 'Xe đạp';
      default:
        return type;
    }
  };

  const handlePreviewImage = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setPreviewVisible(true);
  };

  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 80,
      render: (avatar: string, record: Shipper) => (
        <Avatar
          size={50}
          src={avatar ? `http://localhost:8000/${avatar}` : undefined}
          icon={<UserOutlined />}
          onClick={() => avatar && handlePreviewImage(`http://localhost:8000/${avatar}`)}
          style={{ cursor: avatar ? 'pointer' : 'default' }}
        />
      ),
    },
    {
      title: 'Thông tin',
      key: 'info',
      render: (record: Shipper) => (
        <div>
          <div className="font-medium text-gray-900">{record.fullName}</div>
          <div className="text-sm text-gray-500">{record.email}</div>
          <div className="text-sm text-gray-500">{record.phone}</div>
        </div>
      ),
    },
    {
      title: 'Phương tiện',
      key: 'vehicle',
      render: (record: Shipper) => (
        <div>
          <div className="text-sm">{getVehicleTypeText(record.vehicleType)}</div>
          <div className="text-sm text-gray-500">{record.licensePlate}</div>
        </div>
      ),
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => (
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{rating}/5</div>
          <div className="text-sm text-gray-500">⭐</div>
        </div>
      ),
    },
    {
      title: 'Giao hàng',
      dataIndex: 'totalDeliveries',
      key: 'totalDeliveries',
      render: (count: number) => (
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{count}</div>
          <div className="text-sm text-gray-500">đơn</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Shipper) => (
        <div className="space-y-1">
          <Tag color={getStatusColor(status)}>
            {getStatusText(status)}
          </Tag>
          {status === 'active' && (
            <Tag color={record.isOnline ? 'green' : 'red'}>
              {record.isOnline ? '🟢 Online' : '🔴 Offline'}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Tài liệu',
      key: 'documents',
      render: (record: Shipper) => (
        <div className="space-y-1">
          {record.documents && record.documents.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {record.documents.slice(0, 3).map((doc, index) => (
                <Button
                  key={index}
                  type="link"
                  size="small"
                  onClick={() => handlePreviewImage(`http://localhost:8000/${doc.url}`)}
                >
                  {doc.type === 'id_card' ? 'CCCD' : 
                   doc.type === 'driver_license' ? 'GPLX' :
                   doc.type === 'vehicle_registration' ? 'Đăng ký xe' : 'Bảo hiểm'}
                </Button>
              ))}
              {record.documents.length > 3 && (
                <span className="text-xs text-gray-500">+{record.documents.length - 3}</span>
              )}
            </div>
          ) : (
            <span className="text-gray-400 text-sm">Chưa có</span>
          )}
        </div>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (record: Shipper) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => onEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="default"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => onAssignOrder(record)}
          >
            Phân công
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => onDelete(record._id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Table
        columns={columns}
        dataSource={shippers}
        rowKey="_id"
        pagination={{
          current: currentPage,
          total: totalPages * 10, // Assuming 10 items per page
          pageSize: 10,
          onChange: (page) => setCurrentPage(page),
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} của ${total} shipper`,
        }}
        scroll={{ x: 1200 }}
      />

      <Modal
        open={previewVisible}
        title="Xem ảnh"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
      >
        <Image
          alt="Preview"
          style={{ width: '100%' }}
          src={previewImage}
        />
      </Modal>
    </div>
  );
};

export default ShipperList;
