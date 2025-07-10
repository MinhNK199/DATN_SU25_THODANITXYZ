import { Order } from "../../interfaces/Order";

const API_URL = "http://localhost:8000/api";

const getToken = () => {
    return localStorage.getItem('token') || '';
}

export const getOrderById = async (id: string): Promise<Order> => {
    const token = getToken();
    const res = await fetch(`${API_URL}/order/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) {
        throw new Error('Failed to fetch order');
    }
    return res.json();
};

export const updateOrderStatus = async (id: string, status: string, note: string): Promise<Order> => {
    const token = getToken();
    const res = await fetch(`${API_URL}/order/${id}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, note })
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update order status');
    }
    return res.json();
};

export const createOrder = async (orderData: any) => {
  const token = getToken();
  const res = await fetch(`${API_URL}/order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(orderData)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to create order');
  }
  return res.json();
}; 