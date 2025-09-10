import React, { useState, useEffect } from 'react';
import { Shipper } from '../../../interfaces/Shipper';

interface ShipperFormProps {
  shipper?: Shipper | null;
  onSave: (shipper: Partial<Shipper>) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const ShipperForm: React.FC<ShipperFormProps> = ({ shipper, onSave, onCancel, isEdit = false }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: '',
    idCard: '',
    licensePlate: '',
    vehicleType: 'motorbike' as 'motorbike' | 'car' | 'bicycle',
    status: 'active' as 'active' | 'inactive' | 'suspended',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (shipper && isEdit) {
      setFormData({
        username: shipper.username,
        email: shipper.email,
        password: '', // Không hiển thị mật khẩu cũ
        fullName: shipper.fullName,
        phone: shipper.phone,
        address: shipper.address,
        idCard: shipper.idCard,
        licensePlate: shipper.licensePlate,
        vehicleType: shipper.vehicleType,
        status: shipper.status,
      });
    }
  }, [shipper, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập là bắt buộc';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!isEdit && !formData.password.trim()) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ và tên là bắt buộc';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    }

    if (!formData.idCard.trim()) {
      newErrors.idCard = 'Số CMND/CCCD là bắt buộc';
    }

    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = 'Biển số xe là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = { ...formData };
      if (isEdit && !submitData.password) {
        delete submitData.password; // Không gửi mật khẩu nếu không thay đổi
      }
      onSave(submitData);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
          {isEdit ? 'Chỉnh sửa Shipper' : 'Thêm Shipper mới'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Tên đăng nhập *
              </label>
              <input
                type="text"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleChange}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.username ? 'border-red-300' : ''
                }`}
                placeholder="Tên đăng nhập"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.email ? 'border-red-300' : ''
                }`}
                placeholder="Email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu {!isEdit && '*'}
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.password ? 'border-red-300' : ''
                }`}
                placeholder={isEdit ? 'Để trống nếu không thay đổi' : 'Mật khẩu'}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Họ và tên *
              </label>
              <input
                type="text"
                name="fullName"
                id="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.fullName ? 'border-red-300' : ''
                }`}
                placeholder="Họ và tên"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Số điện thoại *
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.phone ? 'border-red-300' : ''
                }`}
                placeholder="Số điện thoại"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Địa chỉ *
              </label>
              <input
                type="text"
                name="address"
                id="address"
                value={formData.address}
                onChange={handleChange}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.address ? 'border-red-300' : ''
                }`}
                placeholder="Địa chỉ"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            <div>
              <label htmlFor="idCard" className="block text-sm font-medium text-gray-700">
                Số CMND/CCCD *
              </label>
              <input
                type="text"
                name="idCard"
                id="idCard"
                value={formData.idCard}
                onChange={handleChange}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.idCard ? 'border-red-300' : ''
                }`}
                placeholder="Số CMND/CCCD"
              />
              {errors.idCard && (
                <p className="mt-1 text-sm text-red-600">{errors.idCard}</p>
              )}
            </div>

            <div>
              <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700">
                Biển số xe *
              </label>
              <input
                type="text"
                name="licensePlate"
                id="licensePlate"
                value={formData.licensePlate}
                onChange={handleChange}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.licensePlate ? 'border-red-300' : ''
                }`}
                placeholder="Biển số xe"
              />
              {errors.licensePlate && (
                <p className="mt-1 text-sm text-red-600">{errors.licensePlate}</p>
              )}
            </div>

            <div>
              <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700">
                Loại phương tiện *
              </label>
              <select
                name="vehicleType"
                id="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="motorbike">Xe máy</option>
                <option value="car">Ô tô</option>
                <option value="bicycle">Xe đạp</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Trạng thái *
              </label>
              <select
                name="status"
                id="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="suspended">Tạm khóa</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShipperForm;
