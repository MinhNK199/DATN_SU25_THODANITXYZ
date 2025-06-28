import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useToast } from '../components/client/ToastContainer';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  brand?: string;
  color?: string;
  size?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const CartContext = createContext<{
  state: CartState;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        };
      } else {
        const newItem = { ...action.payload, quantity: 1 };
        const updatedItems = [...state.items, newItem];
        return {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        };
      }
    }
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      };
    }
    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(1, action.payload.quantity) }
          : item
      );
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      };
    }
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0
      };
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload,
        total: action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        itemCount: action.payload.reduce((sum, item) => sum + item.quantity, 0)
      };
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0
  });

  const { showSuccess, showInfo } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('cart', JSON.stringify(state.items));
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [state.items]);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_ITEM', payload: { ...item, quantity: 1 } });
    
    const existingItem = state.items.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      showInfo(
        'Đã cập nhật giỏ hàng',
        `Số lượng "${item.name}" đã được tăng lên ${existingItem.quantity + 1}`
      );
    } else {
      showSuccess(
        'Đã thêm vào giỏ hàng',
        `"${item.name}" đã được thêm vào giỏ hàng thành công!`
      );
    }
  }, [state.items, showSuccess, showInfo]);

  const removeFromCart = useCallback((id: string) => {
    const item = state.items.find(item => item.id === id);
    dispatch({ type: 'REMOVE_ITEM', payload: id });
    
    if (item) {
      showInfo(
        'Đã xóa khỏi giỏ hàng',
        `"${item.name}" đã được xóa khỏi giỏ hàng`
      );
    }
  }, [state.items, showInfo]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
    showInfo('Đã xóa giỏ hàng', 'Tất cả sản phẩm đã được xóa khỏi giỏ hàng');
  }, [showInfo]);

  const isInCart = useCallback((id: string) => {
    return state.items.some(item => item.id === id);
  }, [state.items]);

  const value = {
    state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 