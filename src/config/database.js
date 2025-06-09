import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Kết nối thành công ✅");
    } catch (error) {
        console.log("Lỗi kết nối ❌", error.message);
        process.exit(1);
    }
};
export default connectDB;