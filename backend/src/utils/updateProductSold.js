import Product from '../models/Product.js';

/**
 * Cập nhật số lượng sản phẩm đã bán khi đơn hàng được giao thành công
 * @param {Array} orderItems - Danh sách sản phẩm trong đơn hàng
 */
export const updateProductSoldCount = async (orderItems) => {
  try {
    console.log('🛒 Updating product sold count for order items:', orderItems.length);
    
    for (const item of orderItems) {
      if (item.product && item.quantity) {
        console.log(`📦 Updating sold count for product ${item.product}: +${item.quantity}`);
        
        // Cập nhật sản phẩm chính
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { sold: item.quantity } },
          { new: true }
        );
        
        // Nếu có variant, cập nhật variant sold count (nếu cần)
        if (item.variantId) {
          await Product.findOneAndUpdate(
            { 
              _id: item.product,
              'variants._id': item.variantId 
            },
            { 
              $inc: { 'variants.$.sold': item.quantity } 
            },
            { new: true }
          );
        }
        
        console.log(`✅ Updated sold count for product ${item.product}: +${item.quantity}`);
      }
    }
    
    console.log('✅ Successfully updated all product sold counts');
  } catch (error) {
    console.error('❌ Error updating product sold count:', error);
    throw error;
  }
};

/**
 * Hoàn trả số lượng sản phẩm đã bán khi đơn hàng bị hủy hoặc hoàn trả
 * @param {Array} orderItems - Danh sách sản phẩm trong đơn hàng
 */
export const refundProductSoldCount = async (orderItems) => {
  try {
    console.log('🔄 Refunding product sold count for order items:', orderItems.length);
    
    for (const item of orderItems) {
      if (item.product && item.quantity) {
        console.log(`📦 Refunding sold count for product ${item.product}: -${item.quantity}`);
        
        // Hoàn trả sản phẩm chính
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { sold: -item.quantity } },
          { new: true }
        );
        
        // Nếu có variant, hoàn trả variant sold count (nếu cần)
        if (item.variantId) {
          await Product.findOneAndUpdate(
            { 
              _id: item.product,
              'variants._id': item.variantId 
            },
            { 
              $inc: { 'variants.$.sold': -item.quantity } 
            },
            { new: true }
          );
        }
        
        console.log(`✅ Refunded sold count for product ${item.product}: -${item.quantity}`);
      }
    }
    
    console.log('✅ Successfully refunded all product sold counts');
  } catch (error) {
    console.error('❌ Error refunding product sold count:', error);
    throw error;
  }
};
