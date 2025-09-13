import React from 'react';
import { VoucherInfo } from '../../services/voucherService';

interface VoucherDisplayProps {
    voucher: VoucherInfo;
    onRemove?: () => void;
    showRemoveButton?: boolean;
    className?: string;
}

const VoucherDisplay: React.FC<VoucherDisplayProps> = ({
    voucher,
    onRemove,
    showRemoveButton = true,
    className = ""
}) => {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const getVoucherTypeText = () => {
        if (voucher.type === 'percentage') {
            return `Giảm ${voucher.value}%${voucher.maxDiscountValue ? ` (tối đa ${formatPrice(voucher.maxDiscountValue)})` : ''}`;
        } else {
            return `Giảm ${formatPrice(voucher.value)}`;
        }
    };

    return (
        <div className={`bg-green-50 border-2 border-green-200 rounded-xl p-4 ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="text-green-800 font-semibold">{voucher.name}</span>
                        <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                            {voucher.code}
                        </span>
                    </div>
                    <div className="text-sm text-green-700 mb-1">
                        {getVoucherTypeText()}
                    </div>
                    {voucher.minOrderValue > 0 && (
                        <div className="text-xs text-green-600">
                            Đơn tối thiểu: {formatPrice(voucher.minOrderValue)}
                        </div>
                    )}
                    {!voucher.isValid && voucher.validationMessage && (
                        <div className="text-sm text-red-600 mt-1">
                            ⚠️ {voucher.validationMessage}
                        </div>
                    )}
                </div>
                <div className="text-right">
                    <div className="text-lg font-bold text-green-800">
                        -{formatPrice(voucher.discountAmount)}
                    </div>
                    {showRemoveButton && onRemove && (
                        <button
                            onClick={onRemove}
                            className="text-sm text-green-600 hover:text-green-800 underline"
                        >
                            Hủy
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoucherDisplay;