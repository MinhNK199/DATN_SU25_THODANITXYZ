export interface Product {
  _id?: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  brand: string;    
  stock: number;
  specifications?: Record<string, string>;
  features?: string[];
  averageRating?: number;
  numReviews?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}