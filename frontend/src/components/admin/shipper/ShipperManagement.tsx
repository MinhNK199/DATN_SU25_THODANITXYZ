import React, { useState } from 'react';
import { Button, Card, Row, Col, Typography, Space, message } from 'antd';
import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import { Shipper } from '../../../interfaces/Shipper';
import ShipperList from './ShipperList';
import ShipperForm from './ShipperForm';
import AssignOrderModal from './AssignOrderModal';

const ShipperManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingShipper, setEditingShipper] = useState<Shipper | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningShipper, setAssigningShipper] = useState<Shipper | null>(null);

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

  const handleDelete = async (shipperId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/shipper/${shipperId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        message.success('Xóa shipper thành công!');
        // Refresh the list
        window.location.reload();
      } else {
        const errorData = await response.json();
        message.error(errorData.message || 'Có lỗi xảy ra khi xóa shipper');
      }
    } catch (error) {
      console.error('Error deleting shipper:', error);
      message.error('Có lỗi xảy ra khi xóa shipper');
    }
  };

  const handleAssignOrder = (shipper: Shipper) => {
    setAssigningShipper(shipper);
    setShowAssignModal(true);
  };

  const handleAssignConfirm = async (orderId: string) => {
    if (!assigningShipper) return;

    try {
      const response = await fetch('http://localhost:8000/api/admin/shipper/assign-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderId: orderId,
          shipperId: assigningShipper._id
        })
      });

      if (response.ok) {
        message.success(`Phân công đơn hàng thành công cho ${assigningShipper.fullName}!`);
        message.info('Thông báo đã được gửi đến shipper qua email');
        setShowAssignModal(false);
        setAssigningShipper(null);
        // Optionally refresh the shipper list or show success notification
      } else {
        const errorData = await response.json();
        message.error(errorData.message || 'Có lỗi xảy ra khi phân công đơn hàng');
      }
    } catch (error) {
      console.error('Error assigning order:', error);
      message.error('Có lỗi xảy ra khi phân công đơn hàng');
    }
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
        message.success(isEdit ? 'Cập nhật shipper thành công!' : 'Tạo shipper thành công!');
        setShowForm(false);
        setEditingShipper(null);
        setIsEdit(false);
        // Refresh the list
        window.location.reload();
      } else {
        const errorData = await response.json();
        message.error(errorData.message || 'Có lỗi xảy ra khi lưu shipper');
      }
    } catch (error) {
      console.error('Error saving shipper:', error);
      message.error('Có lỗi xảy ra khi lưu shipper');
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
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAssignOrder={handleAssignOrder}
        />

        <AssignOrderModal
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setAssigningShipper(null);
          }}
          onAssign={handleAssignConfirm}
          shipper={assigningShipper}
        />
      </Card>
    </div>
  );
};

export default ShipperManagement;
