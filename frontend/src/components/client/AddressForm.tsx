import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaSave, FaTimes } from 'react-icons/fa';
import axios from 'axios';

interface Province {
  code: number;
  name: string;
  codename: string;
  division_type: string;
  phone_code: number;
}

interface Ward {
  code: number;
  name: string;
  codename: string;
  division_type: string;
  province_code: number;
}

interface Address {
  _id?: string;
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

interface AddressFormProps {
  address?: Address | null;
  onSave: (address: Address) => void;
  onCancel: () => void;
  className?: string;
}

const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onSave,
  onCancel,
  className = ''
}) => {
  const [formData, setFormData] = useState<Address>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    ward: '',
    postalCode: '',
    isDefault: false,
    type: 'home',
    note: ''
  });

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProvinces();
    if (address) {
      setFormData(address);
      if (address.city) {
        fetchWards(address.city);
      }
    }
  }, [address]);

  const fetchProvinces = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/address/provinces');
      setProvinces(response.data);
    } catch (error) {
      console.error('Error fetching provinces:', error);
    }
  };

  const fetchWards = async (provinceCode: string) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/address/provinces/${provinceCode}/wards`);
      setWards(response.data);
    } catch (error) {
      console.error('Error fetching wards:', error);
      setWards([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // If province changes, fetch new wards
    if (name === 'city') {
      setFormData(prev => ({ ...prev, ward: '' }));
      if (value) {
        fetchWards(value);
      } else {
        setWards([]);
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }

    if (!formData.city) {
      newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
    }

    if (!formData.ward) {
      newErrors.ward = 'Vui lòng chọn phường/xã';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      let response;
      if (address?._id) {
        // Update existing address
        response = await axios.put(
          `http://localhost:8000/api/address/${address._id}`,
          formData,
          { headers }
        );
      } else {
        // Create new address
        response = await axios.post(
          'http://localhost:8000/api/address',
          formData,
          { headers }
        );
      }

      onSave(response.data);
    } catch (error: any) {
      console.error('Error saving address:', error);
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: 'Có lỗi xảy ra khi lưu địa chỉ' });
      }
    } finally {
      setLoading(false);
    }
  };

  const getProvinceName = (code: string) => {
    const province = provinces.find(p => p.code.toString() === code);
    return province ? province.name : code;
  };

  const getWardName = (code: string) => {
    const ward = wards.find(w => w.code.toString() === code);
    return ward ? ward.name : code;
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <FaMapMarkerAlt className="text-blue-500 text-xl" />
          <h2 className="text-xl font-semibold text-gray-900">
            {address ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes className="text-xl" />
        </button>
      </div>

      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Họ và tên */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.fullName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Nhập họ và tên"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>

        {/* Số điện thoại */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Nhập số điện thoại"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Địa chỉ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Địa chỉ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.address ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Nhập địa chỉ chi tiết"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>

        {/* Tỉnh/Thành phố */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tỉnh/Thành phố <span className="text-red-500">*</span>
          </label>
          <select
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.city ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Chọn tỉnh/thành phố</option>
            {provinces.map((province) => (
              <option key={province.code} value={province.code}>
                {province.name}
              </option>
            ))}
          </select>
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
          )}
        </div>

        {/* Phường/Xã */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phường/Xã <span className="text-red-500">*</span>
          </label>
          <select
            name="ward"
            value={formData.ward}
            onChange={handleInputChange}
            disabled={!formData.city}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.ward ? 'border-red-300' : 'border-gray-300'
            } ${!formData.city ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value="">
              {formData.city ? 'Chọn phường/xã' : 'Vui lòng chọn tỉnh/thành phố trước'}
            </option>
            {wards.map((ward) => (
              <option key={ward.code} value={ward.code}>
                {ward.name}
              </option>
            ))}
          </select>
          {errors.ward && (
            <p className="mt-1 text-sm text-red-600">{errors.ward}</p>
          )}
        </div>

        {/* Mã bưu điện */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mã bưu điện
          </label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập mã bưu điện (tùy chọn)"
          />
        </div>

        {/* Loại địa chỉ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Loại địa chỉ
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="home">Nhà riêng</option>
            <option value="work">Cơ quan</option>
            <option value="other">Khác</option>
          </select>
        </div>

        {/* Ghi chú */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ghi chú
          </label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ghi chú thêm (tùy chọn)"
          />
        </div>

        {/* Địa chỉ mặc định */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Đặt làm địa chỉ mặc định
          </label>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang lưu...
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                {address ? 'Cập nhật' : 'Thêm mới'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
