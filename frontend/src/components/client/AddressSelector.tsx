import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaCheck, FaPlus } from 'react-icons/fa';
import axios from 'axios';

interface Address {
  _id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  cityName?: string;
  ward: string;
  wardName?: string;
  isDefault: boolean;
  type: 'home' | 'work' | 'other';
  note?: string;
}

interface AddressSelectorProps {
  selectedAddress?: Address | null;
  onAddressSelect: (address: Address) => void;
  onAddNewAddress: () => void;
  className?: string;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  selectedAddress,
  onAddressSelect,
  onAddNewAddress,
  className = ''
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/address', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(response.data);
      
      // Tự động chọn địa chỉ mặc định nếu chưa có địa chỉ nào được chọn
      if (!selectedAddress && response.data.length > 0) {
        const defaultAddress = response.data.find((addr: Address) => addr.isDefault);
        if (defaultAddress) {
          onAddressSelect(defaultAddress);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setError('Không thể tải danh sách địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'home':
        return '🏠';
      case 'work':
        return '🏢';
      case 'other':
        return '📍';
      default:
        return '📍';
    }
  };

  const getAddressTypeText = (type: string) => {
    switch (type) {
      case 'home':
        return 'Nhà riêng';
      case 'work':
        return 'Cơ quan';
      case 'other':
        return 'Khác';
      default:
        return 'Khác';
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-500 mb-4">
          <FaMapMarkerAlt className="mx-auto text-2xl" />
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchAddresses}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-400 mb-4">
          <FaMapMarkerAlt className="mx-auto text-3xl" />
        </div>
        <p className="text-gray-600 mb-4">Bạn chưa có địa chỉ nào</p>
        <button
          onClick={onAddNewAddress}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="mr-2" />
          Thêm địa chỉ mới
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Chọn địa chỉ giao hàng</h3>
        <button
          onClick={onAddNewAddress}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <FaPlus className="mr-1" />
          Thêm mới
        </button>
      </div>

      <div className="space-y-3">
        {addresses.map((address) => (
          <div
            key={address._id}
            className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedAddress?._id === address._id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
            onClick={() => onAddressSelect(address)}
          >
            {/* Check mark for selected address */}
            {selectedAddress?._id === address._id && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <FaCheck className="text-white text-xs" />
                </div>
              </div>
            )}

            {/* Default badge */}
            {address.isDefault && (
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Mặc định
                </span>
              </div>
            )}

            <div className="flex items-start space-x-3">
              <div className="text-xl">
                {getAddressTypeIcon(address.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900">{address.fullName}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">{address.phone}</span>
                </div>
                
                <p className="text-gray-700 mb-1">
                  {address.address}
                </p>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{address.wardName || address.ward}</span>
                  <span>•</span>
                  <span>{address.cityName || address.city}</span>
                </div>
                
                <div className="flex items-center space-x-2 mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {getAddressTypeText(address.type)}
                  </span>
                  {address.note && (
                    <span className="text-xs text-gray-500">
                      Ghi chú: {address.note}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressSelector;
