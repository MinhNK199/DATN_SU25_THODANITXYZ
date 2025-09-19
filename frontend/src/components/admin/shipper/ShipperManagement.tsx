import React, { useState } from 'react';
import { Button, Card, Row, Col, Typography, Space } from 'antd';
import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import { Shipper } from '../../../interfaces/Shipper';
import ShipperList from './ShipperList';
import ShipperForm from './ShipperForm';
import { useNotification } from '../../../hooks/useNotification';

const ShipperManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingShipper, setEditingShipper] = useState<Shipper | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const { success, error } = useNotification();

  const handleAddNew = () => {
    setEditingShipper(null);
    setIsEdit(false);
    setShowForm(true);
  };

  const handleEdit = (shipper: Shipper) => {
    setEditingShipper(shipper);
    setIsEdit(true);
    setShowForm(true);
  };

  const handleViewPerformance = (shipper: Shipper) => {
    // Performance view is now handled in ShipperList component
    console.log(`Viewing performance for ${shipper.fullName}`);
  };

  const handleToggleStatus = (shipperId: string, status: string) => {
    // Status is already updated in ShipperList component
    console.log(`Shipper ${shipperId} status changed to ${status}`);
  };


  const handleSave = async (shipperData: Partial<Shipper>) => {
    try {
      const url = isEdit ? `http://localhost:8000/api/admin/shipper/${editingShipper?._id}` : 'http://localhost:8000/api/admin/shipper';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(shipperData)
      });
      
      if (response.ok) {
        success(isEdit ? 'Cập nhật shipper thành công!' : 'Tạo shipper thành công!');
        setShowForm(false);
        setEditingShipper(null);
        setIsEdit(false);
        // Refresh the list
        window.location.reload();
      } else {
        const errorData = await response.json();
        error(errorData.message || 'Có lỗi xảy ra khi lưu shipper', 'Lỗi lưu dữ liệu');
      }
    } catch (err) {
      console.error('Error saving shipper:', err);
      error('Có lỗi xảy ra khi lưu shipper', 'Lỗi lưu dữ liệu');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingShipper(null);
    setIsEdit(false);
  };

  if (showForm) {
    return (
      <ShipperForm
        shipper={editingShipper}
        onSave={handleSave}
        onCancel={handleCancel}
        isEdit={isEdit}
      />
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card className="shadow-md rounded-lg">
        <Row justify="space-between" align="middle" className="mb-6">
          <Col>
            <Space align="center">
              <UserOutlined className="text-2xl text-blue-600" />
              <Typography.Title level={2} className="!mb-0">
                Quản lý Shipper
              </Typography.Title>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              className="admin-primary-button"
              icon={<PlusOutlined />}
              onClick={handleAddNew}
              size="large"
            >
              Thêm Shipper mới
            </Button>
          </Col>
        </Row>

        <ShipperList
          onViewPerformance={handleViewPerformance}
          onToggleStatus={handleToggleStatus}
        />

      </Card>
    </div>
  );
};

export default ShipperManagement;
