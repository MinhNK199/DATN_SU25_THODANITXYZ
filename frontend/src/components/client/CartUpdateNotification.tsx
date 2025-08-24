import React, { useEffect, useState } from 'react';
import { FaShoppingCart, FaCheckCircle } from 'react-icons/fa';

interface CartUpdateNotificationProps {
  isVisible: boolean;
  onClose: () => void;
}

const CartUpdateNotification: React.FC<CartUpdateNotificationProps> = ({
  isVisible,
  onClose
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-500 ${
      isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3">
        <FaCheckCircle className="text-xl" />
        <div>
          <p className="font-semibold">Giỏ hàng đã được cập nhật!</p>
          <p className="text-sm opacity-90">Sản phẩm đã được xóa sau khi đặt hàng thành công</p>
        </div>
      </div>
    </div>
  );
};

export default CartUpdateNotification;
