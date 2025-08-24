import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api', // ✅ Port 8000 theo backend
  timeout: 10000,
});

// Interceptor để thêm token vào header
axiosInstance.interceptors.request.use(
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
axiosInstance.interceptors.response.use(
  (response) => {
    // Kiểm tra xem có token mới không
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      localStorage.setItem('token', newToken);
      console.log('🔄 Token đã được refresh tự động');
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const errorType = error.response?.data?.error;
      
      if (errorType === 'TOKEN_EXPIRED') {
        console.log('❌ Token đã hết hạn, chuyển hướng đến trang đăng nhập');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        console.log('❌ Lỗi xác thực khác:', errorType);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;