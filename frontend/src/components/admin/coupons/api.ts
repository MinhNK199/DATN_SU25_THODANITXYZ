import axiosInstance from '../../../api/axiosInstance';
import { Coupon, CouponResponse, CreateCouponData, UpdateCouponData } from '../../../interfaces/Coupon';

// Lấy danh sách tất cả coupon (admin)
export const getCoupons = async (page = 1, pageSize = 10): Promise<{ coupons: Coupon[]; total: number; page: number; pages: number }> => {
  try {
    const response = await axiosInstance.get(`/coupon?page=${page}&pageSize=${pageSize}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching coupons:', error);
    throw error;
  }
};

// Lấy coupon theo ID
export const getCouponById = async (id: string): Promise<Coupon> => {
  try {
    const response = await axiosInstance.get(`/coupon/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching coupon:', error);
    throw error;
  }
};

// Tạo coupon mới
export const createCoupon = async (data: CreateCouponData): Promise<Coupon> => {
  try {
    const response = await axiosInstance.post('/coupon', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    throw new Error(error.response?.data?.message || 'Lỗi khi tạo mã giảm giá');
  }
};

// Cập nhật coupon
export const updateCoupon = async (id: string, data: UpdateCouponData): Promise<Coupon> => {
  try {
    const response = await axiosInstance.put(`/coupon/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating coupon:', error);
    throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật mã giảm giá');
  }
};

// Xóa coupon (soft delete hoặc hard delete)
export const deleteCoupon = async (id: string, hardDelete: boolean = false): Promise<void> => {
  try {
    if (hardDelete) {
      await axiosInstance.delete(`/coupon/${id}`);
    } else {
      // Soft delete - chỉ tắt isActive
      await axiosInstance.put(`/coupon/${id}`, { isActive: false });
    }
  } catch (error: any) {
    console.error('Error deleting coupon:', error);
    throw new Error(error.response?.data?.message || 'Lỗi khi xóa mã giảm giá');
  }
};

// Lấy danh sách coupon có sẵn (client)
export const getAvailableCoupons = async (): Promise<CouponResponse> => {
  try {
    const response = await axiosInstance.get('/coupon/available');
    return response.data;
  } catch (error) {
    console.error('Error fetching available coupons:', error);
    throw error;
  }
};

// Lấy danh sách coupon đã sử dụng (client)
export const getUsedCoupons = async (): Promise<CouponResponse> => {
  try {
    const response = await axiosInstance.get('/coupon/used');
    return response.data;
  } catch (error) {
    console.error('Error fetching used coupons:', error);
    throw error;
  }
};

// Áp dụng coupon (client)
export const applyCoupon = async (code: string, orderAmount: number): Promise<{ success: boolean; coupon?: Coupon; message?: string; discountAmount?: number }> => {
  try {
    const response = await axiosInstance.post('/coupon/apply', {
      code,
      orderAmount
    });
    return response.data;
  } catch (error: any) {
    console.error('Error applying coupon:', error);
    throw new Error(error.response?.data?.message || 'Lỗi khi áp dụng mã giảm giá');
  }
};

// Hủy áp dụng coupon (client)
export const removeCoupon = async (couponId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await axiosInstance.post('/coupon/remove', {
      couponId
    });
    return response.data;
  } catch (error: any) {
    console.error('Error removing coupon:', error);
    throw error;
  }
};
