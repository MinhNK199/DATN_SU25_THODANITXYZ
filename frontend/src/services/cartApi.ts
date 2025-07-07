import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Tạo instance axios với interceptor để tự động thêm token
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor để thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    salePrice?: number;
    images: string[];
    stock: number;
    availableStock?: number;
  };
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  coupon?: {
    _id: string;
    code: string;
    value: number;
    type: string;
  };
  discountAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductAvailability {
  productId: string;
  totalStock: number;
  reservedQuantity: number;
  availableStock: number;
}

// Cart API functions
export const cartApi = {
  // Lấy giỏ hàng của user
  getCart: async (): Promise<Cart> => {
    const response = await api.get('/cart');
    return response.data;
  },

  // Thêm sản phẩm vào giỏ hàng
  addToCart: async (productId: string, quantity: number): Promise<Cart> => {
    const response = await api.post('/cart', { productId, quantity });
    return response.data;
  },

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  updateCartItem: async (productId: string, quantity: number): Promise<Cart> => {
    const response = await api.put(`/cart/${productId}`, { quantity });
    return response.data;
  },

  // Xóa sản phẩm khỏi giỏ hàng
  removeFromCart: async (productId: string): Promise<Cart> => {
    const response = await api.delete(`/cart/${productId}`);
    return response.data;
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: async (): Promise<{ message: string }> => {
    const response = await api.delete('/cart');
    return response.data;
  },

  // Áp dụng mã giảm giá
  applyCoupon: async (code: string): Promise<Cart> => {
    const response = await api.post('/cart/apply-coupon', { code });
    return response.data;
  },

  // Lấy số lượng có sẵn của sản phẩm
  getProductAvailability: async (productId: string): Promise<ProductAvailability> => {
    const response = await api.get(`/cart/product-availability/${productId}`);
    return response.data;
  },
};

export default cartApi; 