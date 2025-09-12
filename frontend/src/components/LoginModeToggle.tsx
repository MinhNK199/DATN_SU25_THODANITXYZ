import React from 'react';

interface LoginModeToggleProps {
  loginMode: 'user' | 'shipper';
  setLoginMode: (mode: 'user' | 'shipper') => void;
}

const LoginModeToggle: React.FC<LoginModeToggleProps> = ({ loginMode, setLoginMode }) => {
  return (
    <div className="flex justify-center mt-6 mb-4">
      <div className="bg-red-100 p-2 rounded-lg border-2 border-red-500">
        <div className="bg-gray-100 p-1 rounded-lg flex">
          <button
            type="button"
            onClick={() => setLoginMode('user')}
            className={`px-6 py-3 rounded-md text-lg font-bold transition-all ${
              loginMode === 'user'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-700 hover:text-gray-900 bg-white'
            }`}
          >
            👤 KHÁCH HÀNG
          </button>
          <button
            type="button"
            onClick={() => setLoginMode('shipper')}
            className={`px-6 py-3 rounded-md text-lg font-bold transition-all ${
              loginMode === 'shipper'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-gray-700 hover:text-gray-900 bg-white'
            }`}
          >
            🚚 SHIPPER
          </button>
        </div>
        <p className="text-center text-red-600 font-bold mt-2">
          ⚠️ CHỌN LOẠI TÀI KHOẢN ⚠️
        </p>
      </div>
    </div>
  );
};

export default LoginModeToggle;
