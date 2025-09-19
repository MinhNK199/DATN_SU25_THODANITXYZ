import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaCheck, FaPlus } from 'react-icons/fa';
import { useToast } from './ToastContainer';
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
  onRefresh?: () => void;
  addresses?: Address[];
  loading?: boolean;
  error?: string;
  className?: string;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  selectedAddress,
  onAddressSelect,
  onAddNewAddress,
  onRefresh,
  addresses = [],
  loading = false,
  error = '',
  className = ''
}) => {
  const { showSuccess, showError } = useToast();
  
  // Sử dụng props thay vì state riêng
  const displayAddresses = addresses;
  const isLoading = loading;
  const hasError = error;

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

  const handleAddressClick = (address: Address) => {
    onAddressSelect(address);
    showSuccess('Đã chọn địa chỉ giao hàng!');
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gradient-to-r from-gray-200 to-gray-300 h-24 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaMapMarkerAlt className="text-red-500 text-3xl" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h3>
        <p className="text-gray-600 mb-6">{hasError}</p>
        <button
          onClick={onRefresh}
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-bold hover:from-red-600 hover:to-pink-600 transition-all duration-200 hover:scale-105 shadow-lg"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (displayAddresses.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaMapMarkerAlt className="text-blue-500 text-3xl" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có địa chỉ nào</h3>
        <p className="text-gray-600 mb-6">Hãy thêm địa chỉ giao hàng đầu tiên của bạn</p>
        <button
          onClick={onAddNewAddress}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <FaPlus className="mr-3 text-xl" />
          Thêm địa chỉ mới
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Chọn địa chỉ giao hàng</h3>
          <p className="text-gray-600 mt-1">Chọn địa chỉ để giao hàng</p>
        </div>
        <div className="flex space-x-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Làm mới danh sách"
            >
              🔄
            </button>
          )}
          <button
            onClick={onAddNewAddress}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <FaPlus className="mr-2 text-lg" />
            Thêm mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {displayAddresses.map((address) => (
          <div
            key={address._id}
            className={`relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
              selectedAddress?._id === address._id
                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-xl'
                : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-lg'
            }`}
            onClick={() => handleAddressClick(address)}
          >
            {/* Check mark for selected address */}
            {selectedAddress?._id === address._id && (
              <div className="absolute top-4 right-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <FaCheck className="text-white text-sm" />
                </div>
              </div>
            )}

            {/* Default badge - moved to bottom right */}
            {address.isDefault && (
              <div className="absolute bottom-4 right-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-200 shadow-md">
                  ⭐ Mặc định
                </span>
              </div>
            )}

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-md">
                <span className="text-2xl">{getAddressTypeIcon(address.type)}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-xl font-bold text-gray-900 truncate">{address.fullName}</span>
                  <span className="text-gray-400 text-xl">•</span>
                  <span className="text-gray-600 font-semibold text-lg">{address.phone}</span>
                </div>
                
                <p className="text-gray-700 text-lg mb-3 font-medium">{address.address}</p>
                
                <div className="flex items-center space-x-3 text-base text-gray-600">
                  <span className="font-semibold">{address.wardName || address.ward}</span>
                  <span className="text-gray-400">•</span>
                  <span className="font-semibold">{address.cityName || address.city}</span>
                </div>
                
                <div className="flex items-center space-x-3 mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300">
                    {getAddressTypeText(address.type)}
                  </span>
                  {address.note && (
                    <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                      📝 {address.note}
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
