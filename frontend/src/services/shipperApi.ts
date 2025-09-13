import axiosInstance from '../api/axiosInstance';
import { ShipperAuthResponse, ShipperProfileResponse, AssignedOrdersResponse, OrderTracking } from '../interfaces/Shipper';

export const shipperApi = {
  // Đăng ký shipper
  register: async (data: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    phone: string;
    address: string;
    idCard: string;
    licensePlate: string;
    vehicleType: 'motorbike' | 'car' | 'bicycle';
  }) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key as keyof typeof data]);
    });

    const response = await axiosInstance.post('/shipper/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as ShipperAuthResponse;
  },

  // Đăng nhập shipper
  login: async (data: { email: string; password: string }) => {
    const response = await axiosInstance.post('/shipper/login', data);
    return response.data as ShipperAuthResponse;
  },

  // Lấy thông tin profile shipper
  getProfile: async () => {
    const response = await axiosInstance.get('/shipper/profile');
    return response.data as ShipperProfileResponse;
  },

  // Cập nhật profile shipper
  updateProfile: async (data: {
    fullName?: string;
    phone?: string;
    address?: string;
    currentLocation?: {
      latitude: number;
      longitude: number;
      address: string;
    };
  }) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key as keyof typeof data] !== undefined) {
        if (key === 'currentLocation') {
          formData.append(key, JSON.stringify(data[key as keyof typeof data]));
        } else {
          formData.append(key, data[key as keyof typeof data] as string);
        }
      }
    });

    const response = await axiosInstance.put('/shipper/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Cập nhật trạng thái online/offline
  updateOnlineStatus: async (data: {
    isOnline: boolean;
    currentLocation?: {
      latitude: number;
      longitude: number;
      address: string;
    };
  }) => {
    // Debug: Kiểm tra token trong axiosInstance
    console.log('🔍 axiosInstance headers:', axiosInstance.defaults.headers.common);
    
    // Đảm bảo token được set
    const token = localStorage.getItem('shipperToken');
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Token set for request:', token.substring(0, 20) + '...');
    }
    
    const response = await axiosInstance.put('/shipper/online-status', data);
    return response.data;
  },

  // Lấy danh sách đơn hàng được phân công
  getAssignedOrders: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    // Đảm bảo token được set
    const token = localStorage.getItem('shipperToken');
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('🔍 Calling /shipper/orders API...');
    console.log('🔍 Request headers:', axiosInstance.defaults.headers.common);
    const response = await axiosInstance.get('/shipper/orders', { params });
    console.log('📡 API response:', response);
    return response.data as AssignedOrdersResponse;
  },

  // Bắt đầu giao hàng
  startDelivery: async (orderId: string, data: {
    notes?: string;
    pickupImages?: File[];
  }) => {
    const formData = new FormData();
    formData.append('orderId', orderId);
    if (data.notes) formData.append('notes', data.notes);
    if (data.pickupImages) {
      data.pickupImages.forEach((file, index) => {
        formData.append('pickupImages', file);
      });
    }

    const response = await axiosInstance.post(`/shipper/orders/${orderId}/start-delivery`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Cập nhật vị trí
  updateLocation: async (data: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    const response = await axiosInstance.put('/shipper/location', data);
    return response.data;
  },

  // Xác nhận giao hàng thành công
  confirmDelivery: async (orderId: string, data: {
    deliveryProof?: string;
    customerSignature?: string;
    notes?: string;
    deliveryImages?: File[];
  }) => {
    const formData = new FormData();
    formData.append('orderId', orderId);
    if (data.deliveryProof) formData.append('deliveryProof', data.deliveryProof);
    if (data.customerSignature) formData.append('customerSignature', data.customerSignature);
    if (data.notes) formData.append('notes', data.notes);
    if (data.deliveryImages) {
      data.deliveryImages.forEach((file, index) => {
        formData.append('deliveryImages', file);
      });
    }

    const response = await axiosInstance.post(`/shipper/orders/${orderId}/confirm-delivery`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Báo cáo giao hàng thất bại
  reportDeliveryFailure: async (orderId: string, data: {
    failureReason: string;
    notes?: string;
  }) => {
    const response = await axiosInstance.post(`/shipper/orders/${orderId}/report-failure`, {
      orderId,
      ...data
    });
    return response.data;
  },
};
