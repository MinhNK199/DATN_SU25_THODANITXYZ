import React, { useState, useEffect } from 'react';
import { Badge, Tooltip, Spin } from 'antd';
import { FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useRealtimeStock } from '../../hooks/useRealtimeStock';

interface RealtimeStockDisplayProps {
  productId: string;
  variantId?: string;
  initialStock?: number;
  showReserved?: boolean;
  className?: string;
}

const RealtimeStockDisplay: React.FC<RealtimeStockDisplayProps> = ({
  productId,
  variantId,
  initialStock = 0,
  showReserved = false,
  className = ''
}) => {
  const {
    availableStock,
    reservedQuantity,
    isReserving,
    isStockLow,
    isOutOfStock
  } = useRealtimeStock({
    productId,
    variantId,
    initialStock
  });

  const [isAnimating, setIsAnimating] = useState(false);
  const [previousStock, setPreviousStock] = useState(availableStock);

  // Animation effect when stock changes
  useEffect(() => {
    if (previousStock !== availableStock) {
      setIsAnimating(true);
      setPreviousStock(availableStock);
      
      // Reset animation after 1 second
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [availableStock, previousStock]);

  // Get stock status
  const getStockStatus = () => {
    if (isOutOfStock) {
      return {
        status: 'error',
        text: 'Hết hàng',
        icon: <FaTimesCircle className="text-red-500" />,
        color: 'red'
      };
    }
    
    if (isStockLow) {
      return {
        status: 'warning',
        text: `Còn ${availableStock} sản phẩm`,
        icon: <FaExclamationTriangle className="text-yellow-500" />,
        color: 'orange'
      };
    }
    
    return {
      status: 'success',
      text: `Còn ${availableStock} sản phẩm`,
      icon: <FaCheckCircle className="text-green-500" />,
      color: 'green'
    };
  };

  const stockStatus = getStockStatus();

  return (
    <div className={`realtime-stock-display ${className}`}>
      <Tooltip title={`Tồn kho: ${availableStock}${showReserved ? ` | Đã đặt trước: ${reservedQuantity}` : ''}`}>
        <Badge
          count={isAnimating ? '!' : null}
          status={stockStatus.status as any}
          className={`transition-all duration-300 ${isAnimating ? 'animate-pulse' : ''}`}
        >
          <div className={`flex items-center gap-2 ${isAnimating ? 'animate-bounce' : ''}`}>
            {isReserving ? (
              <Spin size="small" />
            ) : (
              stockStatus.icon
            )}
            <span 
              className={`text-sm font-medium ${
                isAnimating ? 'text-blue-600 font-bold' : ''
              }`}
            >
              {stockStatus.text}
            </span>
          </div>
        </Badge>
      </Tooltip>
      
      {showReserved && reservedQuantity > 0 && (
        <div className="text-xs text-gray-500 mt-1">
          Đã đặt trước: {reservedQuantity}
        </div>
      )}
    </div>
  );
};

export default RealtimeStockDisplay;
