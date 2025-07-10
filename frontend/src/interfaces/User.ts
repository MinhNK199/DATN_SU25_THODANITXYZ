export interface Address {
  street: string;
  city: string;
  isDefault?: boolean;
  province_code?: number;
  district_code?: number;
  ward_code?: number;
}

export type UserRole = "customer" | "staff" | "admin" | "superadmin";

export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  passwordChangedAt?: string;
  role: UserRole;
  phone?: string;
  addresses?: Address[];
  avatar?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;

  // Địa chỉ mặc định cho form
  province_code?: number;
  district_code?: number;
  ward_code?: number;
  street?: string;

  // Thêm các trường cho yêu cầu admin
  adminRequest?: boolean;
  adminRequestStatus?: "pending" | "approved" | "rejected";
  adminRequestContent?: string;
  adminRequestImage?: string;

  // Trường dùng cho danh sách đã xóa mềm (nếu có)
  deleted?: boolean;
}

export interface UserForm extends Partial<User> {
  province_code?: number;
  district_code?: number;
  ward_code?: number;
  street?: string;
}