import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // Thêm dòng này
import router from "./routers/index.js";
import connectDB from "./config/database.js";

dotenv.config();
const app = express();
connectDB();

app.use(cors({
    origin: "http://localhost:5173", // FE chạy ở cổng 5173
    credentials: true
}));

app.use(express.json());

app.use("/api", router);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server Đã Được Chạy Ở Cổng ${process.env.PORT || 3000}🚀`);
});