# Tối Ưu Logic Quản Lý Kho Hàng

## Tổng Quan

Đã tối ưu lại logic xử lý đơn hàng để đảm bảo quản lý kho hàng chính xác và tránh các vấn đề về số lượng tồn kho.

## Các Thay Đổi Chính

### 1. Service Quản Lý Kho Hàng (`inventoryService.js`)

**Chức năng chính:**
- `deductInventory()`: Trừ số lượng sản phẩm khỏi kho khi đặt hàng
- `restoreInventory()`: Hoàn trả số lượng sản phẩm vào kho khi hủy đơn hàng
- `checkAvailability()`: Kiểm tra tính khả dụng của sản phẩm trước khi đặt hàng
- `clearReservations()`: Xóa reservation khỏi giỏ hàng sau khi đặt đơn thành công

**Đặc điểm:**
- Hỗ trợ cả sản phẩm có biến thể và không có biến thể
- Xử lý lỗi chi tiết và logging đầy đủ
- Tránh trùng lặp cập nhật kho
- Validation đầy đủ trước khi thực hiện

### 2. Model Order Cập Nhật

**Thêm fields mới:**
```javascript
inventoryStatus: {
  deducted: Boolean,      // Đã trừ kho chưa
  deductedAt: Date,       // Thời gian trừ kho
  restored: Boolean,      // Đã hoàn trả kho chưa
  restoredAt: Date        // Thời gian hoàn trả kho
}
```

### 3. Logic Tạo Đơn Hàng (`createOrder`)

**Quy trình mới:**
1. ✅ Kiểm tra tính khả dụng của tất cả sản phẩm
2. ✅ Tạo đơn hàng với trạng thái kho hàng
3. ✅ Trừ số lượng kho ngay lập tức (cho cả COD và online payment)
4. ✅ Xóa sản phẩm khỏi giỏ hàng
5. ✅ Xóa reservation
6. ✅ Cập nhật trạng thái đã trừ kho

**Lợi ích:**
- Đảm bảo kho hàng chính xác ngay khi đặt hàng
- Tránh tình trạng overselling
- Xử lý thống nhất cho tất cả phương thức thanh toán

### 4. Logic Hủy Đơn Hàng

**Hủy bởi khách hàng (`cancelOrder`):**
1. ✅ Kiểm tra điều kiện hủy đơn hàng
2. ✅ Hoàn trả số lượng kho (tránh trùng lặp)
3. ✅ Cập nhật trạng thái đơn hàng
4. ✅ Gửi thông báo cho khách hàng

**Hủy bởi admin (`updateOrderStatus`):**
1. ✅ Kiểm tra quyền chuyển trạng thái
2. ✅ Hoàn trả số lượng kho (tránh trùng lặp)
3. ✅ Cập nhật trạng thái đơn hàng
4. ✅ Gửi thông báo cho khách hàng

### 5. Xử Lý Giỏ Hàng

**Sau khi đặt đơn thành công:**
- ✅ Xóa tất cả sản phẩm đã đặt khỏi giỏ hàng
- ✅ Xóa reservation tương ứng
- ✅ Áp dụng cho tất cả phương thức thanh toán

## Các Tính Năng Bảo Vệ

### 1. Tránh Trùng Lặp Hoàn Trả Kho
```javascript
// Kiểm tra trạng thái đã hoàn trả
if (order.inventoryStatus && order.inventoryStatus.restored) {
  console.log('Đã hoàn trả kho trước đó, bỏ qua');
  return;
}
```

### 2. Validation Đầy Đủ
- Kiểm tra sản phẩm tồn tại
- Kiểm tra biến thể tồn tại
- Kiểm tra số lượng tồn kho
- Kiểm tra điều kiện hủy đơn hàng

### 3. Error Handling
- Xử lý lỗi chi tiết cho từng sản phẩm
- Logging đầy đủ cho debugging
- Rollback khi cần thiết

## Cách Sử Dụng

### 1. Test Logic
```bash
cd backend
node test-inventory-logic.js
```

### 2. API Endpoints

**Tạo đơn hàng:**
```javascript
POST /api/orders
// Tự động trừ kho và xóa giỏ hàng
```

**Hủy đơn hàng:**
```javascript
POST /api/orders/:id/cancel
// Tự động hoàn trả kho
```

**Cập nhật trạng thái (admin):**
```javascript
PUT /api/orders/:id/status
// Tự động hoàn trả kho nếu hủy đơn hàng
```

## Lưu Ý Quan Trọng

### 1. Database Migration
- Cần chạy migration để thêm fields `inventoryStatus` vào model Order
- Các đơn hàng cũ sẽ có `inventoryStatus` mặc định

### 2. Performance
- Service sử dụng batch operations để tối ưu performance
- Indexing được tối ưu cho các query thường dùng

### 3. Monitoring
- Logging chi tiết cho tất cả operations
- Có thể monitor qua console logs
- Có thể thêm metrics nếu cần

## Troubleshooting

### 1. Lỗi "Không đủ hàng trong kho"
- Kiểm tra số lượng tồn kho thực tế
- Kiểm tra reservation đang active
- Kiểm tra logic tính toán available stock

### 2. Lỗi "Đã hoàn trả kho trước đó"
- Kiểm tra trạng thái `inventoryStatus.restored`
- Đây là tính năng bảo vệ, không phải lỗi

### 3. Lỗi "Không tìm thấy sản phẩm"
- Kiểm tra ID sản phẩm có đúng không
- Kiểm tra sản phẩm có bị xóa không

## Kết Luận

Logic mới đảm bảo:
- ✅ Quản lý kho hàng chính xác
- ✅ Tránh overselling
- ✅ Xử lý thống nhất cho tất cả phương thức thanh toán
- ✅ Tránh trùng lặp cập nhật kho
- ✅ Clean code, dễ bảo trì
- ✅ Error handling đầy đủ
- ✅ Logging chi tiết
