import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import passport from "passport";
import "./config/passport.js";
import router from "./routes/index.js";
import connectDB from "./config/database.js";
import { setupCleanupCron } from "./utils/cleanupJob.js";
import { checkAndRefreshToken } from "./utils/tokenRefresh.js";
import fs from 'fs';
import path from 'path';
import uploadRoutes from "./routes/upload.js";

const app = express();

// Tạo thư mục uploads nếu chưa có
const uploadsDir = path.join(process.cwd(), 'uploads', 'images');

try {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('✅ Đã tạo thư mục uploads/images:', uploadsDir);
    } else {
        console.log('✅ Thư mục uploads/images đã tồn tại:', uploadsDir);
    }
} catch (error) {
    console.error('❌ Lỗi tạo thư mục uploads:', error);
}

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS - cho phép tất cả origins để test
app.use(cors({
    origin: true,
    credentials: true
}));

// Debug middleware
app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.path}`);
    next();
});

// Token refresh middleware
app.use(checkAndRefreshToken);

app.use(passport.initialize());

// Serve static files từ thư mục uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Test route
app.get('/', (req, res) => {
    res.json({
        message: 'Backend server đang chạy!',
        timestamp: new Date().toISOString(),
        uploadsDir: uploadsDir
    });
});

// Routes
app.use("/api/upload", uploadRoutes); // Đặt lên trên
app.use("/api", router);

// Khởi động server
const PORT = 8000; // Cố định port 8000
app.listen(PORT, async() => {
    console.log(`🚀 Server đã được khởi động thành công!`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`📁 Thư mục uploads: ${uploadsDir}`);
    console.log(`⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}`);

    // Kết nối database sau khi server khởi động
    try {
        await connectDB();
        console.log('✅ Kết nối database thành công');
    } catch (error) {
        console.error('❌ Lỗi kết nối database:', error);
    }

    // Setup cleanup cron job
    try {
        setupCleanupCron();
        console.log('✅ Setup cleanup cron job thành công');
    } catch (error) {
        console.error('❌ Lỗi setup cleanup cron job:', error);
    }
});