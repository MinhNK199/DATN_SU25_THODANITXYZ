import { handleApiResponse } from '../utils/errorHandler';

const API_URL = "http://localhost:8000/api/settings";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};

export interface SettingsData {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    adminEmail: string;
    currency: string;
    timezone: string;
    language: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    maxUploadSize: number;
    cacheEnabled: boolean;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    socialFacebook: string;
    socialTwitter: string;
    socialInstagram: string;
    socialYoutube: string;
    socialLinkedin: string;
    contactPhone: string;
    contactAddress: string;
    contactEmail: string;
}

// Lấy cài đặt
export const getSettings = async (): Promise<SettingsData> => {
    const response = await fetch(API_URL, {
        headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
};

// Cập nhật cài đặt
export const updateSettings = async (settings: SettingsData): Promise<{ message: string; settings: SettingsData }> => {
    const response = await fetch(API_URL, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings),
    });
    return handleApiResponse(response);
};

// Reset cài đặt về mặc định
export const resetSettings = async (): Promise<{ message: string; settings: SettingsData }> => {
    const response = await fetch(`${API_URL}/reset`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
};
