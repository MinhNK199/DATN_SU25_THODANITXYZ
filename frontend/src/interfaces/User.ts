export interface Address {
  street: string;
  city: string;
  isDefault?: boolean;
}

export type UserRole = "customer" | "staff" | "admin" | "superadmin";

export interface User {
  _id?: string; // thường từ MongoDB
  name: string;
  email: string;
  password?: string; // nếu được trả về (thường là không)
  passwordChangedAt?: string; // hoặc Date nếu bạn chuyển sang dùng Date object
  role: UserRole;
  phone?: string;
  addresses?: Address[];
  avatar?: string;
  active?: boolean;
  createdAt?: string; // vì có timestamps: true
  updatedAt?: string;
}
