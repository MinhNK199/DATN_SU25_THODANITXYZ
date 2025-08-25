import React, { useState } from 'react';

interface ValidationTestProps {
  onTest: (data: any) => void;
}

const AddressValidationTest: React.FC<ValidationTestProps> = ({ onTest }) => {
  const [testData, setTestData] = useState({
    selectedAddress: null,
    showManualInput: false,
    formData: {
      lastName: '',
      phone: '',
      address: '',
      province_code: '',
      ward_code: '',
    }
  });

  const testCases = [
    {
      name: 'Test 1: Chọn địa chỉ mặc định',
      data: {
        selectedAddress: {
          _id: '1',
          fullName: 'Nguyễn Văn A',
          phone: '0123456789',
          address: '123 Đường ABC',
          city: '1',
          cityName: 'Thành phố Hà Nội',
          ward: '70',
          wardName: 'Phường Hoàn Kiếm',
          isDefault: true,
          type: 'home' as const
        },
        showManualInput: false,
        formData: {
          lastName: 'A',
          phone: '0123456789',
          address: '123 Đường ABC',
          province_code: '1',
          ward_code: '70',
        }
      }
    },
    {
      name: 'Test 2: Nhập thủ công - thiếu thông tin',
      data: {
        selectedAddress: null,
        showManualInput: true,
        formData: {
          lastName: '',
          phone: '',
          address: '',
          province_code: '',
          ward_code: '',
        }
      }
    },
    {
      name: 'Test 3: Nhập thủ công - đầy đủ thông tin',
      data: {
        selectedAddress: null,
        showManualInput: true,
        formData: {
          lastName: 'Nguyễn Văn B',
          phone: '0987654321',
          address: '456 Đường XYZ',
          province_code: '79',
          ward_code: '26560',
        }
      }
    }
  ];

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Test Validation</h3>
      <div className="space-y-2">
        {testCases.map((testCase, index) => (
          <button
            key={index}
            onClick={() => onTest(testCase.data)}
            className="w-full p-3 text-left bg-white border rounded-lg hover:bg-gray-50"
          >
            <div className="font-medium">{testCase.name}</div>
            <div className="text-sm text-gray-600 mt-1">
              {testCase.data.selectedAddress ? 'Có địa chỉ được chọn' : 'Không có địa chỉ'}
              {testCase.data.showManualInput && ' - Nhập thủ công'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AddressValidationTest;
