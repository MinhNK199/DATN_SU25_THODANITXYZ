import jwt from "jsonwebtoken";
import User from "../models/user";

export const protect = async (req, res, next) => {
    let token;

    // Lấy token từ header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ message: "Không có token, không được phép truy cập" });
    }

    try {
        // Giải mã token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Tìm user tương ứng (bỏ mật khẩu)
        const user = await User.findById(decoded.id).select("-password");

        if (!user || user.active === false) {
            return res.status(401).json({ message: "Người dùng không tồn tại hoặc đã bị khóa" });
        }

        req.user = user; 
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: "Token không hợp lệ" });
    }
};
