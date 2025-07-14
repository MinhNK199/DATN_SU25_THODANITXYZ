import { message } from "antd";
import { Product } from "../../../interfaces/Product";
import { Brand } from "../../../interfaces/Brand";

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
export const getProducts = async (sort = '-createdAt'): Promise<Product[]> => {
    const response = await fetch(`${API_URL}/product?sort=${encodeURIComponent(sort)}`, { headers: getAuthHeaders() });
    const data = await handleResponse(response);
    return data.products.filter((p: Product) => p.isActive);
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
export const getCategories = async (): Promise<any[]> => { // Thay 'any' bằng interface Category sau này
    const response = await fetch(`${API_URL}/category`, { headers: getAuthHeaders() });
    return handleResponse(response);
}; 