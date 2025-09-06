import axiosInstance from '../api/axiosInstance';

export interface Coupon {
  _id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'shipping';
  discount: number;
  minAmount: number;
  maxDiscount?: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  expiryDate?: string;
  usageLimit?: number;
  usedCount: number;
  isUsed?: boolean;
  usedDate?: string;
  // Backward compatibility fields
  value?: number;
  minOrderValue?: number;
  maxDiscountValue?: number;
  usageCount?: number;
}

export interface CouponResponse {
  success: boolean;
  coupons: Coupon[];
  message?: string;
}

// Lấy danh sách mã giảm giá có sẵn
export const getAvailableCoupons = async (): Promise<CouponResponse> => {
  try {
    const response = await axiosInstance.get('/coupon/available');
    return response.data;
  } catch (error) {
    // Silently handle error - let calling component handle it
    throw error;
  }
};

// Lấy danh sách mã giảm giá đã sử dụng
export const getUsedCoupons = async (): Promise<CouponResponse> => {
  try {
    const response = await axiosInstance.get('/coupon/used');
    return response.data;
  } catch (error) {
    // Silently handle error - let calling component handle it
    throw error;
  }
};

// Áp dụng mã giảm giá
export const applyCoupon = async (couponCode: string, orderAmount: number): Promise<{ success: boolean; coupon?: Coupon; message?: string; discountAmount?: number }> => {
  try {
    const response = await axiosInstance.post('/coupon/apply', {
      code: couponCode,
      orderAmount
    });
    return response.data;
  } catch (error) {
    // Silently handle error - let calling component handle it
    throw error;
  }
};

// Hủy áp dụng mã giảm giá
export const removeCoupon = async (couponId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await axiosInstance.post('/coupon/remove', {
      couponId
    });
    return response.data;
  } catch (error) {
    // Silently handle error - let calling component handle it
    throw error;
  }
};
