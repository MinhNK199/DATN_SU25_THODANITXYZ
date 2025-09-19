import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaSave, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { useToast } from './ToastContainer';

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
  onRefresh?: () => void;
  className?: string;
}

const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onSave,
  onCancel,
  onRefresh,
  className = ''
}) => {
  const { showSuccess, showError } = useToast();
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

  // Effect để đảm bảo ward được set đúng sau khi wards được load
  useEffect(() => {
    if (address && address.ward && wards.length > 0) {
      // Tìm ward code từ ward name nếu cần
      const wardCode = address.ward;
      const wardExists = wards.find(w => w.code.toString() === wardCode.toString());
      
      if (wardExists) {
        // Nếu tìm thấy ward, đảm bảo formData.ward được set đúng
        setFormData(prev => ({ ...prev, ward: wardExists.code.toString() }));
      } else if (address.wardName) {
        // Nếu không tìm thấy ward code, thử tìm bằng name
        const wardByName = wards.find(w => w.name === address.wardName);
        
        if (wardByName) {
          setFormData(prev => ({ ...prev, ward: wardByName.code.toString() }));
        }
      }
    }
  }, [wards, address]);

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
      
      // Show success notification
      if (address?._id) {
        showSuccess('Cập nhật địa chỉ thành công!');
      } else {
        showSuccess('Thêm địa chỉ mới thành công!');
      }
      
      // Refresh address list if callback provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      console.error('Error saving address:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi lưu địa chỉ';
      setErrors({ general: errorMessage });
      showError(errorMessage);
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
    <div className={`bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-3xl shadow-2xl border border-blue-100 p-6 max-h-[90vh] overflow-y-auto ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FaMapMarkerAlt className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {address ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {address ? 'Cập nhật thông tin địa chỉ của bạn' : 'Thêm địa chỉ giao hàng mới'}
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105"
        >
          <FaTimes className="text-gray-600 text-lg" />
        </button>
      </div>

      {errors.general && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-lg">⚠️</span>
            </div>
            <p className="text-red-700 font-medium">{errors.general}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Họ và tên */}
        <div className="space-y-2">
          <label className="block text-lg font-bold text-gray-800 mb-3">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border-2 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-lg ${
              errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            placeholder="Nhập họ và tên đầy đủ"
          />
          {errors.fullName && (
            <p className="mt-2 text-base text-red-600 flex items-center">
              <span className="mr-2 text-lg">⚠️</span>
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Số điện thoại */}
        <div className="space-y-2">
          <label className="block text-lg font-bold text-gray-800 mb-3">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border-2 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-lg ${
              errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            placeholder="VD: 0123456789"
          />
          {errors.phone && (
            <p className="mt-2 text-base text-red-600 flex items-center">
              <span className="mr-2 text-lg">⚠️</span>
              {errors.phone}
            </p>
          )}
        </div>

        {/* Địa chỉ */}
        <div className="space-y-2">
          <label className="block text-lg font-bold text-gray-800 mb-3">
            Địa chỉ chi tiết <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border-2 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-lg ${
              errors.address ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
          />
          {errors.address && (
            <p className="mt-2 text-base text-red-600 flex items-center">
              <span className="mr-2 text-lg">⚠️</span>
              {errors.address}
            </p>
          )}
        </div>

        {/* Tỉnh/Thành phố và Phường/Xã */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-lg font-bold text-gray-800 mb-3">
              Tỉnh/Thành phố <span className="text-red-500">*</span>
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border-2 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-lg ${
                errors.city ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
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
              <p className="mt-2 text-base text-red-600 flex items-center">
                <span className="mr-2 text-lg">⚠️</span>
                {errors.city}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-lg font-bold text-gray-800 mb-3">
              Phường/Xã <span className="text-red-500">*</span>
            </label>
            <select
              name="ward"
              value={formData.ward}
              onChange={handleInputChange}
              disabled={!formData.city}
              className={`w-full px-4 py-3 border-2 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-lg ${
                errors.ward ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
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
              <p className="mt-2 text-base text-red-600 flex items-center">
                <span className="mr-2 text-lg">⚠️</span>
                {errors.ward}
              </p>
            )}
          </div>
        </div>

        {/* Mã bưu điện và Loại địa chỉ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-lg font-bold text-gray-800 mb-3">
              Mã bưu điện
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-lg hover:border-gray-300"
              placeholder="Nhập mã bưu điện (tùy chọn)"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-lg font-bold text-gray-800 mb-3">
              Loại địa chỉ
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-lg hover:border-gray-300"
            >
              <option value="home">🏠 Nhà riêng</option>
              <option value="work">🏢 Cơ quan</option>
              <option value="other">📍 Khác</option>
            </select>
          </div>
        </div>

        {/* Ghi chú */}
        <div className="space-y-2">
          <label className="block text-lg font-bold text-gray-800 mb-3">
            Ghi chú thêm
          </label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-lg hover:border-gray-300 resize-none"
            placeholder="Ghi chú thêm về địa chỉ này (tùy chọn)"
          />
        </div>

        {/* Địa chỉ mặc định */}
        <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100">
          <input
            type="checkbox"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleInputChange}
            className="h-6 w-6 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-lg"
          />
          <div>
            <label className="text-lg font-bold text-gray-800 cursor-pointer">
              ⭐ Đặt làm địa chỉ mặc định
            </label>
            <p className="text-sm text-gray-600 mt-1">
              Địa chỉ này sẽ được sử dụng mặc định cho các đơn hàng
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-4 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl font-bold text-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Đang lưu...
              </>
            ) : (
              <>
                <FaSave className="mr-3 text-xl" />
                {address ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
