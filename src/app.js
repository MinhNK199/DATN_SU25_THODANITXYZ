import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes";
import connectDB from "./config/database";

dotenv.config();
const app = express();
connectDB();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use("/api", router);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server Đã Được Chạy Ở Cổng ${process.env.PORT || 3000}🚀`);
});
