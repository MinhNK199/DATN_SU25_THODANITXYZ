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

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id: string;
  user: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  ward: string;
  postalCode?: string;
  isDefault: boolean;
  type: 'home' | 'work' | 'other';
  note?: string;
  cityName?: string;
  wardName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  user: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
    product: string;
  }>;
  shippingAddress: Address;
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// User API functions
export const userApi = {
  // Lấy thông tin user hiện tại
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  // Cập nhật thông tin user
  updateProfile: async (userId: string, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/auth/users/${userId}`, data);
    return response.data.user;
  },

  // Lấy địa chỉ của user
  getAddresses: async (): Promise<Address[]> => {
    const response = await api.get('/address');
    return response.data;
  },

  // Tạo địa chỉ mới
  createAddress: async (data: Omit<Address, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Address> => {
    const response = await api.post('/address', data);
    return response.data;
  },

  // Cập nhật địa chỉ
  updateAddress: async (addressId: string, data: Partial<Address>): Promise<Address> => {
    const response = await api.put(`/address/${addressId}`, data);
    return response.data;
  },

  // Xóa địa chỉ
  deleteAddress: async (addressId: string): Promise<void> => {
    await api.delete(`/address/${addressId}`);
  },

  // Đặt địa chỉ mặc định
  setDefaultAddress: async (addressId: string): Promise<Address> => {
    const response = await api.put(`/address/${addressId}/default`);
    return response.data;
  },

  // Lấy đơn hàng của user
  getMyOrders: async (): Promise<Order[]> => {
    const response = await api.get('/order/myorders');
    return response.data;
  },

  // Lấy chi tiết đơn hàng
  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await api.get(`/order/${orderId}`);
    return response.data;
  },

  // Đổi mật khẩu
  changePassword: async (data: { oldPassword: string; newPassword: string; confirmPassword: string }): Promise<{ message: string }> => {
    const response = await api.patch('/auth/change-password', data);
    return response.data;
  },

  // Lấy lịch sử hoạt động của user
  getMyActivityLogs: async (): Promise<{ logs: any[] }> => {
    const response = await api.get('/auth/my-activity-logs');
    return response.data;
  },

  // Quản lý phương thức thanh toán
  getMyPaymentMethods: async (): Promise<{ methods: any[] }> => {
    const response = await api.get('/payment-methods');
    return response.data;
  },
  addPaymentMethod: async (data: any): Promise<any> => {
    const response = await api.post('/payment-methods', data);
    return response.data;
  },
  deletePaymentMethod: async (id: string): Promise<any> => {
    const response = await api.delete(`/payment-methods/${id}`);
    return response.data;
  },
  updatePaymentMethod: async (id: string, data: any): Promise<any> => {
    const response = await api.put(`/payment-methods/${id}`, data);
    return response.data;
  },
  // Quản lý thông báo
  getNotifications: async (): Promise<any[]> => {
    const response = await api.get('/notification');
    return response.data;
  },
  markNotificationAsRead: async (id: string): Promise<any> => {
    const response = await api.put(`/notification/${id}/read`);
    return response.data;
  },
  markAllNotificationsAsRead: async (): Promise<any> => {
    const response = await api.put('/notification/read-all');
    return response.data;
  },
  deleteNotification: async (id: string): Promise<any> => {
    const response = await api.delete(`/notification/${id}`);
    return response.data;
  },
  getUnreadNotificationCount: async (): Promise<number> => {
    const response = await api.get('/notification/unread-count');
    return response.data.count;
  },
};

export default api; 