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
    console.log(`📋 Payment info:`, paymentInfo);
    
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
    
    // ✅ CẬP NHẬT THÔNG TIN THANH TOÁN CHI TIẾT
    order.paymentResult = {
      id: paymentInfo.id || paymentInfo.transactionId || paymentInfo.transId,
      status: paymentInfo.status || 'success',
      update_time: paymentInfo.update_time || new Date().toISOString(),
      email_address: paymentInfo.email_address || '',
      method: paymentInfo.method || order.paymentMethod,
      amount: paymentInfo.amount || order.totalPrice,
      // Thêm thông tin đặc biệt cho từng phương thức
      ...(paymentInfo.cardLast4 && { cardLast4: paymentInfo.cardLast4 }),
      ...(paymentInfo.cardType && { cardType: paymentInfo.cardType }),
      ...(paymentInfo.bankCode && { bankCode: paymentInfo.bankCode }),
      ...(paymentInfo.payType && { payType: paymentInfo.payType }),
      ...(paymentInfo.orderType && { orderType: paymentInfo.orderType }),
      ...(paymentInfo.transType && { transType: paymentInfo.transType }),
      ...(paymentInfo.extraData && { extraData: paymentInfo.extraData }),
      ...(paymentInfo.app_trans_id && { app_trans_id: paymentInfo.app_trans_id }),
      ...(paymentInfo.zp_trans_id && { zp_trans_id: paymentInfo.zp_trans_id }),
      ...(paymentInfo.vnp_TransactionNo && { vnp_TransactionNo: paymentInfo.vnp_TransactionNo }),
      ...(paymentInfo.vnp_BankCode && { vnp_BankCode: paymentInfo.vnp_BankCode }),
      ...(paymentInfo.vnp_PayDate && { vnp_PayDate: paymentInfo.vnp_PayDate })
    };
    
    // ✅ Thêm vào lịch sử trạng thái
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: 'pending',
      note: `Thanh toán ${paymentInfo.method?.toUpperCase() || order.paymentMethod.toUpperCase()} thành công - Đơn hàng chờ xác nhận từ admin`,
      date: Date.now()
    });
    
    // ✅ Thêm vào lịch sử payment
    order.statusHistory.push({
      status: 'payment_success',
      note: `Thanh toán ${paymentInfo.method?.toUpperCase() || order.paymentMethod.toUpperCase()} thành công - Số tiền: ${paymentInfo.amount || order.totalPrice}đ - Transaction ID: ${paymentInfo.id || paymentInfo.transactionId || paymentInfo.transId || 'N/A'}`,
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

    // ✅ GỬI THÔNG BÁO CHO USER
    try {
      await createNotificationForUser(
        order.user,
        "Thanh toán thành công",
        `Đơn hàng #${order._id} đã được thanh toán thành công qua ${paymentInfo.method?.toUpperCase() || order.paymentMethod.toUpperCase()}. Đơn hàng đang chờ xác nhận từ admin.`,
        "order",
        `/profile?tab=orders`,
        { orderId: order._id, paymentMethod: order.paymentMethod }
      );
    } catch (notificationError) {
      console.error("Lỗi khi gửi thông báo:", notificationError);
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
    console.log(`📋 Failure reason: ${reason}`);
    
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    console.log(`📦 Order before handling failure: status=${order.status}, isPaid=${order.isPaid}, paymentStatus=${order.paymentStatus}`);

    // ✅ CẬP NHẬT TRẠNG THÁI THẤT BẠI
    order.status = 'payment_failed';
    order.paymentStatus = 'failed';
    order.isPaid = false;
    order.paidAt = undefined;
    
    // ✅ CẬP NHẬT THÔNG TIN THANH TOÁN THẤT BẠI
    order.paymentResult = {
      id: order.paymentResult?.id || 'N/A',
      status: 'failed',
      update_time: new Date().toISOString(),
      email_address: order.paymentResult?.email_address || '',
      method: order.paymentMethod,
      amount: order.totalPrice,
      failure_reason: reason,
      failure_time: new Date().toISOString()
    };
    
    // ✅ Thêm vào lịch sử trạng thái
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: 'payment_failed',
      note: `Thanh toán ${order.paymentMethod.toUpperCase()} thất bại: ${reason}`,
      date: Date.now()
    });

    await order.save();
    console.log(`✅ Order after failure handling: status=${order.status}, isPaid=${order.isPaid}, paymentStatus=${order.paymentStatus}`);
    console.log(`✅ Đơn hàng đã được cập nhật trạng thái thất bại`);
    
    // ✅ GỬI THÔNG BÁO CHO USER
    try {
      await createNotificationForUser(
        order.user,
        "Thanh toán thất bại",
        `Đơn hàng #${order._id} thanh toán thất bại qua ${order.paymentMethod.toUpperCase()}. Lý do: ${reason}. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.`,
        "order",
        `/profile?tab=orders`,
        { orderId: order._id, paymentMethod: order.paymentMethod, failureReason: reason }
      );
    } catch (notificationError) {
      console.error("Lỗi khi gửi thông báo thất bại:", notificationError);
    }
    
    return { 
      success: false, 
      orderId: order._id, 
      status: order.status, 
      paymentStatus: order.paymentStatus,
      reason: reason 
    };
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
    
    // ✅ CẬP NHẬT: Logic transitions nhất quán và hoàn thiện
    const validTransitions = {
      draft: ["pending", "cancelled"],
      pending: ["confirmed", "cancelled", "on_hold"],
      confirmed: ["processing", "cancelled", "on_hold"],
      processing: ["shipped", "cancelled", "on_hold"],
      shipped: ["delivered_success", "delivered_failed", "partially_delivered"],
      delivered_success: ["completed", "returned"],
      delivered_failed: ["shipped", "cancelled"], // Cho phép giao lại
      partially_delivered: ["shipped", "delivered_success"],
      returned: ["refund_requested", "refunded"],
      on_hold: ["processing", "cancelled"],
      refund_requested: ["refunded", "delivered_success"], // Có thể từ chối hoàn tiền
      completed: [], // Trạng thái cuối
      cancelled: [], // Trạng thái cuối
      refunded: [], // Trạng thái cuối
      payment_failed: ["cancelled"], // Chỉ có thể hủy
    };
    
    let options = validTransitions[order.status] || [];
    
    // ✅ THÊM: Business rules validation
    // Chỉ cho phép hoàn hàng nếu giao hàng thành công và chưa thanh toán
    if (order.status === "delivered_success" && !order.isPaid) {
      options = options.filter(
        (opt) => opt === "returned" || opt === "completed"
      );
    }
    
    // Chỉ cho phép yêu cầu hoàn tiền nếu trạng thái là completed và trong 3 ngày
    if (order.status === "completed") {
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
    
    // ✅ THÊM: Kiểm tra điều kiện đặc biệt
    // Chỉ cho phép giao lại tối đa 3 lần
    if (order.status === "delivered_failed" && order.retryDeliveryCount >= 3) {
      options = options.filter(opt => opt !== "shipped");
    }
    
    // Chỉ cho phép chuyển sang shipped nếu có thông tin delivery person
    if (order.status === "processing" && !order.deliveryPerson?.name) {
      options = options.filter(opt => opt !== "shipped");
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
    
    // ✅ CẬP NHẬT: Sử dụng logic transitions nhất quán
    const validTransitions = {
      draft: ["pending", "cancelled"],
      pending: ["confirmed", "cancelled", "on_hold"],
      confirmed: ["processing", "cancelled", "on_hold"],
      processing: ["shipped", "cancelled", "on_hold"],
      shipped: ["delivered_success", "delivered_failed", "partially_delivered"],
      delivered_success: ["completed", "returned"],
      delivered_failed: ["shipped", "cancelled"], // Cho phép giao lại
      partially_delivered: ["shipped", "delivered_success"],
      returned: ["refund_requested", "refunded"],
      on_hold: ["processing", "cancelled"],
      refund_requested: ["refunded", "delivered_success"], // Có thể từ chối hoàn tiền
      completed: [], // Trạng thái cuối
      cancelled: [], // Trạng thái cuối
      refunded: [], // Trạng thái cuối
      payment_failed: ["cancelled"], // Chỉ có thể hủy
    };
    
    const currentStatus = order.status;
    if (!validTransitions.hasOwnProperty(currentStatus)) {
      return res
        .status(400)
        .json({ message: `Không thể chuyển trạng thái từ ${currentStatus}` });
    }
    
    if (!validTransitions[currentStatus].includes(status)) {
      // ✅ CẬP NHẬT: Xử lý các trường hợp đặc biệt
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
      } else if (status === "shipped" && currentStatus === "delivered_failed") {
        // ✅ THÊM: Kiểm tra số lần giao lại
        if (order.retryDeliveryCount >= 3) {
          return res.status(400).json({
            message: "Đã vượt quá số lần giao lại tối đa (3 lần).",
          });
        }
        // Tăng số lần giao lại
        order.retryDeliveryCount += 1;
      } else if (status === "shipped" && currentStatus === "processing") {
        // ✅ THÊM: Kiểm tra thông tin delivery person
        if (!order.deliveryPerson?.name) {
          return res.status(400).json({
            message: "Cần cập nhật thông tin người giao hàng trước khi chuyển sang trạng thái giao hàng.",
          });
        }
      } else {
        return res.status(400).json({
          message: `Chuyển trạng thái từ ${currentStatus} sang ${status} không hợp lệ!`,
        });
      }
    }

    // ✅ CẬP NHẬT: Kiểm tra điều kiện chuyển sang completed
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

    // ✅ CẬP NHẬT: Xử lý các trường hợp đặc biệt
    if (status === "delivered_success") {
      order.actualDeliveryDate = Date.now();
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    if (status === "shipped") {
      // Tự động ước tính thời gian giao hàng (3-5 ngày)
      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + 3 + Math.floor(Math.random() * 3));
      order.estimatedDeliveryDate = estimatedDate;
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
    
    // ✅ CẬP NHẬT: Gửi thông báo chi tiết hơn
    if (order.status === "refunded") {
      await createNotificationForUser(
        order.user,
        "Hoàn tiền thành công",
        `Yêu cầu hoàn tiền cho đơn hàng #${order._id} đã được chấp nhận và xử lý thành công.`,
        "order",
        `/profile?tab=orders`,
        { orderId: order._id }
      );
    } else if (order.status === "delivered_success" && refundCount > 0) {
      await createNotificationForUser(
        order.user,
        "Từ chối hoàn tiền",
        `Yêu cầu hoàn tiền cho đơn hàng #${order._id} đã bị từ chối. Bạn còn ${remain} lần yêu cầu hoàn tiền.`,
        "order",
        `/profile?tab=orders`,
        { orderId: order._id, remain }
      );
    } else if (order.status === "shipped") {
      await createNotificationForUser(
        order.user,
        "Đơn hàng đang giao",
        `Đơn hàng #${order._id} đã được giao. Dự kiến giao hàng vào ${new Date(order.estimatedDeliveryDate).toLocaleDateString('vi-VN')}.`,
        "order",
        `/profile?tab=orders`,
        { orderId: order._id, estimatedDate: order.estimatedDeliveryDate }
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
