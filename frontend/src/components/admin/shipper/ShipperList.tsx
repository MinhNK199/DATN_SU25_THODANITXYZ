import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchShippers();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchShippers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/shipper?page=${currentPage}&search=${searchTerm}&status=${statusFilter}`, {
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (shipperId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/shipper/${shipperId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        fetchShippers();
      }
    } catch (error) {
      console.error('Error updating shipper status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm shipper..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
            <option value="suspended">Tạm khóa</option>
          </select>
        </div>
      </div>

      {/* Shipper Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Danh sách Shipper</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {shippers.map((shipper) => (
            <li key={shipper._id} className="px-4 py-5 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {shipper.fullName.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {shipper.fullName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {shipper.email} • {shipper.phone}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Phương tiện:</span> {shipper.vehicleType}
                    </div>
                    <div>
                      <span className="font-medium">Biển số:</span> {shipper.licensePlate}
                    </div>
                    <div>
                      <span className="font-medium">Đánh giá:</span> {shipper.rating}/5
                    </div>
                    <div>
                      <span className="font-medium">Giao hàng:</span> {shipper.totalDeliveries}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipper.status)}`}>
                    {getStatusText(shipper.status)}
                  </span>
                  {shipper.isOnline && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Online
                    </span>
                  )}
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onEdit(shipper)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => onAssignOrder(shipper)}
                      className="text-green-600 hover:text-green-900 text-sm font-medium"
                    >
                      Phân công
                    </button>
                    <button
                      onClick={() => onDelete(shipper._id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Trang <span className="font-medium">{currentPage}</span> của{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipperList;
