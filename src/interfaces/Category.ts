export interface Category {
  _id: string;
  name: string;
  slug?: string;
  description: string;
  image: string;
  isActive: boolean;
  parent?: Category;
  deletedAt?: Date;
  deletedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
} 