# 🎨 TechTrend Frontend

> **Frontend React cho hệ thống thương mại điện tử TechTrend**

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Công nghệ sử dụng](#️-công-nghệ-sử-dụng)
- [Cài đặt và chạy](#-cài-đặt-và-chạy)
- [Tính năng chính](#-tính-năng-chính)
- [Components](#-components)
- [State Management](#-state-management)
- [Routing](#-routing)
- [API Integration](#-api-integration)
- [Styling](#-styling)
- [Testing](#-testing)
- [Build & Deployment](#-build--deployment)

## 🎯 Tổng quan

Frontend được xây dựng bằng **React.js** với **TypeScript**, sử dụng **Vite** làm build tool. Giao diện được thiết kế hiện đại với **Ant Design** và **Tailwind CSS**, cung cấp trải nghiệm người dùng tốt nhất cho cả khách hàng và quản trị viên.

### ✨ Đặc điểm nổi bật

- 🚀 **Performance**: Vite build tool, code splitting, lazy loading
- 📱 **Responsive**: Mobile-first design, PWA support
- 🎨 **UI/UX**: Modern design với Ant Design + Tailwind CSS
- 🔒 **Security**: JWT authentication, role-based access
- 📊 **Analytics**: Real-time data với React Query
- 🔔 **Notifications**: Real-time notifications với Socket.io
- 🛒 **E-commerce**: Đầy đủ tính năng thương mại điện tử

## 📁 Cấu trúc dự án

```
frontend/
├── public/                 # Static assets
│   ├── index.html         # Main HTML template
│   ├── favicon.ico        # App icon
│   └── manifest.json      # PWA manifest
├── src/
│   ├── components/        # Reusable components
│   │   ├── common/        # Common components
│   │   ├── product/       # Product components
│   │   ├── cart/          # Cart components
│   │   ├── auth/          # Authentication components
│   │   └── admin/         # Admin components
│   ├── pages/             # Page components
│   │   ├── customer/      # Customer pages
│   │   ├── admin/         # Admin pages
│   │   └── auth/          # Authentication pages
│   ├── layouts/           # Layout components
│   ├── hooks/             # Custom React hooks
│   ├── contexts/          # React contexts
│   ├── services/          # API services
│   ├── api/               # API configuration
│   ├── utils/             # Utility functions
│   ├── interfaces/        # TypeScript interfaces
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── package.json          # Dependencies
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # Documentation
```

## 🛠️ Công nghệ sử dụng

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
| **React Hook Form** | 7.0+ | Form handling |
| **Yup** | 1.0+ | Form validation |
| **Chart.js** | 4.2+ | Data visualization |
| **React Icons** | 4.0+ | Icon library |

## ⚙️ Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 18+
- npm hoặc pnpm

### Cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd frontend
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
# Chỉnh sửa file .env với thông tin API
```

4. **Chạy development server**
```bash
npm run dev
# hoặc
pnpm dev
```

Ứng dụng sẽ chạy tại: `http://localhost:3000`

## ✨ Tính năng chính

### 👥 Dành cho Khách hàng
- 🏠 **Trang chủ** - Slider, sản phẩm nổi bật, danh mục
- 🛍️ **Catalog sản phẩm** - Tìm kiếm, lọc, sắp xếp
- 📱 **Chi tiết sản phẩm** - Gallery ảnh, thông số kỹ thuật
- 🛒 **Giỏ hàng** - Quản lý giỏ hàng thông minh
- 💳 **Thanh toán** - Đa phương thức (COD, Banking, E-wallet)
- 📦 **Quản lý đơn hàng** - Theo dõi trạng thái đơn hàng
- ⭐ **Đánh giá sản phẩm** - Rating và comment
- ❤️ **Wishlist** - Danh sách yêu thích
- 👤 **Profile** - Quản lý thông tin cá nhân
- 📍 **Địa chỉ** - Quản lý địa chỉ giao hàng
- 🔔 **Thông báo** - Real-time notifications

### 🔧 Dành cho Quản trị viên
- 📊 **Dashboard** - Biểu đồ thống kê tổng quan
- 🛍️ **Quản lý sản phẩm** - CRUD với upload hình ảnh
- 📂 **Quản lý danh mục** - Danh mục đa cấp
- 🏷️ **Quản lý thương hiệu** - Brands management
- 📦 **Quản lý đơn hàng** - Cập nhật trạng thái
- 👥 **Quản lý người dùng** - User management
- 🎫 **Quản lý mã giảm giá** - Coupons management
- 📈 **Báo cáo doanh thu** - Revenue analytics
- 🖼️ **Quản lý banner** - Content management
- ⚙️ **Cài đặt hệ thống** - System configuration

### 🚀 Tính năng nâng cao
- 🔍 **Tìm kiếm thông minh** - Elasticsearch integration
- 🎯 **Recommendation system** - AI gợi ý sản phẩm
- ⚡ **Real-time notifications** - Socket.io integration
- 📧 **Email marketing** - Automated emails
- 🔍 **SEO optimization** - Meta tags, structured data
- 📱 **Mobile responsive** - Progressive Web App
- 🎨 **Dark mode** - Theme switching
- 🌐 **Internationalization** - Multi-language support

## 🧩 Components

### Common Components
```typescript
// Layout components
<Header />           // Navigation header
<Footer />           // Site footer
<Sidebar />          // Admin sidebar
<Loading />          // Loading spinner
<ErrorBoundary />    // Error handling

// Form components
<FormInput />        // Input field
<FormSelect />       // Select dropdown
<FormCheckbox />     // Checkbox
<FormDatePicker />   // Date picker
<FormUpload />       // File upload

// UI components
<Button />           // Custom button
<Card />             // Card container
<Modal />            // Modal dialog
<Table />            // Data table
<Pagination />       // Pagination
```

### Product Components
```typescript
<ProductCard />      // Product display card
<ProductList />      // Product grid/list
<ProductDetail />    // Product detail page
<ProductFilter />    // Filter sidebar
<ProductGallery />   // Image gallery
<ProductReviews />   // Reviews section
<ProductQA />        // Q&A section
<RelatedProducts />  // Related products
```

### Cart Components
```typescript
<CartItem />         // Individual cart item
<CartSummary />      // Cart totals
<CartDrawer />       // Cart sidebar
<CheckoutForm />     // Checkout form
<PaymentMethods />   // Payment options
<OrderSummary />     // Order review
```

### Admin Components
```typescript
<Dashboard />        // Admin dashboard
<ProductManager />   // Product CRUD
<OrderManager />     // Order management
<UserManager />      // User management
<Analytics />        // Charts and reports
<Settings />         // System settings
```

## 📊 State Management

### Zustand Stores
```typescript
// Authentication store
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UserData) => Promise<void>;
}

// Cart store
interface CartStore {
  items: CartItem[];
  total: number;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

// Product store
interface ProductStore {
  products: Product[];
  categories: Category[];
  filters: ProductFilters;
  setProducts: (products: Product[]) => void;
  setFilters: (filters: ProductFilters) => void;
  searchProducts: (query: string) => Promise<void>;
}
```

### React Query Integration
```typescript
// Product queries
const { data: products, isLoading } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => productService.getProducts(filters)
});

// Order mutations
const createOrderMutation = useMutation({
  mutationFn: orderService.createOrder,
  onSuccess: (data) => {
    queryClient.invalidateQueries(['orders']);
    navigate(`/orders/${data.id}`);
  }
});
```

## 🛣️ Routing

### Customer Routes
```typescript
const customerRoutes = [
  { path: '/', element: <HomePage /> },
  { path: '/products', element: <ProductListPage /> },
  { path: '/products/:id', element: <ProductDetailPage /> },
  { path: '/cart', element: <CartPage /> },
  { path: '/checkout', element: <CheckoutPage /> },
  { path: '/orders', element: <OrderHistoryPage /> },
  { path: '/profile', element: <ProfilePage /> },
  { path: '/wishlist', element: <WishlistPage /> }
];
```

### Admin Routes
```typescript
const adminRoutes = [
  { path: '/admin', element: <AdminDashboard /> },
  { path: '/admin/products', element: <ProductManager /> },
  { path: '/admin/orders', element: <OrderManager /> },
  { path: '/admin/users', element: <UserManager /> },
  { path: '/admin/categories', element: <CategoryManager /> },
  { path: '/admin/analytics', element: <Analytics /> },
  { path: '/admin/settings', element: <Settings /> }
];
```

### Authentication Routes
```typescript
const authRoutes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> }
];
```

## 🔌 API Integration

### API Configuration
```typescript
// api/config.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      authStore.logout();
    }
    return Promise.reject(error);
  }
);
```

### Service Layer
```typescript
// services/productService.ts
export const productService = {
  getProducts: (filters: ProductFilters) => 
    api.get('/products', { params: filters }),
  
  getProduct: (id: string) => 
    api.get(`/products/${id}`),
  
  createProduct: (data: CreateProductData) => 
    api.post('/products', data),
  
  updateProduct: (id: string, data: UpdateProductData) => 
    api.put(`/products/${id}`, data),
  
  deleteProduct: (id: string) => 
    api.delete(`/products/${id}`)
};
```

## 🎨 Styling

### Tailwind CSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
```

### Component Styling
```typescript
// Sử dụng Tailwind CSS
const ProductCard = () => (
  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
    <img className="w-full h-48 object-cover rounded-t-lg" />
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-900">Product Name</h3>
      <p className="text-gray-600 mt-2">Product description</p>
      <div className="flex justify-between items-center mt-4">
        <span className="text-xl font-bold text-primary-600">$99.99</span>
        <Button type="primary">Add to Cart</Button>
      </div>
    </div>
  </div>
);
```

### Ant Design Integration
```typescript
// Custom theme
import { ConfigProvider } from 'antd';

const App = () => (
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#3b82f6',
        borderRadius: 8,
        fontFamily: 'Inter, sans-serif'
      }
    }}
  >
    <Router>
      <Routes />
    </Router>
  </ConfigProvider>
);
```

## 🧪 Testing

### Unit Testing
```bash
# Chạy tests
npm run test

# Chạy tests với coverage
npm run test:coverage

# Chạy tests trong watch mode
npm run test:watch
```

### Component Testing
```typescript
// ProductCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from './ProductCard';

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    const product = {
      id: '1',
      name: 'Test Product',
      price: 99.99,
      image: 'test.jpg'
    };

    render(<ProductCard product={product} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  it('calls onAddToCart when button is clicked', () => {
    const onAddToCart = jest.fn();
    render(<ProductCard onAddToCart={onAddToCart} />);
    
    fireEvent.click(screen.getByText('Add to Cart'));
    expect(onAddToCart).toHaveBeenCalled();
  });
});
```

### E2E Testing
```bash
# Chạy E2E tests với Cypress
npm run test:e2e

# Chạy E2E tests trong browser
npm run test:e2e:open
```

## 🚀 Build & Deployment

### Development Build
```bash
# Development server
npm run dev

# Build for development
npm run build:dev
```

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npm run analyze
```

### Deployment

#### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

#### Netlify Deployment
```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

#### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Variables
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

## 📚 Tài liệu tham khảo

- [React Documentation](https://reactjs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Ant Design Documentation](https://ant.design/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Query Documentation](https://tanstack.com/query)

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Dự án này được phát triển cho mục đích học tập và nghiên cứu.
