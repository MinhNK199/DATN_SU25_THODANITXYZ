/**
 * Utility functions for handling product images
 */

export const getProductImage = (product: any, fallback: string = '/placeholder-product.png'): string => {
  try {
    // First try images array
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    
    // Then try single image
    if (product.image && typeof product.image === 'string') {
      return product.image;
    }
    
    // Return fallback
    return fallback;
  } catch (error) {
    console.error('Error getting product image:', error);
    return fallback;
  }
};

export const getProductImages = (product: any): string[] => {
  try {
    // First try images array
    if (product.images && Array.isArray(product.images)) {
      return product.images;
    }
    
    // Then try single image
    if (product.image && typeof product.image === 'string') {
      return [product.image];
    }
    
    // Return empty array
    return [];
  } catch (error) {
    console.error('Error getting product images:', error);
    return [];
  }
};

export const hasProductImages = (product: any): boolean => {
  try {
    return (
      (product.images && Array.isArray(product.images) && product.images.length > 0) ||
      (product.image && typeof product.image === 'string')
    );
  } catch (error) {
    console.error('Error checking product images:', error);
    return false;
  }
};
