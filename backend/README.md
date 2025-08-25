# 🚀 TechTrend Backend API

> **Backend API cho hệ thống thương mại điện tử TechTrend**

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Công nghệ sử dụng](#️-công-nghệ-sử-dụng)
- [Cài đặt và chạy](#-cài-đặt-và-chạy)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Authentication](#-authentication)
- [Payment Integration](#-payment-integration)
- [Testing](#-testing)
- [Deployment](#-deployment)

## 🎯 Tổng quan

Backend API được xây dựng bằng **Node.js** và **Express.js**, sử dụng **MongoDB** làm cơ sở dữ liệu. Hệ thống cung cấp đầy đủ các API cần thiết cho một nền tảng e-commerce hiện đại.

### ✨ Tính năng chính

- 🔐 **Authentication & Authorization** - JWT, Role-based access control
- 🛍️ **Product Management** - CRUD sản phẩm, danh mục, thương hiệu
- 🛒 **Order Management** - Quản lý đơn hàng, giỏ hàng
- 💳 **Payment Integration** - VNPay, MoMo, COD
- 👥 **User Management** - Quản lý người dùng, phân quyền
- 📊 **Analytics & Reports** - Thống kê, báo cáo doanh thu
- 🔔 **Real-time Notifications** - Socket.io
- 📧 **Email Service** - Nodemailer
- 🖼️ **File Upload** - Cloudinary integration

## 📁 Cấu trúc dự án

```
backend/
├── src/
│   ├── config/          # Cấu hình database, middleware
│   ├── controllers/     # Logic xử lý request
│   ├── middlewares/     # Middleware functions
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── validation/      # Request validation
│   └── app.js          # Entry point
├── uploads/            # File uploads (temporary)
├── package.json        # Dependencies
├── .env.example        # Environment variables template
└── README.md          # Documentation
```

## 🛠️ Công nghệ sử dụng

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| **Node.js** | 18+ | Runtime environment |
| **Express.js** | 4.18+ | Web framework |
| **MongoDB** | 6.0+ | NoSQL Database |
| **Mongoose** | 7.0+ | ODM cho MongoDB |
| **JWT** | 9.0+ | Authentication |
| **Bcrypt** | 5.1+ | Password hashing |
| **Multer** | 1.4+ | File upload |
| **Cloudinary** | 1.37+ | Image hosting |
| **Nodemailer** | 6.9+ | Email service |
| **Socket.io** | 4.7+ | Real-time communication |
| **VNPay SDK** | - | Payment gateway |
| **MoMo SDK** | - | Payment gateway |

## ⚙️ Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 18+
- MongoDB 6.0+
- npm hoặc pnpm

### Cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd backend
```

2. **Cài đặt dependencies**
```bash
npm install
# hoặc
pnpm install
```

3. **Cấu hình environment**
```bash
cp .env.example .env
# Chỉnh sửa file .env với thông tin của bạn
```

4. **Chạy development server**
```bash
npm run dev
# hoặc
pnpm dev
```

Server sẽ chạy tại: `http://localhost:5000`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu

### Users
- `GET /api/users/profile` - Lấy thông tin profile
- `PUT /api/users/profile` - Cập nhật profile
- `GET /api/users/addresses` - Lấy danh sách địa chỉ
- `POST /api/users/addresses` - Thêm địa chỉ mới
- `PUT /api/users/addresses/:id` - Cập nhật địa chỉ
- `DELETE /api/users/addresses/:id` - Xóa địa chỉ

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm mới (Admin)
- `PUT /api/products/:id` - Cập nhật sản phẩm (Admin)
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin)
- `GET /api/products/search` - Tìm kiếm sản phẩm
- `GET /api/products/category/:categoryId` - Sản phẩm theo danh mục

### Categories
- `GET /api/categories` - Lấy danh sách danh mục
- `POST /api/categories` - Tạo danh mục mới (Admin)
- `PUT /api/categories/:id` - Cập nhật danh mục (Admin)
- `DELETE /api/categories/:id` - Xóa danh mục (Admin)

### Orders
- `GET /api/orders` - Lấy danh sách đơn hàng
- `GET /api/orders/:id` - Lấy chi tiết đơn hàng
- `POST /api/orders` - Tạo đơn hàng mới
- `PUT /api/orders/:id/status` - Cập nhật trạng thái (Admin)
- `DELETE /api/orders/:id` - Hủy đơn hàng

### Cart
- `GET /api/cart` - Lấy giỏ hàng
- `POST /api/cart/add` - Thêm sản phẩm vào giỏ
- `PUT /api/cart/update` - Cập nhật số lượng
- `DELETE /api/cart/remove/:productId` - Xóa sản phẩm khỏi giỏ
- `DELETE /api/cart/clear` - Xóa toàn bộ giỏ hàng

### Payment
- `POST /api/payment/create` - Tạo giao dịch thanh toán
- `POST /api/payment/vnpay` - Thanh toán VNPay
- `POST /api/payment/momo` - Thanh toán MoMo
- `GET /api/payment/callback` - Callback từ payment gateway
- `GET /api/payment/status/:orderId` - Kiểm tra trạng thái thanh toán

### Admin (Dashboard)
- `GET /api/admin/dashboard` - Thống kê tổng quan
- `GET /api/admin/orders` - Quản lý đơn hàng
- `GET /api/admin/users` - Quản lý người dùng
- `GET /api/admin/reports` - Báo cáo doanh thu
- `POST /api/admin/coupons` - Tạo mã giảm giá
- `PUT /api/admin/settings` - Cập nhật cài đặt hệ thống

## 🗄️ Database Schema

### User Model
```javascript
{
  email: String,
  password: String,
  fullName: String,
  phone: String,
  role: String, // 'user', 'admin', 'superadmin'
  avatar: String,
  addresses: [AddressSchema],
  favorites: [ProductSchema],
  rewardPoints: Number,
  isEmailVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  originalPrice: Number,
  category: ObjectId,
  brand: ObjectId,
  images: [String],
  specifications: Object,
  stock: Number,
  sold: Number,
  rating: Number,
  reviews: [ReviewSchema],
  isActive: Boolean,
  isFlashSale: Boolean,
  flashSaleEnd: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model
```javascript
{
  user: ObjectId,
  items: [OrderItemSchema],
  totalAmount: Number,
  shippingAddress: AddressSchema,
  paymentMethod: String,
  paymentStatus: String,
  orderStatus: String,
  trackingNumber: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Authentication

Hệ thống sử dụng **JWT (JSON Web Token)** cho authentication:

### Token Structure
- **Access Token**: Có thời hạn 15 phút
- **Refresh Token**: Có thời hạn 7 ngày

### Middleware
- `authMiddleware`: Xác thực token
- `roleMiddleware`: Kiểm tra quyền truy cập
- `rateLimitMiddleware`: Giới hạn số request

### Roles & Permissions
- **User**: Truy cập các tính năng cơ bản
- **Admin**: Quản lý sản phẩm, đơn hàng, người dùng
- **Superadmin**: Toàn quyền hệ thống

## 💳 Payment Integration

### VNPay Integration
- Hỗ trợ thanh toán qua ngân hàng
- Tích hợp IPN (Instant Payment Notification)
- Hỗ trợ refund và query transaction

### MoMo Integration
- Thanh toán qua ví MoMo
- Hỗ trợ QR code và app-to-app
- Tích hợp webhook callback

### COD (Cash on Delivery)
- Thanh toán khi nhận hàng
- Xác nhận đơn hàng qua email/SMS

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### Payment Flow Tests
```bash
npm run test:payment
```

### Test Files
- `test-payment-flow.js` - Test luồng thanh toán
- `test-order-flow.js` - Test luồng đơn hàng
- `test-stock-management.js` - Test quản lý kho
- `test-momo-payment-flow.js` - Test thanh toán MoMo

## 🚀 Deployment

### Production Setup
1. **Environment Variables**
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_URL=your_cloudinary_url
VNPAY_TMN_CODE=your_vnpay_code
MOMO_PARTNER_CODE=your_momo_code
```

2. **PM2 Configuration**
```bash
npm install -g pm2
pm2 start ecosystem.config.js
```

3. **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker Deployment
```bash
# Build image
docker build -t techtrend-backend .

# Run container
docker run -p 5000:5000 techtrend-backend
```

## 📚 Tài liệu tham khảo

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Documentation](https://jwt.io/)
- [VNPay API Documentation](https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop)
- [MoMo API Documentation](https://developers.momo.vn/)

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Dự án này được phát triển cho mục đích học tập và nghiên cứu.
