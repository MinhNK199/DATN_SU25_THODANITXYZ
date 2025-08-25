# 🛒 TechTrend - Hệ thống Thương mại Điện tử

> **Dự án Đồ án Tốt nghiệp (DATN)** - Hệ thống thương mại chuyên về sản phẩm công nghệ

Một nền tảng e-commerce hiện đại được xây dựng với **React.js**, **Node.js**, **MongoDB** và **Ant Design**.

## 📋 Mục lục

- [Tổng quan dự án](#-tổng-quan-dự-án)
- [Tính năng chính](#-tính-năng-chính)
- [Công nghệ sử dụng](#️-công-nghệ-sử-dụng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Đóng góp](#-đóng-góp)
- [License](#-license)

## 🎯 Tổng quan dự án

**TechTrend** là một hệ thống thương mại điện tử toàn diện được thiết kế để bán các sản phẩm công nghệ như điện thoại, laptop, tablet và phụ kiện. Dự án được phát triển như một phần của đồ án tốt nghiệp, tập trung vào việc xây dựng một ứng dụng web hiện đại với đầy đủ các tính năng của một website thương mại điện tử chuyên nghiệp.

### 🎨 Demo & Screenshots
- **Frontend Demo**: [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **API Documentation**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

## ✨ Tính năng chính

### 👥 Dành cho Khách hàng
- ✅ **Đăng ký/Đăng nhập** với xác thực JWT
- ✅ **Trang chủ** với slider, sản phẩm nổi bật, danh mục
- ✅ **Catalog sản phẩm** với tìm kiếm, lọc, sắp xếp
- ✅ **Chi tiết sản phẩm** với gallery ảnh, thông số kỹ thuật
- ✅ **Giỏ hàng** thông minh với tính toán tự động
- ✅ **Thanh toán** đa phương thức (COD, Banking, E-wallet)
- ✅ **Quản lý đơn hàng** và theo dõi trạng thái
- ✅ **Đánh giá sản phẩm** với rating và comment
- ✅ **Wishlist** - Danh sách yêu thích
- ✅ **Quản lý profile** và địa chỉ giao hàng
- ✅ **Thông báo** real-time

### 🔧 Dành cho Quản trị viên
- ✅ **Dashboard** với biểu đồ thống kê tổng quan
- ✅ **Quản lý sản phẩm** (CRUD) với upload hình ảnh
- ✅ **Quản lý danh mục** đa cấp
- ✅ **Quản lý thương hiệu** (Brands)
- ✅ **Quản lý đơn hàng** và cập nhật trạng thái
- ✅ **Quản lý người dùng** và phân quyền
- ✅ **Quản lý mã giảm giá** (Coupons)
- ✅ **Báo cáo doanh thu** chi tiết
- ✅ **Quản lý banner** và nội dung
- ✅ **Cài đặt hệ thống**

### 🚀 Tính năng nâng cao
- ✅ **Tìm kiếm thông minh** với Elasticsearch
- ✅ **Lọc sản phẩm** đa tiêu chí
- ✅ **Recommendation system** - Gợi ý sản phẩm
- ✅ **Real-time notifications** với Socket.io
- ✅ **Email marketing** tự động
- ✅ **SEO optimization** với meta tags
- ✅ **Mobile responsive** design
- ✅ **PWA support** - Progressive Web App

### 🆕 Tính năng mới được thêm vào (2024)
- ✅ **Hệ thống Q&A sản phẩm** - Khách hàng đặt câu hỏi, Admin trả lời
- ✅ **Sản phẩm liên quan** - Quản lý sản phẩm gợi ý
- ✅ **Flash Sale** - Khuyến mãi giới hạn thời gian
- ✅ **Hệ thống khuyến mãi đa dạng** - Percentage, Fixed, Voucher
- ✅ **Sản phẩm yêu thích** - Favorites system
- ✅ **AI Recommendation Engine** - Gợi ý sản phẩm thông minh
- ✅ **Hệ thống điểm thưởng** - Reward points tích lũy và sử dụng
- ✅ **Phân quyền nâng cao** - Admin và Superadmin roles
- ✅ **Email verification** - Xác thực email khi đăng ký
- ✅ **CAPTCHA integration** - Bảo mật chống bot
- ✅ **Social login** - Đăng nhập bằng Google

## 🛠️ Công nghệ sử dụng

### Backend
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

### Frontend
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| **React.js** | 18+ | UI Library |
| **TypeScript** | 5.0+ | Type safety |
| **Vite** | 4.0+ | Build tool |
| **React Router** | 6.8+ | Client-side routing |
| **Ant Design** | 5.0+ | UI Component Library |
| **Tailwind CSS** | 3.0+ | Utility-first CSS |
| **Zustand** | 4.3+ | State management |
| **React Query** | 4.0+ | Data fetching & caching |
| **Axios** | 1.3+ | HTTP client |
| **Socket.io Client** | 4.7+ | Real-time communication |

### DevOps & Tools
- **Docker** - Containerization
- **Nginx** - Reverse proxy
- **PM2** - Process manager
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📁 Cấu trúc dự án

```
DATN_SU25_THODANITXYZ/
├── 📁 backend/                 # Backend API Server
│   ├── 📁 src/
│   │   ├── 📁 config/         # Database & app configuration
│   │   ├── 📁 controllers/    # Business logic controllers
│   │   ├── 📁 middlewares/    # Custom middleware
│   │   ├── 📁 models/         # MongoDB schemas
│   │   ├── 📁 routes/         # API routes
│   │   ├── 📁 utils/          # Helper functions
│   │   ├── 📁 validation/     # Request validation
│   │   └── app.js            # Entry point
│   ├── 📁 uploads/           # Temporary file storage
│   ├── package.json          # Dependencies
│   ├── .env.example          # Environment variables template
│   └── README.md            # Backend documentation
├── 📁 frontend/              # React Frontend
│   ├── 📁 public/            # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/    # Reusable components
│   │   ├── 📁 pages/         # Page components
│   │   ├── 📁 layouts/       # Layout components
│   │   ├── 📁 hooks/         # Custom React hooks
│   │   ├── 📁 contexts/      # React contexts
│   │   ├── 📁 services/      # API services
│   │   ├── 📁 api/           # API configuration
│   │   ├── 📁 utils/         # Utility functions
│   │   ├── 📁 interfaces/    # TypeScript interfaces
│   │   ├── App.tsx          # Main app component
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── package.json         # Dependencies
│   ├── vite.config.ts       # Vite configuration
│   ├── tailwind.config.js   # Tailwind configuration
│   ├── tsconfig.json        # TypeScript configuration
│   └── README.md           # Frontend documentation
├── 📁 docs/                 # Documentation
├── 📁 tests/               # Test files
├── docker-compose.yml      # Docker configuration
├── .gitignore             # Git ignore rules
└── README.md             # This file
```

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống
- **Node.js** >= 18.0.0
- **MongoDB** >= 6.0.0
- **npm** >= 8.0.0 hoặc **pnpm** >= 7.0.0
- **Git** >= 2.30.0

### 1. Clone Repository
```bash
# Clone dự án từ GitHub
git clone https://github.com/your-username/DATN_SU25_THODANITXYZ.git
cd DATN_SU25_THODANITXYZ
```

### 2. Cài đặt Dependencies
```bash
# Cài đặt dependencies cho backend
cd backend
npm install
# hoặc
pnpm install

# Cài đặt dependencies cho frontend
cd ../frontend
npm install
# hoặc
pnpm install
```

### 3. Cấu hình Environment Variables

#### Backend Environment (.env)
```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/DATN
MONGODB_TEST_URI=mongodb://localhost:27017/DATN_test

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_REFRESH_EXPIRE=30d

# Cloudinary Configuration (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@techtrend.com

# Payment Configuration
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_SECRET_KEY=your_vnpay_secret_key
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/payment/vnpay-return

# Other Services
REDIS_URL=redis://localhost:6379
ELASTICSEARCH_URL=http://localhost:9200
```

#### Frontend Environment (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_API_TIMEOUT=10000

# App Configuration
VITE_APP_NAME=TechTrend
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Hệ thống thương mại điện tử

# External Services
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_ANALYTICS_ID=your_google_analytics_id

# Feature Flags
VITE_ENABLE_PWA=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_CHAT=false
```

### 4. Khởi động MongoDB
```bash
# Nếu sử dụng MongoDB local
mongod --dbpath /path/to/your/db

# Hoặc sử dụng Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Hoặc sử dụng MongoDB Atlas (cloud)
# Cập nhật MONGODB_URI trong .env với connection string từ Atlas
```

### 5. Khởi tạo Database
```bash
cd backend

# Khởi tạo database và tạo indexes
npm run init-db

# Thêm dữ liệu mẫu (optional)
npm run seed

# Tạo admin user mặc định
npm run create-admin
```

### 6. Chạy ứng dụng

#### Development Mode
```bash
# Terminal 1: Chạy backend
cd backend
npm run dev
# Backend sẽ chạy tại: http://localhost:5000

# Terminal 2: Chạy frontend
cd frontend
npm run dev
# Frontend sẽ chạy tại: http://localhost:3000
```

#### Production Mode
```bash
# Build frontend
cd frontend
npm run build

# Chạy backend production
cd ../backend
npm run start
```

### 7. Truy cập ứng dụng
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **API Documentation**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

### 8. Tài khoản mặc định
```
Admin Account:
- Email: admin@techtrend.com
- Password: admin123

Customer Account:
- Email: user@techtrend.com
- Password: user123
```

## 📖 Hướng dẫn sử dụng

### Cho Khách hàng
1. **Đăng ký/Đăng nhập**: Tạo tài khoản hoặc đăng nhập vào hệ thống
2. **Duyệt sản phẩm**: Xem danh sách sản phẩm, tìm kiếm và lọc theo danh mục
3. **Chi tiết sản phẩm**: Xem thông tin chi tiết, đánh giá và đặt câu hỏi
4. **Giỏ hàng**: Thêm sản phẩm vào giỏ hàng và quản lý số lượng
5. **Thanh toán**: Chọn phương thức thanh toán và hoàn tất đơn hàng
6. **Theo dõi đơn hàng**: Xem trạng thái và lịch sử đơn hàng

### Cho Quản trị viên
1. **Dashboard**: Xem tổng quan doanh thu, đơn hàng và người dùng
2. **Quản lý sản phẩm**: Thêm, sửa, xóa sản phẩm và upload hình ảnh
3. **Quản lý đơn hàng**: Cập nhật trạng thái và xử lý đơn hàng
4. **Quản lý người dùng**: Xem danh sách và phân quyền người dùng
5. **Báo cáo**: Xem báo cáo doanh thu và thống kê chi tiết

## 📚 API Documentation

### Authentication Endpoints
```http
POST   /api/auth/register          # Đăng ký tài khoản
POST   /api/auth/login             # Đăng nhập
POST   /api/auth/refresh           # Refresh token
POST   /api/auth/logout            # Đăng xuất
POST   /api/auth/forgot-password   # Quên mật khẩu
POST   /api/auth/reset-password    # Đặt lại mật khẩu
GET    /api/auth/me                # Thông tin user hiện tại
PUT    /api/auth/profile           # Cập nhật profile
```

### Product Endpoints
```http
GET    /api/products               # Danh sách sản phẩm
GET    /api/products/:id           # Chi tiết sản phẩm
POST   /api/products               # Tạo sản phẩm mới (Admin)
PUT    /api/products/:id           # Cập nhật sản phẩm (Admin)
DELETE /api/products/:id           # Xóa sản phẩm (Admin)
GET    /api/products/search        # Tìm kiếm sản phẩm
GET    /api/products/featured      # Sản phẩm nổi bật
```

### Order Endpoints
```http
GET    /api/orders                 # Danh sách đơn hàng
GET    /api/orders/:id             # Chi tiết đơn hàng
POST   /api/orders                 # Tạo đơn hàng mới
PUT    /api/orders/:id             # Cập nhật đơn hàng
DELETE /api/orders/:id             # Hủy đơn hàng
GET    /api/orders/my-orders       # Đơn hàng của user hiện tại
PUT    /api/orders/:id/status      # Cập nhật trạng thái (Admin)
```

### Cart Endpoints
```http
GET    /api/cart                   # Lấy giỏ hàng
POST   /api/cart/add               # Thêm sản phẩm vào giỏ
PUT    /api/cart/update            # Cập nhật số lượng
DELETE /api/cart/remove/:productId # Xóa sản phẩm khỏi giỏ
DELETE /api/cart/clear             # Xóa toàn bộ giỏ hàng
```

### Admin Endpoints
```http
GET    /api/admin/dashboard        # Thống kê dashboard
GET    /api/admin/users            # Quản lý users
GET    /api/admin/analytics        # Báo cáo analytics
GET    /api/admin/orders           # Quản lý orders
PUT    /api/admin/settings         # Cài đặt hệ thống
```

## 🚀 Deployment

### Development Deployment
```bash
# Sử dụng Docker Compose
docker-compose up -d

# Hoặc deploy manual
npm run deploy:dev
```

### Production Deployment

#### Backend (Node.js Server)
```bash
# Build production
npm run build

# Deploy với PM2
pm2 start ecosystem.config.js

# Hoặc deploy lên cloud platforms
# Heroku, Railway, DigitalOcean, AWS, etc.
```

#### Frontend (React App)
```bash
# Build production
cd frontend
npm run build

# Deploy static files
# Vercel, Netlify, AWS S3, etc.
```

#### Database (MongoDB)
```bash
# MongoDB Atlas (Recommended)
# Hoặc self-hosted MongoDB với replica set
```

### Environment-specific Configs
```
environments/
├── development.env
├── staging.env
└── production.env
```

## 📊 Monitoring & Analytics

### Performance Monitoring
- **Backend**: New Relic, DataDog
- **Frontend**: Google Analytics, Sentry
- **Database**: MongoDB Compass, Grafana

### Logging
```javascript
// Winston logger configuration
const logger = require('./utils/logger');

logger.info('User logged in', { userId, email });
logger.error('Payment failed', { orderId, error });
```

### Health Checks
```http
GET /api/health              # API health status
GET /api/health/db           # Database connection status
GET /api/health/services     # External services status
```

## 🤝 Đóng góp

### Quy trình đóng góp
1. **Fork** repository
2. **Clone** fork về máy local
3. **Tạo branch** cho feature/bugfix
4. **Implement** changes với tests
5. **Commit** với conventional commit format
6. **Push** lên fork repository
7. **Tạo Pull Request** với mô tả chi tiết

### Conventional Commits
```
feat: thêm tính năng mới
fix: sửa lỗi
docs: cập nhật documentation
style: thay đổi formatting
refactor: refactor code
test: thêm tests
chore: cập nhật build tools
```

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No breaking changes
- [ ] Performance impact considered

## 📞 Liên hệ & Hỗ trợ

### Thông tin liên hệ
- **Email**: support@techtrend.com
- **Phone**: +84 123 456 789
- **Website**: https://techtrend.com

### Báo cáo lỗi
- **GitHub Issues**: [Create Issue](https://github.com/your-username/DATN_SU25_THODANITXYZ/issues)
- **Email**: bugs@techtrend.com

### Tài liệu bổ sung
- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Contributing Guide](./docs/CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

## 🙏 Acknowledgments

### Thư viện & Framework
- [React.js](https://reactjs.org/) - Frontend framework
- [Node.js](https://nodejs.org/) - Backend runtime
- [MongoDB](https://www.mongodb.com/) - Database
- [Ant Design](https://ant.design/) - UI component library
- [Express.js](https://expressjs.com/) - Backend framework

### Inspiration
- [Shopify](https://shopify.com) - E-commerce platform inspiration
- [Amazon](https://amazon.com) - User experience reference
- [Tiki](https://tiki.vn) - Vietnamese e-commerce reference

---

**Phát triển bởi**: Group Thổ Dân IT - WD62  
**Trường**: Cao Đẳng FPT PolyTechnic  
**Khoa**: Công Nghệ Thông Tin  
**Năm**: 2025  
**Đồ án tốt nghiệp**: Hệ thống Thương mại Điện tử TechTrend  
---

⭐ **Nếu dự án này hữu ích, hãy cho một star trên GitHub!** ⭐
