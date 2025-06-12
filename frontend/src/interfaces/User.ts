export interface Address {
  street: string;
  city: string;
  isDefault?: boolean;

  // ➕ Thêm vào các trường mã địa lý
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

  // 👉 Thêm tạm nếu bạn dùng trực tiếp trong form
  province_code?: number;
  district_code?: number;
  ward_code?: number;
  street?: string; 
}


export interface UserForm extends Partial<User> {
  province_code?: number;
  district_code?: number;
  ward_code?: number;
  street?: string; 
}

