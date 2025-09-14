import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

// Get auth token
const getAuthToken = () => localStorage.getItem('token');

// API headers
const getHeaders = () => ({
  'Authorization': `Bearer ${getAuthToken()}`,
  'Content-Type': 'application/json'
});

// Variant API functions
export const variantApi = {
  // Get all variants with filters
  getVariants: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    product?: string;
    isActive?: boolean;
  } = {}) => {
    try {
      const response = await axios.get(`${API_BASE}/variant`, {
        headers: getHeaders(),
        params
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single variant by ID
  getVariantById: async (id: string) => {
    try {
      const response = await axios.get(`${API_BASE}/variant/${id}`, {
        headers: getHeaders()
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new variant
  createVariant: async (variantData: any) => {
    const data = { ...variantData };
    if (typeof data.color === 'string') {
      data.color = { code: data.color, name: '' };
    } else if (typeof data.color !== 'object' || typeof data.color.code !== 'string' || typeof data.color.name !== 'string') {
      data.color = { code: '', name: '' };
    }
    try {
      const response = await axios.post(`${API_BASE}/variant`, data, {
        headers: getHeaders()
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update variant
  updateVariant: async (id: string, variantData: any) => {
    const data = { ...variantData };
    if (typeof data.color === 'string') {
      data.color = { code: data.color, name: '' };
    } else if (typeof data.color !== 'object' || typeof data.color.code !== 'string' || typeof data.color.name !== 'string') {
      data.color = { code: '', name: '' };
    }
    try {
      const response = await axios.put(`${API_BASE}/variant/${id}`, data, {
        headers: getHeaders()
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete variant (hard delete)
  deleteVariant: async (id: string) => {
    try {
      const response = await axios.delete(`${API_BASE}/variant/${id}`, {
        headers: getHeaders()
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Soft delete variant
  softDeleteVariant: async (id: string) => {
    try {
      const response = await axios.delete(`${API_BASE}/variant/${id}/soft`, {
        headers: getHeaders()
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Bulk delete variants
  bulkDeleteVariants: async (variantIds: string[]) => {
    try {
      const response = await axios.delete(`${API_BASE}/product/variants/bulk`, {
        headers: getHeaders(),
        data: { variantIds }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Toggle variant status
  toggleVariantStatus: async (id: string, isActive: boolean) => {
    try {
      const response = await axios.put(`${API_BASE}/product/variants/${id}/toggle-status`, 
        { isActive }, 
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get variant statistics
  getVariantStats: async () => {
    try {
      const response = await axios.get(`${API_BASE}/variant/stats`, {
        headers: getHeaders()
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Export variants
  exportVariants: async (format: 'csv' | 'excel' = 'csv') => {
    try {
      const response = await axios.get(`${API_BASE}/product/variants/export`, {
        headers: getHeaders(),
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Import variants
  importVariants: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_BASE}/product/variants/import`, formData, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get variants by product
  getVariantsByProduct: async (productId: string) => {
    try {
      const response = await axios.get(`${API_BASE}/product/${productId}/variants`, {
        headers: getHeaders()
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update variant stock
  updateVariantStock: async (id: string, stock: number) => {
    try {
      const response = await axios.put(`${API_BASE}/product/variants/${id}/stock`, 
        { stock }, 
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get low stock variants
  getLowStockVariants: async (threshold: number = 10) => {
    try {
      const response = await axios.get(`${API_BASE}/product/variants/low-stock`, {
        headers: getHeaders(),
        params: { threshold }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default variantApi; 