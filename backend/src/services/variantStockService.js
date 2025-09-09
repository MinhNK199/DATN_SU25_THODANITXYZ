import Product from "../models/Product.js";
import ProductReservation from "../models/ProductReservation.js";

/**
 * Service quản lý tồn kho cho biến thể sản phẩm
 * Đảm bảo hiển thị chính xác số lượng tồn kho của từng biến thể
 */
class VariantStockService {
    /**
     * Lấy số lượng tồn kho thực tế của một biến thể cụ thể
     * @param {string} productId - ID của sản phẩm
     * @param {string} variantId - ID của biến thể
     * @returns {Promise<number>} Số lượng tồn kho thực tế
     */
    static async getVariantStock(productId, variantId) {
        try {
            // Tìm sản phẩm và biến thể
            const product = await Product.findById(productId);
            if (!product) {
                console.error(`❌ Không tìm thấy sản phẩm với ID: ${productId}`);
                return 0;
            }

            // Tìm biến thể cụ thể
            const variant = product.variants.find(v => v._id.toString() === variantId.toString());
            if (!variant) {
                console.error(`❌ Không tìm thấy biến thể với ID: ${variantId} trong sản phẩm ${productId}`);
                return 0;
            }

            // Trả về stock của biến thể
            const variantStock = typeof variant.stock === 'number' ? variant.stock : 0;
            console.log(`📦 Stock của biến thể ${variantId}: ${variantStock}`);

            return variantStock;
        } catch (error) {
            console.error(`❌ Lỗi khi lấy stock của biến thể ${variantId}:`, error);
            return 0;
        }
    }

    /**
     * Lấy số lượng tồn kho có sẵn của một biến thể
     * @param {string} productId - ID của sản phẩm
     * @param {string} variantId - ID của biến thể
     * @param {string} userId - ID của user (không sử dụng trong trường hợp này)
     * @returns {Promise<number>} Số lượng tồn kho có sẵn
     */
    static async getAvailableVariantStock(productId, variantId, userId = null) {
        try {
            // ✅ ĐỐI VỚI VARIANT, CHÚNG TA CHỈ CẦN TRẢ VỀ STOCK THỰC TẾ CỦA VARIANT
            // Vì mỗi variant có stock riêng biệt và không bị ảnh hưởng bởi reservation của product
            const variantStock = await this.getVariantStock(productId, variantId);

            console.log(`📦 Stock có sẵn của biến thể ${variantId}: ${variantStock} (variant stock)`);

            return variantStock;
        } catch (error) {
            console.error(`❌ Lỗi khi tính stock có sẵn của biến thể ${variantId}:`, error);
            return 0;
        }
    }

    /**
     * Kiểm tra xem có thể thêm số lượng vào giỏ hàng không
     * @param {string} productId - ID của sản phẩm
     * @param {string} variantId - ID của biến thể
     * @param {number} quantity - Số lượng muốn thêm
     * @param {string} userId - ID của user
     * @returns {Promise<Object>} Kết quả kiểm tra
     */
    static async canAddToCart(productId, variantId, quantity, userId) {
        try {
            // ✅ SỬ DỤNG STOCK THỰC TẾ CỦA VARIANT
            const variantStock = await this.getVariantStock(productId, variantId);

            return {
                canAdd: variantStock >= quantity,
                availableStock: variantStock,
                requestedQuantity: quantity,
                message: variantStock >= quantity
                    ? `Có thể thêm ${quantity} sản phẩm vào giỏ hàng`
                    : `Chỉ còn ${variantStock} sản phẩm trong kho, không thể thêm ${quantity} sản phẩm`
            };
        } catch (error) {
            console.error(`❌ Lỗi khi kiểm tra khả năng thêm vào giỏ hàng:`, error);
            return {
                canAdd: false,
                availableStock: 0,
                requestedQuantity: quantity,
                message: 'Có lỗi xảy ra khi kiểm tra tồn kho'
            };
        }
    }

    /**
     * Kiểm tra xem có thể cập nhật số lượng trong giỏ hàng không
     * @param {string} productId - ID của sản phẩm
     * @param {string} variantId - ID của biến thể
     * @param {number} newQuantity - Số lượng mới
     * @param {string} userId - ID của user
     * @returns {Promise<Object>} Kết quả kiểm tra
     */
    static async canUpdateQuantity(productId, variantId, newQuantity, userId) {
        try {
            // ✅ SỬ DỤNG STOCK THỰC TẾ CỦA VARIANT
            const variantStock = await this.getVariantStock(productId, variantId);

            return {
                canUpdate: variantStock >= newQuantity,
                availableStock: variantStock,
                requestedQuantity: newQuantity,
                message: variantStock >= newQuantity
                    ? `Có thể cập nhật thành ${newQuantity} sản phẩm`
                    : `Chỉ còn ${variantStock} sản phẩm trong kho, không thể cập nhật thành ${newQuantity} sản phẩm`
            };
        } catch (error) {
            console.error(`❌ Lỗi khi kiểm tra khả năng cập nhật số lượng:`, error);
            return {
                canUpdate: false,
                availableStock: 0,
                requestedQuantity: newQuantity,
                message: 'Có lỗi xảy ra khi kiểm tra tồn kho'
            };
        }
    }

    /**
     * Lấy thông tin chi tiết về tồn kho của tất cả biến thể trong giỏ hàng
     * @param {Array} cartItems - Danh sách items trong giỏ hàng
     * @param {string} userId - ID của user
     * @returns {Promise<Array>} Danh sách thông tin stock cho từng item
     */
    static async getCartItemsStockInfo(cartItems, userId) {
        try {
            const stockInfo = [];

            for (const item of cartItems) {
                if (item.variantId) {
                    // Xử lý sản phẩm có biến thể
                    const variantStock = await this.getVariantStock(item.product._id, item.variantId);
                    const availableStock = await this.getAvailableVariantStock(item.product._id, item.variantId, userId);

                    stockInfo.push({
                        itemId: item._id,
                        productId: item.product._id,
                        variantId: item.variantId,
                        variantStock: variantStock,
                        availableStock: availableStock,
                        currentQuantity: item.quantity,
                        isOverStock: item.quantity > availableStock
                    });
                } else {
                    // Xử lý sản phẩm không có biến thể
                    const productStock = item.product.stock || 0;
                    const reservedQuantity = await ProductReservation.getReservedQuantity(item.product._id);
                    const availableStock = Math.max(0, productStock - reservedQuantity);

                    stockInfo.push({
                        itemId: item._id,
                        productId: item.product._id,
                        variantId: null,
                        variantStock: productStock,
                        availableStock: availableStock,
                        currentQuantity: item.quantity,
                        isOverStock: item.quantity > availableStock
                    });
                }
            }

            return stockInfo;
        } catch (error) {
            console.error(`❌ Lỗi khi lấy thông tin stock cho giỏ hàng:`, error);
            return [];
        }
    }

    /**
     * Cập nhật số lượng trong giỏ hàng dựa trên stock có sẵn
     * @param {Array} cartItems - Danh sách items trong giỏ hàng
     * @param {string} userId - ID của user
     * @returns {Promise<Array>} Danh sách items đã được cập nhật
     */
    static async adjustCartItemsToStock(cartItems, userId) {
        try {
            const adjustedItems = [];

            for (const item of cartItems) {
                let availableStock = 0;

                if (item.variantId) {
                    // Xử lý sản phẩm có biến thể
                    availableStock = await this.getAvailableVariantStock(item.product._id, item.variantId, userId);
                } else {
                    // Xử lý sản phẩm không có biến thể
                    const productStock = item.product.stock || 0;
                    const reservedQuantity = await ProductReservation.getReservedQuantity(item.product._id);
                    availableStock = Math.max(0, productStock - reservedQuantity);
                }

                // Điều chỉnh số lượng nếu vượt quá stock
                const adjustedQuantity = Math.min(item.quantity, availableStock);

                adjustedItems.push({
                    ...item,
                    quantity: adjustedQuantity,
                    originalQuantity: item.quantity,
                    wasAdjusted: item.quantity > availableStock,
                    availableStock: availableStock
                });
            }

            return adjustedItems;
        } catch (error) {
            console.error(`❌ Lỗi khi điều chỉnh giỏ hàng theo stock:`, error);
            return cartItems;
        }
    }
}

export default VariantStockService;
