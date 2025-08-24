import moment from 'moment';
import qs from 'qs';
import crypto from 'crypto';
import Order from '../models/Order.js';
import { confirmOrderAfterPayment } from './order.js';

// Cấu hình VNPAY TEST
const vnp_TmnCode = process.env.VNPAY_TMN_CODE || 'DLWG4Y9A';
const vnp_HashSecret = process.env.VNPAY_SECRET_KEY || 'JELZJE3OGH11BLLHD8TWSSZR8T4806MS';
const vnp_Url = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const vnp_ReturnUrl = process.env.VNPAY_RETURN_URL || 'http://localhost:5173/checkout/success';

export const createVnpayPayment = async (req, res) => {
    try {
        const { amount, orderId, orderInfo, redirectUrl } = req.body;
        if (!amount || !orderId) {
            return res.status(400).json({ payUrl: null, message: 'Thiếu thông tin số tiền hoặc mã đơn hàng.' });
        }
        const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');
        const orderRef = orderId || moment(date).format('DDHHmmss');
        let vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode,
            vnp_Locale: 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: orderRef,
            vnp_OrderInfo: orderInfo || `Thanh toan cho ma GD:${orderRef}`,
            vnp_OrderType: 'other',
            vnp_Amount: amount * 100,
            vnp_ReturnUrl: redirectUrl || vnp_ReturnUrl,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: createDate
        };
        vnp_Params = sortObject(vnp_Params);
        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac('sha512', vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        vnp_Params['vnp_SecureHash'] = signed;
        const paymentUrl = vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false });
        
        // ✅ Lưu thông tin VNPay vào đơn hàng
        try {
            const order = await Order.findById(orderId);
            if (order) {
                order.vnpayTransId = orderRef;
                order.paymentStatus = 'awaiting_payment';
                order.status = 'draft';
                await order.save();
                console.log(`✅ Updated order ${orderId} with VNPay transaction ID: ${orderRef}`);
            }
        } catch (orderError) {
            console.error('❌ Error updating order with VNPay info:', orderError);
        }
        
        res.json({ payUrl: paymentUrl });
    } catch (error) {
        console.error('VNPAY payment error:', error);
        res.status(500).json({ payUrl: null, message: 'Lỗi tạo thanh toán VNPAY', error: error.message });
    }
};

function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    for (let key of keys) {
        sorted[key] = obj[key];
    }
    return sorted;
}

// ✅ VNPay Webhook/Callback Handler
export const vnpayCallback = async (req, res) => {
    console.log("🔔 ========== VNPAY CALLBACK START ==========");
    console.log("📥 Request query:", req.query);
    
    try {
        const {
            vnp_TxnRef,
            vnp_Amount,
            vnp_OrderInfo,
            vnp_ResponseCode,
            vnp_TransactionNo,
            vnp_BankCode,
            vnp_PayDate,
            vnp_SecureHash
        } = req.query;

        // ✅ Verify signature
        const secretKey = vnp_HashSecret;
        const signData = qs.stringify(req.query, { encode: false });
        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        
        console.log("🔐 VNPay signature verification:", {
            received: vnp_SecureHash,
            calculated: signed,
            match: vnp_SecureHash === signed
        });

        if (vnp_SecureHash !== signed) {
            console.error("❌ VNPay signature verification failed");
            return res.json({ RspCode: '97', Message: 'Invalid signature' });
        }

        // ✅ Find order by transaction reference
        const order = await Order.findOne({ vnpayTransId: vnp_TxnRef });
        
        if (!order) {
            console.error(`❌ Order not found for VNPay transaction: ${vnp_TxnRef}`);
            return res.json({ RspCode: '01', Message: 'Order not found' });
        }

        console.log(`🔍 BEFORE UPDATE - Order ${order._id}:`, {
            status: order.status,
            isPaid: order.isPaid,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod
        });

        // ✅ Process payment result
        if (vnp_ResponseCode === '00') {
            // ✅ Payment successful
            try {
                await confirmOrderAfterPayment(order._id, {
                    id: vnp_TransactionNo || vnp_TxnRef,
                    status: 'success',
                    method: 'vnpay',
                    update_time: new Date(),
                    vnp_transaction_no: vnp_TransactionNo,
                    vnp_bank_code: vnp_BankCode,
                    vnp_pay_date: vnp_PayDate,
                    amount: parseInt(vnp_Amount) / 100
                });
                
                console.log(`🎉 VNPay payment confirmed successfully for order ${order._id}`);
                
                // ✅ Check order after update
                const updatedOrder = await Order.findById(order._id);
                console.log(`🔍 AFTER UPDATE - Order ${updatedOrder._id}:`, {
                    status: updatedOrder.status,
                    isPaid: updatedOrder.isPaid,
                    paymentStatus: updatedOrder.paymentStatus,
                    paymentMethod: updatedOrder.paymentMethod
                });
                
            } catch (confirmError) {
                console.error("❌ Error confirming VNPay payment:", confirmError);
            }
        } else {
            // ❌ Payment failed
            console.log(`❌ VNPay payment failed for order ${order._id}, response code: ${vnp_ResponseCode}`);
            
            try {
                order.status = 'cancelled';
                order.paymentStatus = 'failed';
                order.isPaid = false;
                order.statusHistory.push({
                    status: 'cancelled',
                    note: `VNPay payment failed: ${vnp_ResponseCode}`,
                    date: Date.now(),
                });
                await order.save();
            } catch (updateError) {
                console.error("❌ Error updating failed VNPay order:", updateError);
            }
        }
        
        // ✅ Return success response to VNPay
        res.json({ RspCode: '00', Message: 'Confirm Success' });
        
    } catch (error) {
        console.error('❌ VNPay callback error:', error);
        res.json({ RspCode: '99', Message: 'Unknown error' });
    }
};

// ✅ VNPay Status Check API
export const checkVnpayStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        
        if (!order || !order.vnpayTransId) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng VNPay" });
        }

        // ✅ Query VNPay transaction status
        const vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'querydr',
            vnp_TmnCode: vnp_TmnCode,
            vnp_TxnRef: order.vnpayTransId,
            vnp_OrderInfo: `Query transaction ${order.vnpayTransId}`,
            vnp_TransDate: moment().format('YYYYMMDDHHmmss'),
            vnp_CreateDate: moment().format('YYYYMMDDHHmmss')
        };

        vnp_Params.vnp_SecureHash = crypto
            .createHmac('sha512', vnp_HashSecret)
            .update(qs.stringify(sortObject(vnp_Params), { encode: false }))
            .digest('hex');

        const queryUrl = 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction';
        const queryData = qs.stringify(vnp_Params);

        const response = await fetch(queryUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: queryData
        });

        const result = await response.text();
        const parsedResult = qs.parse(result);

        console.log("VNPay status check result:", parsedResult);

        // ✅ If VNPay reports success but order not updated
        if (parsedResult.vnp_ResponseCode === '00' && !order.isPaid) {
            await confirmOrderAfterPayment(order._id, {
                id: parsedResult.vnp_TransactionNo || order.vnpayTransId,
                status: 'success',
                method: 'vnpay',
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
            vnpay_status: parsedResult
        });

    } catch (error) {
        console.error('VNPay status check error:', error);
        res.status(500).json({ message: "Lỗi kiểm tra VNPay", error: error.message });
    }
};