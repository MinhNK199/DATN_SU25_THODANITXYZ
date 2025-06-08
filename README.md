# 🛒 TechTrend - Hệ thống Thương mại Điện tử

> **Dự án Đồ án Tốt nghiệp (DATN)** - Hệ thống thương mại chuyên về sản phẩm công nghệ

Một nền tảng e-commerce hiện đại được xây dựng với **React.js**, **Node.js**, **MongoDB** và **Soft UI Dashboard React**.

## 📋 Mục lục

- [Tổng quan dự án](#-tổng-quan-dự-án)
- [Tính năng chính](#-tính-năng-chính)
- [Công nghệ sử dụng](#️-công-nghệ-sử-dụng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Cấu trúc Database](#️-cấu-trúc-database)
- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [API Documentation](#-api-documentation)
- [Hướng dẫn phát triển](#-hướng-dẫn-phát-triển)
- [Testing](#-testing)
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
| **React Router** | 6.8+ | Client-side routing |
| **Ant Design** | 5.0+ | UI Component Library |
| **Soft UI Dashboard** | 1.0+ | Admin template |
| **Zustand** | 4.3+ | State management |
| **React Query** | 4.0+ | Data fetching & caching |
| **Axios** | 1.3+ | HTTP client |
| **Chart.js** | 4.2+ | Data visualization |

### DevOps & Tools
- **Docker** - Containerization
- **Nginx** - Reverse proxy
- **PM2** - Process manager
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📁 Cấu trúc dự án

\`\`\`
electronics-ecommerce/
├── 📁 backend/                 # Backend API Server
│   ├── 📁 config/             # Database & app configuration
│   │   ├── database.js        # MongoDB connection
│   │   ├── cloudinary.js      # Image upload config
│   │   └── email.js           # Email service config
│   ├── 📁 controllers/        # Business logic controllers
│   │   ├── authController.js  # Authentication logic
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── ...
│   ├── 📁 middleware/         # Custom middleware
│   │   ├── auth.js           # JWT authentication
│   │   ├── validation.js     # Input validation
│   │   ├── errorHandler.js   # Error handling
│   │   └── upload.js         # File upload
│   ├── 📁 models/            # Mongoose schemas
│   │   ├── User.js           # User model
│   │   ├── Product.js        # Product model
│   │   ├── Order.js          # Order model
│   │   ├── Category.js       # Category model
│   │   ├── Review.js         # Review model
│   │   ├── Cart.js           # Shopping cart model
│   │   ├── Coupon.js         # Discount coupon model
│   │   ├── Brand.js          # Brand model
│   │   ├── Address.js        # Address model
│   │   ├── Notification.js   # Notification model
│   │   └── Analytics.js      # Analytics model
│   ├── 📁 routes/            # API routes
│   │   ├── auth.js           # Authentication routes
│   │   ├── products.js       # Product routes
│   │   ├── orders.js         # Order routes
│   │   ├── categories.js     # Category routes
│   │   ├── reviews.js        # Review routes
│   │   ├── cart.js           # Cart routes
│   │   ├── coupons.js        # Coupon routes
│   │   ├── upload.js         # File upload routes
│   │   └── admin.js          # Admin routes
│   ├── 📁 scripts/           # Utility scripts
│   │   ├── initDatabase.js   # Database initialization
│   │   ├── seedData.js       # Sample data seeding
│   │   └── backup.js         # Database backup
│   ├── 📁 utils/             # Helper functions
│   │   ├── helpers.js        # Common utilities
│   │   ├── validators.js     # Data validation
│   │   ├── emailTemplates.js # Email templates
│   │   └── constants.js      # App constants
│   ├── 📁 uploads/           # Temporary file storage
│   ├── .env                  # Environment variables
│   ├── server.js             # Entry point
│   └── package.json          # Dependencies
├── 📁 frontend/              # React Frontend
│   ├── 📁 public/            # Static assets
│   │   ├── index.html        # Main HTML template
│   │   ├── favicon.ico       # App icon
│   │   └── manifest.json     # PWA manifest
│   ├── 📁 src/               # Source code
│   │   ├── 📁 components/    # Reusable components
│   │   │   ├── 📁 common/    # Common components
│   │   │   │   ├── Header.js
│   │   │   │   ├── Footer.js
│   │   │   │   ├── Loading.js
│   │   │   │   └── ErrorBoundary.js
│   │   │   ├── 📁 product/   # Product components
│   │   │   │   ├── ProductCard.js
│   │   │   │   ├── ProductList.js
│   │   │   │   ├── ProductDetail.js
│   │   │   │   └── ProductFilter.js
│   │   │   ├── 📁 cart/      # Cart components
│   │   │   │   ├── CartItem.js
│   │   │   │   ├── CartSummary.js
│   │   │   │   └── Checkout.js
│   │   │   └── 📁 admin/     # Admin components
│   │   │       ├── Dashboard.js
│   │   │       ├── ProductManager.js
│   │   │       └── OrderManager.js
│   │   ├── 📁 layouts/       # Layout components
│   │   │   ├── MainLayout.js # Customer layout
│   │   │   ├── AdminLayout.js # Admin layout
│   │   │   └── AuthLayout.js # Authentication layout
│   │   ├── 📁 pages/         # Page components
│   │   │   ├── 📁 customer/  # Customer pages
│   │   │   │   ├── HomePage.js
│   │   │   │   ├── ProductPage.js
│   │   │   │   ├── CartPage.js
│   │   │   │   ├── CheckoutPage.js
│   │   │   │   ├── ProfilePage.js
│   │   │   │   └── OrderHistoryPage.js
│   │   │   ├── 📁 admin/     # Admin pages
│   │   │   │   ├── DashboardPage.js
│   │   │   │   ├── ProductsPage.js
│   │   │   │   ├── OrdersPage.js
│   │   │   │   ├── UsersPage.js
│   │   │   │   └── AnalyticsPage.js
│   │   │   └── 📁 auth/      # Authentication pages
│   │   │       ├── LoginPage.js
│   │   │       ├── RegisterPage.js
│   │   │       └── ForgotPasswordPage.js
│   │   ├── 📁 services/      # API services
│   │   │   ├── api.js        # Axios configuration
│   │   │   ├── authService.js # Authentication API
│   │   │   ├── productService.js # Product API
│   │   │   ├── orderService.js # Order API
│   │   │   └── cartService.js # Cart API
│   │   ├── 📁 store/         # State management
│   │   │   ├── authStore.js  # Authentication state
│   │   │   ├── cartStore.js  # Shopping cart state
│   │   │   ├── productStore.js # Product state
│   │   │   └── notificationStore.js # Notification state
│   │   ├── 📁 utils/         # Utility functions
│   │   │   ├── helpers.js    # Common helpers
│   │   │   ├── constants.js  # App constants
│   │   │   ├── formatters.js # Data formatters
│   │   │   └── validators.js # Form validation
│   │   ├── 📁 hooks/         # Custom React hooks
│   │   │   ├── useAuth.js    # Authentication hook
│   │   │   ├── useCart.js    # Cart management hook
│   │   │   └── useApi.js     # API calling hook
│   │   ├── 📁 styles/        # CSS styles
│   │   │   ├── globals.css   # Global styles
│   │   │   ├── variables.css # CSS variables
│   │   │   └── components.css # Component styles
│   │   ├── App.js            # Main app component
│   │   ├── index.js          # Entry point
│   │   └── setupTests.js     # Test configuration
│   ├── .env                  # Environment variables
│   └── package.json          # Dependencies
├── 📁 docs/                  # Documentation
│   ├── API.md               # API documentation
│   ├── DEPLOYMENT.md        # Deployment guide
│   └── CONTRIBUTING.md      # Contribution guide
├── 📁 tests/                # Test files
│   ├── 📁 backend/          # Backend tests
│   └── 📁 frontend/         # Frontend tests
├── docker-compose.yml       # Docker configuration
├── .gitignore              # Git ignore rules
├── README.md               # This file
└── package.json            # Root package.json
\`\`\`

## 🗄️ Cấu trúc Database

### Sơ đồ ERD
Hệ thống sử dụng MongoDB với các collections chính:

\`\`\`mermaid
erDiagram
    USERS ||--o{ ORDERS : "places"
    USERS ||--o{ REVIEWS : "writes"
    USERS ||--o{ CART : "has"
    USERS ||--o{ ADDRESSES : "has"
    
    CATEGORIES ||--o{ PRODUCTS : "contains"
    CATEGORIES ||--o{ CATEGORIES : "parent-child"
    
    PRODUCTS ||--o{ ORDER_ITEMS : "ordered_as"
    PRODUCTS ||--o{ REVIEWS : "reviewed"
    PRODUCTS ||--o{ CART_ITEMS : "added_to_cart"
    
    BRANDS ||--o{ PRODUCTS : "manufactures"
    ORDERS ||--o{ ORDER_ITEMS : "contains"
\`\`\`

### Collections chính

| Collection | Mô tả | Số lượng ước tính |
|------------|-------|-------------------|
| **users** | Thông tin người dùng, admin | 1,000+ |
| **products** | Sản phẩm với đầy đủ thông tin | 500+ |
| **categories** | Danh mục đa cấp | 50+ |
| **brands** | Thương hiệu sản phẩm | 20+ |
| **orders** | Đơn hàng và trạng thái | 2,000+ |
| **reviews** | Đánh giá sản phẩm | 1,500+ |
| **carts** | Giỏ hàng người dùng | 1,000+ |
| **coupons** | Mã giảm giá | 100+ |
| **addresses** | Địa chỉ giao hàng | 2,000+ |
| **notifications** | Thông báo hệ thống | 5,000+ |

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống
- **Node.js** >= 18.0.0
- **MongoDB** >= 6.0.0
- **npm** >= 8.0.0 hoặc **yarn** >= 1.22.0
- **Git** >= 2.30.0

### 1. Clone Repository
\`\`\`bash
# Clone dự án từ GitHub
git clone https://github.com/your-username/electronics-ecommerce.git
cd electronics-ecommerce

# Hoặc download ZIP và giải nén
\`\`\`

### 2. Cài đặt Dependencies
\`\`\`bash
# Cài đặt dependencies cho toàn bộ dự án
npm install

# Hoặc cài đặt riêng từng phần
cd backend && npm install
cd ../frontend && npm install
\`\`\`

### 3. Cấu hình Environment Variables

#### Backend Environment (.env)
\`\`\`env
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
EMAIL_FROM=noreply@electroshop.com

# Payment Configuration
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_SECRET_KEY=your_vnpay_secret_key
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/payment/vnpay-return

# Other Services
REDIS_URL=redis://localhost:6379
ELASTICSEARCH_URL=http://localhost:9200
\`\`\`

#### Frontend Environment (.env)
\`\`\`env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=10000

# App Configuration
REACT_APP_NAME=ElectroShop
REACT_APP_VERSION=1.0.0
REACT_APP_DESCRIPTION=Hệ thống thương mại điện tử

# External Services
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_ANALYTICS_ID=your_google_analytics_id

# Feature Flags
REACT_APP_ENABLE_PWA=true
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_CHAT=false
\`\`\`

### 4. Khởi động MongoDB
\`\`\`bash
# Nếu sử dụng MongoDB local
mongod --dbpath /path/to/your/db

# Hoặc sử dụng Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Hoặc sử dụng MongoDB Atlas (cloud)
# Cập nhật MONGODB_URI trong .env với connection string từ Atlas
\`\`\`

### 5. Khởi tạo Database
\`\`\`bash
cd backend

# Khởi tạo database và tạo indexes
npm run init-db

# Thêm dữ liệu mẫu (optional)
npm run seed

# Tạo admin user mặc định
npm run create-admin
\`\`\`

### 6. Chạy ứng dụng

#### Development Mode
\`\`\`bash
# Chạy cả backend và frontend cùng lúc
npm run dev

# Hoặc chạy riêng từng phần
npm run backend:dev    # Backend: http://localhost:5000
npm run frontend:dev   # Frontend: http://localhost:3000
\`\`\`

#### Production Mode
\`\`\`bash
# Build frontend
npm run frontend:build

# Chạy backend production
npm run backend:start
\`\`\`

### 7. Truy cập ứng dụng
- **Frontend**: [http://localhost:3000](http://localhgigiost:3000)
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **API Documentation**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

### 8. Tài khoản mặc định
\`\`\`
Admin Account:
- Email: admin@datn.com
- Password: admin123

Customer Account:
- Email: user@datn.com
- Password: user123
\`\`\`

## 📚 API Documentation

### Authentication Endpoints
\`\`\`http
POST   /api/auth/register          # Đăng ký tài khoản
POST   /api/auth/login             # Đăng nhập
POST   /api/auth/refresh           # Refresh token
POST   /api/auth/logout            # Đăng xuất
POST   /api/auth/forgot-password   # Quên mật khẩu
POST   /api/auth/reset-password    # Đặt lại mật khẩu
GET    /api/auth/me                # Thông tin user hiện tại
PUT    /api/auth/profile           # Cập nhật profile
\`\`\`

### Product Endpoints
\`\`\`http
GET    /api/products               # Danh sách sản phẩm (có filter, search, pagination)
GET    /api/products/:id           # Chi tiết sản phẩm
POST   /api/products               # Tạo sản phẩm mới (Admin)
PUT    /api/products/:id           # Cập nhật sản phẩm (Admin)
DELETE /api/products/:id           # Xóa sản phẩm (Admin)
GET    /api/products/search        # Tìm kiếm sản phẩm
GET    /api/products/featured      # Sản phẩm nổi bật
GET    /api/products/new-arrivals  # Sản phẩm mới
\`\`\`

### Category Endpoints
\`\`\`http
GET    /api/categories             # Danh sách danh mục
GET    /api/categories/:id         # Chi tiết danh mục
POST   /api/categories             # Tạo danh mục (Admin)
PUT    /api/categories/:id         # Cập nhật danh mục (Admin)
DELETE /api/categories/:id         # Xóa danh mục (Admin)
GET    /api/categories/tree        # Cây danh mục đa cấp
\`\`\`

### Order Endpoints
\`\`\`http
GET    /api/orders                 # Danh sách đơn hàng
GET    /api/orders/:id             # Chi tiết đơn hàng
POST   /api/orders                 # Tạo đơn hàng mới
PUT    /api/orders/:id             # Cập nhật đơn hàng
DELETE /api/orders/:id             # Hủy đơn hàng
GET    /api/orders/my-orders       # Đơn hàng của user hiện tại
PUT    /api/orders/:id/status      # Cập nhật trạng thái (Admin)
\`\`\`

### Cart Endpoints
\`\`\`http
GET    /api/cart                   # Lấy giỏ hàng
POST   /api/cart/add               # Thêm sản phẩm vào giỏ
PUT    /api/cart/update            # Cập nhật số lượng
DELETE /api/cart/remove/:productId # Xóa sản phẩm khỏi giỏ
DELETE /api/cart/clear             # Xóa toàn bộ giỏ hàng
\`\`\`

### Review Endpoints
\`\`\`http
GET    /api/reviews/product/:id    # Đánh giá của sản phẩm
POST   /api/reviews                # Tạo đánh giá mới
PUT    /api/reviews/:id            # Cập nhật đánh giá
DELETE /api/reviews/:id            # Xóa đánh giá
GET    /api/reviews/my-reviews     # Đánh giá của user hiện tại
\`\`\`

### Admin Endpoints
\`\`\`http
GET    /api/admin/dashboard        # Thống kê dashboard
GET    /api/admin/users            # Quản lý users
GET    /api/admin/analytics        # Báo cáo analytics
GET    /api/admin/orders           # Quản lý orders
PUT    /api/admin/settings         # Cài đặt hệ thống
\`\`\`

## 🔧 Hướng dẫn phát triển

### Coding Standards
\`\`\`bash
# Chạy linting
npm run lint

# Tự động fix linting issues
npm run lint:fix

# Format code với Prettier
npm run format

# Type checking (nếu sử dụng TypeScript)
npm run type-check
\`\`\`

### Git Workflow
\`\`\`bash
# Tạo feature branch
git checkout -b feature/ten-tinh-nang

# Commit với conventional commits
git commit -m "feat: thêm tính năng tìm kiếm sản phẩm"

# Push và tạo Pull Request
git push origin feature/ten-tinh-nang
\`\`\`

### Database Operations
\`\`\`bash
# Backup database
npm run db:backup

# Restore database
npm run db:restore

# Reset database
npm run db:reset

# Migrate database
npm run db:migrate
\`\`\`

## 🧪 Testing

### Backend Testing
\`\`\`bash
cd backend

# Chạy tất cả tests
npm test

# Chạy tests với coverage
npm run test:coverage

# Chạy tests trong watch mode
npm run test:watch

# Chạy integration tests
npm run test:integration
\`\`\`

### Frontend Testing
\`\`\`bash
cd frontend

# Chạy unit tests
npm test

# Chạy E2E tests với Cypress
npm run test:e2e

# Chạy tests với coverage
npm run test:coverage
\`\`\`

### Test Structure
\`\`\`
tests/
├── backend/
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── fixtures/       # Test data
└── frontend/
    ├── components/     # Component tests
    ├── pages/          # Page tests
    └── e2e/           # End-to-end tests
\`\`\`

## 🚀 Deployment

### Development Deployment
\`\`\`bash
# Sử dụng Docker Compose
docker-compose up -d

# Hoặc deploy manual
npm run deploy:dev
\`\`\`

### Production Deployment

#### Backend (Node.js Server)
\`\`\`bash
# Build production
npm run build

# Deploy với PM2
pm2 start ecosystem.config.js

# Hoặc deploy lên cloud platforms
# Heroku, Railway, DigitalOcean, AWS, etc.
\`\`\`

#### Frontend (React App)
\`\`\`bash
# Build production
cd frontend
npm run build

# Deploy static files
# Vercel, Netlify, AWS S3, etc.
\`\`\`

#### Database (MongoDB)
\`\`\`bash
# MongoDB Atlas (Recommended)
# Hoặc self-hosted MongoDB với replica set
\`\`\`

### Environment-specific Configs
\`\`\`
environments/
├── development.env
├── staging.env
└── production.env
\`\`\`

## 📊 Monitoring & Analytics

### Performance Monitoring
- **Backend**: New Relic, DataDog
- **Frontend**: Google Analytics, Sentry
- **Database**: MongoDB Compass, Grafana

### Logging
\`\`\`javascript
// Winston logger configuration
const logger = require('./utils/logger');

logger.info('User logged in', { userId, email });
logger.error('Payment failed', { orderId, error });
\`\`\`

### Health Checks
\`\`\`http
GET /api/health              # API health status
GET /api/health/db           # Database connection status
GET /api/health/services     # External services status
\`\`\`

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
\`\`\`
feat: thêm tính năng mới
fix: sửa lỗi
docs: cập nhật documentation
style: thay đổi formatting
refactor: refactor code
test: thêm tests
chore: cập nhật build tools
\`\`\`

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No breaking changes
- [ ] Performance impact considered

## 📞 Liên hệ & Hỗ trợ

### Thông tin liên hệ
- **Email**: support@electroshop.com
- **Phone**: +84 123 456 789
- **Website**: https://electroshop.com

### Báo cáo lỗi
- **GitHub Issues**: [Create Issue](https://github.com/your-username/electronics-ecommerce/issues)
- **Email**: bugs@electroshop.com

### Tài liệu bổ sung
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
- [Soft UI Dashboard React](https://www.creative-tim.com/product/soft-ui-dashboard-react) - Admin template

### Inspiration
- [Shopify](https://shopify.com) - E-commerce platform inspiration
- [Amazon](https://amazon.com) - User experience reference
- [Tiki](https://tiki.vn) - Vietnamese e-commerce reference

---

**Phát triển bởi**: [Tên sinh viên] - [Mã sinh viên]  
**Trường**: [Tên trường đại học]  
**Khoa**: [Tên khoa]  
**Năm**: 2024  
**Đồ án tốt nghiệp**: Hệ thống Thương mại Điện tử

---

⭐ **Nếu dự án này hữu ích, hãy cho một star trên GitHub!** ⭐
