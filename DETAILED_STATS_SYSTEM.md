# 📊 Hệ thống Thống kê Chi tiết - Hướng dẫn đầy đủ

## 🎯 Tổng quan

Hệ thống thống kê chi tiết là một trang admin mới được tạo để cung cấp phân tích sâu về:
- **Doanh thu** (Revenue)
- **Khách hàng** (Customers) 
- **Sản phẩm** (Products)

## 🏗️ Kiến trúc hệ thống

### **Frontend (React + TypeScript)**
- **File chính:** `frontend/src/pages/admin/DetailedStats.tsx`
- **Navigation:** Tab-based interface với 3 tabs
- **Charts:** Sử dụng Recharts library
- **Styling:** Tailwind CSS với gradient và animations

### **Backend (Node.js + Express + MongoDB)**
- **Controller:** `backend/src/controllers/admin.js`
- **Routes:** `backend/src/routes/admin.js`
- **APIs:** 3 endpoints chính cho từng loại thống kê

## 📱 Giao diện người dùng

### **1. Navigation Tabs**
```typescript
// 3 tabs chính
- Doanh thu (Revenue) - FaChartLine icon
- Khách hàng (Customers) - FaUsers icon  
- Sản phẩm (Products) - FaBox icon
```

### **2. Layout Structure**
```
┌─────────────────────────────────────┐
│ Header: "Thống kê chi tiết"         │
├─────────────────────────────────────┤
│ Tab Navigation                      │
├─────────────────────────────────────┤
│ Tab Content (Dynamic)               │
│ ┌─────────────┐ ┌─────────────┐    │
│ │ Overview    │ │ Charts      │    │
│ │ Cards       │ │ & Graphs    │    │
│ └─────────────┘ └─────────────┘    │
└─────────────────────────────────────┘
```

## 🔧 API Endpoints

### **1. Revenue Detailed API**
```
GET /api/admin/revenue-detailed
Authorization: Bearer <admin_token>
```

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "total": 50000000,
    "growth": 15.5,
    "daily": [
      {
        "name": "2024-01-01",
        "totalRevenue": 1000000,
        "orderCount": 25
      }
    ],
    "byPaymentMethod": [
      {
        "name": "Momo",
        "value": 30000000,
        "count": 150
      }
    ],
    "byCategory": [
      {
        "name": "Điện thoại",
        "value": 20000000,
        "count": 50
      }
    ]
  }
}
```

### **2. Customers Detailed API**
```
GET /api/admin/customers-detailed
Authorization: Bearer <admin_token>
```

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "total": 1000,
    "new": 50,
    "active": 800,
    "growth": 12.5,
    "retention": 85.5,
    "bySegment": [
      {
        "name": "VIP",
        "newCustomers": 10,
        "returningCustomers": 40
      }
    ],
    "byLocation": [
      {
        "name": "Hà Nội",
        "customers": 300
      }
    ]
  }
}
```

### **3. Products Detailed API**
```
GET /api/admin/products-detailed
Authorization: Bearer <admin_token>
```

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "total": 500,
    "active": 450,
    "outOfStock": 20,
    "topSelling": [
      {
        "name": "iPhone 15",
        "sold": 100,
        "revenue": 50000000,
        "rating": 4.8
      }
    ],
    "byCategory": [
      {
        "name": "Điện thoại",
        "value": 200
      }
    ],
    "byBrand": [
      {
        "name": "Apple",
        "value": 150
      }
    ],
    "lowStock": [
      {
        "name": "iPhone 15",
        "stock": 5
      }
    ]
  }
}
```

## 📊 Chi tiết từng tab

### **1. Tab Doanh thu (Revenue)**

#### **Overview Cards:**
- **Tổng doanh thu** - Gradient blue, hiển thị tổng doanh thu và % tăng trưởng
- **Doanh thu hôm nay** - Gradient green, doanh thu ngày hiện tại
- **Đơn hàng hôm nay** - Gradient purple, số đơn hàng ngày hiện tại

#### **Charts:**
- **Xu hướng doanh thu (30 ngày)** - AreaChart với gradient fill
- **Doanh thu theo phương thức thanh toán** - PieChart với colors khác nhau

#### **Data Sources:**
```javascript
// MongoDB Aggregation Queries
- Tổng doanh thu: Order.aggregate([{ $match: { status: 'completed' } }])
- Growth rate: So sánh với kỳ trước (30 ngày trước)
- Daily trend: Group by day, month, year
- By payment method: Group by paymentMethod
- By category: Lookup products và categories
```

### **2. Tab Khách hàng (Customers)**

#### **Overview Cards:**
- **Tổng khách hàng** - Border blue, tổng số user
- **Khách hàng mới** - Border green, user mới trong tháng
- **Khách hàng hoạt động** - Border purple, user có hoạt động gần đây
- **Tỷ lệ giữ chân** - Border yellow, retention rate

#### **Charts:**
- **Tăng trưởng khách hàng** - LineChart với 2 lines (mới/quay lại)
- **Khách hàng theo khu vực** - BarChart theo location

#### **Data Sources:**
```javascript
// MongoDB Aggregation Queries
- Total users: User.countDocuments()
- New users: User.find({ createdAt: { $gte: lastMonth } })
- Active users: User.find({ lastLogin: { $gte: lastWeek } })
- Retention: (Returning users / Total users) * 100
- By segment: Group by spending level
- By location: Mock data (có thể kết nối với Address model)
```

### **3. Tab Sản phẩm (Products)**

#### **Overview Cards:**
- **Tổng sản phẩm** - Border blue, tổng số products
- **Đang bán** - Border green, products có isActive = true
- **Hết hàng** - Border red, products có stock = 0
- **Sắp hết hàng** - Border yellow, products có stock < 10

#### **Charts:**
- **Sản phẩm bán chạy** - List view với ranking
- **Sản phẩm theo danh mục** - PieChart theo category

#### **Data Sources:**
```javascript
// MongoDB Aggregation Queries
- Total products: Product.countDocuments()
- Active products: Product.find({ isActive: true })
- Out of stock: Product.find({ stock: 0 })
- Top selling: Aggregate với OrderItems
- By category: Group by category
- By brand: Group by brand
- Low stock: Product.find({ stock: { $lt: 10 } })
```

## 🎨 UI/UX Features

### **1. Visual Design**
- **Gradient Cards:** Mỗi card có gradient background khác nhau
- **Icons:** React Icons (FontAwesome) cho mỗi metric
- **Colors:** Consistent color scheme (blue, green, purple, yellow, red)
- **Shadows:** Subtle shadows cho depth

### **2. Interactive Elements**
- **Tab Navigation:** Smooth transition giữa các tabs
- **Hover Effects:** Cards có hover states
- **Loading States:** Spinner khi đang tải data
- **Error Handling:** Toast notifications cho errors

### **3. Responsive Design**
- **Grid Layout:** Responsive grid cho cards và charts
- **Mobile Friendly:** Tối ưu cho mobile devices
- **Flexible Charts:** Charts tự động resize theo container

## 🔄 Data Flow

### **1. Component Lifecycle**
```typescript
useEffect(() => {
  fetchStatsData(); // Fetch tất cả data khi component mount
}, []);

const fetchStatsData = async () => {
  // Gọi 3 APIs song song
  const [revenueRes, customersRes, productsRes] = await Promise.all([...]);
  
  // Update state
  setStatsData({
    revenue: revenueRes.data.data,
    customers: customersRes.data.data,
    products: productsRes.data.data
  });
};
```

### **2. State Management**
```typescript
interface StatsData {
  revenue: RevenueData;
  customers: CustomerData;
  products: ProductData;
}

// State được chia thành 3 phần tương ứng với 3 tabs
const [statsData, setStatsData] = useState<StatsData>({...});
const [activeTab, setActiveTab] = useState<'revenue' | 'customers' | 'products'>('revenue');
```

## 🚀 Cách sử dụng

### **1. Truy cập trang**
```
URL: /admin/detailed-stats
Navigation: Sidebar → "Thống kê chi tiết"
```

### **2. Yêu cầu quyền**
- Cần đăng nhập với role `admin` hoặc `superadmin`
- Token được gửi trong Authorization header

### **3. Xem dữ liệu**
- Click vào tab để chuyển đổi giữa các loại thống kê
- Dữ liệu được load tự động khi vào trang
- Charts được render với dữ liệu thực từ database

## 🔧 Customization

### **1. Thêm metric mới**
```typescript
// Thêm vào interface
interface StatsData {
  revenue: {
    // ... existing fields
    newMetric: number; // Thêm field mới
  };
}

// Thêm vào component
<div className="bg-white rounded-xl shadow-sm p-6">
  <p className="text-sm font-medium text-gray-600">Metric mới</p>
  <p className="text-2xl font-bold text-gray-900">{data.newMetric}</p>
</div>
```

### **2. Thêm chart mới**
```typescript
// Import chart component từ recharts
import { ScatterChart, Scatter } from 'recharts';

// Thêm vào JSX
<ResponsiveContainer width="100%" height={300}>
  <ScatterChart data={data.scatterData}>
    <XAxis dataKey="x" />
    <YAxis dataKey="y" />
    <Scatter dataKey="value" fill="#8884d8" />
  </ScatterChart>
</ResponsiveContainer>
```

### **3. Thay đổi colors**
```typescript
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

// Sử dụng trong charts
<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
```

## 📈 Performance

### **1. Data Loading**
- **Parallel API calls:** 3 APIs được gọi song song
- **Caching:** Data được cache trong component state
- **Loading states:** UI feedback khi đang load

### **2. Chart Performance**
- **ResponsiveContainer:** Charts tự động resize
- **Data optimization:** Chỉ render data cần thiết
- **Animation:** Smooth animations cho better UX

### **3. Database Optimization**
- **Aggregation pipelines:** Sử dụng MongoDB aggregation
- **Indexes:** Cần indexes cho các fields được query
- **Pagination:** Có thể thêm pagination cho large datasets

## 🐛 Troubleshooting

### **1. Lỗi 403 Forbidden**
```bash
# Kiểm tra token
console.log('Token:', localStorage.getItem('token'));

# Kiểm tra role
console.log('User:', JSON.parse(localStorage.getItem('user')));
```

### **2. Lỗi 500 Internal Server Error**
```bash
# Kiểm tra database connection
# Kiểm tra aggregation queries
# Kiểm tra model imports
```

### **3. Charts không hiển thị**
```bash
# Kiểm tra data format
console.log('Chart data:', data);

# Kiểm tra recharts version
npm list recharts
```

## 🎯 Kết luận

Hệ thống thống kê chi tiết cung cấp:

✅ **Giao diện đẹp** với 3 tabs chính
✅ **Dữ liệu phong phú** từ 3 APIs backend
✅ **Charts tương tác** với Recharts
✅ **Responsive design** cho mọi device
✅ **Performance tốt** với parallel loading
✅ **Dễ customize** và mở rộng

**🚀 Hệ thống đã sẵn sàng sử dụng!**
