import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Hàm lấy token
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};
export interface WishlistItem {
  _id: string;
  name: string;
  price: number;
  images: string[];             // Danh sách ảnh
  category: string | null;      // Có thể là null
  brand: string | null;         // Có thể là null
  stock: number;
  averageRating: number;
  numReviews: number;
  isActive: boolean;
}
const wishlistApi = {
  addToWishlist: (productId: string) =>
    api.post(`/product/${productId}/favorite`, {}, getAuthHeader()),

  removeFromWishlist: (productId: string) =>
    api.delete(`/product/${productId}/favorite`, getAuthHeader()),

  checkFavorite: (productId: string) =>
    api.get(`/product/${productId}/favorite`, getAuthHeader()),

  getFavorites: () =>
    api.get(`/product/favorites`, getAuthHeader()),
};

export default wishlistApi;
