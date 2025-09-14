// Utility functions for price calculations
export interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    salePrice?: number;
    images?: string[];
    stock: number;
    variants?: Array<{
      _id: string;
      name: string;
      price: number;
      salePrice?: number;
      stock: number;
      images?: string[];
      sku?: string;
      color?: { name?: string; code?: string };
      size?: number;
      specifications?: Record<string, string>;
    }>;
  };
  variantId?: string;
  variantInfo?: {
    _id?: string;
    name?: string;
    price?: number;
    salePrice?: number;
    stock?: number;
    images?: string[];
    sku?: string;
    color?: { name?: string; code?: string };
    size?: number;
    specifications?: Record<string, string>;
  };
  quantity: number;
  price: number; // Price from backend
}

/**
 * Tính toán giá hiển thị cho một item trong giỏ hàng
 * Ưu tiên: Variant Sale Price > Variant Price > Product Sale Price > Product Price
 */
export const calculateDisplayPrice = (item: CartItem): number => {
  const variant = item.variantInfo;

  // Nếu có biến thể, LUÔN ưu tiên giá của biến thể
  if (variant && variant.price && variant.price > 0) {
    // Nếu biến thể có giá sale và giá sale thấp hơn giá gốc, dùng giá sale
    if (variant.salePrice && variant.salePrice > 0 && variant.salePrice < variant.price) {
      return variant.salePrice;
    }
    // Nếu không có giá sale hoặc giá sale không hợp lệ, dùng giá gốc của biến thể
    return variant.price;
  }

  // Fallback: Nếu variantInfo rỗng nhưng có variantId, tìm trong product.variants
  if (!variant && item.variantId && item.product.variants) {
    const foundVariant = item.product.variants.find(v => v._id.toString() === item.variantId.toString());
    if (foundVariant && foundVariant.price && foundVariant.price > 0) {
      if (foundVariant.salePrice && foundVariant.salePrice > 0 && foundVariant.salePrice < foundVariant.price) {
        return foundVariant.salePrice;
      }
      return foundVariant.price;
    }
  }

  // Nếu không có biến thể hoặc biến thể không có giá, dùng giá sản phẩm
  if (item.product.salePrice && item.product.salePrice > 0 && item.product.salePrice < item.product.price) {
    return item.product.salePrice;
  }

  return item.product.price;
};

/**
 * Tính toán giá gốc để so sánh (không bao gồm giá khuyến mãi)
 */
export const calculateOriginalPrice = (item: CartItem): number => {
  const variant = item.variantInfo;

  // Nếu có biến thể, dùng giá gốc của biến thể
  if (variant && variant.price && variant.price > 0) {
    return variant.price;
  }

  // Nếu không có biến thể, dùng giá gốc của sản phẩm
  return item.product.price;
};

/**
 * Tính toán số tiền tiết kiệm
 */
export const calculateSavings = (item: CartItem): number => {
  const displayPrice = calculateDisplayPrice(item);
  const originalPrice = calculateOriginalPrice(item);

  if (originalPrice > displayPrice) {
    return (originalPrice - displayPrice) * item.quantity;
  }
  return 0;
};

/**
 * Tính toán tổng giá cho một item
 */
export const calculateItemTotal = (item: CartItem): number => {
  const displayPrice = calculateDisplayPrice(item);
  return displayPrice * item.quantity;
};

/**
 * Tính toán subtotal cho toàn bộ giỏ hàng
 */
export const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
};

/**
 * Tính toán tổng số tiền tiết kiệm
 */
export const calculateTotalSavings = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + calculateSavings(item), 0);
};

/**
 * Format thông tin biến thể để hiển thị (chỉ khi không có variantInfo.name)
 */
export const formatVariantInfo = (item: CartItem): string => {
  if (!item.variantInfo || item.variantInfo.name) return '';

  const variant = item.variantInfo;
  const parts: string[] = [];

  // Thêm thông tin màu sắc nếu có
  if (variant.color?.name) {
    parts.push(`Màu: ${variant.color.name}`);
  }

  // Thêm thông tin size nếu có
  if (variant.size && variant.size > 0) {
    parts.push(`Size: ${variant.size} inch`);
  }

  // Thêm các thông số khác từ specifications
  if (variant.specifications) {
    Object.entries(variant.specifications).forEach(([key, value]) => {
      if (value && value.trim()) {
        parts.push(`${key}: ${value}`);
      }
    });
  }

  return parts.join(', ');
};