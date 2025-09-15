import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { reservationApi, ReservationRequest, ReleaseRequest, StockCheckItem } from '../services/reservationApi';

// Types
interface ProductStock {
  productId: string;
  variantId?: string;
  availableStock: number;
  reservedQuantity: number;
  lastUpdated: Date;
}

interface InventoryState {
  productStocks: Record<string, ProductStock>;
  reservations: Record<string, number>; // productId -> reserved quantity
  isConnected: boolean;
  loading: boolean;
  error: string | null;
}

type InventoryAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'UPDATE_STOCK'; payload: { productId: string; variantId?: string; availableStock: number; reservedQuantity: number } }
  | { type: 'UPDATE_RESERVATION'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_RESERVATION'; payload: string }
  | { type: 'BULK_UPDATE_STOCKS'; payload: ProductStock[] };

interface InventoryContextType {
  state: InventoryState;
  // Actions
  reserveProduct: (data: ReservationRequest) => Promise<boolean>;
  releaseReservation: (data: ReleaseRequest) => Promise<boolean>;
  checkStock: (items: StockCheckItem[]) => Promise<boolean>;
  getAvailableStock: (productId: string, variantId?: string) => number;
  getReservedQuantity: (productId: string) => number;
  // Socket actions
  joinProductRoom: (productId: string) => void;
  leaveProductRoom: (productId: string) => void;
  joinInventoryRoom: () => void;
  leaveInventoryRoom: () => void;
}

// Initial state
const initialState: InventoryState = {
  productStocks: {},
  reservations: {},
  isConnected: false,
  loading: false,
  error: null,
};

// Reducer
const inventoryReducer = (state: InventoryState, action: InventoryAction): InventoryState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    
    case 'UPDATE_STOCK': {
      const key = action.payload.variantId 
        ? `${action.payload.productId}_${action.payload.variantId}`
        : action.payload.productId;
      
      return {
        ...state,
        productStocks: {
          ...state.productStocks,
          [key]: {
            productId: action.payload.productId,
            variantId: action.payload.variantId,
            availableStock: action.payload.availableStock,
            reservedQuantity: action.payload.reservedQuantity,
            lastUpdated: new Date(),
          }
        }
      };
    }
    
    case 'UPDATE_RESERVATION': {
      return {
        ...state,
        reservations: {
          ...state.reservations,
          [action.payload.productId]: action.payload.quantity
        }
      };
    }
    
    case 'CLEAR_RESERVATION': {
      const newReservations = { ...state.reservations };
      delete newReservations[action.payload];
      return { ...state, reservations: newReservations };
    }
    
    case 'BULK_UPDATE_STOCKS': {
      const newStocks = { ...state.productStocks };
      action.payload.forEach(stock => {
        const key = stock.variantId 
          ? `${stock.productId}_${stock.variantId}`
          : stock.productId;
        newStocks[key] = stock;
      });
      return { ...state, productStocks: newStocks };
    }
    
    default:
      return state;
  }
};

// Context
const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// Provider component
export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io('http://localhost:8000', {
      auth: { token },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      // console.log('🔌 Connected to inventory socket');
      dispatch({ type: 'SET_CONNECTED', payload: true });
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from inventory socket');
      dispatch({ type: 'SET_CONNECTED', payload: false });
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Kết nối realtime thất bại' });
    });

    // Listen for stock updates
    newSocket.on('stock_updated', (data) => {
      console.log('📦 Stock updated:', data);
      dispatch({
        type: 'UPDATE_STOCK',
        payload: {
          productId: data.productId,
          variantId: data.variantId,
          availableStock: data.availableStock,
          reservedQuantity: data.reservedQuantity,
        }
      });
    });

    // Listen for reservation updates
    newSocket.on('reservation_updated', (data) => {
      console.log('🔒 Reservation updated:', data);
      dispatch({
        type: 'UPDATE_RESERVATION',
        payload: {
          productId: data.productId,
          quantity: data.reservedQuantity,
        }
      });
    });

    // Listen for inventory updates (global)
    newSocket.on('inventory_updated', (data) => {
      console.log('📦 Global inventory updated:', data);
      // Handle global inventory updates if needed
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Reserve product with optimistic updates
  const reserveProduct = useCallback(async (data: ReservationRequest): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Optimistic update
      const currentStock = getAvailableStock(data.productId, data.variantId);
      const currentReserved = getReservedQuantity(data.productId);
      
      dispatch({
        type: 'UPDATE_STOCK',
        payload: {
          productId: data.productId,
          variantId: data.variantId,
          availableStock: currentStock - data.quantity,
          reservedQuantity: currentReserved + data.quantity,
        }
      });

      dispatch({
        type: 'UPDATE_RESERVATION',
        payload: {
          productId: data.productId,
          quantity: data.quantity,
        }
      });

      // Call API
      const response = await reservationApi.reserveProduct(data);
      
      if (response.success) {
        // Update with actual data from server
        dispatch({
          type: 'UPDATE_STOCK',
          payload: {
            productId: data.productId,
            variantId: data.variantId,
            availableStock: response.data.availableStock,
            reservedQuantity: response.data.reservedQuantity,
          }
        });
        
        return true;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('Error reserving product:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Lỗi khi đặt trước sản phẩm' });
      
      // Rollback optimistic update
      const currentStock = getAvailableStock(data.productId, data.variantId);
      const currentReserved = getReservedQuantity(data.productId);
      
      dispatch({
        type: 'UPDATE_STOCK',
        payload: {
          productId: data.productId,
          variantId: data.variantId,
          availableStock: currentStock + data.quantity,
          reservedQuantity: Math.max(0, currentReserved - data.quantity),
        }
      });
      
      dispatch({ type: 'CLEAR_RESERVATION', payload: data.productId });
      
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Release reservation with optimistic updates
  const releaseReservation = useCallback(async (data: ReleaseRequest): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Optimistic update
      const currentStock = getAvailableStock(data.productId);
      const currentReserved = getReservedQuantity(data.productId);
      
      dispatch({
        type: 'UPDATE_STOCK',
        payload: {
          productId: data.productId,
          availableStock: currentStock + data.quantity,
          reservedQuantity: Math.max(0, currentReserved - data.quantity),
        }
      });

      // Call API
      const response = await reservationApi.releaseReservation(data);
      
      if (response.success) {
        // Update with actual data from server
        dispatch({
          type: 'UPDATE_STOCK',
          payload: {
            productId: data.productId,
            availableStock: response.data.availableStock,
            reservedQuantity: response.data.reservedQuantity,
          }
        });
        
        // Clear reservation if fully released
        if (response.data.reservedQuantity === 0) {
          dispatch({ type: 'CLEAR_RESERVATION', payload: data.productId });
        }
        
        return true;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('Error releasing reservation:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Lỗi khi hủy đặt trước' });
      
      // Rollback optimistic update
      const currentStock = getAvailableStock(data.productId);
      const currentReserved = getReservedQuantity(data.productId);
      
      dispatch({
        type: 'UPDATE_STOCK',
        payload: {
          productId: data.productId,
          availableStock: currentStock - data.quantity,
          reservedQuantity: currentReserved + data.quantity,
        }
      });
      
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Check stock availability
  const checkStock = useCallback(async (items: StockCheckItem[]): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await reservationApi.checkStock(items);
      
      if (response.success) {
        return response.allAvailable;
      } else {
        throw new Error('Lỗi khi kiểm tra tồn kho');
      }
    } catch (error: any) {
      console.error('Error checking stock:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Lỗi khi kiểm tra tồn kho' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Get available stock for a product
  const getAvailableStock = useCallback((productId: string, variantId?: string): number => {
    const key = variantId ? `${productId}_${variantId}` : productId;
    const stock = state.productStocks[key];
    return stock?.availableStock ?? 0;
  }, [state.productStocks]);

  // Get reserved quantity for a product
  const getReservedQuantity = useCallback((productId: string): number => {
    return state.reservations[productId] ?? 0;
  }, [state.reservations]);

  // Socket room management
  const joinProductRoom = useCallback((productId: string) => {
    if (socket) {
      socket.emit('join_product_room', productId);
    }
  }, [socket]);

  const leaveProductRoom = useCallback((productId: string) => {
    if (socket) {
      socket.emit('leave_product_room', productId);
    }
  }, [socket]);

  const joinInventoryRoom = useCallback(() => {
    if (socket) {
      socket.emit('join_inventory_room');
    }
  }, [socket]);

  const leaveInventoryRoom = useCallback(() => {
    if (socket) {
      socket.emit('leave_inventory_room');
    }
  }, [socket]);

  const value: InventoryContextType = {
    state,
    reserveProduct,
    releaseReservation,
    checkStock,
    getAvailableStock,
    getReservedQuantity,
    joinProductRoom,
    leaveProductRoom,
    joinInventoryRoom,
    leaveInventoryRoom,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

// Hook to use inventory context
export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
