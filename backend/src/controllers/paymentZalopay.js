import express from "express";
import axios from "axios";
import moment from "moment";
import CryptoJS from "crypto-js";
import Order from "../models/Order.js";

const config = {
  app_id: "2553",
  key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
  key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
};

export const createZaloPayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
    const transID = Math.floor(Math.random() * 1000000);
    const app_trans_id = `${moment().format("YYMMDD")}_${transID}`;
    const items = [{}];
    const embed_data = {
      preferred_payment_method: [],
      redirecturl: `http://localhost:5173/checkout/success?orderId=${order._id}&paymentMethod=zalopay`,
    };
    const orderData = {
      app_id: config.app_id,
      app_trans_id,
      app_user: req.user._id.toString(),
      app_time: Date.now(),
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: Math.round(order.totalPrice),
      description: `TechTrend - Thanh toán cho đơn hàng #${order._id}`,
      bank_code: "",
      callback_url: "http://localhost:8000/api/payment/zalopay/callback",
    };
    const data =
      config.app_id +
      "|" +
      orderData.app_trans_id +
      "|" +
      orderData.app_user +
      "|" +
      orderData.amount +
      "|" +
      orderData.app_time +
      "|" +
      orderData.embed_data +
      "|" +
      orderData.item;

    orderData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    console.log("ZaloPay request data:", orderData);

    const zaloRes = await axios.post(config.endpoint, null, {
      params: orderData,
    });

    console.log("ZaloPay response:", zaloRes.data);

    order.zalopayTransId = app_trans_id;
    await order.save();
    res.status(200).json({
      data: zaloRes.data,
      app_trans_id: app_trans_id,
      message: "Tạo đơn hàng ZaloPay thành công",
    });
  } catch (error) {
    console.error("ZaloPay error:", error?.response?.data || error.message);
    res.status(500).json({
      message: "Lỗi tạo thanh toán ZaloPay",
      error: error?.response?.data || error.message,
    });
  }
};

export const zaloPayCallback = async (req, res) => {
  let result = {};

  try {
    let dataStr = req.body.data;
    let reqMac = req.body.mac;

    let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
    console.log("mac =", mac);

    if (reqMac !== mac) {
      result.return_code = -1;
      result.return_message = "mac not equal";
    } else {
      let dataJson = JSON.parse(dataStr);
      console.log(
        "update order's status = success where app_trans_id =",
        dataJson["app_trans_id"]
      );

      const order = await Order.findOne({
        zalopayTransId: dataJson["app_trans_id"],
      });
      if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: dataJson["zp_trans_id"],
          status: "paid_zalopay",
          update_time: Date.now(),
        };
        order.status = "paid_online";
        order.statusHistory.push({
          status: "paid_online",
          note: "Thanh toán ZaloPay thành công",
          date: Date.now(),
        });
        await order.save();
        console.log("Đã cập nhật trạng thái đơn hàng:", order._id);
      }

      result.return_code = 1;
      result.return_message = "success";
    }
  } catch (ex) {
    result.return_code = 0;
    result.return_message = ex.message;
  }
  res.json(result);
};
