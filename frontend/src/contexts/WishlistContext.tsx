import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useToast } from '../components/client/ToastContainer';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  brand?: string;
  originalPrice?: number;
  discount?: number;
}

interface WishlistState {
  items: WishlistItem[];
  itemCount: number;
}

type WishlistAction =
  | { type: 'ADD_ITEM'; payload: WishlistItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'LOAD_WISHLIST'; payload: WishlistItem[] };

const WishlistContext = createContext<{
  state: WishlistState;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
  isInWishlist: (id: string) => boolean;
} | null>(null);

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return state; // Item already exists
      } else {
        const updatedItems = [...state.items, action.payload];
        return {
          ...state,
          items: updatedItems,
          itemCount: updatedItems.length
        };
      }
    }
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: updatedItems,
        itemCount: updatedItems.length
      };
    }
    case 'CLEAR_WISHLIST':
      return {
        ...state,
        items: [],
        itemCount: 0
      };
    case 'LOAD_WISHLIST':
      return {
        ...state,
        items: action.payload,
        itemCount: action.payload.length
      };
    default:
      return state;
  }
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, {
    items: [],
    itemCount: 0
  });

  const { showSuccess, showInfo } = useToast();

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        const wishlistItems = JSON.parse(savedWishlist);
        dispatch({ type: 'LOAD_WISHLIST', payload: wishlistItems });
      } catch (error) {
        console.error('Error loading wishlist from localStorage:', error);
      }
    }
  }, []);

  // Save wishlist to localStorage with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('wishlist', JSON.stringify(state.items));
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [state.items]);

  const addToWishlist = useCallback((item: WishlistItem) => {
    const existingItem = state.items.find(wishlistItem => wishlistItem.id === item.id);
    if (existingItem) {
      showInfo(
        'Đã có trong danh sách yêu thích',
        `"${item.name}" đã có trong danh sách yêu thích của bạn`
      );
      return;
    }

    dispatch({ type: 'ADD_ITEM', payload: item });
    showSuccess(
      'Đã thêm vào yêu thích',
      `"${item.name}" đã được thêm vào danh sách yêu thích!`
    );
  }, [state.items, showSuccess, showInfo]);

  const removeFromWishlist = useCallback((id: string) => {
    const item = state.items.find(item => item.id === id);
    dispatch({ type: 'REMOVE_ITEM', payload: id });
    
    if (item) {
      showInfo(
        'Đã xóa khỏi yêu thích',
        `"${item.name}" đã được xóa khỏi danh sách yêu thích`
      );
    }
  }, [state.items, showInfo]);

  const clearWishlist = useCallback(() => {
    dispatch({ type: 'CLEAR_WISHLIST' });
    showInfo('Đã xóa danh sách yêu thích', 'Tất cả sản phẩm đã được xóa khỏi danh sách yêu thích');
  }, [showInfo]);

  const isInWishlist = useCallback((id: string) => {
    return state.items.some(item => item.id === id);
  }, [state.items]);

  const value = {
    state,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}; 