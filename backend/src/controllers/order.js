import Order from "../models/Order.js";
import Notification from "../models/Notification.js";
import { sendMail } from "../utils/mailer.js";
import User from "../models/User.js";

const paidMethods = [
  "credit-card",
  "momo",
  "zalopay",
  "vnpay",
  "BANKING",
  "paid_online",
];

// Tạo đơn hàng mới
export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res
        .status(400)
        .json({ message: "Không có sản phẩm trong đơn hàng" });
    }

    // ✅ SỬA LOGIC: Luôn tạo đơn hàng draft cho tất cả các phương thức thanh toán online
    const isOnlinePayment = [
      "zalopay",
      "momo",
      "vnpay",
      "credit-card",
      "e-wallet",
    ].includes(paymentMethod);

    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      // ✅ CHỈ COD mới pending ngay, các phương thức khác đều draft
      status: paymentMethod === "COD" ? "pending" : "draft",
      isPaid: false,
      paidAt: undefined,
      paymentStatus: paymentMethod === "COD" ? "pending" : "awaiting_payment",
      statusHistory: [
        {
          status: paymentMethod === "COD" ? "pending" : "draft",
          note:
            paymentMethod === "COD"
              ? "Đơn hàng COD đã được tạo - Chờ xác nhận từ admin"
              : `Đơn hàng ${paymentMethod} đã được tạo - Chờ thanh toán online`,
          date: Date.now(),
        },
      ],
    });

    console.log(
      "Created order with status:",
      order.status,
      "paymentMethod:",
      paymentMethod
    );

    const createdOrder = await order.save();

    // Chỉ xóa sản phẩm khỏi giỏ hàng nếu là COD
    if (paymentMethod === "COD") {
      try {
        const Cart = (await import("../models/Cart.js")).default;
        const cart = await Cart.findOne({ user: req.user._id });

        if (cart && cart.items.length > 0) {
          const orderedProductIds = orderItems.map((item) => item.product);
          cart.items = cart.items.filter(
            (item) => !orderedProductIds.includes(item.product.toString())
          );
          await cart.save();
          console.log(`✅ Đã xóa sản phẩm khỏi giỏ hàng cho đơn COD`);
        }
      } catch (cartError) {
        console.error("Lỗi khi cập nhật giỏ hàng:", cartError);
      }
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    res.status(400).json({ message: error.message });
  }
};

// Thêm hàm xác nhận đơn hàng sau khi thanh toán online thành công
export const confirmOrderAfterPayment = async (orderId, paymentInfo) => {
  try {
    console.log(`🔄 confirmOrderAfterPayment called for order: ${orderId}`);
    
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    console.log(`📦 Order before update: status=${order.status}, isPaid=${order.isPaid}, paymentStatus=${order.paymentStatus}`);

    // ✅ CẬP NHẬT TRẠNG THÁI THÀNH CÔNG
    order.status = 'pending'; // Chờ xác nhận từ admin
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentStatus = 'paid'; // Đã thanh toán thành công
    order.paymentResult = paymentInfo;
    
    // Thêm vào lịch sử trạng thái
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: 'pending',
      note: `Thanh toán ${paymentInfo.method.toUpperCase()} thành công - Đơn hàng chờ xác nhận từ admin`,
      date: Date.now()
    });
    
    // Thêm vào lịch sử payment
    order.statusHistory.push({
      status: 'payment_success',
      note: `Thanh toán ${paymentInfo.method.toUpperCase()} thành công - Số tiền: ${paymentInfo.amount || 'N/A'}`,
      date: Date.now()
    });

    await order.save();
    console.log(`✅ Order after update: status=${order.status}, isPaid=${order.isPaid}, paymentStatus=${order.paymentStatus}`);
    console.log(`✅ Đơn hàng giờ sẽ hiển thị trong profile và admin panel`);
    console.log(`✅ Payment method: ${order.paymentMethod}, Total: ${order.totalPrice}`);

    // ✅ XÓA SẢN PHẨM KHỎI GIỎ HÀNG KHI THANH TOÁN THÀNH CÔNG
    try {
      const Cart = (await import("../models/Cart.js")).default;
      const cart = await Cart.findOne({ user: order.user });
      
      if (cart && cart.items.length > 0) {
        const orderedProductIds = order.orderItems.map(item => item.product.toString());
        const originalItemCount = cart.items.length;
        
        cart.items = cart.items.filter(item => 
          !orderedProductIds.includes(item.product.toString())
        );
        
        await cart.save();
        console.log(`🛒 Đã xóa ${originalItemCount - cart.items.length} sản phẩm khỏi giỏ hàng sau thanh toán thành công`);
      }
    } catch (cartError) {
      console.error("Lỗi khi cập nhật giỏ hàng:", cartError);
    }

    return order;
  } catch (error) {
    console.error("❌ Lỗi xác nhận đơn hàng:", error);
    throw error;
  }
};
// Thêm hàm xử lý thanh toán thất bại
export const handlePaymentFailed = async (orderId, reason = "Thanh toán thất bại") => {
  try {
    console.log(`❌ handlePaymentFailed called for order: ${orderId}`);
    
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    // ✅ XÓA ĐƠN HÀNG THAY VÌ CẬP NHẬT TRẠNG THÁI
    await Order.findByIdAndDelete(orderId);
    console.log(`🗑️ Đã xóa đơn hàng thanh toán thất bại: ${orderId} - ${reason}`);
    console.log(`✅ Đơn hàng không hiển thị trong profile hay admin panel`);
    
    return { deleted: true, reason };
  } catch (error) {
    console.error("Lỗi xử lý thanh toán thất bại:", error);
    throw error;
  }
};

// Lấy đơn hàng theo id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    
    // Sử dụng helper để có thông tin trạng thái rõ ràng hơn
    const { getOrderStatusMessage } = await import('../utils/orderStatusHelper.js');
    const statusInfo = getOrderStatusMessage(order);
    
    const orderWithStatus = {
      ...order.toObject(),
      statusInfo
    };
    
    res.json(orderWithStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật trạng thái đã thanh toán
export const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer?.email_address,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// API cập nhật trạng thái thanh toán cho đơn hàng COD
export const updateOrderToPaidCOD = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    if (order.paymentMethod !== "COD") {
      return res
        .status(400)
        .json({ message: "Chỉ cập nhật thanh toán cho đơn hàng COD" });
    }
    if (order.isPaid) {
      return res
        .status(400)
        .json({ message: "Đơn hàng đã được thanh toán trước đó" });
    }
    order.isPaid = true;
    order.paidAt = Date.now();
    order.statusHistory.push({
      status: "paid_cod",
      note: "Đã thanh toán COD",
      date: Date.now(),
    });
    await order.save();
    res.json({
      message: "Cập nhật trạng thái thanh toán COD thành công",
      order,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật trạng thái đã giao hàng
export const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = "delivered";

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy đơn hàng của user hiện tại - CHỈ HIỂN THỊ ĐƠN HÀNG ĐÃ CONFIRM
// SỬA HÀM getMyOrders - LOGIC FILTER CHÍNH XÁC:

export const getMyOrders = async (req, res) => {
  try {
    console.log(`🔍 getMyOrders called for user: ${req.user._id}`);
    
    // ✅ LOGIC CẢI THIỆN: Hiển thị tất cả đơn hàng TRỪ payment_failed (bao gồm cả draft đã thanh toán)
    const orders = await Order.find({
      user: req.user._id,
      status: { $ne: 'payment_failed' } // Chỉ loại trừ payment_failed
    }).sort({ createdAt: -1 });

    console.log(`📋 Found ${orders.length} orders for user ${req.user._id}`);
    
    // Sử dụng helper để có thông tin trạng thái rõ ràng hơn
    const { getOrderStatusMessage } = await import('../utils/orderStatusHelper.js');
    
    const ordersWithStatus = orders.map(order => {
      const orderObj = order.toObject();
      const statusInfo = getOrderStatusMessage(order);
      
      return {
        ...orderObj,
        statusInfo
      };
    });
    
    console.log(`📊 Order details:`, ordersWithStatus.map(o => ({
      id: o._id.toString().slice(-6),
      method: o.paymentMethod,
      status: o.status,
      isPaid: o.isPaid,
      paymentStatus: o.paymentStatus,
      statusInfo: o.statusInfo,
      createdAt: o.createdAt
    })));
    
    res.json(ordersWithStatus);
  } catch (error) {
    console.error("❌ Lỗi getMyOrders:", error);
    res.status(500).json({ message: error.message });
  }
};
// Lấy tất cả đơn hàng (admin) - CHỈ HIỂN THỊ ĐƠN HÀNG ĐÃ CONFIRM
export const getOrders = async (req, res) => {
  try {
    console.log(`🔍 Admin getOrders called`);
    
    const pageSize = 10;
    const page = Number(req.query.page) || 1;

    // ✅ LOGIC CẢI THIỆN: Hiển thị tất cả đơn hàng TRỪ payment_failed (bao gồm cả draft đã thanh toán)
    let filter = {
      status: { 
        $ne: 'payment_failed' // Chỉ loại trừ payment_failed
      }
    };

    // Filter theo status nếu có
    if (req.query.status && req.query.status !== "all") {
      filter.status = req.query.status;
    }

    // Search filter
    if (req.query.search) {
      filter.$or = [
        { _id: { $regex: req.query.search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    let ordersQuery = Order.find(filter)
      .populate("user", "id name email")
      .sort({ createdAt: -1 });

    const count = await Order.countDocuments(filter);
    let orders = await ordersQuery.limit(pageSize).skip(pageSize * (page - 1));

    // Hiển thị trạng thái thanh toán chính xác
    orders = orders.map((order) => {
      const orderObj = order.toObject();

             // Xử lý hiển thị payment status
       if (["zalopay", "momo", "vnpay", "credit-card", "BANKING"].includes(order.paymentMethod)) {
         if (order.isPaid && order.paymentStatus === "paid") {
           orderObj.displayPaymentStatus = `Đã thanh toán ${order.paymentMethod.toUpperCase()}`;
         } else if (order.paymentStatus === "failed") {
           orderObj.displayPaymentStatus = "Thanh toán thất bại";
         } else if (order.paymentStatus === "awaiting_payment" || order.paymentStatus === "pending") {
           orderObj.displayPaymentStatus = "Chưa thanh toán";
         } else {
           orderObj.displayPaymentStatus = "Chưa thanh toán";
         }
       } else if (order.paymentMethod === "COD") {
         orderObj.displayPaymentStatus = order.isPaid
           ? "Đã thanh toán COD"
           : "Chưa thanh toán COD";
       }

      return orderObj;
    });

    console.log(`📋 Admin found ${orders.length} orders (page ${page})`);
    console.log(`📊 Sample orders:`, orders.slice(0, 3).map(o => ({
      id: o._id.toString().slice(-6),
      method: o.paymentMethod,
      status: o.status,
      isPaid: o.isPaid,
      paymentStatus: o.paymentStatus
    })));

    res.json({
      orders,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    console.error("❌ Lỗi getOrders:", error);
    res.status(500).json({ message: error.message });
  }
};
// Hàm tạo notification cho user
async function createNotificationForUser(
  userId,
  title,
  message,
  type = "order",
  link = "",
  data = {}
) {
  await Notification.create({
    user: userId,
    title,
    message,
    type,
    link,
    data,
  });
}

// Hàm lấy danh sách trạng thái hợp lệ cho dropdown
export const getValidOrderStatusOptions = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    const validTransitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered_success", "delivered_failed"],
      delivered_success: ["completed", "returned"],
      delivered_failed: ["cancelled"],
      returned: [],
      refund_requested: ["refunded", "delivered_success"],
      completed: [],
      cancelled: [],
      refunded: [],
    };
    let options = validTransitions[order.status] || [];
    // Chỉ cho phép hoàn hàng nếu giao hàng thành công và chưa thanh toán
    if (order.status === "delivered_success" && !order.isPaid) {
      options = options.filter(
        (opt) => opt === "returned" || opt === "completed"
      );
    }
    // Chỉ cho phép yêu cầu hoàn tiền nếu trạng thái là completed và trong 3 ngày
    if (order.status === "completed") {
      // Tìm thời điểm chuyển sang completed
      const completedHistory = order.statusHistory.find(
        (s) => s.status === "completed"
      );
      if (completedHistory) {
        const now = new Date();
        const completedAt = new Date(completedHistory.date);
        const diffDays = (now - completedAt) / (1000 * 60 * 60 * 24);
        if (diffDays <= 3) {
          options.push("refund_requested");
        }
      }
    }
    res.json({ validStatus: options });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    const validTransitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered_success", "delivered_failed"],
      delivered_success: ["completed", "returned"],
      delivered_failed: ["shipped", "cancelled"],
      returned: [],
      refund_requested: ["refunded", "delivered_success"],
      completed: [],
      cancelled: [],
      refunded: [],
    };
    const currentStatus = order.status;
    if (!validTransitions.hasOwnProperty(currentStatus)) {
      return res
        .status(400)
        .json({ message: `Không thể chuyển trạng thái từ ${currentStatus}` });
    }
    if (!validTransitions[currentStatus].includes(status)) {
      // Nếu là refund_requested thì kiểm tra điều kiện đặc biệt
      if (status === "refund_requested") {
        if (order.status !== "completed") {
          return res.status(400).json({
            message: "Chỉ có thể yêu cầu hoàn tiền khi đơn hàng đã hoàn thành.",
          });
        }
        // Kiểm tra thời gian completed
        const completedHistory = order.statusHistory.find(
          (s) => s.status === "completed"
        );
        if (!completedHistory) {
          return res
            .status(400)
            .json({ message: "Không tìm thấy thời điểm hoàn thành đơn hàng." });
        }
        const now = new Date();
        const completedAt = new Date(completedHistory.date);
        const diffDays = (now - completedAt) / (1000 * 60 * 60 * 24);
        if (diffDays > 3) {
          return res.status(400).json({
            message:
              "Chỉ có thể yêu cầu hoàn tiền trong vòng 3 ngày kể từ khi đơn hàng hoàn thành.",
          });
        }
      } else {
        return res.status(400).json({
          message: `Chuyển trạng thái từ ${currentStatus} sang ${status} không hợp lệ!`,
        });
      }
    }

    // Kiểm tra điều kiện chuyển sang completed
    if (status === "completed") {
      if (order.status !== "delivered_success") {
        return res.status(400).json({
          message:
            "Chỉ có thể chuyển sang trạng thái Thành công khi đơn hàng đã giao thành công.",
        });
      }
      if (!order.isPaid) {
        return res.status(400).json({
          message:
            "Chỉ có thể chuyển sang trạng thái Thành công khi đơn hàng đã được thanh toán.",
        });
      }
    }

    // Đếm số lượt yêu cầu hoàn tiền
    const refundCount = order.statusHistory.filter(
      (s) => s.status === "refund_requested"
    ).length;
    const maxRefund = 3;
    const remain = Math.max(0, maxRefund - refundCount);

    order.status = status;
    order.statusHistory.push({
      status,
      note,
      date: Date.now(),
    });

    const updatedOrder = await order.save();
    // Gửi thông báo khi hoàn tiền thành công hoặc bị từ chối
    if (order.status === "refunded") {
      await createNotificationForUser(
        order.user,
        "Hoàn tiền thành công",
        `Yêu cầu hoàn tiền cho đơn hàng #${order._id} đã được chấp nhận và xử lý thành công.`,
        "order",
        `/profile?tab=orders`,
        { orderId: order._id }
      );
    }
    if (order.status === "delivered_success" && refundCount > 0) {
      await createNotificationForUser(
        order.user,
        "Từ chối hoàn tiền",
        `Yêu cầu hoàn tiền cho đơn hàng #${order._id} đã bị từ chối. Bạn còn ${remain} lần yêu cầu hoàn tiền.`,
        "order",
        `/profile?tab=orders`,
        { orderId: order._id, remain }
      );
    }
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Thống kê doanh thu theo ngày và tháng
export const getRevenueStats = async (req, res) => {
  try {
    // Tạm thời vô hiệu hóa logic thống kê
    res.json({ daily: [], monthly: [] });
    return;
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// API user gửi yêu cầu hoàn tiền
export const requestRefund = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    if (order.status !== "delivered_success") {
      return res.status(400).json({
        message:
          "Chỉ có thể yêu cầu hoàn tiền khi đơn hàng đã giao thành công.",
      });
    }
    if (!order.isPaid) {
      return res.status(400).json({
        message:
          "Chỉ có thể yêu cầu hoàn tiền khi đơn hàng đã được thanh toán.",
      });
    }
    const refundCount = order.statusHistory.filter(
      (s) => s.status === "refund_requested"
    ).length;
    const maxRefund = 3;
    const remain = Math.max(0, maxRefund - refundCount);
    if (refundCount > maxRefund) {
      // Tự động từ chối hoàn tiền
      order.status = "delivered_success";
      order.statusHistory.push({
        status: "delivered_success",
        note: "Tự động từ chối hoàn tiền do vượt quá số lần cho phép",
        date: Date.now(),
      });
      await order.save();
      await createNotificationForUser(
        order.user,
        "Từ chối hoàn tiền",
        `Bạn đã vượt quá số lần yêu cầu hoàn tiền cho đơn hàng #${order._id}. Mọi yêu cầu tiếp theo sẽ bị từ chối.`,
        "order",
        `/profile?tab=orders`,
        { orderId: order._id, remain: 0 }
      );
      return res.status(400).json({
        message:
          "Bạn đã vượt quá số lần yêu cầu hoàn tiền. Mọi yêu cầu tiếp theo sẽ bị từ chối.",
      });
    }
    if (order.status === "refund_requested") {
      return res
        .status(400)
        .json({ message: "Đơn hàng đã có yêu cầu hoàn tiền." });
    }
    order.status = "refund_requested";
    order.statusHistory.push({
      status: "refund_requested",
      note: req.body.reason || "",
      date: Date.now(),
    });
    await order.save();
    await createNotificationForUser(
      order.user,
      "Yêu cầu hoàn tiền",
      `Bạn đã gửi yêu cầu hoàn tiền cho đơn hàng #${order._id}. Bạn còn ${remain} lần yêu cầu hoàn tiền.`,
      "order",
      `/profile?tab=orders`,
      { orderId: order._id, remain }
    );
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
