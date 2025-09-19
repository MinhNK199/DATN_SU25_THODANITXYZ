import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Edit2, Trash2, Star, Home, Building, MapPin as MapPinIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../../api/axiosInstance';
import AddressForm from '../../../components/client/AddressForm';

interface Address {
  _id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  cityName?: string;
  ward: string;
  wardName?: string;
  postalCode?: string;
  isDefault: boolean;
  type: 'home' | 'work' | 'other';
  note?: string;
}

const Addresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/address');
      
      if (response.data) {
        setAddresses(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAddress = (address: Address) => {
    if (editingAddress) {
      toast.success('Cập nhật địa chỉ thành công');
    } else {
      toast.success('Thêm địa chỉ thành công');
    }
    fetchAddresses();
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/address/${addressId}`);
      toast.success('Xóa địa chỉ thành công');
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await axiosInstance.put(`/address/${addressId}/default`);
      toast.success('Đã đặt làm địa chỉ mặc định');
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="w-4 h-4" />;
      case 'work':
        return <Building className="w-4 h-4" />;
      case 'other':
        return <MapPinIcon className="w-4 h-4" />;
      default:
        return <MapPinIcon className="w-4 h-4" />;
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

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sổ địa chỉ</h2>
          <p className="text-gray-600 mt-1">Quản lý địa chỉ giao hàng của bạn</p>
        </div>
        <button
          onClick={() => {
            setEditingAddress(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm địa chỉ mới
        </button>
      </div>

      {/* Address Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <AddressForm
              address={editingAddress}
              onSave={handleSaveAddress}
              onCancel={() => {
                setShowForm(false);
                setEditingAddress(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <MapPin className="mx-auto text-4xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có địa chỉ nào</h3>
          <p className="text-gray-600 mb-6">Thêm địa chỉ đầu tiên để bắt đầu</p>
          <button
            onClick={() => {
              setEditingAddress(null);
              setShowForm(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm địa chỉ mới
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`relative p-6 border-2 rounded-lg transition-all duration-200 ${
                address.isDefault
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              {/* Address Type Icon */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="text-blue-500">
                    {getAddressTypeIcon(address.type)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {getAddressTypeText(address.type)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {!address.isDefault && (
                    <button
                      onClick={() => handleDelete(address._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Address Details */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{address.fullName}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">{address.phone}</span>
                </div>

                <p className="text-gray-700">{address.address}</p>

                {/* Phường xã và thành phố - hiển thị rõ ràng hơn */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <MapPinIcon className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Phường/Xã:</span>
                    <span>{address.wardName || `Phường ${address.ward}`}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-700 mt-1">
                    <MapPinIcon className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Thành phố/Tỉnh:</span>
                    <span>{address.cityName || `Tỉnh ${address.city}`}</span>
                  </div>
                </div>

                {address.postalCode && (
                  <p className="text-sm text-gray-500">Mã bưu điện: {address.postalCode}</p>
                )}

                {address.note && (
                  <p className="text-sm text-gray-500 italic">Ghi chú: {address.note}</p>
                )}
              </div>

              {/* Set Default Button */}
              {!address.isDefault && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleSetDefault(address._id)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Đặt làm mặc định
                  </button>
                </div>
              )}

              {/* Default Badge - di chuyển xuống góc dưới bên phải */}
              {address.isDefault && (
                <div className="absolute bottom-4 right-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Star className="w-3 h-3 mr-1" />
                    Mặc định
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Addresses;