import React, { useState, useEffect } from 'react';
import { Order } from '../../interfaces/Order';

interface AutoConfirmNotificationProps {
  order: Order;
}

const AutoConfirmNotification: React.FC<AutoConfirmNotificationProps> = ({ order }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (order.autoConfirmAt && order.status === 'delivered_success') {
      const autoConfirmTime = new Date(order.autoConfirmAt).getTime();
      const now = new Date().getTime();
      const timeDiff = autoConfirmTime - now;

      if (timeDiff > 0) {
        setIsVisible(true);
        setTimeLeft(Math.floor(timeDiff / (1000 * 60 * 60 * 24))); // Days left

        const timer = setInterval(() => {
          const newTimeDiff = autoConfirmTime - new Date().getTime();
          if (newTimeDiff <= 0) {
            setIsVisible(false);
            clearInterval(timer);
          } else {
            setTimeLeft(Math.floor(newTimeDiff / (1000 * 60 * 60 * 24)));
          }
        }, 1000 * 60 * 60); // Update every hour

        return () => clearInterval(timer);
      }
    }
  }, [order.autoConfirmAt, order.status]);

  if (!isVisible) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            <strong>Thông báo quan trọng:</strong> Đơn hàng của bạn sẽ được tự động xác nhận hoàn thành sau{' '}
            <span className="font-semibold">{timeLeft} ngày</span> nếu bạn không xác nhận nhận hàng.
            <br />
            Vui lòng kiểm tra và xác nhận nếu bạn đã nhận được hàng.
          </p>
          <div className="mt-2">
            <button
              onClick={() => {
                // TODO: Implement confirm order function
                alert('Chức năng xác nhận đơn hàng sẽ được triển khai');
              }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Xác nhận nhận hàng ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoConfirmNotification;
