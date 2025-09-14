import axiosInstance from '../api/axiosInstance';
import { Product } from '../interfaces/Product';

export const productApi = {
  // Lấy danh sách sản phẩm với phân trang và filter
  getProducts: async (params?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    isActive?: boolean;
  }) => {
    const response = await axiosInstance.get('/products', { params });
    return response.data;
  },

  // Lấy sản phẩm theo ID
  getProductById: async (id: string) => {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  },

  // Lấy sản phẩm theo danh mục
  getProductsByCategory: async (categoryId: string, params?: {
    page?: number;
    pageSize?: number;
  }) => {
    const response = await axiosInstance.get(`/categories/${categoryId}/products`, { params });
    return response.data;
  },

  // Lấy sản phẩm theo thương hiệu
  getProductsByBrand: async (brandId: string, params?: {
    page?: number;
    pageSize?: number;
  }) => {
    const response = await axiosInstance.get(`/brands/${brandId}/products`, { params });
    return response.data;
  },

  // Lấy sản phẩm liên quan
  getRelatedProducts: async (productId: string, limit: number = 4) => {
    const response = await axiosInstance.get(`/products/${productId}/related`, {
      params: { limit }
    });
    return response.data;
  },

  // Tìm kiếm sản phẩm
  searchProducts: async (keyword: string, params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }) => {
    const response = await axiosInstance.get('/products', {
      params: {
        keyword,
        ...params
      }
    });
    return response.data;
  },

  // Lấy sản phẩm nổi bật
  getFeaturedProducts: async (limit: number = 8) => {
    const response = await axiosInstance.get('/products', {
      params: {
        isFeatured: true,
        pageSize: limit,
        sort: '-createdAt'
      }
    });
    return response.data;
  },

  // Lấy sản phẩm mới nhất
  getLatestProducts: async (limit: number = 8) => {
    const response = await axiosInstance.get('/products', {
      params: {
        pageSize: limit,
        sort: '-createdAt'
      }
    });
    return response.data;
  },

  // Lấy sản phẩm bán chạy
  getBestSellingProducts: async (limit: number = 8) => {
    const response = await axiosInstance.get('/products', {
      params: {
        pageSize: limit,
        sort: '-averageRating'
      }
    });
    return response.data;
  }
};
