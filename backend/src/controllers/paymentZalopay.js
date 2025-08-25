import express from "express";
import axios from "axios";
import moment from "moment";
import { confirmOrderAfterPayment } from "./order.js";
import { handlePaymentFailed } from "./order.js";
import CryptoJS from "crypto-js";
import Order from "../models/Order.js";

const config = {
  app_id:  "2553",
  key1:  "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
  key2:  "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
  endpoint:  "https://sb-openapi.zalopay.vn/v2/create",
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
    } else if (order.status !== 'draft' && order.status !== 'pending') {
      console.error("Invalid order status for ZaloPay:", order.status);
      return res.status(400).json({ 
        message: `Đơn hàng không phù hợp cho ZaloPay. Status: ${order.status}` 
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
      callback_url:  "https://5da33d70ec21.ngrok-free.app/api/order/zalo-pay/callback",
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
    order.status = 'draft'; // Đảm bảo status là draft
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
  console.log("🔔 ========== ZALOPAY CALLBACK START ==========");
  console.log("📥 Request body:", req.body);
  
  try {
    // ✅ Validate callback data
    if (!req.body?.data || !req.body?.mac) {
      console.log("⚠️ Invalid callback data - missing required fields");
      return res.json({ 
        return_code: -1, 
        return_message: "Invalid callback data",
      });
    }
    
    // ✅ Verify MAC signature
    const dataStr = req.body.data;
    const reqMac = req.body.mac;
    const mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
    
    console.log("🔐 MAC verification:", { 
      received: reqMac, 
      calculated: mac, 
      match: reqMac === mac 
    });
    
    if (reqMac !== mac) {
      console.error("❌ ZaloPay MAC verification failed");
      return res.json({ 
        return_code: -1, 
        return_message: "mac not equal" 
      });
    }
    
    // ✅ Parse callback data
    const dataJson = JSON.parse(dataStr);
    console.log("✅ ZaloPay callback data:", dataJson);
    
    // ✅ Find order by transaction ID
    const order = await Order.findOne({
      zalopayTransId: dataJson.app_trans_id,
    });
    
    if (!order) {
      console.error(`❌ Order not found for ZaloPay transaction: ${dataJson.app_trans_id}`);
      return res.json({ 
        return_code: 1, 
        return_message: "success" 
      });
    }
    
    console.log(`🔍 BEFORE UPDATE - Order ${order._id}:`, {
      status: order.status,
      isPaid: order.isPaid,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod
    });

    // ✅ Process payment result
    if (dataJson.return_code === 1) {
      // ✅ Payment successful
      await confirmOrderAfterPayment(order._id, {
        id: dataJson.zp_trans_id || dataJson.app_trans_id,
        status: 'success',
        method: 'zalopay',
        update_time: new Date(),
        app_trans_id: dataJson.app_trans_id,
        amount: dataJson.amount
      });
      
      console.log(`🎉 ZaloPay payment confirmed successfully for order ${order._id}`);
    } else {
      // ❌ Payment failed
      console.log(`❌ ZaloPay payment failed for order ${order._id}, return_code: ${dataJson.return_code}`);
      
      order.status = 'cancelled';
      order.paymentStatus = 'failed';
      order.isPaid = false;
      order.statusHistory.push({
        status: 'cancelled',
        note: `ZaloPay payment failed: ${dataJson.return_code}`,
        date: Date.now(),
      });
      await order.save();
    }
    
    // ✅ Check order after update
    const updatedOrder = await Order.findById(order._id);
    console.log(`🔍 AFTER UPDATE - Order ${updatedOrder._id}:`, {
      status: updatedOrder.status,
      isPaid: updatedOrder.isPaid,
      paymentStatus: updatedOrder.paymentStatus,
      paymentMethod: updatedOrder.paymentMethod
    });
    
    console.log("🔔 ========== ZALOPAY CALLBACK END ==========");
    res.json({ return_code: 1, return_message: "success" });
    
  } catch (error) {
    console.error('❌ ZaloPay callback error:', error);
    res.json({ 
      return_code: 0, 
      return_message: error.message 
    });
  }
};

// ✅ HÀM KIỂM TRA TRẠNG THÁI VÀ ĐỒNG BỘ
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

    // ✅ NẾU ZALOPAY BÁO THÀNH CÔNG NHƯNG ĐƠN HÀNG CHƯA CẬP NHẬT
    if (result.data.return_code === 1 && !order.isPaid) {
      console.log('🔄 Syncing ZaloPay payment status for order:', order._id);
      
      await confirmOrderAfterPayment(order._id, {
        id: result.data.zp_trans_id || app_trans_id,
        status: 'success',
        method: 'zalopay',
        update_time: new Date(),
        app_trans_id: app_trans_id,
        amount: result.data.amount
      });
      
      console.log('✅ Đã đồng bộ trạng thái đơn hàng ZaloPay:', order._id);
      
      // Lấy lại order sau khi cập nhật
      const updatedOrder = await Order.findById(order._id);
      
      return res.json({
        order_status: updatedOrder.status,
        payment_status: updatedOrder.paymentStatus,
        isPaid: updatedOrder.isPaid,
        zalopay_status: result.data,
        message: "Đã đồng bộ trạng thái thanh toán thành công",
        synced: true
      });
    }

    res.json({
      order_status: order.status,
      payment_status: order.paymentStatus,
      isPaid: order.isPaid,
      zalopay_status: result.data,
      message: "Kiểm tra trạng thái thành công",
      synced: false
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
export const checkZaloPayStatusByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    
    if (!order || !order.zalopayTransId) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng ZaloPay" });
    }

    // ✅ Query ZaloPay transaction status
    const postData = {
      app_id: config.app_id,
      app_trans_id: order.zalopayTransId,
    };

    const data = postData.app_id + "|" + postData.app_trans_id + "|" + config.key1;
    postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    const result = await axios.post('https://sb-openapi.zalopay.vn/v2/query', 
      new URLSearchParams(postData).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    console.log("ZaloPay status check result:", result.data);

    // ✅ If ZaloPay reports success but order not updated
    if (result.data.return_code === 1 && !order.isPaid) {
      await confirmOrderAfterPayment(order._id, {
        id: result.data.zp_trans_id || order.zalopayTransId,
        status: 'success',
        method: 'zalopay',
        update_time: new Date(),
      });
      
      const updatedOrder = await Order.findById(order._id);
      return res.json({
        synced: true,
        order_status: updatedOrder.status,
        isPaid: updatedOrder.isPaid,
      });
    }

    res.json({
      synced: false,
      order_status: order.status,
      isPaid: order.isPaid,
      zalopay_status: result.data
    });

  } catch (error) {
    console.error('ZaloPay status check error:', error);
    res.status(500).json({ message: "Lỗi kiểm tra ZaloPay", error: error.message });
  }
};