import Product from '../models/Product.js';
import Order from '../models/Order.js';

/**
 * Tính toán lại số lượng sản phẩm đã bán dựa trên các đơn hàng thành công trong database
 * @param {string} productId - ID sản phẩm cần tính (optional, nếu không có sẽ tính tất cả)
 */
export const calculateProductSoldCount = async (productId = null) => {
  try {
    console.log('🛒 Calculating product sold count from successful orders...');
    
    // Tìm tất cả đơn hàng đã hoàn thành (completed)
    const successfulOrders = await Order.find({
      status: 'completed'
    }).populate('orderItems.product');
    
    console.log(`📊 Found ${successfulOrders.length} successful orders`);
    
    // Tạo map để đếm số lượng đã bán cho từng sản phẩm
    const soldCountMap = new Map();
    
    // Duyệt qua tất cả đơn hàng thành công
    for (const order of successfulOrders) {
      for (const item of order.orderItems) {
        if (item.product && item.quantity) {
          const productId = item.product._id || item.product;
          const currentSold = soldCountMap.get(productId) || 0;
          soldCountMap.set(productId, currentSold + item.quantity);
        }
      }
    }
    
    console.log(`📦 Found ${soldCountMap.size} products with sales`);
    
    // Cập nhật số lượng đã bán cho từng sản phẩm
    const updatePromises = [];
    
    if (productId) {
      // Chỉ cập nhật sản phẩm cụ thể
      const soldCount = soldCountMap.get(productId) || 0;
      updatePromises.push(
        Product.findByIdAndUpdate(
          productId,
          { sold: soldCount },
          { new: true }
        )
      );
      console.log(`✅ Updated sold count for product ${productId}: ${soldCount}`);
    } else {
      // Cập nhật tất cả sản phẩm
      for (const [pid, soldCount] of soldCountMap) {
        updatePromises.push(
          Product.findByIdAndUpdate(
            pid,
            { sold: soldCount },
            { new: true }
          )
        );
        console.log(`✅ Updated sold count for product ${pid}: ${soldCount}`);
      }
      
      // Reset sold count về 0 cho các sản phẩm không có đơn hàng thành công
      const allProducts = await Product.find({});
      for (const product of allProducts) {
        if (!soldCountMap.has(product._id.toString())) {
          updatePromises.push(
            Product.findByIdAndUpdate(
              product._id,
              { sold: 0 },
              { new: true }
            )
          );
          console.log(`🔄 Reset sold count for product ${product._id}: 0`);
        }
      }
    }
    
    await Promise.all(updatePromises);
    
    console.log('✅ Successfully calculated and updated all product sold counts');
    return {
      success: true,
      totalProducts: soldCountMap.size,
      totalOrders: successfulOrders.length
    };
    
  } catch (error) {
    console.error('❌ Error calculating product sold count:', error);
    throw error;
  }
};

/**
 * Tính toán số lượng đã bán cho một sản phẩm cụ thể
 * @param {string} productId - ID sản phẩm
 */
export const calculateSingleProductSold = async (productId) => {
  try {
    console.log(`🛒 Calculating sold count for product: ${productId}`);
    
    const successfulOrders = await Order.find({
      status: 'completed',
      'orderItems.product': productId
    });
    
    let totalSold = 0;
    
    for (const order of successfulOrders) {
      for (const item of order.orderItems) {
        if (item.product && (item.product._id || item.product).toString() === productId.toString()) {
          totalSold += item.quantity;
        }
      }
    }
    
    await Product.findByIdAndUpdate(
      productId,
      { sold: totalSold },
      { new: true }
    );
    
    console.log(`✅ Product ${productId} sold count: ${totalSold}`);
    return totalSold;
    
  } catch (error) {
    console.error('❌ Error calculating single product sold count:', error);
    throw error;
  }
};
