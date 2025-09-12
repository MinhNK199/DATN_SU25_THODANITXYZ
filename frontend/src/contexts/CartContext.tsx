import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import cartApi, { Cart, CartItem } from '../services/cartApi';
import { calculateSubtotal } from '../utils/priceUtils';

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  loading: boolean;
  error: string | null;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_CART'; payload: Cart }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; variantId?: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number; variantId?: string } }
  | { type: 'CLEAR_CART' };

const CartContext = createContext<{
  state: CartState;
  addToCart: (productId: string, quantity?: number, variantId?: string) => Promise<void>;
  removeFromCart: (productId: string, variantId?: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string, variantId?: string) => boolean;
  loadCart: (forceRefresh?: boolean) => Promise<void>;
  removeOrderedItemsFromCart: (orderItems: any[]) => Promise<void>; // ✅ Thêm vào interface
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload.items || [],
        total: action.payload.totalPrice || 0,
        itemCount: action.payload.totalItems || 0,
        loading: false,
        error: null
      };
    case 'ADD_ITEM': {
      // Kiểm tra cả productId và variantId để xác định item có trùng không
      const existingItemIndex = state.items.findIndex(item => 
        item.product._id === action.payload.product._id && 
        String(item.variantId || '') === String(action.payload.variantId || '')
      );
      let updatedItems;

      if (existingItemIndex > -1) {
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        updatedItems = [...state.items, action.payload];
      }

      return {
        ...state,
        items: updatedItems,
        total: calculateSubtotal(updatedItems),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      };
    }
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => 
        !(item.product._id === action.payload.productId && 
          String(item.variantId || '') === String(action.payload.variantId || ''))
      );
      return {
        ...state,
        items: updatedItems,
        total: calculateSubtotal(updatedItems),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      };
    }
    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.product._id === action.payload.productId && 
        String(item.variantId || '') === String(action.payload.variantId || '')
          ? { ...item, quantity: Math.max(1, action.payload.quantity) }
          : item
      );
      return {
        ...state,
        items: updatedItems,
        total: calculateSubtotal(updatedItems),
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
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
    loading: false,
    error: null
  });

  // Load cart from backend on mount
  const loadCart = useCallback(async (forceRefresh = false) => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Nếu chưa đăng nhập, load từ localStorage
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart);
          const mockCart: Cart = {
            _id: 'local',
            user: 'local',
            items: cartItems,
            totalItems: cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0),
            totalPrice: 0,
            discountAmount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          dispatch({ type: 'LOAD_CART', payload: mockCart });
        } catch (error) {
          // Silently handle localStorage error
        }
      }
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // ✅ THÊM TIMESTAMP ĐỂ TRÁNH CACHE
      const cart = await cartApi.getCart(forceRefresh ? `?t=${Date.now()}` : '');
      dispatch({ type: 'LOAD_CART', payload: cart });
    } catch (error: any) {
      // Silently handle error - don't show error message if server is offline
      if (error.message !== 'Network Error') {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }

      // Fallback to localStorage if API fails
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart);
          const mockCart: Cart = {
            _id: 'local-fallback',
            user: 'local',
            items: cartItems,
            totalItems: cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0),
            totalPrice: 0,
            discountAmount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          dispatch({ type: 'LOAD_CART', payload: mockCart });
        } catch (localError) {
          // Silently handle localStorage error
        }
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addToCart = useCallback(async (productId: string, quantity: number = 1, variantId?: string) => {
    const token = localStorage.getItem('token');

    if (!token) {
      // Nếu chưa đăng nhập, lưu vào localStorage
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }

    // Kiểm tra role của user
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role !== 'customer') {
          toast.error('Chỉ khách hàng mới được thêm sản phẩm vào giỏ hàng');
          return;
        }
      } catch (error) {
        // Silently handle user data parsing error
        toast.error('Lỗi xác thực người dùng');
        return;
      }
    }

    try {
      const cart = await cartApi.addToCart({ productId, quantity, variantId });
      dispatch({ type: 'LOAD_CART', payload: cart });

      const product = cart.items.find(item => item.product._id === productId && String(item.variantId || '') === String(variantId || ''));
      if (product) {
        toast.success(`Đã thêm "${product.product.name}" vào giỏ hàng`);
      }
    } catch (error: any) {
      // Silently handle error - show user-friendly message
      toast.error(error.response?.data?.message || 'Không thể thêm vào giỏ hàng');
    }
  }, []);

  const removeFromCart = useCallback(async (productId: string, variantId?: string) => {
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Vui lòng đăng nhập để thao tác giỏ hàng');
      return;
    }

    try {
      const cart = await cartApi.removeFromCart(productId);
      dispatch({ type: 'LOAD_CART', payload: cart });
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error: any) {
      // Silently handle error - show user-friendly message
      toast.error(error.response?.data?.message || 'Không thể xóa sản phẩm');
    }
  }, []);

  const updateQuantity = useCallback(async (productId: string, quantity: number, variantId?: string) => {
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Vui lòng đăng nhập để thao tác giỏ hàng');
      return;
    }

    // Tìm item trong cart để validate stock
    const item = state.items.find(item => 
      item.product._id === productId && 
      String(item.variantId || '') === String(variantId || '')
    );
    if (!item) {
      toast.error('Không tìm thấy sản phẩm trong giỏ hàng');
      return;
    }

    // ✅ VALIDATE STOCK TRƯỚC KHI GỬI REQUEST
    const variant = item.variantInfo;
    const maxStock = variant?.availableStock ??
      item.product.availableStock ??
      variant?.stock ??
      item.product.stock ?? 0;

    if (quantity > maxStock) {
      toast.error(`Chỉ còn ${maxStock} sản phẩm trong kho!`);
      return;
    }

    if (quantity < 1) {
      toast.error('Số lượng phải lớn hơn 0!');
      return;
    }

    try {
      // Truyền variantId nếu có để backend có thể xử lý đúng
      const cart = await cartApi.updateCartItem(productId, quantity, variantId);
      dispatch({ type: 'LOAD_CART', payload: cart });

      // ✅ HIỂN THỊ THÔNG BÁO THÀNH CÔNG
      if (quantity === maxStock) {
        toast.warning(`Đã đạt số lượng tối đa tồn kho (${maxStock})`);
      }
    } catch (error: any) {
      // ✅ XỬ LÝ LỖI CHI TIẾT HƠN
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật số lượng';
      const availableStock = error.response?.data?.availableStock;

      if (availableStock !== undefined) {
        toast.error(`${errorMessage} (Còn lại: ${availableStock} sản phẩm)`);
      } else {
        toast.error(errorMessage);
      }
    }
  }, [state.items]);

  const clearCart = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Vui lòng đăng nhập để thao tác giỏ hàng');
      return;
    }

    try {
      await cartApi.clearCart();
      dispatch({ type: 'CLEAR_CART' });
      toast.success('Đã xóa toàn bộ giỏ hàng');
    } catch (error: any) {
      // Silently handle error - show user-friendly message
      toast.error(error.response?.data?.message || 'Không thể xóa giỏ hàng');
    }
  }, []);

  const isInCart = useCallback((productId: string, variantId?: string) => {
    return state.items.some(item => 
      item.product._id === productId && 
      String(item.variantId || '') === String(variantId || '')
    );
  }, [state.items]);

  // ✅ DI CHUYỂN FUNCTION VÀO TRONG COMPONENT
  const removeOrderedItemsFromCart = useCallback(async (orderItems: any[]) => {
    const token = localStorage.getItem('token');

    if (!token) {
      return;
    }

    try {
      // Gọi API để lấy lại giỏ hàng mới sau khi đã xóa ở backend
      const updatedCart = await cartApi.getCart();
      dispatch({ type: 'LOAD_CART', payload: updatedCart });

      // Cart updated after order
    } catch (error: any) {
      // Silently handle error - cart will be updated on next page load
    }
  }, []);

  const value = {
    state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    loadCart, // ✅ Thêm dấu phẩy
    removeOrderedItemsFromCart, // ✅ Function mới
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