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

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 calculateDisplayPrice debug:', {
      productName: item.product.name,
      variantId: item.variantId,
      hasVariantInfo: !!variant,
      variantPrice: variant?.price,
      variantSalePrice: variant?.salePrice,
      productPrice: item.product.price,
      productSalePrice: item.product.salePrice
    });
  }

  // Nếu có biến thể, LUÔN ưu tiên giá của biến thể
  if (variant && variant.price && variant.price > 0) {
    // Nếu biến thể có giá sale và giá sale thấp hơn giá gốc, dùng giá sale
    if (variant.salePrice && variant.salePrice > 0 && variant.salePrice < variant.price) {
      console.log('✅ Using variant sale price:', variant.salePrice);
      return variant.salePrice;
    }
    // Nếu không có giá sale hoặc giá sale không hợp lệ, dùng giá gốc của biến thể
    console.log('✅ Using variant price:', variant.price);
    return variant.price;
  }

  // Nếu không có biến thể hoặc biến thể không có giá, dùng giá sản phẩm
  if (item.product.salePrice && item.product.salePrice > 0 && item.product.salePrice < item.product.price) {
    console.log('⚠️ Using product sale price:', item.product.salePrice);
    return item.product.salePrice;
  }

  console.log('⚠️ Using product price:', item.product.price);
  return item.product.price;
};

/**
 * Tính toán giá gốc để so sánh (không bao gồm giá khuyến mãi)
 */
export const calculateOriginalPrice = (item: CartItem): number => {
  const variant = item.variantInfo;
  // Ưu tiên giá gốc của biến thể, nếu không có thì dùng giá gốc của sản phẩm
  return variant?.price || item.product.price;
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
