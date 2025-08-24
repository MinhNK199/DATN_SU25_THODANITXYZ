# 🏦 MoMo Payment Status Guide - Sandbox Environment

## 📋 **Các Trường Quan Trọng Nhất Quyết Định Trạng Thái**

### **1. 🔑 TRƯỜNG QUYẾT ĐỊNH CHÍNH: `resultCode`**

**Đây là trường QUAN TRỌNG NHẤT** để xác định thành công hay thất bại:

```javascript
// ✅ THÀNH CÔNG
resultCode === 0  // Hoặc resultCode === "0"

// ❌ THẤT BẠI
resultCode !== 0  // Bất kỳ giá trị nào khác 0
```

**Các giá trị `resultCode` phổ biến trong sandbox:**
- `0` - **Thành công** ✅
- `1006` - **Người dùng hủy giao dịch** ❌
- `1001` - **Lỗi hệ thống** ❌
- `1002` - **Lỗi tham số** ❌
- `1003` - **Lỗi xác thực** ❌
- `1004` - **Lỗi kết nối** ❌
- `1005` - **Lỗi timeout** ❌

### **2. 🌐 URL PARAMETERS (Từ MoMo Redirect)**

Khi MoMo redirect về website, các tham số quan trọng:

```javascript
// Từ URL: /checkout/status?orderId=xxx&resultCode=0&message=Success
const resultCode = searchParams.get("resultCode");  // "0" hoặc "1006"
const message = searchParams.get("message");        // "Success" hoặc "User cancelled"
const orderId = searchParams.get("orderId");        // ID đơn hàng
```

### **3. 🔔 WEBHOOK PARAMETERS**

Khi MoMo gửi webhook đến backend:

```javascript
{
  orderId: "68a60d4553cbc9246e1b07e1",
  resultCode: 0,                    // ⭐ QUAN TRỌNG NHẤT
  message: "Success",               // Mô tả kết quả
  transId: "123456789",            // ID giao dịch MoMo
  amount: 21600000,                // Số tiền
  extraData: "",                   // Dữ liệu bổ sung
  payType: "qr",                   // Loại thanh toán
  orderType: "momo_wallet",        // Loại đơn hàng
  transType: "momo_wallet",        // Loại giao dịch
  mSignature: "abc123..."          // Chữ ký xác thực
}
```

### **4. 💾 DATABASE STATUS FIELDS**

Sau khi webhook xử lý, các trường trong database:

```javascript
// ✅ THÀNH CÔNG
{
  isPaid: true,
  paymentStatus: "paid",
  status: "pending",
  paidAt: "2024-01-15T10:30:00.000Z"
}

// ❌ THẤT BẠI
{
  isPaid: false,
  paymentStatus: "failed",
  status: "cancelled",
  paidAt: null
}
```

## 🎯 **LOGIC QUYẾT ĐỊNH TRẠNG THÁI**

### **Frontend Logic (CheckoutStatus.tsx):**

```javascript
// ✅ ƯU TIÊN 1: URL Parameters
if (resultCode === "0") {
  // THÀNH CÔNG - Không cần kiểm tra backend
  navigate("/checkout/success");
} else if (resultCode && resultCode !== "0") {
  // THẤT BẠI - Không cần kiểm tra backend
  navigate("/checkout/failed");
} else {
  // Không có resultCode - Kiểm tra backend
  checkBackendStatus();
}
```

### **Backend Logic (momoWebhook):**

```javascript
// ✅ ƯU TIÊN 1: resultCode từ webhook
if (resultCode === 0) {
  // THÀNH CÔNG
  await confirmOrderAfterPayment(orderId, paymentInfo);
} else {
  // THẤT BẠI
  order.status = 'cancelled';
  order.paymentStatus = 'failed';
  order.isPaid = false;
}
```

## 🧪 **SANDBOX TESTING SCENARIOS**

### **1. Thanh Toán Thành Công:**
```javascript
// URL Parameters
resultCode: "0"
message: "Success"

// Webhook Data
{
  resultCode: 0,
  message: "Success",
  transId: "test_trans_123"
}
```

### **2. Người Dùng Hủy Giao Dịch:**
```javascript
// URL Parameters
resultCode: "1006"
message: "User cancelled"

// Webhook Data
{
  resultCode: 1006,
  message: "User cancelled",
  transId: null
}
```

### **3. Lỗi Hệ Thống:**
```javascript
// URL Parameters
resultCode: "1001"
message: "System error"

// Webhook Data
{
  resultCode: 1001,
  message: "System error",
  transId: null
}
```

## ⚠️ **LƯU Ý QUAN TRỌNG CHO SANDBOX**

### **1. Không Có Giao Dịch Thực:**
- Trong sandbox, **KHÔNG có giao dịch thực** diễn ra
- `resultCode` được **giả lập** bởi MoMo sandbox
- `transId` có thể là **giả** hoặc **null**

### **2. Webhook Có Thể Không Được Gọi:**
- Trong sandbox, webhook có thể **không được gọi**
- Cần **dựa vào URL parameters** là chính
- Backend status có thể **không được cập nhật**

### **3. Timing Issues:**
- Frontend có thể check backend **trước khi webhook xử lý**
- Cần **delay** hoặc **retry logic** để đợi webhook

## 🔧 **RECOMMENDED IMPLEMENTATION**

### **Frontend Priority:**
1. **URL Parameters** (resultCode) - **QUAN TRỌNG NHẤT**
2. **Backend Status** (isPaid, paymentStatus) - **Fallback**

### **Backend Priority:**
1. **Webhook resultCode** - **QUAN TRỌNG NHẤT**
2. **Database Status** - **Consistency Check**

### **Error Handling:**
```javascript
// Frontend
if (resultCode === "0") {
  // Success - Process immediately
  showSuccess();
} else if (resultCode && resultCode !== "0") {
  // Failed - Process immediately
  showFailed();
} else {
  // No resultCode - Check backend with retry
  checkBackendWithRetry();
}
```

## 📊 **TESTING CHECKLIST**

- [ ] Test successful payment (`resultCode: 0`)
- [ ] Test cancelled payment (`resultCode: 1006`)
- [ ] Test system error (`resultCode: 1001`)
- [ ] Test missing resultCode (fallback to backend)
- [ ] Test webhook timing issues
- [ ] Test duplicate webhook calls
- [ ] Test network errors

## 🎯 **KẾT LUẬN**

**Trong môi trường sandbox MoMo, `resultCode` là trường QUAN TRỌNG NHẤT:**

- `resultCode === 0` → **THÀNH CÔNG** ✅
- `resultCode !== 0` → **THẤT BẠI** ❌

**Không nên dựa vào:**
- `transId` (có thể null trong sandbox)
- `amount` (có thể không chính xác)
- `message` (chỉ là mô tả)

**Nên dựa vào:**
- `resultCode` (quyết định chính)
- `orderId` (để xác định đơn hàng)
- Backend status (fallback khi không có resultCode)
