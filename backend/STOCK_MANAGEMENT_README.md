# Hệ thống Quản lý Kho theo Thời gian Thực

## Tổng quan

Hệ thống quản lý kho theo thời gian thực được thiết kế để tránh tình trạng overselling (bán quá số lượng có trong kho) bằng cách:

1. **Reservation System**: Khi người dùng thêm sản phẩm vào giỏ hàng, số lượng đó được "đặt trước" (reserved)
2. **Real-time Stock**: Số lượng có sẵn được tính toán theo thời gian thực
3. **Auto Cleanup**: Tự động xóa reservations và carts cũ sau 3 ngày
4. **Stock Validation**: Kiểm tra số lượng trước khi cho phép thêm vào giỏ hàng

## Các thành phần chính

### 1. ProductReservation Model
- Theo dõi số lượng sản phẩm đã được đặt trước bởi từng user
- Tự động hết hạn sau 3 ngày
- Có các static methods để quản lý reservations

### 2. Cart Model (Cập nhật)
- Thêm field `lastActivity` để theo dõi hoạt động cuối cùng
- Tự động cleanup carts cũ sau 3 ngày
- Cập nhật `reservedAt` timestamp cho mỗi item

### 3. Cart Controller (Cập nhật)
- Kiểm tra số lượng có sẵn trước khi thêm vào giỏ hàng
- Tự động tạo/cập nhật reservations
- Trả về thông tin số lượng có sẵn cho frontend

### 4. Cleanup System
- Cron job chạy mỗi giờ để cleanup reservations và carts cũ
- API endpoint để chạy cleanup thủ công

## API Endpoints

### Cart APIs
```
GET /api/cart - Lấy giỏ hàng (với số lượng có sẵn)
POST /api/cart - Thêm vào giỏ hàng (với validation)
PUT /api/cart/:productId - Cập nhật số lượng
DELETE /api/cart/:productId - Xóa khỏi giỏ hàng
DELETE /api/cart - Xóa toàn bộ giỏ hàng
POST /api/cart/apply-coupon - Áp dụng mã giảm giá
GET /api/cart/product-availability/:productId - Lấy số lượng có sẵn
```

### Cleanup API
```
GET /api/cleanup - Chạy cleanup thủ công (cần auth)
```

## Cách hoạt động

### 1. Khi thêm vào giỏ hàng
```javascript
// 1. Kiểm tra số lượng có sẵn
const availableStock = totalStock - reservedQuantity;

// 2. Nếu đủ số lượng, tạo reservation
await ProductReservation.createReservation(productId, userId, quantity);

// 3. Thêm vào giỏ hàng
await Cart.findOneAndUpdate(...);
```

### 2. Khi cập nhật số lượng
```javascript
// 1. Tính số lượng có sẵn (trừ đi số lượng hiện tại của user)
const currentQuantity = userCurrentReservation.quantity;
const otherReservedQuantity = totalReserved - currentQuantity;
const availableStock = totalStock - otherReservedQuantity;

// 2. Kiểm tra số lượng mới có hợp lệ không
if (availableStock < newQuantity) {
  throw new Error('Không đủ hàng');
}

// 3. Cập nhật reservation và cart
```

### 3. Khi xóa khỏi giỏ hàng
```javascript
// 1. Xóa reservation
await ProductReservation.updateMany(
  { product: productId, user: userId, isActive: true },
  { isActive: false }
);

// 2. Xóa khỏi giỏ hàng
cart.items = cart.items.filter(item => item.product !== productId);
```

### 4. Auto Cleanup
```javascript
// Chạy mỗi giờ
setInterval(async () => {
  // Cleanup expired reservations
  await ProductReservation.cleanupExpiredReservations();
  
  // Cleanup old carts
  await Cart.cleanupOldCarts();
}, 60 * 60 * 1000);
```

## Frontend Integration

### 1. ProductCard Component
- Hiển thị số lượng có sẵn theo thời gian thực
- Disable nút "Thêm vào giỏ" khi hết hàng
- Hiển thị cảnh báo khi số lượng ít

### 2. CartContext
- Xử lý lỗi khi không đủ hàng
- Hiển thị thông báo phù hợp cho user
- Tự động refresh cart khi có thay đổi

### 3. TestAPI Component
- Test tất cả các tính năng quản lý kho
- Hiển thị thông tin chi tiết về reservations
- Chạy cleanup thủ công

## Test

### Chạy test script
```bash
cd backend
node test-stock-management.js
```

### Test qua frontend
1. Truy cập `/test-api`
2. Test các chức năng:
   - Thêm sản phẩm vào giỏ hàng
   - Kiểm tra số lượng có sẵn
   - Cập nhật số lượng
   - Xóa khỏi giỏ hàng
   - Chạy cleanup

## Lưu ý quan trọng

1. **Performance**: Hệ thống sử dụng aggregation để tính toán số lượng có sẵn, đảm bảo hiệu suất tốt
2. **Consistency**: Sử dụng transactions để đảm bảo tính nhất quán của dữ liệu
3. **Scalability**: Có thể mở rộng để hỗ trợ nhiều warehouse
4. **Monitoring**: Log đầy đủ các hoạt động cleanup để theo dõi

## Troubleshooting

### Lỗi thường gặp

1. **"Không đủ hàng" khi vẫn còn stock**
   - Kiểm tra reservations có bị treo không
   - Chạy cleanup để xóa reservations cũ

2. **Số lượng không cập nhật real-time**
   - Kiểm tra frontend có gọi API `product-availability` không
   - Đảm bảo component re-render khi có thay đổi

3. **Cleanup không hoạt động**
   - Kiểm tra cron job có được setup không
   - Chạy cleanup thủ công qua API

### Debug

```javascript
// Kiểm tra reservations của sản phẩm
const reservations = await ProductReservation.find({ 
  product: productId, 
  isActive: true 
});

// Kiểm tra số lượng có sẵn
const availableStock = await ProductReservation.getReservedQuantity(productId);

// Kiểm tra carts cũ
const oldCarts = await Cart.find({
  lastActivity: { $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
});
``` 