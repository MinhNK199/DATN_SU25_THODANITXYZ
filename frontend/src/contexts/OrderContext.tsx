import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Order } from '../interfaces/Order';

interface OrderContextType {
  socket: Socket | null;
  isConnected: boolean;
  orders: Order[];
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  addOrder: (order: Order) => void;
  removeOrder: (orderId: string) => void;
  refreshOrders: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

interface OrderProviderProps {
  children: React.ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:8000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000
    });

    newSocket.on('connect', () => {
      // console.log('🔌 Connected to order socket');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from order socket');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 Order socket connection error:', error);
    });

    // Listen for order status updates
    newSocket.on('order_status_updated', (data) => {
      console.log('📦 Order status updated:', data);
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === data.orderId 
            ? { ...order, status: data.status, ...data.updates }
            : order
        )
      );

      // Emit custom event for order detail pages
      window.dispatchEvent(new CustomEvent('orderUpdated', {
        detail: {
          orderId: data.orderId,
          updates: {
            status: data.status,
            ...data.updates
          }
        }
      }));
    });

    // Listen for order payment updates
    newSocket.on('order_payment_updated', (data) => {
      console.log('💰 Order payment updated:', data);
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === data.orderId 
            ? { 
                ...order, 
                isPaid: data.isPaid, 
                paidAt: data.paidAt,
                status: data.status,
                paymentStatus: data.paymentStatus || order.paymentStatus,
                statusHistory: data.statusHistory || order.statusHistory
              }
            : order
        )
      );

      // Emit custom event for order detail pages
      window.dispatchEvent(new CustomEvent('orderUpdated', {
        detail: {
          orderId: data.orderId,
          updates: {
            isPaid: data.isPaid,
            paidAt: data.paidAt,
            status: data.status,
            paymentStatus: data.paymentStatus,
            statusHistory: data.statusHistory
          }
        }
      }));
    });

    // Listen for new orders (for admin)
    newSocket.on('new_order_created', (data) => {
      console.log('🆕 New order created:', data);
      setOrders(prevOrders => [data.order, ...prevOrders]);
    });

    // Listen for order assignment updates
    newSocket.on('order_assigned', (data) => {
      console.log('🚚 Order assigned to shipper:', data);
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === data.orderId 
            ? { 
                ...order, 
                status: data.status,
                shipper: data.shipper,
                statusHistory: data.statusHistory || order.statusHistory
              }
            : order
        )
      );

      // Emit custom event for order detail pages
      window.dispatchEvent(new CustomEvent('orderUpdated', {
        detail: {
          orderId: data.orderId,
          updates: {
            status: data.status,
            shipper: data.shipper,
            statusHistory: data.statusHistory
          }
        }
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const updateOrder = useCallback((orderId: string, updates: Partial<Order>) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order._id === orderId 
          ? { ...order, ...updates }
          : order
      )
    );
  }, []);

  const addOrder = useCallback((order: Order) => {
    setOrders(prevOrders => [order, ...prevOrders]);
  }, []);

  const removeOrder = useCallback((orderId: string) => {
    setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
  }, []);

  const refreshOrders = useCallback(() => {
    // This will be implemented by components that need to refresh orders
    console.log('🔄 Refreshing orders...');
  }, []);

  const value: OrderContextType = {
    socket,
    isConnected,
    orders,
    updateOrder,
    addOrder,
    removeOrder,
    refreshOrders
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};
