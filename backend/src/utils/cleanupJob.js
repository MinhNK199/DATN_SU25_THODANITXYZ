import Cart from "../models/Cart";
import ProductReservation from "../models/ProductReservation";
import Order from "../models/Order";

// Cleanup job chạy mỗi giờ
export const runCleanupJob = async () => {
    try {
        console.log('Starting cleanup job...');
        
        // Cleanup expired reservations
        const expiredReservations = await ProductReservation.cleanupExpiredReservations();
        
        // Cleanup old carts
        await Cart.cleanupOldCarts();
        
        // Đã bỏ logic tự động chuyển trạng thái đơn hàng sang 'returned' sau 3 ngày giao hàng thành công mà chưa thanh toán.
        console.log('Cleanup job completed successfully');
        
        return {
            expiredReservations: expiredReservations.length,
            success: true
        };
    } catch (error) {
        console.error('Cleanup job failed:', error);
        return {
            error: error.message,
            success: false
        };
    }
};

// Chạy cleanup job ngay lập tức (có thể gọi từ API)
export const runCleanupNow = async (req, res) => {
    try {
        const result = await runCleanupJob();
        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            message: 'Cleanup job failed', 
            error: error.message 
        });
    }
};

// Setup cron job (chạy mỗi giờ)
export const setupCleanupCron = () => {
    // Chạy cleanup job mỗi giờ
    setInterval(async () => {
        await runCleanupJob();
    }, 60 * 60 * 1000); // 1 giờ
    
    console.log('Cleanup cron job setup completed');
}; 