import cron from 'node-cron';
import Order from '../models/Order.js';

// Hàm tự động hoàn thành đơn hàng sau 7 ngày giao hàng thành công
export const autoCompleteOrders = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Tìm các đơn hàng đã giao thành công từ 7 ngày trước và chưa có yêu cầu hoàn tiền
    const ordersToComplete = await Order.find({
      status: 'delivered_success',
      deliveredAt: { $lte: sevenDaysAgo },
      // Không có yêu cầu hoàn tiền gần đây
      statusHistory: {
        $not: {
          $elemMatch: {
            status: 'refund_requested',
            date: { $gte: sevenDaysAgo }
          }
        }
      }
    });

    console.log(`🔍 Tìm thấy ${ordersToComplete.length} đơn hàng cần tự động hoàn thành`);

    for (const order of ordersToComplete) {
      try {
        // Cập nhật trạng thái thành completed
        order.status = 'completed';
        order.statusHistory.push({
          status: 'completed',
          note: 'Tự động hoàn thành sau 7 ngày giao hàng thành công',
          date: Date.now(),
        });

        await order.save();

        console.log(`✅ Đã tự động hoàn thành đơn hàng #${order._id}`);

        // Gửi thông báo cho khách hàng (nếu có)
        try {
          const { createNotificationForUser } = await import('./mailer.js');
          await createNotificationForUser(
            order.user,
            "Đơn hàng hoàn thành tự động",
            `Đơn hàng #${order._id} đã được tự động hoàn thành sau 7 ngày giao hàng thành công. Cảm ơn bạn đã mua sắm tại cửa hàng chúng tôi!`,
            "order",
            `/profile?tab=orders`,
            { orderId: order._id }
          );
        } catch (notificationError) {
          console.error(`❌ Lỗi gửi thông báo cho đơn hàng ${order._id}:`, notificationError);
        }

      } catch (orderError) {
        console.error(`❌ Lỗi cập nhật đơn hàng ${order._id}:`, orderError);
      }
    }

    console.log(`✅ Hoàn thành xử lý tự động ${ordersToComplete.length} đơn hàng`);

  } catch (error) {
    console.error('❌ Lỗi trong quá trình tự động hoàn thành đơn hàng:', error);
  }
};

// Khởi tạo cron job chạy mỗi ngày lúc 2:00 sáng
export const initAutoCompleteCron = () => {
  cron.schedule('0 2 * * *', async () => {
    console.log('🕐 Bắt đầu chạy cron job tự động hoàn thành đơn hàng...');
    await autoCompleteOrders();
  }, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh"
  });

  console.log('✅ Đã khởi tạo cron job tự động hoàn thành đơn hàng (chạy mỗi ngày lúc 2:00 sáng)');
};

// Hàm test (có thể gọi thủ công)
export const testAutoComplete = async () => {
  console.log('🧪 Bắt đầu test tự động hoàn thành đơn hàng...');
  await autoCompleteOrders();
};
