import express from "express";
import axios from "axios";
import moment from "moment";
import { confirmOrderAfterPayment } from "./order.js";
import { handlePaymentFailed } from "./order.js";
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
    console.log("Creating ZaloPay order for:", orderId);
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      console.error("Order not found:", orderId);
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    console.log("Order found:", order._id, "status:", order.status, "paymentMethod:", order.paymentMethod);

    // ✅ SỬA LOGIC KIỂM TRA - CHO PHÉP CẬP NHẬT PAYMENT METHOD
    if (order.status === 'pending' && order.paymentMethod === 'COD') {
      // Cập nhật phương thức thanh toán từ COD sang ZaloPay
      order.paymentMethod = 'zalopay';
      order.status = 'draft';
      order.paymentStatus = 'awaiting_payment';
      await order.save();
      console.log("✅ Updated order: COD -> ZaloPay, pending -> draft");
    } else if (order.status !== 'draft' && order.paymentMethod !== 'zalopay') {
      console.error("Invalid order for ZaloPay:", {
        status: order.status,
        paymentMethod: order.paymentMethod
      });
      return res.status(400).json({ 
        message: `Đơn hàng không phù hợp cho ZaloPay. Status: ${order.status}, PaymentMethod: ${order.paymentMethod}` 
      });
    }

    // Tiếp tục tạo ZaloPay order...
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
  callback_url: "https://81d517e947da.ngrok-free.app/api/order/zalo-pay/callback",
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

    // Lưu transaction ID để theo dõi
    order.zalopayTransId = app_trans_id;
    order.paymentStatus = 'awaiting_payment';
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

export const zalopayCallback = async (req, res) => {
  let result = {};
  
  console.log("🔔 ========== ZALOPAY CALLBACK START ==========");
  console.log("📥 Request body:", req.body);
  
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log("⚠️ Empty request body - returning test response");
      return res.json({ 
        return_code: 1, 
        return_message: "callback endpoint working",
        timestamp: new Date().toISOString(),
        test: true
      });
    }
    
    let dataStr = req.body.data;
    let reqMac = req.body.mac;
    
    let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
    console.log("🔐 MAC verification:", { 
      received: reqMac, 
      calculated: mac, 
      match: reqMac === mac 
    });
    
    if (reqMac !== mac) {
      console.error("❌ ZaloPay MAC verification failed");
      result.return_code = -1;
      result.return_message = "mac not equal";
    } else {
      let dataJson = JSON.parse(dataStr);
      console.log("✅ ZaloPay callback data:", dataJson);
      
      const order = await Order.findOne({
        zalopayTransId: dataJson["app_trans_id"],
      });
      
      if (order) {
        console.log(`🔍 BEFORE UPDATE - Order ${order._id}:`, {
          status: order.status,
          isPaid: order.isPaid,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod
        });

        // ✅ CHỈ GỌI confirmOrderAfterPayment - BỎ PHẦN MANUAL UPDATE
        await confirmOrderAfterPayment(order._id, {
          id: dataJson["zp_trans_id"],
          status: 'success',
          method: 'zalopay',
          update_time: new Date(),
          app_trans_id: dataJson["app_trans_id"],
          amount: dataJson["amount"]
        });
        
        console.log(`🎉 ZaloPay callback completed successfully for order ${order._id}`);
        
      } else {
        console.error(`❌ Order not found for ZaloPay transaction: ${dataJson["app_trans_id"]}`);
      }
      
      result.return_code = 1;
      result.return_message = "success";
    }
  } catch (ex) {
    console.error('❌ ZaloPay callback error:', ex);
    result.return_code = 0;
    result.return_message = ex.message;
  }
  
  console.log("📤 ZaloPay callback response:", result);
  console.log("🔔 ========== ZALOPAY CALLBACK END ==========");
  
  res.json(result);
};
// Hàm kiểm tra trạng thái thanh toán ZaloPay
export const checkZaloPayStatus = async (req, res) => {
  try {
    const { app_trans_id } = req.params;
    
    const postData = {
      app_id: config.app_id,
      app_trans_id: app_trans_id,
    };

    const data = postData.app_id + "|" + postData.app_trans_id + "|" + config.key1;
    postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    const postConfig = {
      method: 'post',
      url: 'https://sb-openapi.zalopay.vn/v2/query',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: new URLSearchParams(postData).toString()
    };

    const result = await axios(postConfig);
    console.log("ZaloPay status check result:", result.data);

    // Tìm đơn hàng trong database
    const order = await Order.findOne({ zalopayTransId: app_trans_id });
    
    if (!order) {
      return res.status(404).json({ 
        message: "Không tìm thấy đơn hàng",
        zalopay_status: result.data 
      });
    }

    // Nếu ZaloPay báo thành công nhưng đơn hàng chưa được cập nhật
    if (result.data.return_code === 1 && order.status === 'draft') {
      const { confirmOrderAfterPayment } = await import('./order.js');
      
      await confirmOrderAfterPayment(order._id, {
        id: result.data.zp_trans_id,
        status: 'success',
        method: 'zalopay',
        update_time: Date.now(),
        app_trans_id: app_trans_id
      });
      
      console.log('✅ Đã đồng bộ trạng thái đơn hàng ZaloPay:', order._id);
    }

    res.json({
      order_status: order.status,
      payment_status: order.paymentStatus,
      zalopay_status: result.data,
      message: "Kiểm tra trạng thái thành công"
    });

  } catch (error) {
    console.error("Lỗi kiểm tra trạng thái ZaloPay:", error);
    res.status(500).json({
      message: "Lỗi kiểm tra trạng thái thanh toán",
      error: error.message
    });
  }
};

// Hàm xử lý khi user hủy thanh toán (được gọi từ frontend)
export const cancelZaloPayPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // ✅ XÓA ĐƠN HÀNG THAY VÌ CẬP NHẬT TRẠNG THÁI
    await Order.findByIdAndDelete(orderId);
    console.log(`🗑️ Đã xóa đơn hàng ZaloPay bị hủy: ${orderId}`);
    
    res.json({ 
      message: "Đã xóa đơn hàng do hủy thanh toán ZaloPay" 
    });
  } catch (error) {
    console.error("Lỗi hủy thanh toán ZaloPay:", error);
    res.status(500).json({ 
      message: "Lỗi xử lý hủy thanh toán", 
      error: error.message 
    });
  }
};