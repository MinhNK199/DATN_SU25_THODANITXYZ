export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: PaginationParams;
} 