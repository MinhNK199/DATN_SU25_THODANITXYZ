import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    let token;

    // Lấy token từ header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
        // Bỏ qua các giá trị token không hợp lệ dạng string
        if (token === "null" || token === "undefined" || !token || token.trim() === "") {
            token = undefined;
        }
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

        // Kiểm tra role từ token nếu có
        if (decoded.role) {
            // Ưu tiên role từ token nếu có
            user.role = decoded.role;
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Token không hợp lệ:', error);

        // Xử lý riêng cho từng loại lỗi
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: "Token đã hết hạn, vui lòng đăng nhập lại",
                error: "TOKEN_EXPIRED",
                expiredAt: error.expiredAt
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: "Token không hợp lệ",
                error: "INVALID_TOKEN"
            });
        } else {
            return res.status(401).json({
                message: "Token không hợp lệ",
                error: "TOKEN_ERROR"
            });
        }
    }

};

export const checkAdmin = (allowedRoles = ['admin', 'superadmin']) => {
    return (req, res, next) => {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: "Chưa xác thực" });
        }

        // Kiểm tra role có được phép không
        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
        }

        next();
    };
};
