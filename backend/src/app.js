import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import passport from "passport";
import "./config/passport.js";
import router from "./routes";
import connectDB from "./config/database";
import { setupCleanupCron } from "./utils/cleanupJob";

const app = express();
connectDB();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(passport.initialize());
app.use("/api", router);

// Setup cleanup cron job
setupCleanupCron();

app.listen(process.env.PORT || 9000, () => {
  console.log(`Server Đã Được Chạy Ở Cổng ${process.env.PORT || 9000}🚀`);
});