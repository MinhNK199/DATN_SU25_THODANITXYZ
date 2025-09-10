import Product from '../models/Product.js';
import ProductReservation from '../models/ProductReservation.js';
import { emitStockUpdate, emitReservationUpdate, emitCartSyncUpdate } from '../config/socket.js';

// Reserve product (đặt trước sản phẩm)
export const reserveProduct = async (req, res) => {
  try {
    const { productId, quantity, variantId } = req.body;
    const userId = req.user.id;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin sản phẩm hoặc số lượng không hợp lệ'
      });
    }

    // Tìm sản phẩm
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Kiểm tra stock availability
    let availableStock = 0;
    if (variantId) {
      const variant = product.variants?.find(v => v._id.toString() === variantId);
      if (!variant) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy biến thể sản phẩm'
        });
      }
      availableStock = variant.stock || 0;
    } else {
      availableStock = product.stock || 0;
    }

    // Lấy tổng số lượng đã được đặt trước
    const reservedQuantity = await ProductReservation.getReservedQuantity(productId);
    const actualAvailableStock = availableStock - reservedQuantity;

    if (quantity > actualAvailableStock) {
      return res.status(400).json({
        success: false,
        message: `Chỉ còn ${actualAvailableStock} sản phẩm trong kho`,
        availableStock: actualAvailableStock
      });
    }

    // Tạo reservation
    const reservation = await ProductReservation.createReservation(productId, userId, quantity);

    // Emit realtime updates
    emitReservationUpdate(productId, {
      type: 'reserved',
      quantity,
      reservedQuantity: reservedQuantity + quantity,
      availableStock: actualAvailableStock - quantity,
      userId
    });

    emitStockUpdate(productId, {
      type: 'reservation_created',
      quantity,
      availableStock: actualAvailableStock - quantity,
      reservedQuantity: reservedQuantity + quantity
    });

    res.status(200).json({
      success: true,
      message: 'Đặt trước sản phẩm thành công',
      data: {
        reservationId: reservation._id,
        productId,
        quantity,
        availableStock: actualAvailableStock - quantity,
        reservedQuantity: reservedQuantity + quantity,
        expiresAt: reservation.expiresAt
      }
    });

  } catch (error) {
    console.error('Error reserving product:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đặt trước sản phẩm'
    });
  }
};

// Release reservation (hủy đặt trước)
export const releaseReservation = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin sản phẩm hoặc số lượng không hợp lệ'
      });
    }

    // Tìm reservation của user cho sản phẩm này
    const reservation = await ProductReservation.findOne({
      product: productId,
      user: userId,
      isActive: true
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đặt trước cho sản phẩm này'
      });
    }

    // Cập nhật hoặc xóa reservation
    if (reservation.quantity <= quantity) {
      // Xóa hoàn toàn reservation
      reservation.isActive = false;
      await reservation.save();
    } else {
      // Giảm số lượng reservation
      reservation.quantity -= quantity;
      await reservation.save();
    }

    // Lấy thông tin cập nhật
    const updatedReservedQuantity = await ProductReservation.getReservedQuantity(productId);
    const product = await Product.findById(productId);
    const availableStock = product.stock - updatedReservedQuantity;

    // Emit realtime updates
    emitReservationUpdate(productId, {
      type: 'released',
      quantity,
      reservedQuantity: updatedReservedQuantity,
      availableStock,
      userId
    });

    emitStockUpdate(productId, {
      type: 'reservation_released',
      quantity,
      availableStock,
      reservedQuantity: updatedReservedQuantity
    });

    res.status(200).json({
      success: true,
      message: 'Hủy đặt trước thành công',
      data: {
        productId,
        releasedQuantity: quantity,
        availableStock,
        reservedQuantity: updatedReservedQuantity
      }
    });

  } catch (error) {
    console.error('Error releasing reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi hủy đặt trước'
    });
  }
};

// Check stock availability
export const checkStock = async (req, res) => {
  try {
    const { items } = req.body; // Array of {productId, quantity, variantId}

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin sản phẩm cần kiểm tra'
      });
    }

    const stockCheckResults = [];

    for (const item of items) {
      const { productId, quantity, variantId } = item;

      // Tìm sản phẩm
      const product = await Product.findById(productId);
      if (!product) {
        stockCheckResults.push({
          productId,
          available: false,
          message: 'Không tìm thấy sản phẩm'
        });
        continue;
      }

      // Kiểm tra stock
      let availableStock = 0;
      if (variantId) {
        const variant = product.variants?.find(v => v._id.toString() === variantId);
        if (!variant) {
          stockCheckResults.push({
            productId,
            variantId,
            available: false,
            message: 'Không tìm thấy biến thể sản phẩm'
          });
          continue;
        }
        availableStock = variant.stock || 0;
      } else {
        availableStock = product.stock || 0;
      }

      // Lấy tổng số lượng đã được đặt trước
      const reservedQuantity = await ProductReservation.getReservedQuantity(productId);
      const actualAvailableStock = availableStock - reservedQuantity;

      stockCheckResults.push({
        productId,
        variantId,
        available: quantity <= actualAvailableStock,
        availableStock: actualAvailableStock,
        reservedQuantity,
        requestedQuantity: quantity
      });
    }

    const allAvailable = stockCheckResults.every(result => result.available);

    res.status(200).json({
      success: true,
      allAvailable,
      results: stockCheckResults
    });

  } catch (error) {
    console.error('Error checking stock:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi kiểm tra tồn kho'
    });
  }
};

// Get user's active reservations
export const getUserReservations = async (req, res) => {
  try {
    const userId = req.user.id;

    const reservations = await ProductReservation.find({
      user: userId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    })
    .populate('product', 'name price images')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reservations
    });

  } catch (error) {
    console.error('Error getting user reservations:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách đặt trước'
    });
  }
};

// Cleanup expired reservations (admin only)
export const cleanupExpiredReservations = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có quyền thực hiện chức năng này'
      });
    }

    const expiredReservations = await ProductReservation.cleanupExpiredReservations();

    res.status(200).json({
      success: true,
      message: `Đã dọn dẹp ${expiredReservations.length} đặt trước hết hạn`,
      data: {
        cleanedCount: expiredReservations.length,
        reservations: expiredReservations
      }
    });

  } catch (error) {
    console.error('Error cleaning up expired reservations:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi dọn dẹp đặt trước hết hạn'
    });
  }
};
