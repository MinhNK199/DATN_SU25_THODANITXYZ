import express from "express";
import axios from "axios";
import moment from "moment";
import CryptoJS from "crypto-js";
import Order from "../models/Order.js";

const config = {
    app_id: "2553",
    key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
    key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
    endpoint: "https://sb-openapi.zalopay.vn/v2/create"
};

export const createZaloPayOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        // Sửa app_trans_id cho ngắn gọn hơn
        const app_trans_id = moment().format("YYMMDD") + "_" + Math.floor(Math.random() * 1000000);

        const items = [{
            itemid: "knb",
            itemname: order.orderItems[0]?.name || "Sản phẩm TechTrend", 
            itemprice: Math.round(order.totalPrice),
            itemquantity: 1
        }];

        const orderData = {
    app_id: config.app_id,
    app_trans_id,
    app_user: req.user._id.toString(),
    app_time: Date.now(),
    amount: Math.round(order.totalPrice),
    item: JSON.stringify(items),
    embed_data: JSON.stringify({}),
    description: `TechTrend - Thanh toán cho đơn hàng #${order._id}`,
    bank_code: "zalopayapp",
    callback_url: "http://localhost:8000/api/payment/zalopay/callback",
    // 🎯 THÊM RETURN_URL ĐỂ ZALOPAY TỰ CHUYỂN HƯỚNG SAU KHI THANH TOÁN
    return_url: `http://localhost:5173/checkout/success?orderId=${order._id}&paymentMethod=zalopay`
};

        // Tạo MAC signature
        const dataStr = `${orderData.app_id}|${orderData.app_trans_id}|${orderData.app_user}|${orderData.amount}|${orderData.app_time}|${orderData.embed_data}|${orderData.item}`;
        orderData.mac = CryptoJS.HmacSHA256(dataStr, config.key1).toString();

        console.log("ZaloPay request data:", orderData);

        const zaloRes = await axios.post(config.endpoint, null, { params: orderData });

        console.log("ZaloPay response:", zaloRes.data);

        order.zalopayTransId = app_trans_id;
        await order.save();

        setTimeout(async () => {
    try {
        const orderToUpdate = await Order.findOne({ zalopayTransId: app_trans_id });
        if (orderToUpdate && !orderToUpdate.isPaid) {
            orderToUpdate.isPaid = true;
            orderToUpdate.paidAt = Date.now();
            orderToUpdate.paymentResult = {
                id: "demo_zp_trans_" + Date.now(),
                status: "paid_zalopay",
                update_time: Date.now()
            };
            orderToUpdate.status = "paid_online";
            orderToUpdate.statusHistory.push({
                status: "paid_online",
                note: "Thanh toán ZaloPay thành công (mô phỏng)",
                date: Date.now()
            });
            await orderToUpdate.save();
            console.log(`✅ Đơn hàng ${orderToUpdate._id} đã được đánh dấu thanh toán thành công (mô phỏng)`);
        }
    } catch (error) {
        console.error("Lỗi mô phỏng callback:", error);
    }
}, 3000);

res.json({
    order_url: zaloRes.data.order_url,
    app_trans_id: app_trans_id,
    zaloRes: zaloRes.data,
    message: "QR ZaloPay đã tạo thành công! Đơn hàng sẽ tự động thanh toán sau 3 giây (demo).",
    redirect_url: `http://localhost:5173/checkout/success?orderId=${order._id}&paymentMethod=zalopay`
});
    } catch (error) {
        console.error("ZaloPay error:", error?.response?.data || error.message);
        res.status(500).json({ 
            message: "Lỗi tạo thanh toán ZaloPay",
            error: error?.response?.data || error.message 
        });
    }
};

export const zaloPayCallback = async (req, res) => {
    try {
        const { app_trans_id, zp_trans_id, status } = req.body;
        
        console.log("ZaloPay callback:", req.body);

        
        if (status == 1) { // Thanh toán thành công
            const order = await Order.findOne({ zalopayTransId: app_trans_id });
            if (order) {
                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentResult = {
                    id: zp_trans_id,
                    status: "paid_zalopay",
                    update_time: Date.now()
                };
                order.status = "paid_online";
                order.statusHistory.push({
                    status: "paid_online",
                    note: "Thanh toán ZaloPay thành công",
                    date: Date.now()
                });
                await order.save();
                console.log("Đã cập nhật trạng thái đơn hàng:", order._id);
            }
        }
        
        res.json({ return_code: 1, return_message: "OK" });
    } catch (error) {
        console.error("ZaloPay callback error:", error);
        res.status(500).json({ return_code: -1, return_message: error.message });
    }
};