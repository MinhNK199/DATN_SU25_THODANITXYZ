import moment from 'moment';
import crypto from 'crypto';
import Order from '../models/Order.js';
import { confirmOrderAfterPayment } from './order.js';

// Cấu hình VNPAY
const vnp_TmnCode = process.env.VNP_TMN_CODE || 'DLWG4Y9A';
const vnp_HashSecret = process.env.VNP_HASH_SECRET || 'JELZJE3OGH11BLLHD8TWSSZR8T4806MS';
const vnp_Url = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const vnp_ReturnUrl = process.env.VNP_RETURN_URL || 'http://localhost:8000/api/payment/vnpay/callback';

// Tạo chữ ký VNPAY
function createVnpaySignature(params, secretKey) {
    const sortedKeys = Object.keys(params).sort();
    const signData = sortedKeys
        .map(key => `${key}=${encodeURIComponent(params[key]).replace(/%20/g, '+')}`)
        .join('&');
    const hmac = crypto.createHmac('sha512', secretKey);
    return hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
}

// Tạo URL thanh toán VNPAY
export const createVnpayPayment = async (req, res) => {
    try {
        const { amount, orderId, orderInfo } = req.body;
        
        if (!amount || !orderId) {
            return res.status(400).json({ 
                payUrl: null, 
                message: 'Thiếu thông tin số tiền hoặc mã đơn hàng.' 
            });
        }

        const vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: vnp_TmnCode,
            vnp_Locale: 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: orderId,
            vnp_OrderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
            vnp_OrderType: 'other',
            vnp_Amount: amount * 100,
            vnp_ReturnUrl: `${process.env.CLIENT_URL || 'http://localhost:8000'}/api/payment/vnpay/callback`,
            vnp_IpAddr: req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1',
            vnp_CreateDate: moment(new Date()).format('YYYYMMDDHHmmss'),
            vnp_ExpireDate: moment(new Date()).add(15, 'minutes').format('YYYYMMDDHHmmss')
        };

        console.log("🔧 VNPAY Parameters:");
        console.log("   📋 vnp_ReturnUrl:", vnp_Params.vnp_ReturnUrl);
        console.log("   📋 vnp_TxnRef:", vnp_Params.vnp_TxnRef);
        console.log("   💰 vnp_Amount:", vnp_Params.vnp_Amount);

        const signature = createVnpaySignature(vnp_Params, vnp_HashSecret);

        const sortedKeys = Object.keys(vnp_Params).sort();
        const queryString = sortedKeys
            .map(key => `${key}=${encodeURIComponent(vnp_Params[key]).replace(/%20/g, '+')}`)
            .join('&') + `&vnp_SecureHash=${signature}`;
        
        const paymentUrl = `${vnp_Url}?${queryString}`;

        // Log để debug
        console.log("🔐 VNPAY Payment Created:");
        console.log("   📋 Order ID:", orderId);
        console.log("   💰 Amount:", amount, "VND");
        console.log("   ✍️ Signature:", signature);
        console.log("   🔗 Payment URL:", paymentUrl);
        console.log("   📏 URL Length:", paymentUrl.length);

        // Cập nhật order
        try {
            const order = await Order.findById(orderId);
            if (order) {
                console.log("💾 Updating order before VNPAY payment:");
                console.log("   📋 Order ID:", order._id);
                console.log("   🔑 Setting vnpayTransId to:", orderId);
                console.log("   💳 Current paymentStatus:", order.paymentStatus);
                console.log("   📊 Current status:", order.status);
                
                order.vnpayTransId = orderId;
                order.paymentStatus = 'awaiting_payment';
                order.status = 'draft';
                await order.save();
                
                console.log("✅ Order updated successfully:");
                console.log("   🔑 vnpayTransId set to:", order.vnpayTransId);
                console.log("   💳 paymentStatus updated to:", order.paymentStatus);
                console.log("   📊 status updated to:", order.status);
            } else {
                console.error("❌ Order not found for ID:", orderId);
            }
        } catch (orderError) {
            console.error('❌ Error updating order:', orderError);
        }

        res.json({ payUrl: paymentUrl });
        
        // Log response
        console.log("📤 Response sent to frontend:");
        console.log("   📤 Status: 200");
        console.log("   📤 Response body:", JSON.stringify({ payUrl: paymentUrl }));
        console.log("   📤 Response body length:", JSON.stringify({ payUrl: paymentUrl }).length);
        
    } catch (error) {
        console.error('VNPAY payment error:', error);
        res.status(500).json({ 
            payUrl: null, 
            message: 'Lỗi tạo thanh toán VNPAY', 
            error: error.message 
        });
    }
};

// Xử lý callback từ VNPAY
export const vnpayCallback = async (req, res) => {
    try {
        console.log("🔄 VNPAY Callback received:");
        console.log("   📋 Query params:", req.query);
        console.log("   📋 Headers:", req.headers);

        const {
            vnp_TxnRef,
            vnp_Amount,
            vnp_ResponseCode,
            vnp_TransactionNo,
            vnp_BankCode,
            vnp_PayDate,
            vnp_SecureHash
        } = req.query;

        console.log("🔍 VNPAY Callback details:");
        console.log("   📋 TxnRef:", vnp_TxnRef);
        console.log("   💰 Amount:", vnp_Amount);
        console.log("   ✅ ResponseCode:", vnp_ResponseCode);
        console.log("   🆔 TransactionNo:", vnp_TransactionNo);
        console.log("   🏦 BankCode:", vnp_BankCode);
        console.log("   📅 PayDate:", vnp_PayDate);
        console.log("   🔑 SecureHash:", vnp_SecureHash);

        // Xác thực chữ ký
        const decodedParams = {};
        for (const key in req.query) {
            if (key !== 'vnp_SecureHash') {
                decodedParams[key] = decodeURIComponent(req.query[key].replace(/\+/g, '%20'));
            }
        }
        
        console.log("🔐 Signature verification:");
        console.log("   📋 Decoded params:", decodedParams);
        
        const calculatedHash = createVnpaySignature(decodedParams, vnp_HashSecret);
        console.log("   ✍️ Calculated hash:", calculatedHash);
        console.log("   🔑 Received hash:", vnp_SecureHash);
        console.log("   ✅ Hash match:", vnp_SecureHash === calculatedHash);
        
        if (vnp_SecureHash !== calculatedHash) {
            console.error('❌ VNPAY signature verification failed');
            console.error('   Expected:', calculatedHash);
            console.error('   Received:', vnp_SecureHash);
            return res.status(400).send(`
                <html>
                <head><title>VNPay Payment Error</title></head>
                <body>
                    <h1>Lỗi xác thực chữ ký VNPAY</h1>
                    <p>Mã lỗi: 97</p>
                    <p>Thông báo: Invalid signature</p>
                    <script>
                        setTimeout(() => {
                            window.location.href = '${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout/failed?error=signature_error';
                        }, 3000);
                    </script>
                </body>
                </html>
            `);
        }

        // Tìm order
        console.log("🔍 Looking for order with vnpayTransId:", vnp_TxnRef);
        
        // Thử tìm bằng vnpayTransId trước
        let order = await Order.findOne({ vnpayTransId: vnp_TxnRef });
        console.log("   🔍 Order found by vnpayTransId:", order ? "YES" : "NO");
        
        // Nếu không tìm thấy, thử tìm bằng _id (vì vnp_TxnRef = orderId)
        if (!order) {
            console.log("   🔍 Order not found by vnpayTransId, trying by _id...");
            order = await Order.findById(vnp_TxnRef);
            console.log("   🔍 Order found by _id:", order ? "YES" : "NO");
        }
        
        if (!order) {
            console.error(`❌ Order not found for VNPay transaction: ${vnp_TxnRef}`);
            console.error("   🔍 Searched in database for:");
            console.error("      - vnpayTransId:", vnp_TxnRef);
            console.error("      - _id:", vnp_TxnRef);
            
            // Log tất cả orders để debug
            const allOrders = await Order.find({}).limit(5);
            console.log("   🔍 Recent orders in database:", allOrders.map(o => ({ 
                id: o._id, 
                vnpayTransId: o.vnpayTransId, 
                status: o.status,
                paymentStatus: o.paymentStatus 
            })));
            
            // Thử tìm order bằng các cách khác
            console.log("   🔍 Trying alternative search methods...");
            const orderByStatus = await Order.findOne({ status: 'draft', paymentStatus: 'awaiting_payment' });
            console.log("   🔍 Order with draft status:", orderByStatus ? "YES" : "NO");
            
            return res.status(404).send(`
                <html>
                <head><title>VNPay Payment Error</title></head>
                <body>
                    <h1>Không tìm thấy đơn hàng</h1>
                    <p>Mã lỗi: 01</p>
                    <p>Thông báo: Order not found</p>
                    <script>
                        setTimeout(() => {
                            window.location.href = '${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout/failed?error=order_not_found';
                        }, 3000);
                    </script>
                </body>
                </html>
            `);
        }

        console.log("✅ Order found:", order._id);
        console.log("   📋 Order status:", order.status);
        console.log("   💳 Payment status:", order.paymentStatus);

        // Xử lý kết quả thanh toán
        if (vnp_ResponseCode === '00') {
            console.log("🎉 VNPAY payment successful (ResponseCode: 00)");
            
            // Thanh toán thành công
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
                
                console.log(`✅ VNPay payment confirmed successfully for order ${order._id}`);

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
                    console.log('📡 Emitted payment update event for VNPay payment');
                }
                
            } catch (confirmError) {
                console.error("❌ Error confirming VNPay payment:", confirmError);
            }

            // Redirect về trang thành công
            console.log("🔄 Redirecting to success page...");
            return res.send(`
                <html>
                <head><title>VNPay Payment Success</title></head>
                <body>
                    <h1>Thanh toán VNPAY thành công!</h1>
                    <p>Mã giao dịch: ${vnp_TransactionNo || vnp_TxnRef}</p>
                    <p>Đơn hàng: ${order._id}</p>
                    <script>
                        setTimeout(() => {
                            window.location.href = '${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout/success?orderId=${order._id}&paymentMethod=vnpay&vnp_ResponseCode=${vnp_ResponseCode}&vnp_Amount=${vnp_Amount}&vnp_TransactionNo=${vnp_TransactionNo || vnp_TxnRef}&vnp_BankCode=${vnp_BankCode || ''}&vnp_PayDate=${vnp_PayDate || ''}';
                        }, 2000);
                    </script>
                </body>
                </html>
            `);
            
        } else {
            console.log(`❌ VNPAY payment failed (ResponseCode: ${vnp_ResponseCode})`);
            
            // Thanh toán thất bại
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
                console.log("✅ Order updated to failed status");
            } catch (updateError) {
                console.error("❌ Error updating failed VNPay order:", updateError);
            }
            
            // Redirect về trang thất bại
            console.log("🔄 Redirecting to failed page...");
            return res.send(`
                <html>
                <head><title>VNPay Payment Failed</title></head>
                <body>
                    <h1>Thanh toán VNPAY thất bại!</h1>
                    <p>Mã lỗi: ${vnp_ResponseCode}</p>
                    <p>Đơn hàng: ${order._id}</p>
                    <script>
                        setTimeout(() => {
                            window.location.href = '${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout/failed?orderId=${order._id}&paymentMethod=vnpay&error=payment_failed&code=${vnp_ResponseCode}';
                        }, 2000);
                    </script>
                </body>
                </html>
            `);
        }
        
    } catch (error) {
        console.error('❌ VNPAY callback error:', error);
        res.status(500).send(`
            <html>
            <head><title>VNPay Payment Error</title></head>
            <body>
                <h1>Lỗi xử lý thanh toán VNPAY</h1>
                <p>Mã lỗi: 99</p>
                <p>Thông báo: Unknown error</p>
                <script>
                    setTimeout(() => {
                        window.location.href = '${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout/failed?error=unknown_error';
                    }, 3000);
                </script>
            </body>
            </html>
        `);
    }
};

// Kiểm tra trạng thái thanh toán VNPAY
export const checkVnpayStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        res.json({
            orderId: order._id,
            status: order.status,
            paymentStatus: order.paymentStatus,
            isPaid: order.isPaid,
            vnpayTransId: order.vnpayTransId
        });
        
    } catch (error) {
        console.error('Error checking VNPAY status:', error);
        res.status(500).json({ message: 'Error checking payment status' });
    }
};

// Test VNPAY signature (chỉ để debug)
export const testVnpaySignature = async (req, res) => {
    try {
        const { params } = req.body;
        if (!params) {
            return res.status(400).json({ message: "Thiếu parameters để test" });
        }
        
        const signature = createVnpaySignature(params, vnp_HashSecret);
        
        res.json({
            success: true,
            originalParams: params,
            signature: signature
        });
        
    } catch (error) {
        console.error('Test VNPAY signature error:', error);
        res.status(500).json({ message: 'Error testing signature' });
    }
};
