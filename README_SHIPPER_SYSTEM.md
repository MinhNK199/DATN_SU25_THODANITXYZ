# Hệ Thống Quản Lý Shipper

## Tổng Quan

Hệ thống quản lý shipper được thiết kế để quản lý quy trình giao hàng từ khi phân công đến khi hoàn thành. Hệ thống bao gồm:

- **Backend API**: Quản lý shipper, đơn hàng, và tracking
- **Frontend Shipper**: Giao diện cho shipper quản lý giao hàng
- **Admin Panel**: Quản lý shipper và phân công đơn hàng
- **Auto-confirmation**: Tự động xác nhận đơn hàng sau 7 ngày

## Tính Năng Chính

### 1. Quản Lý Shipper
- Đăng ký/Đăng nhập shipper
- Quản lý thông tin cá nhân
- Cập nhật trạng thái online/offline
- Upload ảnh chứng minh giao hàng

### 2. Quy Trình Giao Hàng
1. **Phân công đơn hàng**: Admin phân công đơn hàng cho shipper
2. **Nhận hàng**: Shipper nhận hàng từ shop và chụp ảnh xác nhận
3. **Giao hàng**: Shipper giao hàng đến khách hàng
4. **Xác nhận**: Shipper chụp ảnh giao hàng thành công
5. **Tự động xác nhận**: Sau 7 ngày, đơn hàng tự động được xác nhận

### 3. Tracking & Monitoring
- Theo dõi vị trí shipper
- Lịch sử giao hàng
- Thống kê hiệu suất
- Thông báo tự động

## Cài Đặt và Chạy

### Backend

1. Cài đặt dependencies:
```bash
cd backend
npm install
```

2. Cấu hình database trong `src/config/database.js`

3. Chạy server:
```bash
npm start
```

### Frontend

1. Cài đặt dependencies:
```bash
cd frontend
npm install
```

2. Chạy development server:
```bash
npm run dev
```

## API Endpoints

### Shipper Authentication
- `POST /api/shipper/register` - Đăng ký shipper
- `POST /api/shipper/login` - Đăng nhập shipper
- `GET /api/shipper/profile` - Lấy thông tin profile
- `PUT /api/shipper/profile` - Cập nhật profile

### Shipper Operations
- `GET /api/shipper/orders` - Lấy danh sách đơn hàng được phân công
- `POST /api/shipper/orders/:id/start-delivery` - Bắt đầu giao hàng
- `POST /api/shipper/orders/:id/confirm-delivery` - Xác nhận giao hàng
- `POST /api/shipper/orders/:id/report-failure` - Báo cáo giao hàng thất bại
- `PUT /api/shipper/location` - Cập nhật vị trí

### Admin Management
- `GET /api/admin/shipper` - Lấy danh sách shipper
- `POST /api/admin/shipper` - Tạo shipper mới
- `PUT /api/admin/shipper/:id` - Cập nhật shipper
- `DELETE /api/admin/shipper/:id` - Xóa shipper
- `POST /api/admin/shipper/assign-order` - Phân công đơn hàng

## Cấu Trúc Database

### Model Shipper
```javascript
{
  username: String,
  email: String,
  password: String,
  fullName: String,
  phone: String,
  address: String,
  idCard: String,
  licensePlate: String,
  vehicleType: String,
  status: String,
  isOnline: Boolean,
  currentLocation: Object,
  rating: Number,
  totalDeliveries: Number
}
```

### Model OrderTracking
```javascript
{
  orderId: ObjectId,
  shipperId: ObjectId,
  status: String,
  pickupImages: Array,
  deliveryImages: Array,
  pickupTime: Date,
  deliveryTime: Date,
  notes: String,
  autoConfirmAt: Date
}
```

## Quy Trình Sử Dụng

### Cho Shipper

1. **Đăng ký tài khoản** tại `/shipper/register`
2. **Đăng nhập** tại `/shipper/login`
3. **Xem dashboard** với danh sách đơn hàng được phân công
4. **Bắt đầu giao hàng**:
   - Chụp ảnh nhận hàng từ shop
   - Thêm ghi chú nếu cần
5. **Giao hàng**:
   - Cập nhật vị trí khi cần
   - Chụp ảnh giao hàng thành công
   - Xác nhận hoàn thành

### Cho Admin

1. **Quản lý shipper** tại `/admin/shipper`
2. **Tạo shipper mới** hoặc chỉnh sửa thông tin
3. **Phân công đơn hàng** cho shipper phù hợp
4. **Theo dõi tiến độ** giao hàng

## Tự Động Hóa

### Auto-confirmation Job
- Chạy mỗi giờ để kiểm tra đơn hàng cần tự động xác nhận
- Tự động xác nhận đơn hàng sau 7 ngày giao hàng thành công
- Gửi thông báo nhắc nhở trước khi tự động xác nhận

### Offline Detection
- Tự động chuyển shipper sang offline nếu không hoạt động trong 30 phút
- Cập nhật thời gian hoạt động cuối cùng

## Bảo Mật

- JWT authentication cho shipper
- Middleware xác thực riêng cho shipper
- Phân quyền truy cập theo role
- Validation dữ liệu đầu vào

## Tối Ưu Hóa

### Performance
- Index database cho các truy vấn thường xuyên
- Pagination cho danh sách đơn hàng
- Caching cho dữ liệu ít thay đổi

### UX/UI
- Responsive design cho mobile
- Real-time updates
- Intuitive navigation
- Clear status indicators

## Monitoring & Analytics

- Thống kê hiệu suất shipper
- Theo dõi thời gian giao hàng
- Báo cáo tỷ lệ thành công
- Dashboard quản lý

## Troubleshooting

### Lỗi thường gặp

1. **Shipper không thể đăng nhập**
   - Kiểm tra trạng thái tài khoản (active/inactive/suspended)
   - Xác nhận thông tin đăng nhập

2. **Không nhận được đơn hàng**
   - Kiểm tra trạng thái online
   - Xác nhận đã được phân công

3. **Upload ảnh thất bại**
   - Kiểm tra kích thước file (max 5MB)
   - Xác nhận định dạng file (JPEG, PNG, GIF)

## Roadmap

### Tính năng sắp tới
- [ ] Real-time tracking với GPS
- [ ] Push notifications
- [ ] Chat giữa shipper và khách hàng
- [ ] Rating system cho shipper
- [ ] Route optimization
- [ ] Multi-language support

## Liên Hệ

Nếu có vấn đề hoặc cần hỗ trợ, vui lòng liên hệ team phát triển.
