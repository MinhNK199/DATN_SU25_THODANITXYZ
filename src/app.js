import express from "express";
import dotenv from "dotenv";
import router from "./routers/index.js";
import connectDB from "./config/database.js";
import orderRouter from "./routers/order.js";
import cors from "cors";
dotenv.config();
const app = express();
connectDB();

app.use(express.json());

app.use(cors());
app.use("/api", router);
app.use("/api/orders", orderRouter);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server Đã Được Chạy Ở Cổng ${process.env.PORT || 3000}🚀`);
});