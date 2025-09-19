import React, { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaPlus, FaEdit } from "react-icons/fa";
import { Address } from "../../services/userApi";
import AddressSelector from "../../components/client/AddressSelector";
import AddressForm from "../../components/client/AddressForm";
import axios from "axios";

// Local interface for form data
interface FormAddress {
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

export interface FormDataType {
  lastName: string;
  phone: string;
  address: string;
  province_code: string;
  ward_code: string;
  paymentMethod: string;
}

interface Props {
  selectedAddress: Address | null;
  setSelectedAddress: (address: Address | null) => void;
  addresses: Address[];
  setAddresses: React.Dispatch<React.SetStateAction<Address[]>>;
  showAddressForm: boolean;
  setShowAddressForm: React.Dispatch<React.SetStateAction<boolean>>;
  showAddressSelector: boolean;
  setShowAddressSelector: React.Dispatch<React.SetStateAction<boolean>>;
  onRefreshAddresses?: () => void;
}

const CheckoutShippingInfo: React.FC<Props> = ({
  selectedAddress,
  setSelectedAddress,
  addresses,
  setAddresses,
  showAddressForm,
  setShowAddressForm,
  showAddressSelector,
  setShowAddressSelector,
  onRefreshAddresses,
}) => {
  const [showManualInput, setShowManualInput] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    lastName: "",
    phone: "",
    address: "",
    province_code: "",
    ward_code: "",
  });
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);

  // Load provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/address/provinces');
        setProvinces(response.data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  // Load wards when province changes
  const fetchWards = async (provinceCode: string) => {
    if (!provinceCode) {
      setWards([]);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/address/provinces/${provinceCode}/wards`);
      setWards(response.data);
    } catch (error) {
      console.error('Error fetching wards:', error);
      setWards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
    setFormData({
      lastName: address.fullName.split(" ").slice(-1).join(" "),
      phone: address.phone,
      address: address.address,
      province_code: address.city,
      ward_code: address.ward,
    });
    setShowAddressSelector(false);
    setShowManualInput(false);
    setValidationErrors({});
  };

  const handleAddNewAddress = () => {
    setShowAddressForm(true);
  };

  const handleSaveAddress = (address: Address) => {
    setSelectedAddress(address);
    setFormData({
      lastName: address.fullName.split(" ").slice(-1).join(" "),
      phone: address.phone,
      address: address.address,
      province_code: address.city,
      ward_code: address.ward,
    });
    setShowAddressForm(false);
    setShowManualInput(false);
    setValidationErrors({});
  };

  const handleRefreshAddresses = () => {
    // Call parent refresh function if provided
    if (onRefreshAddresses) {
      onRefreshAddresses();
    }
    // Close the form
    setShowAddressForm(false);
  };

  const handleManualInputToggle = () => {
    setShowManualInput(!showManualInput);
    if (!showManualInput) {
      // Reset form when switching to manual input
      setSelectedAddress(null);
      setFormData({
        lastName: "",
        phone: "",
        address: "",
        province_code: "",
        ward_code: "",
      });
    }
    setValidationErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }

    // If province changes, fetch new wards and reset ward selection
    if (name === 'province_code') {
      setFormData(prev => ({ ...prev, ward_code: '' }));
      fetchWards(value);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Nếu chọn địa chỉ từ danh sách
    if (selectedAddress && !showManualInput) {
      // Không cần validate vì đã có địa chỉ đầy đủ
    } else {
      // Validate cho manual input
      if (!formData.lastName.trim()) {
        errors.lastName = "Vui lòng nhập họ và tên";
      }

      if (!formData.phone.trim()) {
        errors.phone = "Vui lòng nhập số điện thoại";
      } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
        errors.phone = "Số điện thoại không hợp lệ (10-11 số)";
      }

      if (!formData.address.trim()) {
        errors.address = "Vui lòng nhập địa chỉ chi tiết";
      }

      if (!formData.province_code) {
        errors.province_code = "Vui lòng chọn tỉnh/thành phố";
      }

      if (!formData.ward_code) {
        errors.ward_code = "Vui lòng chọn phường/xã";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateForm()) {
      // handleNextStepShipping(); // This prop is removed from props
    }
  };

  const getProvinceName = (code: string) => {
    // Tìm tên tỉnh từ selectedAddress hoặc từ API
    if (selectedAddress && selectedAddress.cityName) {
      return selectedAddress.cityName;
    }
    return code;
  };

  const getWardName = (code: string) => {
    // Tìm tên phường/xã từ selectedAddress hoặc từ API
    if (selectedAddress && selectedAddress.wardName) {
      return selectedAddress.wardName;
    }
    return code;
  };

  return (
    <div className="space-y-8">
      {/* Address Selection */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="mr-4 text-3xl">📍</span>
            Địa chỉ giao hàng
          </h4>
          <div className="flex items-center space-x-6">
            <button
              type="button"
              onClick={() => setShowAddressSelector(true)}
              className={`inline-flex items-center px-6 py-3 rounded-2xl font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-xl ${
                selectedAddress && !showManualInput 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700' 
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
              }`}
            >
              <FaPlus className="mr-3 text-lg" />
              {selectedAddress && !showManualInput ? 'Thay đổi địa chỉ' : 'Chọn địa chỉ có sẵn'}
            </button>
            <div className="w-px h-8 bg-gray-300"></div>
            <button
              type="button"
              onClick={handleManualInputToggle}
              className={`inline-flex items-center px-6 py-3 rounded-2xl font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-xl ${
                showManualInput 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700' 
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
              }`}
            >
              <FaEdit className="mr-3 text-lg" />
              {showManualInput ? 'Đang nhập thủ công' : 'Nhập địa chỉ mới'}
            </button>
          </div>
        </div>

        {selectedAddress && !showManualInput ? (
          <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 rounded-3xl p-8 shadow-lg">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow-lg">
                  <FaMapMarkerAlt className="text-green-600 text-2xl" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <span className="text-2xl font-bold text-gray-900 truncate">{selectedAddress.fullName}</span>
                  <span className="text-gray-400 text-xl">•</span>
                  <span className="text-gray-600 font-semibold text-lg">{selectedAddress.phone}</span>
                </div>
                <p className="text-gray-700 text-lg mb-3 font-medium">{selectedAddress.address}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-base text-gray-600">
                    <span className="font-semibold">{selectedAddress.wardName || selectedAddress.ward}</span>
                    <span className="text-gray-400">•</span>
                    <span className="font-semibold">{selectedAddress.cityName || selectedAddress.city}</span>
                  </div>
                  {selectedAddress.isDefault && (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-200 shadow-md">
                      ⭐ Mặc định
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : showManualInput ? (
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-3xl p-8 shadow-lg">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-lg">
                <FaEdit className="text-blue-600 text-xl" />
              </div>
              <div>
                <h5 className="text-xl font-bold text-blue-800">Đang nhập địa chỉ thủ công</h5>
                <p className="text-base text-blue-600">Vui lòng điền đầy đủ thông tin bên dưới</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FaMapMarkerAlt className="text-gray-400 text-4xl" />
              </div>
              <h5 className="text-2xl font-bold text-gray-700 mb-3">Chưa có địa chỉ nào được chọn</h5>
              <p className="text-gray-500 text-lg">Vui lòng chọn địa chỉ có sẵn hoặc nhập địa chỉ mới</p>
            </div>
            <div className="flex items-center justify-center space-x-6">
              <button
                type="button"
                onClick={() => setShowAddressSelector(true)}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl font-bold text-lg"
              >
                <FaPlus className="mr-3 text-xl" />
                Chọn địa chỉ có sẵn
              </button>
              <span className="text-gray-400 font-bold text-lg">hoặc</span>
              <button
                type="button"
                onClick={handleManualInputToggle}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 text-white rounded-2xl hover:from-gray-700 hover:via-gray-800 hover:to-gray-900 transition-all duration-300 shadow-xl hover:shadow-2xl font-bold text-lg"
              >
                <FaEdit className="mr-3 text-xl" />
                Nhập địa chỉ mới
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Input Fields */}
      {showManualInput && (
        <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-xl">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-blue-600 text-2xl">✏️</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold text-gray-900">Thông tin giao hàng</h4>
              <p className="text-lg text-gray-600">Điền đầy đủ thông tin để đảm bảo giao hàng chính xác</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-lg font-bold text-gray-700 mb-4">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full px-6 py-5 border-2 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-lg ${
                  validationErrors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="Nhập họ và tên đầy đủ"
              />
              {validationErrors.lastName && (
                <p className="mt-3 text-base text-red-600 flex items-center">
                  <span className="mr-2 text-lg">⚠️</span>
                  {validationErrors.lastName}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-lg font-bold text-gray-700 mb-4">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-6 py-5 border-2 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-lg ${
                  validationErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="VD: 0123456789"
              />
              {validationErrors.phone && (
                <p className="mt-3 text-base text-red-600 flex items-center">
                  <span className="mr-2 text-lg">⚠️</span>
                  {validationErrors.phone}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8">
            <label className="block text-lg font-bold text-gray-700 mb-4">
              Địa chỉ chi tiết <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={`w-full px-6 py-5 border-2 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-lg ${
                validationErrors.address ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
            />
            {validationErrors.address && (
              <p className="mt-3 text-base text-red-600 flex items-center">
                <span className="mr-2 text-lg">⚠️</span>
                {validationErrors.address}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div>
              <label className="block text-lg font-bold text-gray-700 mb-4">
                Tỉnh/Thành phố <span className="text-red-500">*</span>
              </label>
              <select
                name="province_code"
                value={formData.province_code}
                onChange={handleInputChange}
                className={`w-full px-6 py-5 border-2 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-lg ${
                  validationErrors.province_code ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <option value="">Chọn tỉnh/thành phố</option>
                {provinces.map((province) => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </select>
              {validationErrors.province_code && (
                <p className="mt-3 text-base text-red-600 flex items-center">
                  <span className="mr-2 text-lg">⚠️</span>
                  {validationErrors.province_code}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-lg font-bold text-gray-700 mb-4">
                Phường/Xã <span className="text-red-500">*</span>
              </label>
              <select
                name="ward_code"
                value={formData.ward_code}
                onChange={handleInputChange}
                disabled={!formData.province_code || loading}
                className={`w-full px-6 py-5 border-2 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-lg ${
                  validationErrors.ward_code ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                } ${!formData.province_code || loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {!formData.province_code ? 'Vui lòng chọn tỉnh/thành phố trước' : 
                   loading ? 'Đang tải...' : 'Chọn phường/xã'}
                </option>
                {wards.map((ward) => (
                  <option key={ward.code} value={ward.code}>
                    {ward.name}
                  </option>
                ))}
              </select>
              {validationErrors.ward_code && (
                <p className="mt-3 text-base text-red-600 flex items-center">
                  <span className="mr-2 text-lg">⚠️</span>
                  {validationErrors.ward_code}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Validation Summary */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-lg">⚠️</span>
            </div>
            <div>
              <h4 className="text-red-800 font-semibold">Vui lòng sửa các lỗi sau:</h4>
              <p className="text-sm text-red-600">Để tiếp tục, hãy điền đầy đủ thông tin bắt buộc</p>
            </div>
          </div>
          <ul className="text-red-700 text-sm space-y-2">
            {Object.entries(validationErrors).map(([field, error]) => (
              <li key={field} className="flex items-center">
                <span className="mr-2">•</span>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Note: Continue button has been moved to Order Summary section for better layout balance */}

      {/* Address Selector Modal */}
      {showAddressSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Chọn địa chỉ giao hàng</h3>
                <button
                  onClick={() => setShowAddressSelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <AddressSelector
                selectedAddress={selectedAddress}
                onAddressSelect={handleAddressSelect}
                onAddNewAddress={handleAddNewAddress}
                onRefresh={handleRefreshAddresses}
              />
            </div>
          </div>
        </div>
      )}

      {/* Address Form Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <AddressForm
              onSave={handleSaveAddress}
              onCancel={() => setShowAddressForm(false)}
              onRefresh={handleRefreshAddresses}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutShippingInfo;