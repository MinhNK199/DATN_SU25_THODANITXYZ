import React, { useState } from 'react';
import { FaCheckCircle, FaTruck, FaEnvelope, FaWhatsapp, FaTimes, FaDownload, FaPrint, FaRegCopy } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  estimatedDelivery: string;
  children?: React.ReactNode;
}

const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  estimatedDelivery,
  children
}) => {
  if (!isOpen) return null;

  const handleDownloadInvoice = () => {
    // Logic to download invoice
    console.log('Downloading invoice...');
  };

  const handlePrintInvoice = () => {
    // Logic to print invoice
    window.print();
  };

  const handleWhatsAppShare = () => {
    const message = `Tôi vừa đặt hàng thành công! Mã đơn hàng: ${orderNumber}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-black bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>

          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <FaCheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Đặt hàng thành công!
            </h2>
            <p className="text-gray-600">
              Cảm ơn bạn đã mua sắm tại ElectronStore
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Mã đơn hàng</h3>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base bg-gray-100 px-2 py-1 rounded">
                    {orderNumber.slice(0, 6)}...{orderNumber.slice(-4)}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(orderNumber);
                      toast.success('Đã copy mã đơn hàng!');
                    }}
                    className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                    title="Sao chép mã đơn hàng"
                  >
                    <FaRegCopy className="w-4 h-4" /> Copy
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Dự kiến giao hàng</h3>
                <p className="text-lg text-gray-700">{estimatedDelivery}</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Những bước tiếp theo:</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaEnvelope className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Email xác nhận</p>
                  <p className="text-sm text-gray-600">Chúng tôi đã gửi email xác nhận đến địa chỉ của bạn</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <FaTruck className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Theo dõi đơn hàng</p>
                  <p className="text-sm text-gray-600">Bạn sẽ nhận được thông báo khi đơn hàng được giao</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={handleDownloadInvoice}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              <FaDownload className="w-4 h-4" />
              <span>Tải hóa đơn</span>
            </button>
            <button
              onClick={handlePrintInvoice}
              className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              <FaPrint className="w-4 h-4" />
              <span>In hóa đơn</span>
            </button>
          </div>

          {/* Share Button */}
          <button
            onClick={handleWhatsAppShare}
            className="w-full flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors mb-6"
          >
            <FaWhatsapp className="w-5 h-5" />
            <span>Chia sẻ qua WhatsApp</span>
          </button>

          {/* Continue Shopping */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-8 rounded-full font-semibold transition-all duration-300 hover:shadow-lg"
            >
              Tiếp tục mua sắm
            </button>
          </div>

          {/* Hiển thị children nếu có */}
          {children}

          {/* Contact Info */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Cần hỗ trợ? Liên hệ chúng tôi:
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <span className="text-blue-600">📞 1900-1234</span>
              <span className="text-blue-600">📧 support@electronstore.vn</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessModal; 