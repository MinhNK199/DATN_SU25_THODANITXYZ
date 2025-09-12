import { useState, useEffect, useCallback } from 'react';
import voucherService, { VoucherInfo, VoucherValidationResult } from '../services/voucherService';
import { useCart } from '../contexts/CartContext';

export interface UseVoucherReturn {
    voucher: VoucherInfo | null;
    isValidating: boolean;
    applyVoucher: (code: string) => Promise<VoucherValidationResult>;
    removeVoucher: () => void;
    revalidateVoucher: () => Promise<void>;
    isVoucherValid: boolean;
    validationMessage?: string;
}

export const useVoucher = (): UseVoucherReturn => {
    const [voucher, setVoucher] = useState<VoucherInfo | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const { state: cartState } = useCart();

    // Load voucher từ localStorage khi component mount
    useEffect(() => {
        const storedVoucher = voucherService.getVoucherFromStorage();
        if (storedVoucher) {
            setVoucher(storedVoucher);
        }
    }, []);

    // Revalidate voucher khi cart thay đổi
    useEffect(() => {
        if (voucher && cartState.total > 0) {
            revalidateVoucher();
        }
    }, [cartState.total, cartState.items]);

    const applyVoucher = useCallback(async (code: string): Promise<VoucherValidationResult> => {
        if (!code.trim()) {
            return { valid: false, message: 'Vui lòng nhập mã voucher' };
        }

        setIsValidating(true);
        try {
            const result = await voucherService.validateAndUpdateVoucher(code, cartState.total);

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
                const validation = voucherService.validateVoucherComprehensive(voucherInfo, cartState.total);
                if (!validation.isValid) {
                    voucherInfo.isValid = false;
                    voucherInfo.validationMessage = validation.message;
                }

                setVoucher(voucherInfo);
            } else {
                setVoucher(null);
            }

            return result;
        } catch (error) {
            console.error('Error applying voucher:', error);
            return { valid: false, message: 'Lỗi xác thực voucher' };
        } finally {
            setIsValidating(false);
        }
    }, [cartState.total]);

    const removeVoucher = useCallback(() => {
        setVoucher(null);
        voucherService.clearVoucherFromStorage();
    }, []);

    const revalidateVoucher = useCallback(async () => {
        if (!voucher) return;

        try {
            const updatedVoucher = await voucherService.revalidateStoredVoucher(cartState.total);
            if (updatedVoucher) {
                setVoucher(updatedVoucher);
            }
        } catch (error) {
            console.error('Error revalidating voucher:', error);
        }
    }, [voucher, cartState.total]);

    return {
        voucher,
        isValidating,
        applyVoucher,
        removeVoucher,
        revalidateVoucher,
        isVoucherValid: voucher?.isValid || false,
        validationMessage: voucher?.validationMessage
    };
};
