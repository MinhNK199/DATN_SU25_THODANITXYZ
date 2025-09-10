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
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Interfaces
export interface ReservationRequest {
  productId: string;
  quantity: number;
  variantId?: string;
}

export interface ReservationResponse {
  success: boolean;
  message: string;
  data: {
    reservationId: string;
    productId: string;
    quantity: number;
    availableStock: number;
    reservedQuantity: number;
    expiresAt: string;
  };
}

export interface ReleaseRequest {
  productId: string;
  quantity: number;
}

export interface ReleaseResponse {
  success: boolean;
  message: string;
  data: {
    productId: string;
    releasedQuantity: number;
    availableStock: number;
    reservedQuantity: number;
  };
}

export interface StockCheckItem {
  productId: string;
  quantity: number;
  variantId?: string;
}

export interface StockCheckResponse {
  success: boolean;
  allAvailable: boolean;
  results: Array<{
    productId: string;
    variantId?: string;
    available: boolean;
    availableStock: number;
    reservedQuantity: number;
    requestedQuantity: number;
    message?: string;
  }>;
}

export interface UserReservation {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
  reservedAt: string;
  expiresAt: string;
  isActive: boolean;
}

// Reservation API functions
export const reservationApi = {
  // Reserve product (đặt trước sản phẩm)
  reserveProduct: async (data: ReservationRequest): Promise<ReservationResponse> => {
    const response = await api.post('/reservation/reserve', data);
    return response.data;
  },

  // Release reservation (hủy đặt trước)
  releaseReservation: async (data: ReleaseRequest): Promise<ReleaseResponse> => {
    const response = await api.post('/reservation/release', data);
    return response.data;
  },

  // Check stock availability
  checkStock: async (items: StockCheckItem[]): Promise<StockCheckResponse> => {
    const response = await api.post('/reservation/check-stock', { items });
    return response.data;
  },

  // Get user's active reservations
  getUserReservations: async (): Promise<{ success: boolean; data: UserReservation[] }> => {
    const response = await api.get('/reservation/user-reservations');
    return response.data;
  },

  // Cleanup expired reservations (admin only)
  cleanupExpiredReservations: async (): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await api.post('/reservation/cleanup');
    return response.data;
  }
};
