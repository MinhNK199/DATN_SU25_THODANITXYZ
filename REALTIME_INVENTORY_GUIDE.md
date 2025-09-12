# 🚀 Hướng Dẫn Sử Dụng Realtime Inventory System

## 📋 Tổng Quan

Hệ thống Realtime Inventory đã được tích hợp hoàn chỉnh vào dự án, bao gồm:

- ✅ **WebSocket Events** cho realtime stock updates
- ✅ **Reservation System** với API `/reserve`, `/release`, `/check_stock`
- ✅ **Optimistic Updates** với rollback mechanism
- ✅ **Concurrency Handling** và conflict resolution
- ✅ **Realtime Cart Sync** và stock validation
- ✅ **Animation Effects** cho stock changes

## 🏗️ Cấu Trúc Hệ Thống

### Backend (Node.js + Socket.io)

#### 1. WebSocket Events (`backend/src/config/socket.js`)
```javascript
// Events đã thêm:
- join_product_room(productId)     // Tham gia room theo sản phẩm
- leave_product_room(productId)    // Rời khỏi room
- join_inventory_room()            // Tham gia room global
- leave_inventory_room()           // Rời khỏi room global

// Events được emit:
- stock_updated                    // Cập nhật stock realtime
- reservation_updated              // Cập nhật reservation
- inventory_updated                // Cập nhật inventory global
- cart_sync                        // Sync cart realtime
```

#### 2. Reservation API (`backend/src/routes/reservation.js`)
```javascript
POST /api/reservation/reserve      // Đặt trước sản phẩm
POST /api/reservation/release      // Hủy đặt trước
POST /api/reservation/check-stock  // Kiểm tra tồn kho
GET  /api/reservation/user-reservations // Lấy danh sách đặt trước
POST /api/reservation/cleanup      // Dọn dẹp đặt trước hết hạn (admin)
```

#### 3. Models
- `ProductReservation.js` - Model quản lý đặt trước sản phẩm
- Tích hợp với `Product.js` để tính toán stock thực tế

### Frontend (React + TypeScript)

#### 1. Contexts
- `InventoryContext.tsx` - Quản lý state inventory realtime
- Tích hợp với `CartContext.tsx` hiện có

#### 2. Hooks
- `useRealtimeStock.ts` - Hook quản lý stock realtime cho component

#### 3. Components
- `RealtimeStockDisplay.tsx` - Hiển thị stock với animation
- `RealtimeAddToCart.tsx` - Thêm vào giỏ với reservation
- `RealtimeInventoryDemo.tsx` - Component demo và test

## 🚀 Cách Sử Dụng

### 1. Khởi Động Hệ Thống

#### Backend:
```bash
cd backend
npm start
# Server sẽ chạy trên http://localhost:8000
# WebSocket sẽ tự động khởi tạo
```

#### Frontend:
```bash
cd frontend
npm run dev
# Client sẽ chạy trên http://localhost:5173
```

### 2. Test Realtime Inventory

Truy cập: `http://localhost:5173/test-realtime-inventory`

Component demo sẽ hiển thị:
- ✅ Stock information realtime
- ✅ Reservation system
- ✅ Add to cart với optimistic updates
- ✅ Animation effects
- ✅ Test controls

### 3. Tích Hợp Vào Component Hiện Có

#### Sử dụng RealtimeStockDisplay:
```tsx
import RealtimeStockDisplay from './components/client/RealtimeStockDisplay';

<RealtimeStockDisplay
  productId="product-123"
  variantId="variant-456"  // Optional
  initialStock={10}
  showReserved={true}
  className="my-custom-class"
/>
```

#### Sử dụng RealtimeAddToCart:
```tsx
import RealtimeAddToCart from './components/client/RealtimeAddToCart';

<RealtimeAddToCart
  productId="product-123"
  variantId="variant-456"  // Optional
  initialStock={10}
  showQuantityInput={true}
  maxQuantity={5}
  size="large"
/>
```

#### Sử dụng useRealtimeStock hook:
```tsx
import { useRealtimeStock } from '../hooks/useRealtimeStock';

const MyComponent = () => {
  const {
    availableStock,
    reservedQuantity,
    isReserving,
    reserveProduct,
    releaseReservation,
    checkStock,
    isStockLow,
    isOutOfStock
  } = useRealtimeStock({
    productId: 'product-123',
    variantId: 'variant-456',
    initialStock: 10
  });

  // Sử dụng các giá trị và functions...
};
```

## 🔧 API Endpoints

### Reservation API

#### 1. Reserve Product
```http
POST /api/reservation/reserve
Content-Type: application/json
Authorization: Bearer <token>

{
  "productId": "product-123",
  "quantity": 2,
  "variantId": "variant-456"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đặt trước sản phẩm thành công",
  "data": {
    "reservationId": "reservation-123",
    "productId": "product-123",
    "quantity": 2,
    "availableStock": 8,
    "reservedQuantity": 2,
    "expiresAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 2. Release Reservation
```http
POST /api/reservation/release
Content-Type: application/json
Authorization: Bearer <token>

{
  "productId": "product-123",
  "quantity": 1
}
```

#### 3. Check Stock
```http
POST /api/reservation/check-stock
Content-Type: application/json
Authorization: Bearer <token>

{
  "items": [
    {
      "productId": "product-123",
      "quantity": 2,
      "variantId": "variant-456"
    }
  ]
}
```

## 🎯 Tính Năng Chính

### 1. Realtime Stock Updates
- ✅ Stock cập nhật realtime qua WebSocket
- ✅ Animation effects khi stock thay đổi
- ✅ Visual indicators (hết hàng, sắp hết hàng)

### 2. Reservation System
- ✅ Đặt trước sản phẩm trước khi thêm vào giỏ
- ✅ Timeout tự động (3 ngày)
- ✅ Optimistic updates với rollback

### 3. Concurrency Handling
- ✅ Kiểm tra stock trước khi đặt trước
- ✅ Xử lý xung đột khi nhiều user cùng mua
- ✅ Rollback khi có lỗi

### 4. Cart Integration
- ✅ Tích hợp với CartContext hiện có
- ✅ Sync realtime giữa các tab/window
- ✅ Validation stock khi update cart

## 🐛 Troubleshooting

### 1. WebSocket Connection Issues
```javascript
// Kiểm tra connection status
const { state } = useInventory();
console.log('Connected:', state.isConnected);
console.log('Error:', state.error);
```

### 2. Stock Not Updating
- Kiểm tra WebSocket connection
- Kiểm tra productId có đúng không
- Kiểm tra backend logs

### 3. Reservation Failed
- Kiểm tra stock availability
- Kiểm tra user authentication
- Kiểm tra API response

## 📊 Monitoring

### Backend Logs
```bash
# Xem logs WebSocket
tail -f backend/logs/socket.log

# Xem logs reservation
tail -f backend/logs/reservation.log
```

### Frontend Console
```javascript
// Enable debug logs
localStorage.setItem('debug', 'inventory:*');
```

## 🔄 Workflow

### 1. User Flow
1. User xem sản phẩm → Join product room
2. User click "Add to Cart" → Reserve product
3. Reserve thành công → Add to cart
4. Add to cart thành công → Release reservation
5. Stock cập nhật realtime cho tất cả users

### 2. Admin Flow
1. Admin cập nhật stock → Emit stock_updated event
2. Tất cả clients nhận event → Update UI
3. Animation effects hiển thị thay đổi

## 🎉 Kết Luận

Hệ thống Realtime Inventory đã được tích hợp hoàn chỉnh và sẵn sàng sử dụng. Tất cả các tính năng đã được test và hoạt động ổn định.

**Để bắt đầu sử dụng:**
1. Khởi động backend và frontend
2. Truy cập `/test-realtime-inventory` để test
3. Tích hợp components vào UI hiện có
4. Monitor logs để đảm bảo hoạt động ổn định

**Hỗ trợ:** Nếu có vấn đề, kiểm tra logs và console để debug.
