import { IBrand } from './Brand';
import { ICategory } from './Category';

// Giao diện cho một biến thể sản phẩm
export interface ProductVariant {
    _id?: string;
    name: string;
    sku?: string;
    price: number;
    salePrice?: number;
    stock: number;
    color?: string;
    size?: string;
    weight?: number;
    images?: string[];
    isActive?: boolean;
}

// Giao diện cho kích thước sản phẩm
export interface ProductDimensions {
    length: number;
    width: number;
    height: number;
}

// Giao diện chính cho sản phẩm
export interface Product {
    _id: string;
    name: string;
    slug?: string;
    description: string;
    price: number;
    salePrice?: number;
    images: string[];
    category: ICategory | string; // Có thể là object Category đầy đủ hoặc chỉ là ID
    brand: IBrand | string;       // Có thể là object Brand đầy đủ hoặc chỉ là ID
    stock: number;
    variants: ProductVariant[];
    specifications?: Record<string, string>; // Sử dụng Record cho kiểu dữ liệu Map
    features?: string[];
    averageRating?: number;
    numReviews?: number;
    isActive: boolean;
    isFeatured?: boolean;
    tags?: string[];
    sku?: string;
    weight?: number;
    dimensions?: ProductDimensions;
    warranty?: number; // Bảo hành (tính theo tháng)
    createdAt?: string;
    updatedAt?: string;
}

