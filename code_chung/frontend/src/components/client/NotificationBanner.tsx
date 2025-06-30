import React, { useState } from 'react';
import { FaTimes, FaGift, FaShieldAlt, FaTruck, FaCreditCard, FaCheckCircle } from 'react-icons/fa';

const NotificationBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentNotification, setCurrentNotification] = useState(0);

  const notifications = [
    {
      id: 1,
      type: 'promo',
      icon: FaGift,
      message: '🎉 Ưu đãi đặc biệt: Giảm 20% tất cả điện thoại! Mã: SMARTPHONE20',
      bgColor: 'bg-gradient-to-r from-red-500 to-pink-500',
      textColor: 'text-white'
    },
    {
      id: 2,
      type: 'security',
      icon: FaShieldAlt,
      message: '🔒 Mua sắm an toàn: Tất cả giao dịch được bảo vệ bằng mã hóa SSL',
      bgColor: 'bg-gradient-to-r from-green-500 to-blue-500',
      textColor: 'text-white'
    },
    {
      id: 3,
      type: 'shipping',
      icon: FaTruck,
      message: '🚚 Miễn phí vận chuyển cho đơn hàng trên 500K! Giao hàng toàn quốc',
      bgColor: 'bg-gradient-to-r from-blue-500 to-purple-500',
      textColor: 'text-white'
    },
    {
      id: 4,
      type: 'payment',
      icon: FaCreditCard,
      message: '💳 Nhiều phương thức thanh toán: Thẻ tín dụng, PayPal, Momo, ZaloPay',
      bgColor: 'bg-gradient-to-r from-purple-500 to-indigo-500',
      textColor: 'text-white'
    },
    {
      id: 5,
      type: 'success',
      icon: FaCheckCircle,
      message: '✅ Đặt hàng thành công! Chúng tôi sẽ giao hàng trong 2-3 ngày',
      bgColor: 'bg-gradient-to-r from-green-600 to-emerald-500',
      textColor: 'text-white'
    }
  ];

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleNext = () => {
    setCurrentNotification((prev) => (prev + 1) % notifications.length);
  };

  const handlePrev = () => {
    setCurrentNotification((prev) => (prev - 1 + notifications.length) % notifications.length);
  };

  if (!isVisible) return null;

  const currentNotif = notifications[currentNotification];
  const Icon = currentNotif.icon;

  return (
    <div className={`${currentNotif.bgColor} ${currentNotif.textColor} py-2 relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Left side - Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              title="Thông báo trước"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Dots indicator */}
            <div className="flex space-x-1">
              {notifications.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentNotification(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentNotification ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                  title={`Thông báo ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              title="Thông báo tiếp"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Center - Message */}
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="flex items-center space-x-2 text-sm font-medium">
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-center">{currentNotif.message}</span>
            </div>
          </div>

          {/* Right side - Close button */}
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors flex-shrink-0"
            title="Đóng thông báo"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner; 