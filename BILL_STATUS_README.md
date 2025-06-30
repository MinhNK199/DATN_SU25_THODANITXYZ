# Hướng dẫn sử dụng chức năng cập nhật trạng thái hóa đơn

## Tổng quan
Hệ thống đã được cập nhật để hỗ trợ 8 trạng thái hóa đơn với khả năng chỉnh sửa trạng thái theo thứ tự logic.

## Các trạng thái hóa đơn

### 1. Chờ xác nhận (pending)
- Trạng thái mặc định khi tạo hóa đơn mới
- Có thể chuyển sang: Đã xác nhận, Đã hủy

### 2. Đã xác nhận (confirmed)
- Hóa đơn đã được admin xác nhận
- Có thể chuyển sang: Chờ lấy hàng, Chờ xác nhận, Đã hủy

### 3. Chờ lấy hàng (ready_for_pickup)
- Hàng đã được chuẩn bị, sẵn sàng cho khách lấy
- Có thể chuyển sang: Đang vận chuyển, Đã xác nhận, Đã hủy

### 4. Đang vận chuyển (shipping)
- Hàng đang được vận chuyển đến khách hàng
- Có thể chuyển sang: Đang giao hàng, Chờ lấy hàng, Đã hủy

### 5. Đang giao hàng (delivering)
- Đang giao hàng đến địa chỉ khách hàng
- Có thể chuyển sang: Đã giao hàng, Đang vận chuyển, Đã hủy

### 6. Đã giao hàng (delivered)
- Hàng đã được giao thành công
- Có thể chuyển sang: Đã thanh toán, Đang giao hàng, Đã hủy

### 7. Đã thanh toán (paid)
- Khách hàng đã thanh toán đầy đủ
- Có thể chuyển sang: Đã giao hàng, Đã hủy

### 8. Đã hủy (cancelled)
- Hóa đơn đã bị hủy
- Có thể chuyển từ bất kỳ trạng thái nào

## Cách sử dụng trong Admin Panel

### 1. Truy cập danh sách hóa đơn
- Đăng nhập vào admin panel
- Vào menu "Hóa đơn" hoặc "Bills"

### 2. Chỉnh sửa trạng thái
- Trong cột "Trạng thái", click vào icon chỉnh sửa (biểu tượng bút chì)
- Modal sẽ hiển thị với dropdown chứa các trạng thái có thể chuyển đổi
- Chọn trạng thái mới và click "Cập nhật"

### 3. Quy tắc chuyển đổi
- Chỉ có thể chuyển sang trạng thái tiếp theo hoặc trước đó 1 bước
- Có thể hủy hóa đơn từ bất kỳ trạng thái nào
- Không thể chuyển về trạng thái quá xa trong quá khứ

## API Endpoints

### Cập nhật trạng thái hóa đơn
```
PATCH /api/bill/:id/status
Content-Type: application/json

{
  "status": "confirmed"
}
```

### Response thành công
```json
{
  "success": true,
  "data": {
    "_id": "bill_id",
    "status": "confirmed",
    // ... other bill data
  }
}
```

### Response lỗi
```json
{
  "success": false,
  "error": "Không thể chuyển về trạng thái trước đó"
}
```

## Validation Rules

### Backend Validation
1. **Trạng thái hợp lệ**: Chỉ chấp nhận các trạng thái đã định nghĩa
2. **Thứ tự logic**: Không thể chuyển về trạng thái quá xa trong quá khứ
3. **Hủy hóa đơn**: Có thể hủy từ bất kỳ trạng thái nào

### Frontend Validation
1. **Dropdown động**: Chỉ hiển thị các trạng thái có thể chuyển đổi
2. **UI/UX**: Hiển thị màu sắc và nhãn phù hợp cho từng trạng thái
3. **Feedback**: Thông báo thành công/thất bại khi cập nhật

## Màu sắc trạng thái

- **Chờ xác nhận**: Orange
- **Đã xác nhận**: Blue  
- **Chờ lấy hàng**: Cyan
- **Đang vận chuyển**: Purple
- **Đang giao hàng**: Geekblue
- **Đã giao hàng**: Green
- **Đã thanh toán**: Success (xanh lá)
- **Đã hủy**: Red

## Lưu ý quan trọng

1. **Backup dữ liệu**: Luôn backup database trước khi cập nhật trạng thái
2. **Kiểm tra quyền**: Đảm bảo chỉ admin mới có quyền thay đổi trạng thái
3. **Log hoạt động**: Hệ thống sẽ ghi log mọi thay đổi trạng thái
4. **Thông báo**: Có thể gửi email thông báo cho khách hàng khi trạng thái thay đổi

## Troubleshooting

### Lỗi thường gặp

1. **"Trạng thái không hợp lệ"**
   - Kiểm tra xem trạng thái có trong danh sách cho phép không

2. **"Không thể chuyển về trạng thái trước đó"**
   - Chỉ có thể chuyển về trạng thái trước đó 1 bước

3. **"Bill not found"**
   - Kiểm tra ID hóa đơn có đúng không

### Debug
- Kiểm tra console browser để xem lỗi frontend
- Kiểm tra logs server để xem lỗi backend
- Sử dụng Postman để test API trực tiếp 