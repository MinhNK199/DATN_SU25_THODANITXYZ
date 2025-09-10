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
        console.log('Không có token');
        return res.status(401).json({ message: "Không có token, không được phép truy cập" });
    }


    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Không có token, vui lòng đăng nhập" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.active === false) {
            console.log('User không tồn tại hoặc bị khóa');
            return res.status(401).json({ message: "Người dùng không tồn tại hoặc đã bị khóa" });
        }

        // Kiểm tra role từ token nếu có
        if (decoded.role) {
            console.log('🔍 Role from token:', decoded.role);
            console.log('🔍 Role from database:', user.role);
            // Ưu tiên role từ token nếu có
            user.role = decoded.role;
        }

        req.user = user;
        console.log('Xác thực thành công:', user.email, user.role);
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

        console.log('🔍 checkAdmin - User object:', JSON.stringify(user, null, 2));
        console.log('🔍 checkAdmin - Allowed roles:', allowedRoles);
        console.log('🔍 checkAdmin - User role:', user?.role);
        console.log('🔍 checkAdmin - Role type:', typeof user?.role);

        if (!user) {
            console.log('❌ Chưa xác thực');
            return res.status(401).json({ message: "Chưa xác thực" });
        }

        // Kiểm tra role có được phép không
        if (!allowedRoles.includes(user.role)) {
            console.log('❌ Không đủ quyền:', user.role, user.email);
            console.log('❌ Allowed roles:', allowedRoles);
            console.log('❌ User role in allowed roles?', allowedRoles.includes(user.role));
            return res.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
        }

        console.log('✅ Qua checkAdmin:', user.email, user.role);
        next();
    };
};
