export interface Coupon {
    _id: string;
    code: string;
    name: string;
    description?: string;
    type: 'percentage' | 'fixed';
    discount: number;
    minAmount: number;
    maxDiscount?: number;
    isActive: boolean;
    startDate: string;
    endDate: string;
    usageLimit: number;
    usedCount: number;
    userUsageLimit: number;
    applicableProducts?: string[];
    applicableCategories?: string[];
    usedBy?: Array<{
        user: string;
        count: number;
    }>;
    applyToAllProducts?: boolean;
    // Backward compatibility fields (deprecated)
    value?: number;
    minOrderValue?: number;
    maxDiscountValue?: number;
    usageCount?: number;
}

export interface CreateCouponData {
    code: string;
    name: string;
    description?: string;
    type: 'percentage' | 'fixed';
    discount: number;
    minAmount: number;
    maxDiscount?: number;
    isActive: boolean;
    startDate: string;
    endDate: string;
    usageLimit: number;
    userUsageLimit: number;
    applicableProducts?: string[];
    applicableCategories?: string[];
    applyToAllProducts?: boolean; // ✅ Mới thêm
}

export interface UpdateCouponData extends Partial<CreateCouponData> { }

export interface CouponResponse {
    success: boolean;
    coupons: Coupon[];
}

export interface CouponUsage {
    user: string;
    count: number;
}
