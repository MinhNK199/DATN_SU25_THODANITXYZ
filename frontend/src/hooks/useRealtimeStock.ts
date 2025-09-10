import { useState, useEffect, useCallback } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { reservationApi } from '../services/reservationApi';

interface UseRealtimeStockProps {
  productId: string;
  variantId?: string;
  initialStock?: number;
}

interface UseRealtimeStockReturn {
  availableStock: number;
  reservedQuantity: number;
  isReserving: boolean;
  reserveProduct: (quantity: number) => Promise<boolean>;
  releaseReservation: (quantity: number) => Promise<boolean>;
  checkStock: (quantity: number) => Promise<boolean>;
  isStockLow: boolean;
  isOutOfStock: boolean;
}

export const useRealtimeStock = ({ 
  productId, 
  variantId, 
  initialStock = 0 
}: UseRealtimeStockProps): UseRealtimeStockReturn => {
  const { 
    getAvailableStock, 
    getReservedQuantity, 
    reserveProduct: inventoryReserveProduct,
    releaseReservation: inventoryReleaseReservation,
    checkStock: inventoryCheckStock,
    joinProductRoom,
    leaveProductRoom
  } = useInventory();

  const [isReserving, setIsReserving] = useState(false);

  // Get current stock from inventory context
  const availableStock = getAvailableStock(productId, variantId) || initialStock;
  const reservedQuantity = getReservedQuantity(productId);

  // Join product room for realtime updates
  useEffect(() => {
    joinProductRoom(productId);
    return () => {
      leaveProductRoom(productId);
    };
  }, [productId, joinProductRoom, leaveProductRoom]);

  // Reserve product with optimistic updates
  const reserveProduct = useCallback(async (quantity: number): Promise<boolean> => {
    if (quantity <= 0) return false;
    if (quantity > availableStock) return false;

    setIsReserving(true);
    try {
      const success = await inventoryReserveProduct({
        productId,
        quantity,
        variantId
      });
      return success;
    } catch (error) {
      console.error('Error reserving product:', error);
      return false;
    } finally {
      setIsReserving(false);
    }
  }, [productId, variantId, availableStock, inventoryReserveProduct]);

  // Release reservation
  const releaseReservation = useCallback(async (quantity: number): Promise<boolean> => {
    if (quantity <= 0) return false;

    try {
      const success = await inventoryReleaseReservation({
        productId,
        quantity
      });
      return success;
    } catch (error) {
      console.error('Error releasing reservation:', error);
      return false;
    }
  }, [productId, inventoryReleaseReservation]);

  // Check stock availability
  const checkStock = useCallback(async (quantity: number): Promise<boolean> => {
    if (quantity <= 0) return false;

    try {
      const success = await inventoryCheckStock([{
        productId,
        quantity,
        variantId
      }]);
      return success;
    } catch (error) {
      console.error('Error checking stock:', error);
      return false;
    }
  }, [productId, variantId, inventoryCheckStock]);

  // Stock status indicators
  const isStockLow = availableStock > 0 && availableStock <= 5;
  const isOutOfStock = availableStock <= 0;

  return {
    availableStock,
    reservedQuantity,
    isReserving,
    reserveProduct,
    releaseReservation,
    checkStock,
    isStockLow,
    isOutOfStock
  };
};
