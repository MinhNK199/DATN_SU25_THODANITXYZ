import Order from "../models/order";
import { sendMail } from "../utils/mailer.js";
// Tạo đơn hàng mới
export const createOrder = async(req, res) => {
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
export const getOrderById = async(req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật trạng thái đã thanh toán
export const updateOrderToPaid = async(req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.payer,
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật trạng thái đã giao hàng
export const updateOrderToDelivered = async(req, res) => {
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
export const getMyOrders = async(req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy tất cả đơn hàng (admin)
export const getOrders = async(req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.page) || 1;

        const count = await Order.countDocuments({});
        const orders = await Order.find({})
            .populate('user', 'id name')
            .limit(pageSize)
            .skip(pageSize * (page - 1));

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
export const updateOrderStatus = async(req, res) => {
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

// Hoàn tiền đơn hàng
export const refundOrder = async(req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'email');
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

        // ...xử lý hoàn tiền...

        order.status = "cancelled";
        order.statusHistory.push({ status: "cancelled", note: "Hoàn tiền đơn hàng", date: Date.now() });
        await order.save();

        // Gửi mail thông báo cho khách hàng
        await sendMail(
            order.user.email,
            "Thông báo đơn hàng",
            "<b>Đơn hàng của bạn đã được hoàn tiền!</b>"
        );

        res.json({ message: "Đã hoàn tiền đơn hàng", order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Hủy đơn hàng
export const cancelOrder = async(req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

        if (order.status === "cancelled") {
            return res.status(400).json({ message: "Đơn hàng đã bị hủy" });
        }

        order.status = "cancelled";
        order.statusHistory.push({ status: "cancelled", note: "Khách hủy đơn", date: Date.now() });
        await order.save();

        // Gửi mail hoặc Zalo ở đây nếu muốn

        res.json({ message: "Đã hủy đơn hàng", order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};