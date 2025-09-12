/**
 * Utility functions để xử lý hiển thị và validation stock
 * Đảm bảo hiển thị chính xác số lượng tồn kho của biến thể
 */

import { CartItem } from '../services/cartApi';

/**
 * Lấy số lượng stock có sẵn từ item trong giỏ hàng
 * Ưu tiên stock của variant, sau đó mới đến availableStock
 * @param item - Item trong giỏ hàng
 * @returns Số lượng stock có sẵn
 */
export const getAvailableStock = (item: CartItem): number => {
    const variant = item.variantInfo;

    // ✅ ƯU TIÊN STOCK CỦA VARIANT (vì đây là stock thực tế của biến thể)
    if (variant?.stock !== undefined && variant.stock > 0) {
        console.log(`🔍 Using variant stock: ${variant.stock} for variant: ${variant.name}`);
        return variant.stock;
    }

    // Sau đó đến availableStock từ variantInfo
    if (variant?.availableStock !== undefined && variant.availableStock > 0) {
        console.log(`🔍 Using variant availableStock: ${variant.availableStock} for variant: ${variant.name}`);
        return variant.availableStock;
    }

    // Sau đó đến availableStock từ product
    if (item.product.availableStock !== undefined && item.product.availableStock > 0) {
        console.log(`🔍 Using product availableStock: ${item.product.availableStock} for product: ${item.product.name}`);
        return item.product.availableStock;
    }

    // Cuối cùng mới đến stock của product
    console.log(`🔍 Using product stock: ${item.product.stock} for product: ${item.product.name}`);
    return item.product.stock ?? 0;
};

/**
 * Lấy số lượng stock gốc từ item trong giỏ hàng (không trừ reservation)
 * @param item - Item trong giỏ hàng
 * @returns Số lượng stock gốc
 */
export const getOriginalStock = (item: CartItem): number => {
    const variant = item.variantInfo;

    // Ưu tiên stock từ variant
    if (variant?.stock !== undefined) {
        return variant.stock;
    }

    return item.product.stock ?? 0;
};

/**
 * Kiểm tra xem có thể cập nhật số lượng không
 * @param item - Item trong giỏ hàng
 * @param newQuantity - Số lượng mới
 * @returns Kết quả validation
 */
export const canUpdateQuantity = (item: CartItem, newQuantity: number): {
    canUpdate: boolean;
    maxStock: number;
    message?: string;
} => {
    const maxStock = getAvailableStock(item);

    if (newQuantity < 1) {
        return {
            canUpdate: false,
            maxStock,
            message: 'Số lượng phải lớn hơn 0!'
        };
    }

    if (newQuantity > maxStock) {
        return {
            canUpdate: false,
            maxStock,
            message: `Chỉ còn ${maxStock} sản phẩm trong kho!`
        };
    }

    return {
        canUpdate: true,
        maxStock
    };
};

/**
 * Tạo thông báo stock dựa trên số lượng có sẵn
 * @param availableStock - Số lượng có sẵn (đã trừ reservation)
 * @returns Thông báo stock
 */
export const getStockMessage = (availableStock: number): {
    message: string;
    className: string;
    remainingStock: number;
} => {
    // ✅ AVAILABLE STOCK ĐÃ LÀ SỐ LƯỢNG CÓ SẴN THỰC TẾ, KHÔNG CẦN TRỪ THÊM
    const remainingStock = availableStock;

    if (remainingStock <= 0) {
        return {
            message: 'Hết hàng',
            className: 'text-red-600 font-medium',
            remainingStock: 0
        };
    } else if (remainingStock <= 5) {
        return {
            message: `Chỉ còn ${remainingStock}`,
            className: 'text-orange-500 font-medium',
            remainingStock
        };
    } else {
        return {
            message: `Còn ${remainingStock} sản phẩm`,
            className: 'text-green-600 font-medium',
            remainingStock
        };
    }
};

/**
 * Tạo thông báo stock cho variant cụ thể
 * @param item - Item trong giỏ hàng
 * @returns Thông báo stock
 */
export const getVariantStockMessage = (item: CartItem): {
    message: string;
    className: string;
    remainingStock: number;
    availableStock: number;
} => {
    // ✅ FORCE SỬ DỤNG STOCK CỦA VARIANT NẾU CÓ
    let availableStock = 0;

    if (item.variantId && item.variantInfo?.stock !== undefined) {
        // Nếu có variant, sử dụng stock của variant
        availableStock = item.variantInfo.stock;
        console.log(`🔍 Force using variant stock: ${availableStock} for variant: ${item.variantInfo.name}`);
    } else {
        // Nếu không có variant, sử dụng logic cũ
        availableStock = getAvailableStock(item);
    }

    const stockMessage = getStockMessage(availableStock);

    return {
        ...stockMessage,
        availableStock
    };
};

/**
 * Validate số lượng trước khi cập nhật giỏ hàng
 * @param item - Item trong giỏ hàng
 * @param newQuantity - Số lượng mới
 * @returns Kết quả validation chi tiết
 */
export const validateQuantityUpdate = (item: CartItem, newQuantity: number): {
    isValid: boolean;
    maxStock: number;
    availableStock: number;
    originalStock: number;
    message?: string;
    warning?: string;
} => {
    const availableStock = getAvailableStock(item);
    const originalStock = getOriginalStock(item);
    const validation = canUpdateQuantity(item, newQuantity);

    let warning: string | undefined;

    // Cảnh báo nếu đạt giới hạn stock
    if (validation.canUpdate && newQuantity === availableStock) {
        warning = `Đã đạt số lượng tối đa tồn kho (${availableStock})`;
    }

    return {
        isValid: validation.canUpdate,
        maxStock: validation.maxStock,
        availableStock,
        originalStock,
        message: validation.message,
        warning
    };
};

/**
 * Format số lượng stock để hiển thị
 * @param stock - Số lượng stock
 * @returns Chuỗi hiển thị
 */
export const formatStockDisplay = (stock: number): string => {
    if (stock <= 0) {
        return 'Hết hàng';
    } else if (stock <= 5) {
        return `Chỉ còn ${stock}`;
    } else {
        return `Còn ${stock} sản phẩm`;
    }
};

/**
 * Kiểm tra xem item có bị oversold không
 * @param item - Item trong giỏ hàng
 * @returns True nếu bị oversold
 */
export const isOversold = (item: CartItem): boolean => {
    const availableStock = getAvailableStock(item);
    return item.quantity > availableStock;
};

/**
 * Lấy danh sách items bị oversold trong giỏ hàng
 * @param items - Danh sách items trong giỏ hàng
 * @returns Danh sách items bị oversold
 */
export const getOversoldItems = (items: CartItem[]): CartItem[] => {
    return items.filter(item => isOversold(item));
};
