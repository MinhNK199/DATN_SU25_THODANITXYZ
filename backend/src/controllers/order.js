import Order from "../models/Order";
import Notification from "../models/Notification";
import { sendMail } from "../utils/mailer";
import User from "../models/User";

// Tạo đơn hàng mới
export const createOrder = async (req, res) => {
  try {
    // Thêm dòng này để khai báo paidMethods
    const paidMethods = [
      "BANKING",
      "E-WALLET",
      "credit-card",
      "e-wallet",
      "credit_card",
      "e_wallet",
    ];
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

    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: paidMethods.includes(paymentMethod),
      paidAt: paidMethods.includes(paymentMethod) ? Date.now() : undefined,
    });

    const createdOrder = await order.save();
    // const user = await User.findById(req.user._id);
    // if (user && user.email) {
    //   await sendMail({
    //     to: user.email,
    //     subject: 'Xác nhận đơn hàng tại TechTrend',
    //     html: `<p>Cảm ơn bạn đã đặt hàng tại TechTrend!</p><p>Mã đơn hàng: <b>${createdOrder._id}</b></p>`
    //   });
    // }
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    res.status(400).json({ message: error.message });
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
    res.json(order);
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

// Lấy đơn hàng của user hiện tại
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy tất cả đơn hàng (admin)
export const getOrders = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;

    // Build filter object
    const filter = {};
    // Lọc theo trạng thái
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Lấy tất cả đơn hàng phù hợp trạng thái, populate user
    let ordersQuery = Order.find(filter).populate("user", "id name");
    const count = await Order.countDocuments(filter);
    let orders = await ordersQuery.limit(pageSize).skip(pageSize * (page - 1));

    // Lọc theo mã đơn hàng (orderId) và tên khách hàng (customerName) ở phía backend
    if (req.query.orderId) {
      const orderIdStr = req.query.orderId.toLowerCase();
      orders = orders.filter((o) =>
        o._id.toString().toLowerCase().includes(orderIdStr)
      );
    }
    if (req.query.customerName) {
      const nameStr = req.query.customerName.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.user && o.user.name && o.user.name.toLowerCase().includes(nameStr)
      );
    }

    res.json({
      orders,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
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
      delivered_success: ["completed", "returned"], // Không cho phép refund_requested ở đây nữa
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
      delivered_success: ["completed", "returned"], // Không cho phép refund_requested ở đây nữa
      delivered_failed: ["shipped", "cancelled"], // Cho phép giao lại hoặc hủy
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
          return res
            .status(400)
            .json({
              message:
                "Chỉ có thể yêu cầu hoàn tiền khi đơn hàng đã hoàn thành.",
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
          return res
            .status(400)
            .json({
              message:
                "Chỉ có thể yêu cầu hoàn tiền trong vòng 3 ngày kể từ khi đơn hàng hoàn thành.",
            });
        }
      } else {
        return res
          .status(400)
          .json({
            message: `Chuyển trạng thái từ ${currentStatus} sang ${status} không hợp lệ!`,
          });
      }
    }

    // Kiểm tra điều kiện chuyển sang completed
    if (status === "completed") {
      if (order.status !== "delivered_success") {
        return res
          .status(400)
          .json({
            message:
              "Chỉ có thể chuyển sang trạng thái Thành công khi đơn hàng đã giao thành công.",
          });
      }
      if (!order.isPaid) {
        return res
          .status(400)
          .json({
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

    /*
        // Doanh thu theo ngày (30 ngày gần nhất)
        const daily = await Order.aggregate([
            {
                $match: { isPaid: true }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" }
                    },
                    totalRevenue: { $sum: "$totalPrice" },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 }
            },
            { $limit: 30 }
        ]);

        // Doanh thu theo tháng (12 tháng gần nhất)
        const monthly = await Order.aggregate([
            {
                $match: { isPaid: true }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    totalRevenue: { $sum: "$totalPrice" },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": -1, "_id.month": -1 }
            },
            { $limit: 12 }
        ]);

        res.json({ daily, monthly });
        */
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
      return res
        .status(400)
        .json({
          message:
            "Chỉ có thể yêu cầu hoàn tiền khi đơn hàng đã giao thành công.",
        });
    }
    if (!order.isPaid) {
      return res
        .status(400)
        .json({
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
      return res
        .status(400)
        .json({
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
