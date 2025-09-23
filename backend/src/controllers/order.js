import Order from "../models/Order.js";
import Notification from "../models/Notification.js";
import { sendMail } from "../utils/mailer.js";
import User from "../models/User.js";
import InventoryService from "../services/inventoryService.js";

const paidMethods = [
  "credit-card",
  "momo",
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
      couponDiscount,
      couponCode,
      voucherDiscount,
      voucherCode,
      voucherProductId,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res
        .status(400)
        .json({ message: "Không có sản phẩm trong đơn hàng" });
    }

    // ✅ KIỂM TRA TÍNH KHẢ DỤNG CỦA SẢN PHẨM TRƯỚC KHI TẠO ĐƠN HÀNG
    console.log("🔍 Kiểm tra tính khả dụng của sản phẩm...");
    console.log("🔍 [DEBUG] Order items received:", JSON.stringify(orderItems, null, 2));
    const availabilityCheck = await InventoryService.checkAvailability(orderItems);
    console.log("🔍 [DEBUG] Availability check result:", JSON.stringify(availabilityCheck, null, 2));

    if (!availabilityCheck.available) {
      console.error("❌ Một số sản phẩm không khả dụng:", availabilityCheck.unavailableItems);
      return res.status(400).json({
        message: "Một số sản phẩm không khả dụng",
        unavailableItems: availabilityCheck.unavailableItems
      });
    }

    console.log("✅ Tất cả sản phẩm đều khả dụng");

    // ✅ XỬ LÝ VOUCHER NẾU CÓ
    let voucherInfo = null;
    if (voucherCode && voucherProductId && voucherDiscount > 0) {
      try {
        const Product = (await import("../models/Product.js")).default;
        const product = await Product.findById(voucherProductId);

        if (product) {
          const voucher = product.vouchers.find((v) => v.code === voucherCode);
          if (voucher) {
            voucherInfo = {
              productId: voucherProductId,
              code: voucherCode,
              discountType: voucher.discountType,
              value: voucher.value,
              discountAmount: voucherDiscount,
            };
            console.log("✅ Đã lưu thông tin voucher:", voucherInfo);
          }
        }
      } catch (voucherError) {
        console.error("❌ Lỗi khi xử lý voucher:", voucherError);
        // Không hủy đơn hàng nếu có lỗi voucher, chỉ ghi log
      }
    }

    // ✅ SỬA LOGIC: Luôn tạo đơn hàng draft cho tất cả các phương thức thanh toán online
    const isOnlinePayment = [
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
      // ✅ THÊM THÔNG TIN COUPON
      couponDiscount: couponDiscount || 0,
      couponCode: couponCode || null,
      // ✅ THÊM THÔNG TIN VOUCHER NẾU CÓ
      voucher: voucherInfo,
      discountAmount: voucherDiscount || 0,
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
      // Khởi tạo trạng thái kho hàng
      inventoryStatus: {
        deducted: false,
        restored: false
      }
    });

    console.log(
      "Created order with status:",
      order.status,
      "paymentMethod:",
      paymentMethod
    );

    const createdOrder = await order.save();

    // Emit WebSocket event for new order creation
    const io = req.app.get('io');
    if (io) {
      io.emit('new_order_created', {
        order: createdOrder
      });
      console.log('📡 Emitted new order created event');
    }

    // ✅ TRỪ SỐ LƯỢNG KHO NGAY KHI TẠO ĐƠN HÀNG (CHO CẢ COD VÀ ONLINE PAYMENT)
    console.log("📦 Bắt đầu trừ kho cho đơn hàng...");
    const inventoryResult = await InventoryService.deductInventory(orderItems, createdOrder._id);

    if (!inventoryResult.success) {
      console.error("❌ Lỗi khi trừ kho, hủy đơn hàng:", inventoryResult.errors);
      // Xóa đơn hàng nếu không thể trừ kho
      await Order.findByIdAndDelete(createdOrder._id);
      return res.status(400).json({
        message: "Không thể trừ kho cho một số sản phẩm",
        errors: inventoryResult.errors
      });
    }

    // Cập nhật trạng thái đã trừ kho
    createdOrder.inventoryStatus.deducted = true;
    createdOrder.inventoryStatus.deductedAt = new Date();
    await createdOrder.save();

    console.log("✅ Đã trừ kho thành công cho đơn hàng", createdOrder._id);

    // ✅ CẬP NHẬT SỐ LƯỢNG SỬ DỤNG VOUCHER NẾU CÓ
    if (voucherInfo && voucherInfo.code && voucherInfo.productId) {
      try {
        const { updateVoucherUsage } = await import("../controllers/product.js");
        await updateVoucherUsage({
          body: {
            productId: voucherInfo.productId,
            code: voucherInfo.code,
          }
        }, {
          json: (result) => {
            console.log("✅ Đã cập nhật số lượt sử dụng voucher:", result);
          },
          status: (code) => {
            if (code !== 200) {
              console.error("❌ Lỗi khi cập nhật voucher usage:", code);
            }
          }
        });
      } catch (voucherUpdateError) {
        console.error("❌ Lỗi khi cập nhật voucher usage:", voucherUpdateError);
        // Không hủy đơn hàng nếu có lỗi cập nhật voucher
      }
    }

    // ✅ XÓA SẢN PHẨM KHỎI GIỎ HÀNG VÀ XÓA RESERVATION (CHO TẤT CẢ PHƯƠNG THỨC THANH TOÁN)
    try {
      const Cart = (await import("../models/Cart.js")).default;
      const cart = await Cart.findOne({ user: req.user._id });

      if (cart && cart.items.length > 0) {
        const orderedProductIds = orderItems.map((item) => item.product);
        const originalItemCount = cart.items.length;

        cart.items = cart.items.filter(
          (item) => !orderedProductIds.includes(item.product.toString())
        );

        await cart.save();
        console.log(`🛒 Đã xóa ${originalItemCount - cart.items.length} sản phẩm khỏi giỏ hàng`);
      }

      // Xóa reservation
      await InventoryService.clearReservations(req.user._id, orderItems);

    } catch (cartError) {
      console.error("Lỗi khi cập nhật giỏ hàng:", cartError);
      // Không hủy đơn hàng vì đã trừ kho thành công
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

    // Emit WebSocket events for realtime updates
    const io = req.app.get('io');
    if (io) {
      io.emit('order_payment_updated', {
        orderId: order._id,
        isPaid: order.isPaid,
        paidAt: order.paidAt,
        status: order.status,
        paymentStatus: order.paymentStatus,
        statusHistory: order.statusHistory
      });
      console.log('📡 Emitted payment update event for online payment');
    }

    // ✅ GIỎ HÀNG ĐÃ ĐƯỢC XÓA TRONG createOrder, KHÔNG CẦN XÓA LẠI
    console.log("ℹ️ Giỏ hàng đã được xóa khi tạo đơn hàng, không cần xóa lại");

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

    // Emit WebSocket events for realtime updates
    const io = req.app.get('io');
    if (io) {
      io.emit('order_payment_updated', {
        orderId: order._id,
        isPaid: order.isPaid,
        paidAt: order.paidAt,
        status: order.status,
        paymentStatus: order.paymentStatus,
        statusHistory: order.statusHistory
      });
      console.log('📡 Emitted payment failure event');
    }

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
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("shipper", "fullName phone email vehicleType");
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    // Sử dụng helper để có thông tin trạng thái rõ ràng hơn
    try {
      const { getOrderStatusMessage } = await import('../utils/orderStatusHelper.js');
      const statusInfo = getOrderStatusMessage(order);

      const orderWithStatus = {
        ...order.toObject(),
        statusInfo
      };

      res.json(orderWithStatus);
    } catch (helperError) {
      console.error('Error loading orderStatusHelper:', helperError);
      // Fallback nếu helper không load được
      res.json(order.toObject());
    }
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
    let ordersWithStatus = orders;
    try {
      const { getOrderStatusMessage } = await import('../utils/orderStatusHelper.js');

      ordersWithStatus = orders.map(order => {
        const orderObj = order.toObject();
        const statusInfo = getOrderStatusMessage(order);

        return {
          ...orderObj,
          statusInfo
        };
      });
    } catch (helperError) {
      console.error('Error loading orderStatusHelper:', helperError);
      // Fallback nếu helper không load được
      ordersWithStatus = orders.map(order => order.toObject());
    }

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


    // ✅ LOGIC CẢI THIỆN: Hiển thị tất cả đơn hàng (bao gồm cả draft, pending, v.v.)
    let filter = {};


    // Filter theo status nếu có
    if (req.query.status && req.query.status !== "all") {
      filter.status = req.query.status;
    }

    // Filter orders chưa được assign shipper
    if (req.query.unassigned === 'true') {
      filter.shipper = { $exists: false };
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
      .populate("shipper", "fullName phone email vehicleType")
      .sort({ createdAt: -1 });

    const count = await Order.countDocuments(filter);
    let orders = await ordersQuery.limit(pageSize).skip(pageSize * (page - 1));

    // Hiển thị trạng thái thanh toán chính xác
    orders = orders.map((order) => {
      const orderObj = order.toObject();

      // Xử lý hiển thị payment status
      if (["momo", "vnpay", "credit-card", "BANKING"].includes(order.paymentMethod)) {
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
      data: {
        orders,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
      }
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
    // 📋 QUY TẮC: Admin chỉ có thể chuyển trạng thái theo luồng chính
    // ❌ KHÔNG CHO PHÉP: Admin thay đổi trạng thái từ shipped trở đi (phụ thuộc vào user)
    // ✅ CHO PHÉP: Client yêu cầu hoàn tiền thông qua API requestRefund
    const validTransitions = {
      draft: ["pending", "cancelled"],
      pending: ["confirmed", "cancelled", "on_hold"],
      confirmed: ["processing", "cancelled", "on_hold"],
      processing: ["shipped", "cancelled", "on_hold"],
      // ❌ TỪ SHIPPED TRỞ ĐI: Admin KHÔNG THỂ thay đổi trạng thái thủ công
      // Các trạng thái này phụ thuộc vào hành động của người dùng
      shipped: [], // Admin không thể thay đổi - user phải xác nhận nhận hàng
      delivered_success: [], // Admin không thể thay đổi - user phải xác nhận hài lòng
      delivered_failed: ["shipped", "cancelled"], // Chỉ cho phép giao lại hoặc hủy
      partially_delivered: ["shipped", "delivered_success"], // Chỉ cho phép giao lại hoặc hoàn thành
      returned: ["refund_requested", "refunded"], // Admin có thể xử lý hoàn tiền
      return_requested: ["returned", "delivered_success"], // Admin có thể từ chối hoàn hàng
      on_hold: ["processing", "cancelled"],
      refund_requested: ["refunded", "delivered_success"], // Admin có thể từ chối hoàn tiền
      completed: [], // Trạng thái cuối - KHÔNG THỂ THAY ĐỔI
      cancelled: [], // Trạng thái cuối - KHÔNG THỂ THAY ĐỔI
      refunded: [], // Trạng thái cuối - KHÔNG THỂ THAY ĐỔI
      payment_failed: ["cancelled"], // Chỉ có thể hủy
    };

    let options = validTransitions[order.status] || [];
    console.log(`Đơn hàng ${order._id} có trạng thái ${order.status}, options ban đầu:`, options);

    // ✅ THÊM: Business rules validation đơn giản hóa
    // ❌ TỪ SHIPPED TRỞ ĐI: Admin KHÔNG THỂ thay đổi trạng thái thủ công
    if (["shipped", "delivered_success"].includes(order.status)) {
      options = []; // Không có options nào cho admin
      console.log(`Đơn hàng ${order._id} có trạng thái ${order.status} - Admin không thể thay đổi (phụ thuộc vào user)`);
    }

    // ❌ CHẶN: Admin không thể thay đổi trạng thái từ shipped trở đi
    // Các trạng thái này phụ thuộc vào hành động của người dùng
    if (["completed", "cancelled", "refunded"].includes(order.status)) {
      console.log(`Đơn hàng ${order._id} có trạng thái ${order.status} - Admin không thể thay đổi trạng thái cuối`);
      options = []; // Không có options nào cho admin
    }

    // Kiểm tra điều kiện giao lại (chỉ khi cần thiết)
    if (order.status === "delivered_failed") {
      const retryCount = order.retryDeliveryCount || 0;
      if (retryCount >= 3) {
        options = options.filter(opt => opt !== "shipped");
        console.log(`Đơn hàng ${order._id} đã vượt quá số lần giao lại (${retryCount}/3)`);
      }
    }

    // Kiểm tra thông tin delivery person (chỉ khi cần thiết)
    if (order.status === "processing") {
      const hasDeliveryPerson = order.deliveryPerson && order.deliveryPerson.name && order.deliveryPerson.name.trim() !== "";
      if (!hasDeliveryPerson) {
        // Không ẩn shipped, chỉ ghi log để admin biết cần cập nhật thông tin
        console.log(`Đơn hàng ${order._id} chưa có thông tin người giao hàng, nhưng vẫn cho phép chuyển sang shipped`);
        // options = options.filter(opt => opt !== "shipped"); // Bỏ dòng này
      }
    }

    console.log(`Đơn hàng ${order._id} - options cuối cùng:`, options);
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
    // 📋 QUY TẮC: Admin chỉ có thể chuyển trạng thái theo luồng chính
    // ❌ KHÔNG CHO PHÉP: Admin thay đổi trạng thái từ shipped trở đi (phụ thuộc vào user)
    // ✅ CHO PHÉP: Client yêu cầu hoàn tiền thông qua API requestRefund
    const validTransitions = {
      draft: ["pending", "cancelled"],
      pending: ["confirmed", "cancelled", "on_hold"],
      confirmed: ["processing", "cancelled", "on_hold"],
      processing: ["shipped", "cancelled", "on_hold"],
      // ❌ TỪ SHIPPED TRỞ ĐI: Admin KHÔNG THỂ thay đổi trạng thái thủ công
      // Các trạng thái này phụ thuộc vào hành động của người dùng
      shipped: [], // Admin không thể thay đổi - user phải xác nhận nhận hàng
      delivered_success: [], // Admin không thể thay đổi - user phải xác nhận hài lòng
      delivered_failed: ["shipped", "cancelled"], // Chỉ cho phép giao lại hoặc hủy
      partially_delivered: ["shipped", "delivered_success"], // Chỉ cho phép giao lại hoặc hoàn thành
      returned: ["refund_requested", "refunded"], // Admin có thể xử lý hoàn tiền
      return_requested: ["returned", "delivered_success"], // Admin có thể từ chối hoàn hàng
      on_hold: ["processing", "cancelled"],
      refund_requested: ["refunded", "delivered_success"], // Admin có thể từ chối hoàn tiền
      completed: [], // Trạng thái cuối - KHÔNG THỂ THAY ĐỔI
      cancelled: [], // Trạng thái cuối - KHÔNG THỂ THAY ĐỔI
      refunded: [], // Trạng thái cuối - KHÔNG THỂ THAY ĐỔI
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
      if (status === "return_requested") {
        // Chỉ cho phép yêu cầu hoàn hàng khi đang giao hàng
        if (currentStatus !== 'shipped') {
          return res.status(400).json({
            message: 'Chỉ có thể yêu cầu hoàn hàng khi đơn hàng đang giao'
          });
        }
      } else if (status === "refund_requested") {
        // ❌ BỎ: Admin không thể yêu cầu hoàn tiền
        // Yêu cầu hoàn tiền chỉ có thể đến từ client thông qua API requestRefund
        // Admin chỉ có thể xử lý yêu cầu hoàn tiền khi client đã gửi
        return res.status(400).json({
          message: "Admin không thể yêu cầu hoàn tiền. Yêu cầu hoàn tiền chỉ có thể đến từ khách hàng.",
        });
      } else if (status === "shipped" && currentStatus === "delivered_failed") {
        // ✅ THÊM: Kiểm tra số lần giao lại
        const retryCount = order.retryDeliveryCount || 0;
        if (retryCount >= 3) {
          return res.status(400).json({
            message: "Đã vượt quá số lần giao lại tối đa (3 lần).",
          });
        }
        // Tăng số lần giao lại
        order.retryDeliveryCount = retryCount + 1;
      } else if (status === "shipped" && currentStatus === "processing") {
        // ✅ THÊM: Kiểm tra thông tin delivery person (không bắt buộc)
        const hasDeliveryPerson = order.deliveryPerson && order.deliveryPerson.name && order.deliveryPerson.name.trim() !== "";
        if (!hasDeliveryPerson) {
          console.log(`⚠️ Đơn hàng ${order._id} chuyển sang shipped mà chưa có thông tin người giao hàng`);
          // Không return error, chỉ ghi log để admin biết
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
      // Bỏ kiểm tra thanh toán - cho phép chuyển sang completed từ delivered_success
      // Đơn hàng có thể hoàn thành ngay cả khi chưa thanh toán (ví dụ: COD)
      // 📋 LƯU Ý: Trạng thái completed là trạng thái cuối, admin không thể thay đổi nữa
    }

    // ✅ CẬP NHẬT: Xử lý các trường hợp đặc biệt
    if (status === "return_requested") {
      // Lưu thông tin yêu cầu hoàn hàng
      order.returnRequest = {
        requestedAt: Date.now(),
        reason: note || 'Khách hàng yêu cầu hoàn hàng',
        status: 'pending'
      };
    } else if (status === "delivered_success") {
      order.actualDeliveryDate = Date.now();
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    if (status === "shipped") {
      // Tự động ước tính thời gian giao hàng (3-5 ngày)
      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + 3 + Math.floor(Math.random() * 3));
      order.estimatedDeliveryDate = estimatedDate;

      // Nếu chưa có thông tin delivery person, tạo thông tin mặc định
      if (!order.deliveryPerson || !order.deliveryPerson.name) {
        order.deliveryPerson = {
          name: "Nhân viên giao hàng",
          phone: "N/A",
          id: "N/A"
        };
        console.log(`✅ Đã tạo thông tin delivery person mặc định cho đơn hàng ${order._id}`);
      }
    }

    // Đếm số lượt yêu cầu hoàn tiền
    const refundCount = order.statusHistory && order.statusHistory.length > 0
      ? order.statusHistory.filter((s) => s.status === "refund_requested").length
      : 0;
    const maxRefund = 3;
    const remain = Math.max(0, maxRefund - refundCount);

    // ✅ XỬ LÝ HOÀN TRẢ KHO KHI ADMIN HỦY ĐƠN HÀNG
    if (status === "cancelled") {
      console.log(`🔄 Admin hủy đơn hàng ${order._id} - Bắt đầu hoàn trả kho`);

      // Kiểm tra xem đã hoàn trả chưa để tránh trùng lặp
      if (order.inventoryStatus && order.inventoryStatus.restored) {
        console.log(`⚠️ Đơn hàng ${order._id} đã được hoàn trả kho trước đó, bỏ qua việc hoàn trả`);
      } else {
        const restoreResult = await InventoryService.restoreInventory(
          order.orderItems,
          order._id,
          order.inventoryStatus?.restored || false
        );

        if (!restoreResult.success && !restoreResult.skipped) {
          console.error("❌ Lỗi khi hoàn trả kho:", restoreResult.errors);
          // Vẫn cho phép hủy đơn hàng nhưng ghi log lỗi
        } else if (restoreResult.success) {
          console.log("✅ Hoàn trả kho thành công cho đơn hàng bị hủy bởi admin");
        }
      }
    }

    order.status = status;
    // Đảm bảo statusHistory là array
    if (!order.statusHistory) {
      order.statusHistory = [];
    }

    order.statusHistory.push({
      status,
      note,
      date: Date.now(),
    });

    // Cập nhật trạng thái đã hoàn trả kho nếu hủy đơn hàng
    if (status === "cancelled") {
      if (!order.inventoryStatus) {
        order.inventoryStatus = {};
      }
      if (!order.inventoryStatus.restored) {
        order.inventoryStatus.restored = true;
        order.inventoryStatus.restoredAt = new Date();
      }
    }

    const updatedOrder = await order.save();

    // ✅ CẬP NHẬT: Gửi thông báo chi tiết hơn
    if (status === "returned") {
      await createNotificationForUser(
        order.user,
        "Yêu cầu hoàn hàng được chấp nhận",
        `Yêu cầu hoàn hàng cho đơn hàng #${order._id} đã được chấp nhận. Vui lòng chuẩn bị hàng để hoàn trả.`,
        "order",
        `/profile?tab=orders`,
        { orderId: order._id }
      );
    } else if (status === "refunded") {
      await createNotificationForUser(
        order.user,
        "Hoàn tiền thành công",
        `Yêu cầu hoàn tiền cho đơn hàng #${order._id} đã được chấp nhận và xử lý thành công.`,
        "order",
        `/profile?tab=orders`,
        { orderId: order._id }
      );

      // Send email notification to shipper about successful refund
      try {
        if (order.shipper) {
          const { sendShipperNotification } = await import('../utils/shipperNotification.js');
          const Shipper = (await import('../models/Shipper.js')).default;
          const shipper = await Shipper.findById(order.shipper);
          
          if (shipper) {
            await sendShipperNotification(shipper.email, 'refund_completed', {
              shipperName: shipper.fullName,
              orderId: order._id,
              customerName: order.shippingAddress?.fullName || 'Khách hàng',
              refundAmount: order.totalPrice?.toLocaleString('vi-VN') + ' VNĐ',
              refundDate: new Date().toLocaleDateString('vi-VN'),
              reason: 'Khách hàng yêu cầu hoàn tiền và đã được chấp nhận'
            });
            console.log(`✅ Refund completed email sent to shipper: ${shipper.email}`);
          }
        }
      } catch (emailError) {
        console.error('Failed to send refund completed email:', emailError);
        // Don't fail the request if email fails
      }
    } else if (status === "delivered_success" && refundCount > 0) {
      await createNotificationForUser(
        order.user,
        "Từ chối hoàn tiền",
        `Yêu cầu hoàn tiền cho đơn hàng #${order._id} đã bị từ chối. Bạn còn ${remain} lần yêu cầu hoàn tiền.`,
        "order",
        `/profile?tab=orders`,
        { orderId: order._id, remain }
      );
    } else if (status === "shipped") {
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

// Thống kê doanh thu theo ngày, tuần và tháng
export const getRevenueStats = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có quyền xem thống kê doanh thu'
      });
    }

    // Thống kê doanh thu theo ngày (30 ngày gần nhất)
    const dailyStats = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 ngày gần nhất
          }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$createdAt' },
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          totalRevenue: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Thống kê doanh thu theo tuần (12 tuần gần nhất)
    const weeklyStats = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: {
            $gte: new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000) // 12 tuần gần nhất
          }
        }
      },
      {
        $group: {
          _id: {
            week: { $week: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          totalRevenue: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.week': 1 }
      }
    ]);

    // Thống kê doanh thu theo tháng (12 tháng gần nhất)
    const monthlyStats = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: {
            $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) // 12 tháng gần nhất
          }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          totalRevenue: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      success: true,
      daily: dailyStats,
      weekly: weeklyStats,
      monthly: monthlyStats
    });
  } catch (error) {
    console.error('Error getting revenue stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê doanh thu'
    });
  }
};

// API user gửi yêu cầu hoàn tiền
export const requestRefund = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // ❌ Đếm số lần yêu cầu hoàn tiền trong lịch sử
    const refundCount =
      order.statusHistory && order.statusHistory.length > 0
        ? order.statusHistory.filter((s) => s.status === "refund_requested")
            .length
        : 0;

    const maxRefund = 1; // chỉ cho phép 1 lần
    if (refundCount >= maxRefund) {
      return res.status(400).json({
        message: "Bạn đã đạt giới hạn số lần yêu cầu hoàn tiền.",
      });
    }

    // ❌ Chỉ cho phép hoàn tiền khi đơn hàng đã giao thành công
    if (order.status !== "delivered_success") {
      return res.status(400).json({
        message: "Chỉ có thể yêu cầu hoàn tiền khi đơn hàng đã giao thành công.",
      });
    }

    // ❌ Chỉ cho phép hoàn tiền khi đơn hàng đã được thanh toán
    if (!order.isPaid) {
      return res.status(400).json({
        message: "Chỉ có thể yêu cầu hoàn tiền khi đơn hàng đã được thanh toán.",
      });
    }

    // ✅ Đổi trạng thái sang refund_requested
    order.status = "refund_requested";
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: "refund_requested",
      note: req.body.reason || "",
      date: Date.now(),
    });

    await order.save();

    // 🔔 Gửi thông báo cho user
    await createNotificationForUser(
      order.user,
      "Yêu cầu hoàn tiền",
      `Bạn đã gửi yêu cầu hoàn tiền cho đơn hàng #${order._id}.`,
      "order",
      `/profile?tab=orders`,
      { orderId: order._id }
    );

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};




// API yêu cầu hoàn hàng
export const requestReturn = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Kiểm tra điều kiện yêu cầu hoàn hàng
    if (order.status !== "shipped") {
      return res.status(400).json({
        message: "Chỉ có thể yêu cầu hoàn hàng khi đơn hàng đang giao"
      });
    }

    // Cập nhật trạng thái
    order.status = "return_requested";
    order.statusHistory.push({
      status: "return_requested",
      note: reason || "Khách hàng yêu cầu hoàn hàng",
      date: Date.now(),
    });

    await order.save();

    // Gửi thông báo
    await createNotificationForUser(
      order.user,
      "Yêu cầu hoàn hàng đã được gửi",
      `Yêu cầu hoàn hàng cho đơn hàng #${order._id} đã được gửi thành công. Chúng tôi sẽ xem xét và phản hồi trong thời gian sớm nhất.`,
      "order",
      `/profile?tab=orders`,
      { orderId: order._id, reason }
    );

    res.json({
      success: true,
      message: "Yêu cầu hoàn hàng đã được gửi thành công",
      order: order
    });

  } catch (error) {
    console.error("Lỗi khi yêu cầu hoàn hàng:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi yêu cầu hoàn hàng"
    });
  }
};

// API xác nhận hài lòng với đơn hàng
export const confirmSatisfaction = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Kiểm tra điều kiện
    if (order.status !== "delivered_success") {
      return res.status(400).json({
        message: "Chỉ có thể xác nhận hài lòng khi đơn hàng đã giao thành công"
      });
    }

    // Cập nhật trạng thái
    order.status = "completed";
    order.statusHistory.push({
      status: "completed",
      note: "Khách hàng xác nhận hài lòng với đơn hàng",
      date: Date.now(),
    });

    await order.save();

    // Gửi thông báo
    await createNotificationForUser(
      order.user,
      "Đơn hàng hoàn thành",
      `Đơn hàng #${order._id} đã được hoàn thành. Cảm ơn bạn đã mua sắm tại cửa hàng chúng tôi!`,
      "order",
      `/profile?tab=orders`,
      { orderId: order._id }
    );

    res.json({
      success: true,
      message: "Xác nhận hài lòng thành công",
      order: order
    });

  } catch (error) {
    console.error("Lỗi khi xác nhận hài lòng:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi xác nhận hài lòng"
    });
  }
};

// API xác nhận đã nhận hàng (cho khách hàng)
export const confirmDelivery = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Kiểm tra điều kiện
    if (order.status !== "shipped") {
      return res.status(400).json({
        message: "Chỉ có thể xác nhận đã nhận hàng khi đơn hàng đang giao"
      });
    }

    // Cập nhật trạng thái
    order.status = "delivered_success";
    order.deliveredAt = new Date();
    order.statusHistory.push({
      status: "delivered_success",
      note: "Khách hàng xác nhận đã nhận được hàng",
      date: Date.now(),
    });

    await order.save();

    // Gửi thông báo
    await createNotificationForUser(
      order.user,
      "Đã nhận hàng thành công",
      `Bạn đã xác nhận nhận được hàng cho đơn hàng #${order._id}. Đơn hàng đã hoàn thành giao hàng.`,
      "order",
      `/profile?tab=orders`,
      { orderId: order._id }
    );

    res.json({
      success: true,
      message: "Xác nhận đã nhận hàng thành công",
      order: order
    });

  } catch (error) {
    console.error("Lỗi khi xác nhận đã nhận hàng:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi xác nhận đã nhận hàng"
    });
  }
};

// API hủy đơn hàng (cho khách hàng)
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Kiểm tra điều kiện - chỉ cho phép hủy khi đơn hàng còn ở trạng thái có thể hủy
    if (!['pending', 'confirmed', 'processing'].includes(order.status)) {
      return res.status(400).json({
        message: "Chỉ có thể hủy đơn hàng khi đơn hàng chưa được giao"
      });
    }

    // ✅ HOÀN TRẢ SỐ LƯỢNG KHO KHI HỦY ĐƠN HÀNG
    console.log(`🔄 Bắt đầu hoàn trả kho cho đơn hàng bị hủy ${order._id}`);

    // Kiểm tra xem đã hoàn trả chưa để tránh trùng lặp
    if (order.inventoryStatus && order.inventoryStatus.restored) {
      console.log(`⚠️ Đơn hàng ${order._id} đã được hoàn trả kho trước đó, bỏ qua việc hoàn trả`);
    } else {
      const restoreResult = await InventoryService.restoreInventory(
        order.orderItems,
        order._id,
        order.inventoryStatus?.restored || false
      );

      if (!restoreResult.success && !restoreResult.skipped) {
        console.error("❌ Lỗi khi hoàn trả kho:", restoreResult.errors);
        // Vẫn cho phép hủy đơn hàng nhưng ghi log lỗi
      } else if (restoreResult.success) {
        console.log("✅ Hoàn trả kho thành công cho đơn hàng bị hủy");
      }
    }

    // Cập nhật trạng thái
    order.status = "cancelled";
    order.statusHistory.push({
      status: "cancelled",
      note: "Khách hàng hủy đơn hàng",
      date: Date.now(),
    });

    // Cập nhật trạng thái đã hoàn trả kho (nếu chưa)
    if (!order.inventoryStatus) {
      order.inventoryStatus = {};
    }
    if (!order.inventoryStatus.restored) {
      order.inventoryStatus.restored = true;
      order.inventoryStatus.restoredAt = new Date();
    }

    await order.save();

    // Gửi thông báo
    await createNotificationForUser(
      order.user,
      "Đơn hàng đã được hủy",
      `Đơn hàng #${order._id} đã được hủy thành công. Số lượng sản phẩm đã được hoàn trả vào kho.`,
      "order",
      `/profile?tab=orders`,
      { orderId: order._id }
    );

    res.json({
      success: true,
      message: "Hủy đơn hàng thành công",
      order: order
    });

  } catch (error) {
    console.error("Lỗi khi hủy đơn hàng:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi hủy đơn hàng"
    });
  }
};

// Xác nhận đơn hàng (chuyển từ pending sang confirmed)
export const confirmOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (order.status !== 'pending' && order.status !== 'draft') {
      return res.status(400).json({ message: "Chỉ có thể xác nhận đơn hàng ở trạng thái pending hoặc draft" });
    }

    order.status = 'confirmed';
    order.statusHistory.push({
      status: 'confirmed',
      note: 'Admin đã xác nhận đơn hàng',
      date: new Date()
    });

    await order.save();

    res.json({
      success: true,
      message: 'Xác nhận đơn hàng thành công',
      order
    });
  } catch (error) {
    console.error('Confirm order error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xác nhận đơn hàng',
      error: error.message
    });
  }
};
