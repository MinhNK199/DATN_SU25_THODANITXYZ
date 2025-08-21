import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Plus, MapPin, Edit2, Trash2, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../../api/axiosInstance';
import axios from 'axios';

interface Address {
  _id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  postalCode?: string;
  isDefault: boolean;
  type?: string;
  note?: string;
}

const Addresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    province_code: '',
    district_code: '',
    ward_code: '',
    postalCode: '',
    isDefault: false
  });

  // State cho select động
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [wardLoading, setWardLoading] = useState(false);

  useEffect(() => {
    fetchAddresses();
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (formData.province_code) {
      fetchDistricts(formData.province_code);
    } else {
      setDistricts([]);
      setFormData(prev => ({ ...prev, district_code: '', ward_code: '' }));
    }
  }, [formData.province_code]);

  useEffect(() => {
    if (formData.district_code) {
      fetchWards(formData.district_code);
    } else {
      setWards([]);
      setFormData(prev => ({ ...prev, ward_code: '' }));
    }
  }, [formData.district_code]);

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

  // Sử dụng provinces.open-api.vn
  const fetchProvinces = async () => {
    try {
      const res = await axios.get('https://provinces.open-api.vn/api/p/');
      setProvinces(res.data || []);
    } catch {
      setProvinces([]);
    }
  };
  const fetchDistricts = async (provinceCode: string) => {
    setDistrictLoading(true);
    try {
      const res = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      setDistricts(res.data?.districts || []);
    } catch {
      setDistricts([]);
    } finally {
      setDistrictLoading(false);
    }
  };
  const fetchWards = async (districtCode: string) => {
    setWardLoading(true);
    try {
      const res = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
      setWards(res.data?.wards || []);
    } catch {
      setWards([]);
    } finally {
      setWardLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const provinceObj = provinces.find(p => String(p.code) === formData.province_code);
      const districtObj = districts.find(d => String(d.code) === formData.district_code);
      const wardObj = wards.find(w => String(w.code) === formData.ward_code);
      const payload = {
        ...formData,
        city: formData.province_code,
        cityName: provinceObj?.name || '',
        district: formData.district_code,
        districtName: districtObj?.name || '',
        ward: formData.ward_code,
        wardName: wardObj?.name || ''
      };
      if (editingAddress) {
        const response = await axiosInstance.put(`/address/${editingAddress._id}`, payload);
        if (response.data) {
          toast.success('Cập nhật địa chỉ thành công');
          fetchAddresses();
        }
      } else {
        // Nếu chọn là mặc định, set tất cả địa chỉ khác về false
        if (payload.isDefault) {
          await Promise.all(addresses.map(addr => {
            if (addr.isDefault) {
              return axiosInstance.put(`/address/${addr._id}`, { ...addr, isDefault: false });
            }
            return Promise.resolve();
          }));
        }
        const response = await axiosInstance.post('/address', payload);
        if (response.data) {
          toast.success('Thêm địa chỉ thành công');
          fetchAddresses();
        }
      }
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      province_code: address.city || '',
      district_code: address.district || '',
      ward_code: address.ward || '',
      postalCode: address.postalCode || '',
      isDefault: address.isDefault
    });
    setShowForm(true);
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    try {
      const response = await axiosInstance.delete(`/address/${addressId}`);
      if (response.data) {
        toast.success('Xóa địa chỉ thành công');
        fetchAddresses();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await axiosInstance.put(`/address/${addressId}/default`);
      if (response.data) {
        toast.success('Đặt làm địa chỉ mặc định thành công');
        fetchAddresses();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      address: '',
      province_code: '',
      district_code: '',
      ward_code: '',
      postalCode: '',
      isDefault: false
    });
    setEditingAddress(null);
    setShowForm(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Đang tải địa chỉ...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sổ địa chỉ</h1>
          <p className="text-gray-600 mt-1">Quản lý địa chỉ giao hàng của bạn</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm địa chỉ</span>
        </button>
      </div>

      {/* Address Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ cụ thể <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Số nhà, tên đường"
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={provinces.map((p) => ({ value: String(p.code), label: p.name }))}
                    value={
                      provinces.find((p) => String(p.code) === formData.province_code)
                        ? {
                            value: formData.province_code,
                            label:
                              provinces.find((p) => String(p.code) === formData.province_code)?.name ?? ''
                          }
                        : null
                    }
                    onChange={option =>
                      setFormData(prev => ({
                        ...prev,
                        province_code: option?.value || '',
                        district_code: '',
                        ward_code: ''
                      }))
                    }
                    placeholder="Chọn tỉnh/thành phố..."
                    isClearable
                    classNamePrefix="react-select"
                    noOptionsMessage={() => "Không tìm thấy"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quận/Huyện <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={districts.map((d) => ({ value: String(d.code), label: d.name }))}
                    isLoading={districtLoading}
                    value={districts.find((d) => String(d.code) === formData.district_code)
                      ? { value: formData.district_code, label: districts.find((d) => String(d.code) === formData.district_code)?.name ?? '' }
                      : null}
                    onChange={option => setFormData(prev => ({ ...prev, district_code: option?.value || '' }))}
                    placeholder="Chọn quận/huyện..."
                    isClearable
                    isDisabled={!formData.province_code}
                    classNamePrefix="react-select"
                    noOptionsMessage={() => formData.province_code ? "Không tìm thấy" : "Chọn tỉnh/thành phố trước"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phường/Xã <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={wards.map((w) => ({ value: String(w.code), label: w.name }))}
                    isLoading={wardLoading}
                    value={wards.find((w) => String(w.code) === formData.ward_code)
                      ? { value: formData.ward_code, label: wards.find((w) => String(w.code) === formData.ward_code)?.name ?? '' }
                      : null}
                    onChange={option => setFormData(prev => ({ ...prev, ward_code: option?.value || '' }))}
                    placeholder="Chọn phường/xã..."
                    isClearable
                    isDisabled={!formData.district_code}
                    classNamePrefix="react-select"
                    noOptionsMessage={() => formData.district_code ? "Không tìm thấy" : "Chọn quận/huyện trước"}
                  />
                </div>
              </div>
              {/* Đã bỏ loại địa chỉ */}
              {/* Đã bỏ trường ghi chú */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Đặt làm địa chỉ mặc định
                </label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingAddress ? 'Cập nhật' : 'Thêm địa chỉ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Addresses List */}
      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có địa chỉ nào</h3>
          <p className="text-gray-500 mb-6">Thêm địa chỉ giao hàng để thuận tiện cho việc mua sắm</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div key={address._id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium text-gray-900">{address.fullName}</h3>
                    <span className="text-gray-500">|</span>
                    <span className="text-gray-600">{address.phone}</span>
                    {address.isDefault && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                        <Star className="w-3 h-3 mr-1" />
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-1">
                    {address.address}, {address.wardName || address.ward}, {address.districtName || address.district}, {address.cityName || address.city}
                  </p>
                  {address.note && (
                    <p className="text-sm text-gray-500">Ghi chú: {address.note}</p>
                  )}
                </div>
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
                      onClick={() => handleSetDefault(address._id)}
                      className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                      title="Đặt làm mặc định"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(address._id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Addresses;