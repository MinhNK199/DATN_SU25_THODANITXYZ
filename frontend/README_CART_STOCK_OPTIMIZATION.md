# Tối Ưu Logic Hiển Thị Stock Trong Giỏ Hàng

## Tổng Quan

Đã tối ưu lại logic hiển thị số lượng sản phẩm trong giỏ hàng để đảm bảo hiển thị chính xác tồn kho của biến thể đã chọn, thay vì sử dụng stock của sản phẩm cha.

## Vấn Đề Đã Giải Quyết

### ❌ **Trước khi tối ưu:**
- Hiển thị stock của sản phẩm cha thay vì stock của biến thể cụ thể
- Không tính đến reservation khi hiển thị stock
- Validation không chính xác khi cập nhật số lượng
- Không có error handling đầy đủ

### ✅ **Sau khi tối ưu:**
- Hiển thị chính xác stock của biến thể đã chọn
- Tính toán available stock (trừ đi reservation)
- Validation chính xác trước khi cập nhật
- Error handling và user feedback đầy đủ

## Các Thay Đổi Chính

### 1. Backend - Service Quản Lý Stock Biến Thể

**File:** `backend/src/services/variantStockService.js`

**Chức năng chính:**
- `getVariantStock()`: Lấy stock thực tế của biến thể
- `getAvailableVariantStock()`: Lấy stock có sẵn (trừ reservation)
- `canAddToCart()`: Kiểm tra có thể thêm vào giỏ hàng không
- `canUpdateQuantity()`: Kiểm tra có thể cập nhật số lượng không
- `getCartItemsStockInfo()`: Lấy thông tin stock cho tất cả items
- `adjustCartItemsToStock()`: Điều chỉnh giỏ hàng theo stock

**Đặc điểm:**
- Hỗ trợ cả sản phẩm có biến thể và không có biến thể
- Tính toán chính xác reservation
- Error handling đầy đủ
- Logging chi tiết

### 2. Backend - Cập Nhật Cart Controller

**File:** `backend/src/controllers/cart.js`

**Thay đổi trong `getCart()`:**
```javascript
// ✅ SỬ DỤNG VARIANT STOCK SERVICE
if (item.variantId) {
  // Lấy stock từ biến thể cụ thể
  variantStock = await VariantStockService.getVariantStock(item.product._id, item.variantId);
  availableStock = await VariantStockService.getAvailableVariantStock(
    item.product._id, 
    item.variantId, 
    req.user._id
  );
} else {
  // Lấy stock từ sản phẩm
  variantStock = item.product.stock || 0;
  availableStock = await getAvailableStock(item.product._id);
}
```

**Thay đổi trong `updateCartItem()`:**
```javascript
// ✅ VALIDATE STOCK CỦA VARIANT
if (variantId) {
  stockValidation = await VariantStockService.canUpdateQuantity(
    productId, variantId, quantity, req.user._id
  );
  if (!stockValidation.canUpdate) {
    return res.status(400).json({
      message: stockValidation.message,
      availableStock: stockValidation.availableStock
    });
  }
}
```

### 3. Frontend - Utility Functions

**File:** `frontend/src/utils/stockUtils.ts`

**Các functions chính:**
- `getAvailableStock()`: Lấy stock có sẵn từ item
- `getOriginalStock()`: Lấy stock gốc (không trừ reservation)
- `canUpdateQuantity()`: Kiểm tra có thể cập nhật không
- `getStockMessage()`: Tạo thông báo stock
- `validateQuantityUpdate()`: Validate chi tiết
- `formatStockDisplay()`: Format hiển thị stock

**Đặc điểm:**
- Logic tập trung, dễ bảo trì
- Type-safe với TypeScript
- Xử lý tất cả edge cases
- Consistent API

### 4. Frontend - Cart Component

**File:** `frontend/src/pages/client/Cart.tsx`

**Thay đổi chính:**
```javascript
// ✅ SỬ DỤNG UTILITY FUNCTION ĐỂ HIỂN THỊ STOCK
const stockMessage = getVariantStockMessage(item);
return (
  <span className={stockMessage.className}>
    {stockMessage.message}
  </span>
);

// ✅ VALIDATE TRƯỚC KHI CẬP NHẬT
const validation = validateQuantityUpdate(item, newQuantity);
if (!validation.isValid) {
  warning(validation.message || 'Số lượng không hợp lệ!');
  return;
}
```

### 5. Frontend - Cart Context

**File:** `frontend/src/contexts/CartContext.tsx`

**Thay đổi trong `updateQuantity()`:**
```javascript
// ✅ VALIDATE STOCK TRƯỚC KHI GỬI REQUEST
const maxStock = variant?.availableStock ?? 
                item.product.availableStock ?? 
                variant?.stock ?? 
                item.product.stock ?? 0;

if (quantity > maxStock) {
  toast.error(`Chỉ còn ${maxStock} sản phẩm trong kho!`);
  return;
}
```

### 6. Frontend - Interface Updates

**File:** `frontend/src/interfaces/Product.ts`

**Thêm field mới:**
```typescript
export interface ProductVariant {
  // ... existing fields
  availableStock?: number; // ✅ THÊM AVAILABLE STOCK CHO VARIANT
}
```

## Cách Hoạt Động

### 1. Khi Load Giỏ Hàng
1. Backend sử dụng `VariantStockService` để lấy stock chính xác
2. Tính toán available stock (trừ reservation)
3. Điều chỉnh số lượng nếu vượt quá stock
4. Trả về thông tin stock đầy đủ cho frontend

### 2. Khi Cập Nhật Số Lượng
1. Frontend validate trước khi gửi request
2. Backend validate lại với `VariantStockService`
3. Cập nhật reservation nếu thành công
4. Trả về thông tin stock mới

### 3. Khi Hiển Thị Stock
1. Ưu tiên `availableStock` từ `variantInfo`
2. Fallback về `availableStock` từ `product`
3. Cuối cùng mới dùng `stock` thông thường
4. Hiển thị thông báo phù hợp (Hết hàng, Chỉ còn X, Còn X sản phẩm)

## Lợi Ích

### ✅ **Chính Xác**
- Hiển thị đúng stock của biến thể đã chọn
- Tính toán chính xác reservation
- Validation đầy đủ

### ✅ **User Experience**
- Thông báo rõ ràng khi vượt quá stock
- Cảnh báo khi đạt giới hạn
- Error handling thân thiện

### ✅ **Maintainable**
- Code tập trung trong utility functions
- Logic rõ ràng, dễ hiểu
- Type-safe với TypeScript

### ✅ **Performance**
- Validation ở frontend trước khi gửi request
- Backend validation nhanh chóng
- Caching thông tin stock

## Testing

### 1. Test Cases
- ✅ Sản phẩm có biến thể: hiển thị stock của biến thể
- ✅ Sản phẩm không có biến thể: hiển thị stock của sản phẩm
- ✅ Validation khi vượt quá stock
- ✅ Hiển thị thông báo phù hợp
- ✅ Error handling khi có lỗi

### 2. Edge Cases
- ✅ Stock = 0: hiển thị "Hết hàng"
- ✅ Stock <= 5: hiển thị "Chỉ còn X"
- ✅ Stock > 5: hiển thị "Còn X sản phẩm"
- ✅ Quantity > availableStock: validation và cảnh báo
- ✅ Reservation: tính toán chính xác

## Kết Luận

Logic mới đảm bảo:
- ✅ Hiển thị chính xác stock của biến thể đã chọn
- ✅ Validation đầy đủ trước khi cập nhật
- ✅ User feedback rõ ràng và thân thiện
- ✅ Code clean, dễ bảo trì
- ✅ Performance tốt
- ✅ Error handling đầy đủ

Giờ đây, giỏ hàng sẽ hiển thị chính xác số lượng tồn kho của biến thể mà người dùng đã chọn, thay vì hiển thị sai số liệu từ sản phẩm cha.
