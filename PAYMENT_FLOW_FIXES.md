# 🔧 Sửa lỗi Logic Thanh Toán - MoMo Payment Flow

## 🎯 **Vấn đề đã được xác định:**

Khi user hủy giao dịch MoMo, trang web vẫn hiển thị "Đặt hàng thành công!" mặc dù thực tế là thất bại. Điều này xảy ra do:

1. **Frontend không kiểm tra đúng trạng thái** - chỉ kiểm tra `status === 'paid'` mà không kiểm tra các trường hợp thất bại
2. **Thiếu logic xử lý khi user hủy giao dịch** - khi user hủy, MoMo sẽ gửi webhook với `resultCode !== 0`
3. **Không có trang hiển thị thất bại** - chỉ có trang success, không có trang failed

## ✅ **Các sửa đổi đã thực hiện:**

### **1. Backend - MoMo Webhook (`backend/src/controllers/paymentMomo.js`)**

#### **Cập nhật logic webhook:**
```javascript
// Trước: Chỉ xử lý thành công
if (resultCode === 0) {
  // Xử lý thành công
} else {
  // Chỉ log lỗi
}

// Sau: Xử lý cả thành công và thất bại
if (resultCode === 0) {
  // Xử lý thành công
  await confirmOrderAfterPayment(orderId, {...});
} else {
  // Xử lý thất bại - cập nhật trạng thái đơn hàng
  const order = await Order.findById(orderId);
  if (order) {
    order.status = 'cancelled';
    order.paymentStatus = 'failed';
    order.isPaid = false;
    await order.save();
  }
}
```

#### **Cải thiện hàm `checkMomoPaymentStatus`:**
```javascript
// Thêm kiểm tra trạng thái thất bại
if (order.paymentStatus === 'failed' || order.status === 'cancelled') {
  return res.json({
    orderId: order._id,
    status: order.status,
    paymentStatus: 'failed',
    isPaid: false,
    // ...
  });
}
```

### **2. Frontend - CheckoutSuccess (`frontend/src/pages/client/CheckoutSuccess.tsx`)**

#### **Cải thiện logic kiểm tra trạng thái MoMo:**
```javascript
// Trước: Chỉ kiểm tra status === 'paid'
if (statusResponse.data.status === 'paid') {
  // Hiển thị thành công
}

// Sau: Kiểm tra đầy đủ các trạng thái
if (statusResponse.data.isPaid && statusResponse.data.paymentStatus === 'paid') {
  // Hiển thị thành công
} else if (statusResponse.data.paymentStatus === 'failed' || statusResponse.data.status === 'cancelled') {
  // Chuyển hướng đến trang thất bại
  navigate(`/checkout/failed?orderId=${orderId}&paymentMethod=momo&error=payment_cancelled`);
} else {
  // Đang chờ xử lý - retry
}
```

#### **Thay thế modal bằng chuyển hướng:**
```javascript
// Trước: Hiển thị modal
setFailedOrderInfo({...});
setShowOrderFailedModal(true);

// Sau: Chuyển hướng đến trang thất bại
navigate(`/checkout/failed?orderId=${orderId}&paymentMethod=momo&error=payment_cancelled`);
```

### **3. Tạo trang CheckoutFailed (`frontend/src/pages/client/CheckoutFailed.tsx`)**

#### **Tính năng:**
- ✅ Hiển thị thông tin lỗi chi tiết
- ✅ Thông tin đơn hàng (mã đơn, phương thức thanh toán, số tiền)
- ✅ Gợi ý cách khắc phục
- ✅ Các action: Thử lại, Xem giỏ hàng, Quay lại, Về trang chủ
- ✅ Thông tin hỗ trợ khách hàng
- ✅ Giao diện chuyên nghiệp với gradient background

#### **URL Parameters:**
```
/checkout/failed?orderId=123&paymentMethod=momo&error=payment_cancelled&amount=21600000
```

### **4. Cập nhật Checkout (`frontend/src/pages/client/Checkout.tsx`)**

#### **Thay thế alert bằng chuyển hướng:**
```javascript
// Trước: Hiển thị alert
alert("Không lấy được link thanh toán MoMo. Vui lòng thử lại.");

// Sau: Chuyển hướng đến trang thất bại
navigate(`/checkout/failed?orderId=${res._id}&paymentMethod=momo&error=payment_error&amount=${orderData.totalPrice}`);
```

### **5. Thêm route trong App.tsx**

```javascript
<Route path="checkout/failed" element={<CheckoutFailed />} />
```

## 🔄 **Luồng xử lý mới:**

### **Khi user hủy giao dịch MoMo:**

1. **MoMo gửi webhook** với `resultCode !== 0`
2. **Backend cập nhật** trạng thái đơn hàng thành `cancelled` và `paymentStatus = 'failed'`
3. **Frontend kiểm tra** trạng thái từ backend
4. **Chuyển hướng** đến `/checkout/failed` với thông tin chi tiết
5. **Hiển thị trang thất bại** với giao diện chuyên nghiệp

### **Khi user thanh toán thành công:**

1. **MoMo gửi webhook** với `resultCode === 0`
2. **Backend cập nhật** trạng thái đơn hàng thành `pending` và `paymentStatus = 'paid'`
3. **Frontend kiểm tra** trạng thái từ backend
4. **Hiển thị trang thành công** với thông tin đơn hàng

## 🧪 **Test Script:**

Đã tạo `backend/test-momo-payment-flow.js` để test toàn bộ luồng:
- Tạo đơn hàng
- Tạo thanh toán MoMo
- Giả lập webhook thất bại
- Kiểm tra trạng thái đơn hàng
- Xác nhận logic hoạt động đúng

## 🎯 **Kết quả:**

✅ **Đã sửa hoàn toàn** vấn đề hiển thị sai trạng thái  
✅ **Tạo trang thất bại** chuyên nghiệp với đầy đủ thông tin  
✅ **Logic backend** xử lý đúng cả thành công và thất bại  
✅ **Frontend** chuyển hướng đúng và hiển thị thông tin chính xác  
✅ **UX tốt hơn** với thông báo rõ ràng và action buttons  

Bây giờ khi user hủy giao dịch MoMo, họ sẽ thấy trang "Đặt hàng thất bại" thay vì "Đặt hàng thành công"! 🎉
