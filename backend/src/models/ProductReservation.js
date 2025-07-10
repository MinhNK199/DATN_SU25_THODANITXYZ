import mongoose from "mongoose";

const productReservationSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Sản phẩm không được để trống'],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Người dùng không được để trống'],
    },
    quantity: {
        type: Number,
        required: [true, 'Số lượng không được để trống'],
        min: [1, 'Số lượng tối thiểu là 1'],
    },
    reservedAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        default: function() {
            // Hết hạn sau 3 ngày
            return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        },
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});

// Index để tối ưu query
productReservationSchema.index({ product: 1, isActive: 1 });
productReservationSchema.index({ user: 1, isActive: 1 });
productReservationSchema.index({ expiresAt: 1 });

// Static method để lấy tổng số lượng đã được đặt trước của một sản phẩm
productReservationSchema.statics.getReservedQuantity = async function(productId) {
    const result = await this.aggregate([
        {
            $match: {
                product: new mongoose.Types.ObjectId(productId),
                isActive: true,
                expiresAt: { $gt: new Date() }
            }
        },
        {
            $group: {
                _id: null,
                totalReserved: { $sum: '$quantity' }
            }
        }
    ]);
    
    return result.length > 0 ? result[0].totalReserved : 0;
};

// Static method để cleanup reservations hết hạn
productReservationSchema.statics.cleanupExpiredReservations = async function() {
    const now = new Date();
    
    // Tìm tất cả reservations hết hạn
    const expiredReservations = await this.find({
        expiresAt: { $lt: now },
        isActive: true
    });
    
    // Cập nhật trạng thái thành không active
    await this.updateMany(
        {
            expiresAt: { $lt: now },
            isActive: true
        },
        {
            isActive: false
        }
    );
    
    console.log(`Cleaned up ${expiredReservations.length} expired reservations`);
    
    return expiredReservations;
};

// Static method để tạo reservation mới
productReservationSchema.statics.createReservation = async function(productId, userId, quantity) {
    // Kiểm tra xem user đã có reservation cho sản phẩm này chưa
    const existingReservation = await this.findOne({
        product: productId,
        user: userId,
        isActive: true
    });
    
    if (existingReservation) {
        // Cập nhật số lượng và thời gian hết hạn
        existingReservation.quantity = quantity;
        existingReservation.expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        existingReservation.isActive = true;
        return await existingReservation.save();
    } else {
        // Tạo reservation mới
        return await this.create({
            product: productId,
            user: userId,
            quantity: quantity
        });
    }
};

const ProductReservation = mongoose.model("ProductReservation", productReservationSchema);
export default ProductReservation; 