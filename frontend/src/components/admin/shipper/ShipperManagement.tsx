import React, { useState } from 'react';
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
    if (window.confirm('Bạn có chắc chắn muốn xóa shipper này?')) {
      try {
              const response = await fetch(`/api/admin/shipper/${shipperId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
        
        if (response.ok) {
          // Refresh the list
          window.location.reload();
        } else {
          alert('Có lỗi xảy ra khi xóa shipper');
        }
      } catch (error) {
        console.error('Error deleting shipper:', error);
        alert('Có lỗi xảy ra khi xóa shipper');
      }
    }
  };

  const handleAssignOrder = (shipper: Shipper) => {
    setAssigningShipper(shipper);
    setShowAssignModal(true);
  };

  const handleAssignConfirm = async (orderId: string) => {
    if (!assigningShipper) return;

    try {
      const response = await fetch('/api/admin/shipper/assign-order', {
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
        alert(`Phân công đơn hàng thành công cho ${assigningShipper.fullName}!`);
        setShowAssignModal(false);
        setAssigningShipper(null);
        // Optionally refresh the shipper list or show success notification
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Có lỗi xảy ra khi phân công đơn hàng');
      }
    } catch (error) {
      console.error('Error assigning order:', error);
      alert('Có lỗi xảy ra khi phân công đơn hàng');
    }
  };

  const handleSave = async (shipperData: Partial<Shipper>) => {
    try {
      const url = isEdit ? `/api/admin/shipper/${editingShipper?._id}` : '/api/admin/shipper';
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
        setShowForm(false);
        setEditingShipper(null);
        setIsEdit(false);
        // Refresh the list
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Có lỗi xảy ra khi lưu shipper');
      }
    } catch (error) {
      console.error('Error saving shipper:', error);
      alert('Có lỗi xảy ra khi lưu shipper');
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý Shipper</h2>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Thêm Shipper mới
        </button>
      </div>

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
    </div>
  );
};

export default ShipperManagement;
