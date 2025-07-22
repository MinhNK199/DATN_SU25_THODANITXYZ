import { message } from "antd";

const API_URL = "http://localhost:8000/api";

const handleResponse = async (response: Response) => {
    if (response.ok) {
        return response.json();
    }
    const errorData = await response.json().catch(() => ({ message: "Đã xảy ra lỗi không xác định" }));
    message.error(errorData.message || "Có lỗi xảy ra");
    return Promise.reject(errorData);
};

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};

// Định nghĩa interface cho Voucher
export interface Voucher {
    code: string;
    discountType: 'percentage' | 'fixed';
    value: number;
    startDate?: string;
    endDate?: string;
    usageLimit?: number;
    usedCount?: number;
    minOrderValue?: number;
}

export interface VoucherWithProduct extends Voucher {
    product: { _id: string; name: string };
}

export interface CreateVoucherParams {
    code: string;
    discountType: 'percentage' | 'fixed';
    value: number;
    startDate?: string;
    endDate?: string;
    usageLimit?: number;
    minOrderValue?: number;
    productIds: string[];
}

export interface CheckVoucherParams {
    productId: string;
    code: string;
    orderValue: number;
}

// Tạo voucher cho sản phẩm (admin)
export const createVoucher = async (data: CreateVoucherParams) => {
    const response = await fetch(`${API_URL}/product/voucher`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

// Lấy danh sách voucher (từ tất cả sản phẩm)
export const getAllVouchers = async (): Promise<VoucherWithProduct[]> => {
    const response = await fetch(`${API_URL}/product?pageSize=1000`, { headers: getAuthHeaders() });
    const data = await handleResponse(response);
    // Gộp tất cả voucher từ các sản phẩm
    const vouchers: VoucherWithProduct[] = [];
    if (data.products) {
        data.products.forEach((p: { _id: string; name: string; vouchers?: Voucher[] }) => {
            if (Array.isArray(p.vouchers)) {
                p.vouchers.forEach((v: Voucher) => vouchers.push({ ...v, product: { _id: p._id, name: p.name } }));
            }
        });
    }
    return vouchers;
};

// Kiểm tra voucher (áp dụng khi checkout)
export const checkVoucher = async (data: CheckVoucherParams) => {
    const response = await fetch(`${API_URL}/product/check-voucher`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

// Xóa voucher khỏi sản phẩm (admin)
export const deleteVoucher = async (productId: string, code: string) => {
    // Gọi API cập nhật sản phẩm, loại bỏ voucher có code tương ứng
    const productRes = await fetch(`${API_URL}/product/${productId}`, { headers: getAuthHeaders() });
    const product = await handleResponse(productRes);
    if (!product || !Array.isArray(product.vouchers)) throw new Error("Không tìm thấy sản phẩm hoặc voucher");
    const newVouchers = (product.vouchers as Voucher[]).filter((v: Voucher) => v.code !== code);
    const response = await fetch(`${API_URL}/product/${productId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ vouchers: newVouchers }),
    });
    return handleResponse(response);
}; 