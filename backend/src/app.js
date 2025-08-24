import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import passport from "passport";
import "./config/passport.js";
import router from "./routes/index.js";
import connectDB from "./config/database.js";
import { setupCleanupCron } from "./utils/cleanupJob.js";

const app = express();
connectDB();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Content-Length: ${req.headers['content-length'] || 'unknown'}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Request body size:', JSON.stringify(req.body).length, 'characters');
    }
    next();
});
app.use(passport.initialize());
app.use("/api", router);

// Setup cleanup cron job
setupCleanupCron();

app.listen(process.env.PORT || 9000, () => {
    console.log(`Server Đã Được Chạy Ở Cổng ${process.env.PORT || 9000}🚀`);
});