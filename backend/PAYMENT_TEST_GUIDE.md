# 🧪 Hướng dẫn Test Thanh toán Online (Sandbox)

## 📋 Tổng quan

Dự án đã tích hợp 3 phương thức thanh toán online với sandbox:
- **MoMo** - Ví điện tử MoMo
- **VNPay** - Cổng thanh toán VNPay  
- **ZaloPay** - Ví điện tử ZaloPay

## 🚀 Cài đặt và Cấu hình

### 1. Cài đặt Environment Variables

Copy file `env.example` thành `.env` và cập nhật các thông tin cần thiết:

```bash
cp env.example .env
```

### 2. Khởi động Backend

```bash
cd backend
npm install
npm start
```

### 3. Khởi động Frontend

```bash
cd frontend
npm install
npm run dev
```

## 💳 Thông tin Test Account

### MoMo Sandbox
- **Partner Code**: MOMO
- **Access Key**: F8BBA842ECF85
- **Secret Key**: K951B6PE1waDMi640xX08PD3vg6EkVlz
- **Test URL**: https://test-payment.momo.vn/v2/gateway/api/create

### VNPay Sandbox
- **TMN Code**: DLWG4Y9A
- **Hash Secret**: JELZJE3OGH11BLLHD8TWSSZR8T4806MS
- **Test URL**: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

### ZaloPay Sandbox
- **App ID**: 2553
- **Key1**: PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL
- **Key2**: kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz
- **Test URL**: https://sb-openapi.zalopay.vn/v2/create

## 🧪 Cách Test

### Bước 1: Đăng nhập
1. Truy cập: http://localhost:5173
2. Đăng nhập với tài khoản test
3. Thêm sản phẩm vào giỏ hàng

### Bước 2: Test Thanh toán

#### Test MoMo (Đã cải tiến theo chuẩn chính thức)
1. Chọn "Thanh toán qua MoMo" trong danh sách phương thức thanh toán
2. Click "Đặt hàng"
3. Sẽ chuyển hướng đến trang MoMo sandbox
4. **Test thành công**: Sử dụng thông tin test để thanh toán
5. **Test thất bại**: Thử thanh toán với số tiền lớn hơn số dư (sẽ báo thất bại)
6. **Mới**: Hỗ trợ QR Code, Deep Link, App Link, Xử lý thất bại, Xóa giỏ hàng tự động

#### Test MoMo với Official SDK
```bash
# Chạy test MoMo theo chuẩn chính thức
cd backend
node test-momo-official.cjs
```

#### Test MoMo với số tiền lớn
```bash
# Test thanh toán với số tiền lớn (21.6M VND)
cd backend
node test-momo-large-amount.cjs
```

#### Test VNPay
1. Chọn "Thanh toán qua VNPay"
2. Click "Đặt hàng"
3. Sẽ chuyển hướng đến trang VNPay sandbox
4. Sử dụng thông tin test để thanh toán

#### Test ZaloPay
1. Chọn "Thanh toán qua ZaloPay"
2. Click "Đặt hàng"
3. Sẽ hiển thị QR code
4. Quét QR code bằng app ZaloPay test

## 🔍 Kiểm tra Logs

### Backend Logs
```bash
# Theo dõi logs backend
cd backend
npm start
```

### Frontend Logs
```bash
# Mở Developer Tools (F12)
# Xem Console tab
```

## 📊 API Endpoints

### MoMo (Đã cải tiến)
- **Create Payment**: `POST /api/payment/momo/create`
- **Webhook**: `POST /api/payment/momo/webhook`
- **Check Status**: `GET /api/payment/momo/status/:orderId`
- **Features**: QR Code, Deep Link, App Link, Signature Verification

### VNPay
- **Create Payment**: `POST /api/payment/vnpay/create`

### ZaloPay
- **Create Payment**: `POST /api/order/zalo-pay`
- **Callback**: `POST /api/order/zalo-pay/callback`
- **Check Status**: `GET /api/order/zalo-pay/status/:app_trans_id`

## 🐛 Troubleshooting

### Lỗi thường gặp

#### 1. "Không lấy được link thanh toán"
- Kiểm tra cấu hình environment variables
- Kiểm tra logs backend
- Đảm bảo backend đang chạy

#### 2. "Callback không hoạt động"
- Kiểm tra URL callback có đúng không
- Đảm bảo backend có thể nhận request từ internet (có thể cần ngrok)

#### 3. "Thanh toán thành công nhưng đơn hàng không cập nhật"
- Kiểm tra webhook/callback logs
- Kiểm tra database connection
- Kiểm tra hàm `confirmOrderAfterPayment`

#### 4. "Thanh toán thất bại nhưng web vẫn báo thành công"
- Kiểm tra logic xử lý thất bại trong CheckoutSuccess
- Kiểm tra API endpoint `/api/payment/momo/status/:orderId`
- Đảm bảo webhook được gọi khi thanh toán thất bại

### Debug Commands

```bash
# Test MoMo API (Improved)
curl -X POST http://localhost:8000/api/payment/momo/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100000,
    "orderId": "test_order_123",
    "orderInfo": "Test payment",
    "redirectUrl": "http://localhost:5173/checkout/success",
    "ipnUrl": "http://localhost:8000/api/payment/momo/webhook",
    "extraData": ""
  }'

# Check MoMo Payment Status
curl -X GET http://localhost:8000/api/payment/momo/status/test_order_123

# Test VNPay API
curl -X POST http://localhost:8000/api/payment/vnpay/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100000,
    "orderId": "test_order_123",
    "orderInfo": "Test payment"
  }'

# Test ZaloPay API
curl -X POST http://localhost:8000/api/order/zalo-pay \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "orderId": "ORDER_ID_FROM_DATABASE"
  }'
```

## 📝 Ghi chú quan trọng

1. **Sandbox Mode**: Tất cả đều đang sử dụng sandbox, không có giao dịch thật
2. **Callback URL**: Cần đảm bảo callback URL có thể truy cập được từ internet
3. **Test Data**: Có thể test với số tiền từ 1,000 VND đến 50,000,000 VND
4. **Logs**: Luôn kiểm tra logs để debug khi có lỗi
5. **Giỏ hàng**: Sản phẩm sẽ tự động được xóa khỏi giỏ hàng khi thanh toán thành công
6. **Đơn hàng**: Đơn hàng sẽ hiển thị trong danh sách với trạng thái và phương thức thanh toán chính xác

## 🔗 Tài liệu tham khảo

- [MoMo API Documentation](https://developers.momo.vn/)
- [VNPay API Documentation](https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop)
- [ZaloPay API Documentation](https://docs.zalopay.vn/)
