# Phân Quyền Hệ Thống

## Các Role và Quyền Hạn

### 1. Guest (Khách)
- Xem danh sách sản phẩm
- Xem chi tiết sản phẩm
- Tìm kiếm sản phẩm
- Xem danh mục, thương hiệu
- Xem đánh giá và câu hỏi sản phẩm

### 2. User (Người dùng đã đăng ký)
- Tất cả quyền của Guest
- Đặt hàng
- Quản lý giỏ hàng
- Đánh giá sản phẩm
- Đặt câu hỏi về sản phẩm
- Xóa câu hỏi của chính mình
- Quản lý địa chỉ giao hàng
- Xem lịch sử đơn hàng
- Thêm/xóa sản phẩm yêu thích
- Sử dụng điểm thưởng
- Xem điểm thưởng và lịch sử

### 3. Admin
- Tất cả quyền của User
- **Quản lý sản phẩm:**
  - Tạo, sửa, xóa sản phẩm
  - Quản lý biến thể sản phẩm
  - Import sản phẩm từ Excel
  - Thêm video sản phẩm
  - Cập nhật SEO meta
- **Quản lý câu hỏi:**
  - Trả lời câu hỏi sản phẩm
  - Xóa bất kỳ câu hỏi nào
- **Quản lý sản phẩm liên quan:**
  - Thêm/xóa sản phẩm liên quan
- **Quản lý khuyến mãi:**
  - Tạo/cập nhật/xóa flash sale
  - Thêm/cập nhật/xóa khuyến mãi
- **Quản lý điểm thưởng:**
  - Thêm điểm thưởng cho user
- **Quản lý hệ thống:**
  - Quản lý danh mục, thương hiệu
  - Quản lý banner, coupon
  - Quản lý đơn hàng, hóa đơn
  - Quản lý user

### 4. Superadmin
- **Tất cả quyền của Admin**
- Quyền cao nhất trong hệ thống
- Có thể thực hiện mọi thao tác quản trị
- Có thể quản lý admin khác

## Chi Tiết Quyền Hạn

### Quản lý Câu Hỏi Sản Phẩm
- **User:** Chỉ có thể xóa câu hỏi của chính mình
- **Admin/Superadmin:** Có thể xóa bất kỳ câu hỏi nào và trả lời câu hỏi

### Quản lý Sản Phẩm Liên Quan
- **Admin/Superadmin:** Có thể thêm/xóa sản phẩm liên quan

### Quản lý Flash Sale
- **Admin/Superadmin:** Có thể tạo/cập nhật/xóa flash sale

### Quản lý Khuyến Mãi
- **Admin/Superadmin:** Có thể thêm/cập nhật/xóa khuyến mãi

### Quản lý Điểm Thưởng
- **Admin/Superadmin:** Có thể thêm điểm thưởng cho user
- **User:** Có thể sử dụng điểm thưởng và xem lịch sử

## Lưu Ý Bảo Mật

1. Tất cả API quản trị đều yêu cầu authentication
2. Kiểm tra role được thực hiện ở cả middleware và controller
3. Superadmin có quyền cao nhất, có thể thực hiện mọi thao tác
4. User chỉ có thể thao tác với dữ liệu của chính mình (trừ khi có quyền đặc biệt)

## Cách Sử Dụng

### Kiểm tra quyền trong code:
```javascript
// Kiểm tra admin hoặc superadmin
if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ 
        message: "Chỉ admin mới có quyền thực hiện thao tác này" 
    });
}

// Kiểm tra chỉ superadmin
if (req.user.role !== 'superadmin') {
    return res.status(403).json({ 
        message: "Chỉ superadmin mới có quyền thực hiện thao tác này" 
    });
}
```

### Middleware Authentication:
```javascript
// Middleware cho admin và superadmin
const adminAuth = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    next();
};

// Middleware chỉ cho superadmin
const superadminAuth = (req, res, next) => {
    if (req.user.role !== 'superadmin') {
        return res.status(403).json({ message: "Chỉ superadmin mới có quyền" });
    }
    next();
};
``` 