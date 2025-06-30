import Order from "../models/Order";

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
            return res.status(400).json({ message: "Không có sản phẩm trong đơn hàng" });
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
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Lấy đơn hàng theo id
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật trạng thái đã thanh toán
export const updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

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

// Cập nhật trạng thái đã giao hàng
export const updateOrderToDelivered = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.status = 'delivered';

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
        let ordersQuery = Order.find(filter).populate('user', 'id name');
        const count = await Order.countDocuments(filter);
        let orders = await ordersQuery
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        // Lọc theo mã đơn hàng (orderId) và tên khách hàng (customerName) ở phía backend
        if (req.query.orderId) {
            const orderIdStr = req.query.orderId.toLowerCase();
            orders = orders.filter(o => o._id.toString().toLowerCase().includes(orderIdStr));
        }
        if (req.query.customerName) {
            const nameStr = req.query.customerName.toLowerCase();
            orders = orders.filter(o => o.user && o.user.name && o.user.name.toLowerCase().includes(nameStr));
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

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (req, res) => {
    try {
        const { status, note } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

        order.status = status;
        order.statusHistory.push({
            status,
            note,
            date: Date.now(),
        });

        const updatedOrder = await order.save();
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