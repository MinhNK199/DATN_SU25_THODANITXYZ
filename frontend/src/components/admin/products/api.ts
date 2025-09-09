import { message } from "antd";
import { Product } from "../../../interfaces/Product";
import { Brand } from "../../../interfaces/Brand";
import { Category } from "../../../interfaces/Category";




const API_URL = "http://localhost:8000/api";

const handleResponse = async (response: Response) => {
    if (response.ok) {
        return response.json();
    }
    const errorData = await response.json().catch(() => ({ message: "An unknown error occurred" }));
    message.error(errorData.message || "Something went wrong");
    return Promise.reject(errorData);
};

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};

// Product API
export const getProducts = async (sort = '-createdAt', page = 1, pageSize = 10, filters: {
    keyword?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    isActive?: boolean;
} = {}): Promise<{
    products: Product[];
    page: number;
    pages: number;
    total: number;
    stats: {
        total: number;
        minPrice: number;
        maxPrice: number;
        avgRating: number;
    };
}> => {
    const params = new URLSearchParams({
        sort: sort,
        page: page.toString(),
        pageSize: pageSize.toString(),
    });

    // Thêm các filter nếu có
    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.category) params.append('category', filters.category);
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());

    const response = await fetch(`${API_URL}/product?${params.toString()}`, { headers: getAuthHeaders() });
    const data = await handleResponse(response);

    // Lọc sản phẩm active nếu cần
    const filteredProducts = data.products.filter((p: Product) => p.isActive);

    return {
        products: filteredProducts,
        page: data.page,
        pages: data.pages,
        total: data.total,
        stats: data.stats
    };
};

export const getDeletedProducts = async (): Promise<Product[]> => {
    const response = await fetch(`${API_URL}/product/deleted`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

export const softDeleteProduct = async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/product/${id}/soft-delete`, {
        method: "PUT",
        headers: getAuthHeaders(),
    });
    await handleResponse(response);
};

export const restoreProduct = async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/product/${id}/restore`, {
        method: "PUT",
        headers: getAuthHeaders(),
    });
    await handleResponse(response);
};

export const hardDeleteProduct = async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/product/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    await handleResponse(response);
};

export const getProductById = async (id: string): Promise<Product> => {
    const response = await fetch(`${API_URL}/product/${id}`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

export const updateProduct = async (id: string, data: Partial<Product>): Promise<Product> => {
    const response = await fetch(`${API_URL}/product/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};
// Brand API (cần cho form sản phẩm)
export const getBrands = async (): Promise<Brand[]> => {
    const response = await fetch(`${API_URL}/brand`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

// Category API (cần cho form sản phẩm)
export const getCategories = async (): Promise<Category[]> => { // Thay 'any' bằng interface Category sau này
    const response = await fetch(`${API_URL}/category`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

// ✅ API CẬP NHẬT STOCK CỦA VARIANT
export const updateVariantStock = async (productId: string, variantId: string, stock: number): Promise<void> => {
    const response = await fetch(`${API_URL}/product/${productId}/variant/${variantId}/stock`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ stock })
    });
    return handleResponse(response);
}; 