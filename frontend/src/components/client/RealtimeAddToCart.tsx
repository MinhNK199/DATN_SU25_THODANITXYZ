import React, { useState, useEffect } from 'react';
import { Button, InputNumber, Spin } from 'antd';
import { FaShoppingCart, FaCheck, FaTimes } from 'react-icons/fa';
import { useCart } from '../../contexts/CartContext';
import { useRealtimeStock } from '../../hooks/useRealtimeStock';
import { toast } from 'react-hot-toast';

interface RealtimeAddToCartProps {
  productId: string;
  variantId?: string;
  initialStock?: number;
  className?: string;
  size?: 'small' | 'middle' | 'large';
  showQuantityInput?: boolean;
  maxQuantity?: number;
}

const RealtimeAddToCart: React.FC<RealtimeAddToCartProps> = ({
  productId,
  variantId,
  initialStock = 0,
  className = '',
  size = 'middle',
  showQuantityInput = true,
  maxQuantity = 10
}) => {
  const { addToCart } = useCart();
  const {
    availableStock,
    isReserving,
    reserveProduct,
    releaseReservation,
    checkStock,
    isOutOfStock,
    isStockLow
  } = useRealtimeStock({
    productId,
    variantId,
    initialStock
  });

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isReserved, setIsReserved] = useState(false);
  const [reservationId, setReservationId] = useState<string | null>(null);

  // Update quantity when stock changes
  useEffect(() => {
    if (quantity > availableStock) {
      setQuantity(Math.max(1, availableStock));
    }
  }, [availableStock, quantity]);

  // Handle add to cart with reservation
  const handleAddToCart = async () => {
    if (quantity <= 0) {
      toast.error('Số lượng phải lớn hơn 0');
      return;
    }

    if (quantity > availableStock) {
      toast.error(`Chỉ còn ${availableStock} sản phẩm trong kho`);
      return;
    }

    setIsAdding(true);
    try {
      // Step 1: Reserve product
      const reserveSuccess = await reserveProduct(quantity);
      if (!reserveSuccess) {
        toast.error('Không thể đặt trước sản phẩm. Vui lòng thử lại.');
        return;
      }

      setIsReserved(true);
      toast.success(`Đã đặt trước ${quantity} sản phẩm`);

      // Step 2: Add to cart
      await addToCart(productId, quantity, variantId);
      toast.success('Đã thêm vào giỏ hàng');
      
      // Step 3: Release reservation (since it's now in cart)
      await releaseReservation(quantity);
      setIsReserved(false);

    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Lỗi khi thêm vào giỏ hàng');
      
      // Rollback reservation if cart add failed
      if (isReserved) {
        await releaseReservation(quantity);
        setIsReserved(false);
      }
    } finally {
      setIsAdding(false);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (value: number | null) => {
    if (value && value > 0 && value <= availableStock) {
      setQuantity(value);
    }
  };

  // Get button props based on state
  const getButtonProps = () => {
    if (isOutOfStock) {
      return {
        disabled: true,
        icon: <FaTimes />,
        children: 'Hết hàng',
        className: 'bg-gray-400 text-white border-gray-400'
      };
    }

    if (isStockLow) {
      return {
        disabled: false,
        icon: <FaShoppingCart />,
        children: isAdding ? 'Đang thêm...' : 'Thêm vào giỏ (Sắp hết)',
        className: 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500'
      };
    }

    if (isReserved) {
      return {
        disabled: false,
        icon: <Spin size="small" />,
        children: 'Đang xử lý...',
        className: 'bg-blue-500 text-white border-blue-500'
      };
    }

    return {
      disabled: isAdding || isReserving,
      icon: isAdding ? <Spin size="small" /> : <FaShoppingCart />,
      children: isAdding ? 'Đang thêm...' : 'Thêm vào giỏ',
      className: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500'
    };
  };

  const buttonProps = getButtonProps();

  return (
    <div className={`realtime-add-to-cart ${className}`}>
      {showQuantityInput && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số lượng:
          </label>
          <InputNumber
            min={1}
            max={Math.min(availableStock, maxQuantity)}
            value={quantity}
            onChange={handleQuantityChange}
            disabled={isOutOfStock || isAdding || isReserving}
            className="w-full"
            size={size}
          />
          <div className="text-xs text-gray-500 mt-1">
            Tối đa: {Math.min(availableStock, maxQuantity)} sản phẩm
          </div>
        </div>
      )}

      <Button
        {...buttonProps}
        onClick={handleAddToCart}
        size={size}
        className={`w-full ${buttonProps.className}`}
        loading={isAdding || isReserving}
      />

      {isReserved && (
        <div className="text-xs text-blue-600 mt-2 flex items-center gap-1">
          <FaCheck className="text-green-500" />
          Sản phẩm đã được đặt trước
        </div>
      )}

      {isStockLow && !isOutOfStock && (
        <div className="text-xs text-orange-600 mt-2">
          ⚠️ Sản phẩm sắp hết hàng!
        </div>
      )}
    </div>
  );
};

export default RealtimeAddToCart;
