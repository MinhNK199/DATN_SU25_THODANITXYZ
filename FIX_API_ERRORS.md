# 🔧 Sửa lỗi API - Hướng dẫn

## ❌ Các lỗi đã sửa

### **1. Lỗi 403 Forbidden - Admin Dashboard API**

**Vấn đề:**
```
GET http://localhost:8000/api/admin/dashboard 403 (Forbidden)
```

**Nguyên nhân:**
- Middleware `checkAdmin` đang kiểm tra quyền cụ thể thay vì role
- Logic phân quyền phức tạp không phù hợp với admin APIs

**Giải pháp:**
```javascript
// Trước (sai)
export const checkAdmin = (requiredCheck = []) => {
  // Kiểm tra quyền cụ thể
  const roleCheck = {
    superadmin: ["capQuyen", "CheckTaiKhoan", "view_user", "view_nhatKy"],
    admin: ["view_user", "CheckTaiKhoan"],
    customer: [],
  };
  // ...
}

// Sau (đúng)
export const checkAdmin = (allowedRoles = ['admin', 'superadmin']) => {
  // Chỉ kiểm tra role
  if (!allowedRoles.includes(user.role)) {
    return res.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
  }
  // ...
}
```

### **2. Lỗi 500 Internal Server Error - Product Quantity API**

**Vấn đề:**
```
GET http://localhost:8000/api/product/total-product-quantity-by-name 500 (Internal Server Error)
```

**Nguyên nhân:**
- Function `getTotalProductQuantityByName` trong `product.js` đang trả về 0
- Logic phức tạp bị comment out

**Giải pháp:**
```javascript
// Trước (sai)
export const getTotalProductQuantityByName = async(req, res) => {
  try {
    // Tạm thời vô hiệu hóa để tránh lỗi 500
    res.json({ totalProductQuantityByName: 0 })
    return
    // ...
  }
}

// Sau (đúng)
export const getTotalProductQuantityByName = async(req, res) => {
  try {
    const result = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalQuantity: { $sum: '$stock' } } }
    ]);

    const totalProductQuantityByName = result.length > 0 ? result[0].totalQuantity : 0;

    res.json({
      success: true,
      totalProductQuantityByName
    });
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
```

## ✅ Kết quả sau khi sửa

### **1. Admin Dashboard API:**
- ✅ **403 → 200:** API hoạt động với admin token
- ✅ **Authentication:** Middleware kiểm tra role đúng
- ✅ **Data:** Trả về thống kê đầy đủ

### **2. Product Quantity API:**
- ✅ **500 → 200:** API hoạt động bình thường
- ✅ **Data:** Trả về tổng số lượng sản phẩm thực tế
- ✅ **Performance:** Sử dụng MongoDB aggregation

### **3. Revenue Stats API:**
- ✅ **403 → 200:** API hoạt động với admin token
- ✅ **Data:** Trả về thống kê doanh thu chi tiết

## 🧪 Cách test

### **1. Test không cần auth:**
```bash
# Product Quantity API
curl http://localhost:8000/api/product/total-product-quantity-by-name
```

### **2. Test cần auth:**
```bash
# Lấy token từ frontend (localStorage)
# Sau đó test với token
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:8000/api/admin/dashboard
```

### **3. Test script:**
```bash
cd backend
node test-fixed-apis.js
```

## 🔍 Debug tips

### **1. Kiểm tra token:**
```javascript
// Trong browser console
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user')));
```

### **2. Kiểm tra role:**
```javascript
// User object phải có role: 'admin' hoặc 'superadmin'
const user = JSON.parse(localStorage.getItem('user'));
console.log('Role:', user.role);
```

### **3. Kiểm tra network:**
- Mở DevTools → Network tab
- Xem request headers có Authorization không
- Xem response status và message

## 📝 Lưu ý quan trọng

### **1. Authentication:**
- Tất cả admin APIs cần token hợp lệ
- Token phải có role 'admin' hoặc 'superadmin'
- Token không được hết hạn

### **2. Error Handling:**
- Frontend cần handle 401/403 errors
- Hiển thị thông báo lỗi phù hợp
- Redirect về login nếu cần

### **3. Performance:**
- Sử dụng MongoDB aggregation cho queries phức tạp
- Cache dữ liệu thống kê nếu cần
- Optimize database indexes

## 🚀 Next Steps

1. **Test toàn bộ hệ thống** với admin user
2. **Kiểm tra UI** hiển thị dữ liệu đúng
3. **Optimize performance** nếu cần
4. **Add error boundaries** cho better UX
5. **Implement caching** cho thống kê

---

**🎉 Kết luận:** Tất cả lỗi API đã được sửa và hệ thống thống kê admin hoạt động bình thường!
