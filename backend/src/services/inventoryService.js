import Product from "../models/Product.js";
import ProductReservation from "../models/ProductReservation.js";

/**
 * Service quản lý kho hàng - xử lý trừ và hoàn trả số lượng sản phẩm
 * Đảm bảo tính nhất quán dữ liệu và tránh trùng lặp cập nhật kho
 */
class InventoryService {
    /**
     * Trừ số lượng sản phẩm khỏi kho khi đặt hàng
     * @param {Array} orderItems - Danh sách sản phẩm trong đơn hàng
     * @param {string} orderId - ID của đơn hàng
     * @returns {Promise<Object>} Kết quả cập nhật kho
     */
    static async deductInventory(orderItems, orderId) {
        const results = {
            success: true,
            updatedProducts: [],
            errors: []
        };

        try {
            for (const item of orderItems) {
                try {
                    const { product: productId, quantity, variantId } = item;

                    // Tìm sản phẩm
                    const product = await Product.findById(productId);
                    if (!product) {
                        results.errors.push({
                            productId,
                            error: "Không tìm thấy sản phẩm"
                        });
                        continue;
                    }

                    // Xử lý trừ kho cho sản phẩm có biến thể
                    if (variantId) {
                        const variant = product.variants.find(v => v._id.toString() === variantId.toString());
                        if (!variant) {
                            results.errors.push({
                                productId,
                                variantId,
                                error: "Không tìm thấy biến thể sản phẩm"
                            });
                            continue;
                        }

                        // Kiểm tra số lượng tồn kho của biến thể
                        if (variant.stock < quantity) {
                            results.errors.push({
                                productId,
                                variantId,
                                error: `Không đủ hàng trong kho. Còn lại: ${variant.stock}, yêu cầu: ${quantity}`
                            });
                            continue;
                        }

                        // Trừ số lượng biến thể
                        variant.stock -= quantity;

                    } else {
                        // Xử lý trừ kho cho sản phẩm không có biến thể
                        if (product.stock < quantity) {
                            results.errors.push({
                                productId,
                                error: `Không đủ hàng trong kho. Còn lại: ${product.stock}, yêu cầu: ${quantity}`
                            });
                            continue;
                        }

                        // Trừ số lượng sản phẩm chính
                        product.stock -= quantity;
                    }

                    // Lưu sản phẩm đã cập nhật
                    await product.save();

                    results.updatedProducts.push({
                        productId,
                        variantId: variantId || null,
                        quantity,
                        remainingStock: variantId ?
                            product.variants.find(v => v._id.toString() === variantId.toString())?.stock :
                            product.stock
                    });

                } catch (itemError) {
                    console.error(`❌ Lỗi khi trừ kho cho sản phẩm ${item.product}:`, itemError);
                    results.errors.push({
                        productId: item.product,
                        error: itemError.message
                    });
                }
            }

            // Nếu có lỗi, đánh dấu kết quả là thất bại
            if (results.errors.length > 0) {
                results.success = false;
                console.error(`Có ${results.errors.length} lỗi khi trừ kho cho đơn hàng ${orderId}`);
            }

            return results;

        } catch (error) {
            console.error(`❌ Lỗi nghiêm trọng khi trừ kho cho đơn hàng ${orderId}:`, error);
            return {
                success: false,
                updatedProducts: [],
                errors: [{ error: error.message }]
            };
        }
    }

    /**
     * Hoàn trả số lượng sản phẩm vào kho khi hủy đơn hàng
     * @param {Array} orderItems - Danh sách sản phẩm trong đơn hàng bị hủy
     * @param {string} orderId - ID của đơn hàng
     * @param {boolean} alreadyRestored - Đánh dấu đã hoàn trả để tránh trùng lặp
     * @returns {Promise<Object>} Kết quả hoàn trả kho
     */
    static async restoreInventory(orderItems, orderId, alreadyRestored = false) {
        const results = {
            success: true,
            restoredProducts: [],
            errors: [],
            skipped: false
        };

        try {
            // Kiểm tra xem đã hoàn trả chưa để tránh trùng lặp
            if (alreadyRestored) {
                results.skipped = true;
                return results;
            }

            for (const item of orderItems) {
                try {
                    const { product: productId, quantity, variantId } = item;

                    // Tìm sản phẩm
                    const product = await Product.findById(productId);
                    if (!product) {
                        results.errors.push({
                            productId,
                            error: "Không tìm thấy sản phẩm"
                        });
                        continue;
                    }

                    // Xử lý hoàn trả kho cho sản phẩm có biến thể
                    if (variantId) {
                        const variant = product.variants.find(v => v._id.toString() === variantId.toString());
                        if (!variant) {
                            results.errors.push({
                                productId,
                                variantId,
                                error: "Không tìm thấy biến thể sản phẩm"
                            });
                            continue;
                        }

                        // Hoàn trả số lượng biến thể
                        variant.stock += quantity;

                    } else {
                        // Hoàn trả số lượng sản phẩm chính
                        product.stock += quantity;
                    }

                    // Lưu sản phẩm đã cập nhật
                    await product.save();

                    results.restoredProducts.push({
                        productId,
                        variantId: variantId || null,
                        quantity,
                        newStock: variantId ?
                            product.variants.find(v => v._id.toString() === variantId.toString())?.stock :
                            product.stock
                    });

                } catch (itemError) {
                    console.error(`❌ Lỗi khi hoàn trả kho cho sản phẩm ${item.product}:`, itemError);
                    results.errors.push({
                        productId: item.product,
                        error: itemError.message
                    });
                }
            }

            // Nếu có lỗi, đánh dấu kết quả là thất bại
            if (results.errors.length > 0) {
                results.success = false;
                console.error(`Có ${results.errors.length} lỗi khi hoàn trả kho cho đơn hàng ${orderId}`);
            }

            return results;

        } catch (error) {
            console.error(`❌ Lỗi nghiêm trọng khi hoàn trả kho cho đơn hàng ${orderId}:`, error);
            return {
                success: false,
                restoredProducts: [],
                errors: [{ error: error.message }],
                skipped: false
            };
        }
    }

    /**
     * Kiểm tra tính khả dụng của sản phẩm trước khi đặt hàng
     * @param {Array} orderItems - Danh sách sản phẩm cần kiểm tra
     * @returns {Promise<Object>} Kết quả kiểm tra
     */
    static async checkAvailability(orderItems) {
        const results = {
            available: true,
            unavailableItems: [],
            availableItems: []
        };

        try {
            for (const item of orderItems) {
                const { product: productId, quantity, variantId } = item;

                const product = await Product.findById(productId);
                if (!product) {
                    results.unavailableItems.push({
                        productId,
                        error: "Không tìm thấy sản phẩm"
                    });
                    continue;
                }

                let availableStock = 0;
                let itemType = "product";

                if (variantId) {
                    const variant = product.variants.find(v => v._id.toString() === variantId.toString());
                    if (!variant) {
                        results.unavailableItems.push({
                            productId,
                            variantId,
                            error: "Không tìm thấy biến thể sản phẩm"
                        });
                        continue;
                    }
                    availableStock = variant.stock;
                    itemType = "variant";
                } else {
                    availableStock = product.stock;
                }

                if (availableStock >= quantity) {
                    results.availableItems.push({
                        productId,
                        variantId: variantId || null,
                        quantity,
                        availableStock,
                        itemType
                    });
                } else {
                    results.unavailableItems.push({
                        productId,
                        variantId: variantId || null,
                        quantity,
                        availableStock,
                        itemType,
                        error: "Không đủ hàng trong kho"
                    });
                }
            }

            results.available = results.unavailableItems.length === 0;
            return results;

        } catch (error) {
            console.error("❌ Lỗi khi kiểm tra tính khả dụng:", error);
            return {
                available: false,
                unavailableItems: [{ error: error.message }],
                availableItems: []
            };
        }
    }

    /**
     * Xóa reservation khỏi giỏ hàng sau khi đặt đơn thành công
     * @param {string} userId - ID người dùng
     * @param {Array} orderItems - Danh sách sản phẩm đã đặt
     * @returns {Promise<Object>} Kết quả xóa reservation
     */
    static async clearReservations(userId, orderItems) {
        const results = {
            success: true,
            clearedReservations: [],
            errors: []
        };

        try {
            for (const item of orderItems) {
                try {
                    const { product: productId } = item;

                    // Tìm và xóa reservation
                    const reservation = await ProductReservation.findOne({
                        product: productId,
                        user: userId,
                        isActive: true
                    });

                    if (reservation) {
                        reservation.isActive = false;
                        await reservation.save();

                        results.clearedReservations.push({
                            productId,
                            reservationId: reservation._id
                        });

                    }

                } catch (itemError) {
                    console.error(`❌ Lỗi khi xóa reservation cho sản phẩm ${item.product}:`, itemError);
                    results.errors.push({
                        productId: item.product,
                        error: itemError.message
                    });
                }
            }

            if (results.errors.length > 0) {
                results.success = false;
            }

            return results;

        } catch (error) {
            console.error(`❌ Lỗi nghiêm trọng khi xóa reservation cho user ${userId}:`, error);
            return {
                success: false,
                clearedReservations: [],
                errors: [{ error: error.message }]
            };
        }
    }
}

export default InventoryService;
