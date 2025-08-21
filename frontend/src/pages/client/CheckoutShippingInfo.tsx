import React from "react";
import Select from "react-select";
import { Address } from "../../services/userApi";

export interface FormDataType {
  lastName: string;
  phone: string;
  address: string;
  province_code: string;
  district_code: string;
  ward_code: string;
  paymentMethod: string;
}

interface Props {
  formData: FormDataType;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
  addresses: Address[];
  handleNextStepShipping: () => void;
  selectedAddressId: string;
  setSelectedAddressId: (id: string) => void;
  provinces: any[];
  districts: any[];
  wards: any[];
  districtLoading: boolean;
  handleSelectAddress: (id: string) => void;
  fetchDistrictsByProvinceCode: (code: string) => void;
  setCurrentStep: (step: number) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const CheckoutShippingInfo: React.FC<Props> = ({
  formData,
  setFormData,
  addresses,
  handleNextStepShipping,
  selectedAddressId,
  setSelectedAddressId,
  provinces,
  districts,
  wards,
  districtLoading,
  handleSelectAddress,
  fetchDistrictsByProvinceCode,
  setCurrentStep,
  handleInputChange,
}) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin giao hàng</h2>
    {addresses.length > 0 && (
      <div className="mb-4">
        <div className="font-semibold mb-2">Chọn địa chỉ đã lưu:</div>
        <div className="space-y-2">
          {addresses.map(addr => (
            <label key={addr._id} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="address-select"
                value={addr._id}
                checked={selectedAddressId === addr._id}
                onChange={() => handleSelectAddress(addr._id)}
                className="mr-2"
              />
              <span>
                <span className="font-medium">{addr.fullName}</span> - {addr.phone} <br />
                <span className="text-gray-500 text-sm">
                  {addr.address}, {addr.wardName || addr.ward}, {addr.districtName || addr.district}, {addr.cityName || addr.city}
                </span>
                {addr.isDefault && (
                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                    Mặc định
                  </span>
                )}
              </span>
            </label>
          ))}
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="address-select"
              value="new"
              checked={selectedAddressId === 'new'}
              onChange={() => handleSelectAddress('new')}
              className="mr-2"
            />
            <span className="font-medium text-blue-600">Địa chỉ mới</span>
          </label>
        </div>
      </div>
    )}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label>
        <input
          type="text"
          name="fullName"
          value={formData.lastName}
          onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại *</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ (số nhà, tên đường...)</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tỉnh/Thành phố</label>
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Quận/Huyện</label>
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Xã/Phường/Thị trấn</label>
        <Select
          options={wards.map((w) => ({ value: String(w.code), label: w.name }))}
          value={wards.find((w) => String(w.code) === formData.ward_code)
            ? { value: formData.ward_code, label: wards.find((w) => String(w.code) === formData.ward_code)?.name ?? '' }
            : null}
          onChange={option => setFormData(prev => ({ ...prev, ward_code: option?.value || '' }))}
          placeholder="Chọn xã/phường/thị trấn..."
          isClearable
          isDisabled={!formData.district_code}
          classNamePrefix="react-select"
          noOptionsMessage={() => formData.district_code ? "Không tìm thấy" : "Chọn quận/huyện trước"}
        />
      </div>
    </div>
    <div className="mt-6">
      <button
        type="button"
        onClick={handleNextStepShipping}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg"
      >
        Tiếp tục
      </button>
    </div>
  </div>
);

export default CheckoutShippingInfo;