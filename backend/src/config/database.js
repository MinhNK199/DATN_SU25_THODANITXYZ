import mongoose from "mongoose";

const connectDB = async() => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/DATN';
        await mongoose.connect(mongoURI);
        console.log("Kết nối DB DATN thành công ✅");
        console.log("MongoDB URI:", mongoURI);
    } catch (error) {
        console.log("Lỗi kết nối ❌", error.message);
        console.log("Đang thử kết nối với MongoDB Atlas...");
        
        // Fallback to MongoDB Atlas
        try {
            const atlasURI = "mongodb+srv://admin:admin123@cluster0.mongodb.net/DATN?retryWrites=true&w=majority";
            await mongoose.connect(atlasURI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log("Kết nối MongoDB Atlas thành công ✅");
        } catch (atlasError) {
            console.log("Lỗi kết nối MongoDB Atlas ❌", atlasError.message);
            console.log("Vui lòng cài đặt MongoDB hoặc cấu hình MongoDB Atlas");
            process.exit(1);
        }
    }
};
export default connec tDB;
