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

        const app_trans_id = moment().format("YYMMDD") + "_" + Math.floor(Math.random() * 1000000);

        const items = [{
            itemid: "test",
            itemname: "test",
            itemprice: order.totalPrice,
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
            description: `Thanh toán đơn hàng #${order._id}`,
            bank_code: "zalopayapp",
            callback_url: "http://localhost:8000/api/payment/zalopay/callback"
        };

        const dataStr = `${orderData.app_id}|${orderData.app_trans_id}|${orderData.app_user}|${orderData.amount}|${orderData.app_time}|${orderData.embed_data}|${orderData.item}`;
        orderData.mac = CryptoJS.HmacSHA256(dataStr, config.key1).toString();
console.log("orderData gửi lên ZaloPay:", orderData);
        // Sửa lại cách gửi request: dùng params, body là null (chuẩn ZaloPay)
        const zaloRes = await axios.post(config.endpoint, null, { params: orderData });

        order.zalopayTransId = app_trans_id;
        await order.save();

        res.json({
            order_url: zaloRes.data.order_url,
            zaloTransId: app_trans_id,
            zaloRes: zaloRes.data
        });
    } catch (error) {
        console.error("ZaloPay error:", error?.response?.data || error.message);
        res.status(500).json({ message: error.message });
    }
};

// Nhận callback từ ZaloPay
export const zaloPayCallback = async (req, res) => {
    try {
        const { app_trans_id, zp_trans_id, status } = req.body;
        // TODO: xác thực chữ ký callback với key2 nếu cần

        if (status == 1) {
            const order = await Order.findOne({ zalopayTransId: app_trans_id });
            if (order) {
                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentResult = {
                    id: zp_trans_id,
                    status: "paid_zalopay",
                    update_time: Date.now()
                };
                await order.save();
            }
        }
        res.json({ return_code: 1, return_message: "OK" });
    } catch (error) {
        res.status(500).json({ return_code: -1, return_message: error.message });
    }
};