import React from 'react';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';

interface PaymentStatusModalProps {
  isOpen: boolean;
  status: 'processing' | 'success' | 'failed' | 'unknown';
  title: string;
  message: string;
  onClose?: () => void;
}

const PaymentStatusModal: React.FC<PaymentStatusModalProps> = ({
  isOpen,
  status,
  title,
  message,
  onClose
}) => {
  if (!isOpen) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <FaSpinner className="animate-spin text-blue-500" size={48} />;
      case 'success':
        return <FaCheckCircle className="text-green-500" size={48} />;
      case 'failed':
        return <FaTimesCircle className="text-red-500" size={48} />;
      case 'unknown':
        return <FaExclamationTriangle className="text-yellow-500" size={48} />;
      default:
        return <FaSpinner className="animate-spin text-blue-500" size={48} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'border-blue-500 bg-blue-50';
      case 'success':
        return 'border-green-500 bg-green-50';
      case 'failed':
        return 'border-red-500 bg-red-50';
      case 'unknown':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg p-6 max-w-md w-full mx-4 border-2 ${getStatusColor()}`}>
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            {getStatusIcon()}
          </div>
          
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          
          {status === 'processing' && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          )}
          
          {onClose && status !== 'processing' && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusModal;
