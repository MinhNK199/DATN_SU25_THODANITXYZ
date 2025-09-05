# Scripts Cập Nhật Dữ Liệu Địa Chỉ Việt Nam

Thư mục này chứa các script để cập nhật dữ liệu địa chỉ Việt Nam từ API `provinces.open-api.vn`.

## 📁 Files

- `updateAddressDataV2.js` - Script chính để cập nhật dữ liệu địa chỉ
- `testAddressAPI.js` - Script test API địa chỉ
- `runUpdate.sh` - Script chạy cập nhật tự động
- `package.json` - Dependencies cho scripts

## 🚀 Cách sử dụng

### 1. Cài đặt dependencies

```bash
cd scripts
npm install
```

### 2. Test API

```bash
node testAddressAPI.js
```

### 3. Cập nhật dữ liệu

```bash
node updateAddressDataV2.js
```

### 4. Chạy cập nhật tự động

```bash
./runUpdate.sh
```

## 📊 Dữ liệu được tạo

- `../data/vietnam_addresses.json` - Dữ liệu đầy đủ
- `../data/vietnam_addresses_simplified.json` - Dữ liệu đơn giản hóa cho frontend
- `../data/vietnam_addresses.csv` - Dữ liệu dạng CSV

## 📈 Thống kê

- 34 tỉnh/thành
- 2,351 quận/huyện
- 3,321 phường/xã

## ⚠️ Lưu ý

- Scripts này sử dụng API `provinces.open-api.vn`
- Dữ liệu được cache trong 24 giờ
- Có thể chạy lại để cập nhật dữ liệu mới nhất
