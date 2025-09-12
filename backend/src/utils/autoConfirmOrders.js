import Order from '../models/Order.js';
import OrderTracking from '../models/OrderTracking.js';
import Notification from '../models/Notification.js';

// Job tự động xác nhận đơn hàng sau 7 ngày
const autoConfirmOrders = async () => {
  try {
    console.log('Bắt đầu job tự động xác nhận đơn hàng...');
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Tìm các đơn hàng cần tự động xác nhận
    const ordersToConfirm = await Order.find({
      status: 'delivered_success',
      isDelivered: true,
      autoConfirmAt: { $lte: now },
      autoConfirmAt: { $ne: null }
    }).populate('user shipper');

    console.log(`Tìm thấy ${ordersToConfirm.length} đơn hàng cần tự động xác nhận`);

    for (const order of ordersToConfirm) {
      try {
        // Cập nhật trạng thái đơn hàng
        order.status = 'completed';
        order.statusHistory.push({
          status: 'completed',
          note: 'Tự động xác nhận đơn hàng sau 7 ngày',
          date: new Date()
        });
        order.autoConfirmAt = null;

        await order.save();

        // Cập nhật order tracking
        const orderTracking = await OrderTracking.findOne({ orderId: order._id });
        if (orderTracking) {
          orderTracking.status = 'delivered';
          orderTracking.actualDeliveryTime = new Date();
          await orderTracking.save();
        }

        // Tạo thông báo cho khách hàng
        if (order.user) {
          const notification = new Notification({
            user: order.user._id,
            title: 'Đơn hàng đã được xác nhận',
            message: `Đơn hàng #${order._id} đã được tự động xác nhận hoàn thành sau 7 ngày giao hàng.`,
            type: 'order_completed',
            data: {
              orderId: order._id,
              orderNumber: order._id.toString().slice(-8)
            }
          });
          await notification.save();
        }

        console.log(`Đã tự động xác nhận đơn hàng ${order._id}`);
      } catch (error) {
        console.error(`Lỗi khi xác nhận đơn hàng ${order._id}:`, error);
      }
    }

    console.log(`Hoàn thành job tự động xác nhận đơn hàng. Đã xử lý ${ordersToConfirm.length} đơn hàng.`);
  } catch (error) {
    console.error('Lỗi trong job tự động xác nhận đơn hàng:', error);
  }
};

// Job kiểm tra và cập nhật trạng thái shipper offline
const updateOfflineShippers = async () => {
  try {
    console.log('Bắt đầu job cập nhật trạng thái shipper offline...');
    
    const { default: Shipper } = await import('../models/Shipper.js');
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    
    // Cập nhật shipper offline nếu không hoạt động trong 30 phút
    const result = await Shipper.updateMany(
      {
        isOnline: true,
        lastActiveAt: { $lt: thirtyMinutesAgo }
      },
      {
        $set: { isOnline: false }
      }
    );

    console.log(`Đã cập nhật ${result.modifiedCount} shipper thành offline`);
  } catch (error) {
    console.error('Lỗi trong job cập nhật trạng thái shipper:', error);
  }
};

// Job gửi nhắc nhở shipper về đơn hàng sắp hết hạn
const sendDeliveryReminders = async () => {
  try {
    console.log('Bắt đầu job gửi nhắc nhở giao hàng...');
    
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Tìm các đơn hàng sắp hết hạn tự động xác nhận
    const ordersNearExpiry = await Order.find({
      status: 'delivered_success',
      isDelivered: true,
      autoConfirmAt: { $lte: oneDayFromNow },
      autoConfirmAt: { $gt: now }
    }).populate('shipper user');

    for (const order of ordersNearExpiry) {
      try {
        // Tạo thông báo cho shipper
        if (order.shipper) {
          const notification = new Notification({
            user: order.shipper._id,
            title: 'Nhắc nhở giao hàng',
            message: `Đơn hàng #${order._id} sẽ được tự động xác nhận trong 24h nếu khách hàng không xác nhận.`,
            type: 'delivery_reminder',
            data: {
              orderId: order._id,
              orderNumber: order._id.toString().slice(-8)
            }
          });
          await notification.save();
        }

        // Tạo thông báo cho khách hàng
        if (order.user) {
          const notification = new Notification({
            user: order.user._id,
            title: 'Xác nhận nhận hàng',
            message: `Đơn hàng #${order._id} sẽ được tự động xác nhận trong 24h. Vui lòng xác nhận nếu bạn đã nhận được hàng.`,
            type: 'order_confirmation_reminder',
            data: {
              orderId: order._id,
              orderNumber: order._id.toString().slice(-8)
            }
          });
          await notification.save();
        }

        console.log(`Đã gửi nhắc nhở cho đơn hàng ${order._id}`);
      } catch (error) {
        console.error(`Lỗi khi gửi nhắc nhở cho đơn hàng ${order._id}:`, error);
      }
    }

    console.log(`Hoàn thành job gửi nhắc nhở. Đã xử lý ${ordersNearExpiry.length} đơn hàng.`);
  } catch (error) {
    console.error('Lỗi trong job gửi nhắc nhở giao hàng:', error);
  }
};

export {
  autoConfirmOrders,
  updateOfflineShippers,
  sendDeliveryReminders
};
