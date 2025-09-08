import mongoose from "mongoose";

const connectDB = async() => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/DATN';
        await mongoose.connect(mongoURI);
        console.log("Kết nối DB DATN thành công ✅");
    } catch (error) {
        console.log("Lỗi kết nối ❌", error.message);
        process.exit(1);
    }
};
export default connectDB;