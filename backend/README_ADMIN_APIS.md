# 📊 Admin APIs - Hướng dẫn sử dụng

## ✅ Các API đã được sửa lỗi

### 1. **Dashboard API** - `/api/admin/dashboard`
**Mô tả:** Lấy thống kê tổng quan cho admin dashboard

**Method:** `GET`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalProducts": 500,
    "totalOrders": 1200,
    "totalRevenue": 50000000,
    "totalVariants": 1200,
    "totalCategories": 25,
    "totalBrands": 15,
    "totalRatings": 800,
    "totalConversations": 45,
    "recentOrders": [...],
    "lowStockProducts": [...],
    "topProducts": [...]
  }
}
```

### 2. **Revenue Stats API** - `/api/order/admin/revenue-stats`
**Mô tả:** Thống kê doanh thu theo ngày, tuần và tháng

**Method:** `GET`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "daily": [
    {
      "_id": { "day": 15, "month": 1, "year": 2024 },
      "totalRevenue": 1500000,
      "orderCount": 25
    }
  ],
  "weekly": [
    {
      "_id": { "week": 3, "year": 2024 },
      "totalRevenue": 10500000,
      "orderCount": 175
    }
  ],
  "monthly": [
    {
      "_id": { "month": 1, "year": 2024 },
      "totalRevenue": 45000000,
      "orderCount": 750
    }
  ]
}
```

### 3. **Product Quantity API** - `/api/product/total-product-quantity-by-name`
**Mô tả:** Lấy tổng số lượng sản phẩm theo tên

**Method:** `GET`

**Response:**
```json
{
  "success": true,
  "totalProductQuantityByName": 5000
}
```

### 4. **Order Status Stats API** - `/api/order/admin/stats/status`
**Mô tả:** Thống kê đơn hàng theo trạng thái

**Method:** `GET`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "orderStatusStats": [
    {
      "_id": "completed",
      "count": 800,
      "totalAmount": 40000000
    }
  ],
  "paymentStatusStats": [
    {
      "_id": "paid",
      "count": 750,
      "totalAmount": 37500000
    }
  ]
}
```

### 5. **Product Stats API** - `/api/product/stats`
**Mô tả:** Thống kê sản phẩm cơ bản

**Method:** `GET`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "totalProducts": 500,
  "outOfStockProducts": 25,
  "activeProducts": 475,
  "newProducts": 15
}
```

### 6. **Chat Stats API** - `/api/chat/stats`
**Mô tả:** Thống kê chat admin

**Method:** `GET`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalConversations": 45,
    "activeConversations": 12,
    "pendingConversations": 8,
    "closedConversations": 25,
    "averageResponseTime": 5.2
  }
}
```

## 🔧 Cách test APIs

### 1. Sử dụng file test có sẵn:
```bash
cd backend
node test-admin-apis.js
```

### 2. Sử dụng Postman/Insomnia:
- Import collection từ file `admin-apis.postman_collection.json`
- Thay thế `{{admin-token}}` bằng token admin thực tế

### 3. Sử dụng curl:
```bash
# Test Dashboard API
curl -X GET "http://localhost:8000/api/admin/dashboard" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Test Revenue Stats API (bao gồm daily, weekly, monthly)
curl -X GET "http://localhost:8000/api/order/admin/revenue-stats" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 🚀 Cách sử dụng trong Frontend

### 1. Cập nhật Dashboard Component:
```typescript
// Đã được cập nhật trong dashboard.tsx
useEffect(() => {
  fetchDashboardData();
  fetchRevenueStats();
  fetchTotalProductQuantity();
}, []);
```

### 2. Xử lý Response:
```typescript
const fetchDashboardData = async () => {
  try {
    const response = await axios.get('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      setStats(response.data.data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Xử lý Revenue Stats với weekly data
const fetchRevenueStats = async () => {
  try {
    const response = await axios.get('/api/order/admin/revenue-stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      setRevenueStats({
        daily: response.data.daily.reverse(),
        weekly: response.data.weekly.reverse(), // Thêm weekly
        monthly: response.data.monthly.reverse(),
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## ⚠️ Lưu ý quan trọng

1. **Authentication:** Tất cả API admin đều cần token admin/superadmin
2. **Error Handling:** Luôn kiểm tra `response.data.success` trước khi sử dụng data
3. **Loading States:** Hiển thị loading khi gọi API
4. **Error Messages:** Hiển thị thông báo lỗi cho user

## 🐛 Troubleshooting

### Lỗi 403 Forbidden:
- Kiểm tra token admin có hợp lệ không
- Kiểm tra user có role admin/superadmin không

### Lỗi 500 Internal Server Error:
- Kiểm tra database connection
- Kiểm tra logs server
- Kiểm tra dữ liệu có tồn tại không

### API trả về data rỗng:
- Kiểm tra database có dữ liệu không
- Kiểm tra điều kiện filter trong query
- Kiểm tra thời gian range (30 ngày, 12 tháng)

## 📈 Performance Tips

1. **Caching:** Implement Redis cache cho các API thống kê
2. **Pagination:** Sử dụng pagination cho danh sách dài
3. **Indexing:** Đảm bảo database có index phù hợp
4. **Background Jobs:** Chạy thống kê phức tạp trong background

## 🔄 Next Steps

1. ✅ Sửa lỗi API cơ bản
2. 🔄 Thêm thống kê nâng cao
3. 🔄 Implement caching
4. 🔄 Thêm export báo cáo
5. 🔄 Real-time updates
