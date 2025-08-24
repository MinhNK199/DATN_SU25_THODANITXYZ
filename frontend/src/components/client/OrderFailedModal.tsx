import React from 'react';
import { XCircle, AlertTriangle, RefreshCw, Home, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OrderFailedModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  errorMessage: string;
  paymentMethod?: string;
  amount?: number;
}

const OrderFailedModal: React.FC<OrderFailedModalProps> = ({
  isOpen,
  onClose,
  orderId,
  errorMessage,
  paymentMethod,
  amount
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleRetry = () => {
    onClose();
    navigate('/checkout');
  };

  const handleGoHome = () => {
    onClose();
    navigate('/');
  };

  const handleGoCart = () => {
    onClose();
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-6 pt-6 pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Đặt hàng thất bại
                  </h3>
                  <p className="text-sm text-gray-500">
                    Rất tiếc, đã xảy ra lỗi trong quá trình đặt hàng
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Error Details */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-800 mb-1">
                    Chi tiết lỗi:
                  </h4>
                  <p className="text-sm text-red-700">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Information */}
            {orderId && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Thông tin đơn hàng:
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Mã đơn hàng:</span>
                    <span className="font-mono">{orderId}</span>
                  </div>
                  {paymentMethod && (
                    <div className="flex justify-between">
                      <span>Phương thức thanh toán:</span>
                      <span className="font-medium">{paymentMethod.toUpperCase()}</span>
                    </div>
                  )}
                  {amount && (
                    <div className="flex justify-between">
                      <span>Số tiền:</span>
                      <span className="font-medium">
                        {amount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Possible Solutions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Có thể thử các cách sau:
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Kiểm tra lại thông tin thanh toán</li>
                <li>• Đảm bảo tài khoản có đủ số dư</li>
                <li>• Thử phương thức thanh toán khác</li>
                <li>• Liên hệ hỗ trợ nếu vấn đề tiếp tục</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Thử lại
            </button>
            
            <button
              onClick={handleGoCart}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Xem giỏ hàng
            </button>
            
            <button
              onClick={handleGoHome}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderFailedModal;
