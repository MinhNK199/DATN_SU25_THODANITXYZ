import moment from 'moment';
import qs from 'qs';
import crypto from 'crypto';

// Cấu hình VNPAY TEST
const vnp_TmnCode = 'DLWG4Y9A';
const vnp_HashSecret = 'JELZJE3OGH11BLLHD8TWSSZR8T4806MS';
const vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const vnp_ReturnUrl = 'http://localhost:5173/checkout/success'; // Đảm bảo đúng domain FE

export const createVnpayPayment = (req, res) => {
    try {
        const { amount, orderId, orderInfo, redirectUrl } = req.body;
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
        res.json({ payUrl: paymentUrl });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tạo thanh toán VNPAY', error: error.message });
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