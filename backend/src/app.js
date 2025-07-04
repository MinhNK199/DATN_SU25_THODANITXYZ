import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes";
import connectDB from "./config/database";
import { setupCleanupCron } from "./utils/cleanupJob";

dotenv.config();
const app = express();
connectDB();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use("/api", router);

// Setup cleanup cron job
setupCleanupCron();

app.listen(process.env.PORT || 9000, () => {
  console.log(`Server Đã Được Chạy Ở Cổng ${process.env.PORT || 9000}🚀`);
});
