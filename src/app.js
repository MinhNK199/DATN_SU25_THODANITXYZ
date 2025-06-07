import express from "express";
import dotenv from "dotenv";
import router from "./routers/index.js";
import connectDB from "./config/database.js";

dotenv.config();
const app = express();
connectDB();

app.use(express.json());

app.use("/", router);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server Đã Được Chạy Ở Cổng ${process.env.PORT || 3000}🚀`);
});
