import React, { useState, useEffect } from 'react';
import { Shipper } from '../../../interfaces/Shipper';

interface AssignShipperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (shipperId: string) => void;
  orderId: string;
}

const AssignShipperModal: React.FC<AssignShipperModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  orderId
}) => {
  const [shippers, setShippers] = useState<Shipper[]>([]);
  const [selectedShipper, setSelectedShipper] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableShippers();
    }
  }, [isOpen]);

  const fetchAvailableShippers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/shipper?status=active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setShippers(data.data.shippers || []);
      }
    } catch (error) {
      console.error('Error fetching shippers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = () => {
    if (selectedShipper) {
      onAssign(selectedShipper);
      onClose();
      setSelectedShipper('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Phân công Shipper
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn Shipper:
            </label>
            
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <select
                value={selectedShipper}
                onChange={(e) => setSelectedShipper(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn Shipper --</option>
                {shippers.map((shipper) => (
                  <option key={shipper._id} value={shipper._id}>
                    {shipper.fullName} - {shipper.phone} 
                    {shipper.isOnline ? ' (Online)' : ' (Offline)'}
                    {shipper.vehicleType === 'motorbike' ? ' 🏍️' : 
                     shipper.vehicleType === 'car' ? ' 🚗' : ' 🚲'}
                  </option>
                ))}
              </select>
            )}
            
            {shippers.length === 0 && !isLoading && (
              <p className="text-sm text-gray-500 mt-2">
                Không có shipper nào khả dụng
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Hủy
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedShipper}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Phân công
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignShipperModal;
