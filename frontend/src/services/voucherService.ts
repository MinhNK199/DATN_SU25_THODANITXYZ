import axios from 'axios';

export interface VoucherValidationResult {
    valid: boolean;
    message?: string;
    voucher?: {
        _id: string;
        code: string;
        name: string;
        type: 'percentage' | 'fixed';
        value: number;
        discountValue: number;
        minOrderValue: number;
        maxDiscountValue?: number;
        startDate: string;
        endDate: string;
        usageLimit: number;
        usedCount: number;
    };
    discountAmount?: number;
}

export interface VoucherInfo {
    code: string;
    name: string;
    type: 'percentage' | 'fixed';
    value: number;
    discountAmount: number;
    minOrderValue: number;
    maxDiscountValue?: number;
    startDate?: string;
    endDate?: string;
    isValid: boolean;
    validationMessage?: string;
}

export interface VoucherValidationOptions {
    orderValue: number;
    revalidate?: boolean; // Có kiểm tra lại điều kiện không
}

class VoucherService {
    private baseURL = 'http://localhost:8000/api';

    /**
     * Validate voucher với thông tin đơn hàng - Hàm chính để validate voucher
     */
    async validateVoucher(code: string, orderValue: number): Promise<VoucherValidationResult> {
        try {
            const response = await axios.post(`${this.baseURL}/coupon/validate`, {
                code,
                orderValue
            });

            return {
                valid: true,
                voucher: response.data.coupon,
                discountAmount: response.data.discountAmount
            };
        } catch (error: any) {
            return {
                valid: false,
                message: error.response?.data?.message || 'Lỗi xác thực voucher'
            };
        }
    }

    /**
     * Validate voucher với options mở rộng
     */
    async validateVoucherWithOptions(code: string, options: VoucherValidationOptions): Promise<VoucherValidationResult> {
        return this.validateVoucher(code, options.orderValue);
    }

    /**
     * Validate voucher cho sản phẩm cụ thể (legacy support)
     */
    async validateProductVoucher(productId: string, code: string, orderValue: number): Promise<VoucherValidationResult> {
        try {
            const response = await axios.post(`${this.baseURL}/product/check-voucher`, {
                productId,
                code,
                orderValue
            });

            return {
                valid: true,
                voucher: response.data.voucher,
                discountAmount: response.data.discount
            };
        } catch (error: any) {
            return {
                valid: false,
                message: error.response?.data?.message || 'Lỗi xác thực voucher'
            };
        }
    }

    /**
     * Tính toán discount amount dựa trên voucher info
     */
    calculateDiscount(voucher: VoucherInfo, orderValue: number): number {
        if (!voucher.isValid) return 0;

        let discount = 0;

        if (voucher.type === 'percentage') {
            discount = Math.round(orderValue * (voucher.value / 100));

            // Áp dụng giới hạn tối đa nếu có
            if (voucher.maxDiscountValue && discount > voucher.maxDiscountValue) {
                discount = voucher.maxDiscountValue;
            }
        } else if (voucher.type === 'fixed') {
            discount = Math.min(voucher.value, orderValue);
        }

        return discount;
    }

    /**
     * Kiểm tra voucher có hợp lệ không dựa trên thời gian và điều kiện
     */
    isVoucherValid(voucher: VoucherInfo): { isValid: boolean; message?: string } {
        if (!voucher.startDate || !voucher.endDate) {
            return { isValid: true }; // Nếu không có thông tin thời gian, coi như hợp lệ
        }

        const now = new Date();
        const startDate = new Date(voucher.startDate);
        const endDate = new Date(voucher.endDate);

        // Kiểm tra thời gian
        if (now < startDate) {
            return { isValid: false, message: 'Voucher chưa bắt đầu' };
        }

        if (now > endDate) {
            return { isValid: false, message: 'Voucher đã hết hạn' };
        }

        return { isValid: true };
    }

    /**
     * Kiểm tra điều kiện đơn hàng tối thiểu
     */
    checkMinOrderValue(voucher: VoucherInfo, orderValue: number): { isValid: boolean; message?: string } {
        if (voucher.minOrderValue && orderValue < voucher.minOrderValue) {
            return {
                isValid: false,
                message: `Đơn hàng tối thiểu phải từ ${voucher.minOrderValue.toLocaleString('vi-VN')}đ`
            };
        }
        return { isValid: true };
    }

    /**
     * Validate voucher toàn diện (thời gian + điều kiện đơn hàng)
     */
    validateVoucherComprehensive(voucher: VoucherInfo, orderValue: number): { isValid: boolean; message?: string } {
        // Kiểm tra thời gian
        const timeValidation = this.isVoucherValid(voucher);
        if (!timeValidation.isValid) {
            return timeValidation;
        }

        // Kiểm tra điều kiện đơn hàng
        const orderValidation = this.checkMinOrderValue(voucher, orderValue);
        if (!orderValidation.isValid) {
            return orderValidation;
        }

        return { isValid: true };
    }

    /**
     * Lưu voucher vào localStorage
     */
    saveVoucherToStorage(voucher: VoucherInfo): void {
        try {
            localStorage.setItem('checkoutVoucher', JSON.stringify(voucher));
        } catch (error) {
            console.error('Lỗi lưu voucher vào localStorage:', error);
        }
    }

    /**
     * Lấy voucher từ localStorage
     */
    getVoucherFromStorage(): VoucherInfo | null {
        try {
            const voucherStr = localStorage.getItem('checkoutVoucher');
            return voucherStr ? JSON.parse(voucherStr) : null;
        } catch (error) {
            console.error('Lỗi đọc voucher từ localStorage:', error);
            return null;
        }
    }

    /**
     * Xóa voucher khỏi localStorage
     */
    clearVoucherFromStorage(): void {
        try {
            localStorage.removeItem('checkoutVoucher');
        } catch (error) {
            console.error('Lỗi xóa voucher khỏi localStorage:', error);
        }
    }

    /**
     * Validate và cập nhật voucher cho checkout
     */
    async validateAndUpdateVoucher(code: string, orderValue: number): Promise<VoucherValidationResult> {
        const result = await this.validateVoucher(code, orderValue);

        if (result.valid && result.voucher) {
            const voucherInfo: VoucherInfo = {
                code: result.voucher.code,
                name: result.voucher.name,
                type: result.voucher.type,
                value: result.voucher.value,
                discountAmount: result.discountAmount || 0,
                minOrderValue: result.voucher.minOrderValue,
                maxDiscountValue: result.voucher.maxDiscountValue,
                startDate: result.voucher.startDate,
                endDate: result.voucher.endDate,
                isValid: true
            };

            // Kiểm tra lại tính hợp lệ
            const validation = this.isVoucherValid(voucherInfo);
            if (!validation.isValid) {
                voucherInfo.isValid = false;
                voucherInfo.validationMessage = validation.message;
            }

            // Lưu vào localStorage
            this.saveVoucherToStorage(voucherInfo);
        }

        return result;
    }

    /**
     * Revalidate voucher đã lưu với giá trị đơn hàng mới
     */
    async revalidateStoredVoucher(orderValue: number): Promise<VoucherInfo | null> {
        const storedVoucher = this.getVoucherFromStorage();
        if (!storedVoucher) return null;

        // Kiểm tra lại điều kiện với giá trị đơn hàng mới
        const validation = this.validateVoucherComprehensive(storedVoucher, orderValue);

        if (!validation.isValid) {
            // Cập nhật trạng thái không hợp lệ
            const updatedVoucher = {
                ...storedVoucher,
                isValid: false,
                validationMessage: validation.message
            };
            this.saveVoucherToStorage(updatedVoucher);
            return updatedVoucher;
        }

        // Tính lại discount amount với giá trị đơn hàng mới
        const newDiscountAmount = this.calculateDiscount(storedVoucher, orderValue);
        const updatedVoucher = {
            ...storedVoucher,
            discountAmount: newDiscountAmount,
            isValid: true,
            validationMessage: undefined
        };

        this.saveVoucherToStorage(updatedVoucher);
        return updatedVoucher;
    }

    /**
     * Convert Coupon object từ API thành VoucherInfo
     */
    convertCouponToVoucherInfo(coupon: any, orderValue: number): VoucherInfo {
        const discountAmount = this.calculateDiscount({
            code: coupon.code,
            name: coupon.name,
            type: coupon.type,
            value: coupon.discount || coupon.value || 0,
            discountAmount: 0,
            minOrderValue: coupon.minAmount || coupon.minOrderValue || 0,
            maxDiscountValue: coupon.maxDiscount || coupon.maxDiscountValue,
            startDate: coupon.startDate,
            endDate: coupon.endDate,
            isValid: true
        }, orderValue);

        return {
            code: coupon.code,
            name: coupon.name,
            type: coupon.type,
            value: coupon.discount || coupon.value || 0,
            discountAmount,
            minOrderValue: coupon.minAmount || coupon.minOrderValue || 0,
            maxDiscountValue: coupon.maxDiscount || coupon.maxDiscountValue,
            startDate: coupon.startDate,
            endDate: coupon.endDate,
            isValid: true
        };
    }
}

export default new VoucherService();
