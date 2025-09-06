#!/bin/bash

echo "🚀 Bắt đầu cập nhật dữ liệu địa chỉ Việt Nam..."

# Di chuyển vào thư mục scripts
cd "$(dirname "$0")"

# Cài đặt dependencies nếu chưa có
if [ ! -d "node_modules" ]; then
    echo "📦 Cài đặt dependencies..."
    npm install
fi

# Test API trước
echo "🧪 Test API địa chỉ..."
node testAddressAPI.js

# Chạy cập nhật dữ liệu
echo "📥 Cập nhật dữ liệu địa chỉ..."
node updateAddressData.js

echo "✅ Hoàn thành cập nhật dữ liệu địa chỉ!"
echo "📁 Dữ liệu đã được lưu trong thư mục ../data/"
