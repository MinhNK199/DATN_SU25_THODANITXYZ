import { Category } from "../../interfaces/Category";

const API_URL = "http://localhost:9000/api/category";

const getAuthToken = () => {
    return localStorage.getItem("token");
}

const handleResponse = async (response: Response) => {
    if (response.ok) {
        return response.json();
    } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
    }
};

export const fetchCategories = async (): Promise<Category[]> => {
    const token = getAuthToken();
    const response = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(response);
};

export const fetchDeletedCategories = async (): Promise<Category[]> => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/deleted`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(response);
}

export const softDeleteCategory = async (id: string): Promise<void> => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/${id}/soft-delete`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
    });
    await handleResponse(response);
};

export const hardDeleteCategory = async (id: string): Promise<void> => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    await handleResponse(response);
};

export const restoreCategory = async (id: string): Promise<void> => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/${id}/restore`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
    });
    await handleResponse(response);
};

export const createCategory = async (categoryData: Omit<Category, '_id'>): Promise<Category> => {
    const token = getAuthToken();
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
    });
    return handleResponse(response);
};

export const getCategoryById = async (id: string): Promise<Category | undefined> => {
    // Note: This is inefficient. A dedicated API endpoint `GET /api/category/:id` would be better.
    const categories = await fetchCategories();
    return categories.find(category => category._id === id);
}

export const updateCategory = async (id: string, categoryData: Partial<Category>): Promise<Category> => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
    });
    return handleResponse(response);
}; 