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
        if (token === "null" || token === "undefined" || token.trim() === "") {
            token = undefined;
        }
    }

    if (!token) {
        console.log('Không có token');
        return res.status(401).json({ message: "Không có token, không được phép truy cập" });
    }

    try {
        // Giải mã token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Tìm user tương ứng (bỏ mật khẩu)
        const user = await User.findById(decoded.id).select("-password");

        if (!user || user.active === false) {
            console.log('User không tồn tại hoặc bị khóa');
            return res.status(401).json({ message: "Người dùng không tồn tại hoặc đã bị khóa" });
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

export const checkAdmin = (requiredCheck = []) => {
    return (req, res, next) => {
        const user = req.user;

        if (!user) {
            console.log('Chưa xác thực');
            return res.status(401).json({ message: "Chưa xác thực" });
        }

        // Phân quyền theo vai trò
        const roleCheck = {
            superadmin: ["capQuyen", "CheckTaiKhoan", "view_user", "view_nhatKy"],
            admin: ["view_user", "CheckTaiKhoan"], 
            customer: [],
        };

        const userCheck = roleCheck[user.role] || [];

        const okCheck = requiredCheck.every(p => userCheck.includes(p));

        if (!okCheck) {
            console.log('Không đủ quyền:', user.role, user.email);
            return res.status(403).json({ message: "Không đủ quyền để thực hiện hành động này" });
        }

        console.log('Qua checkAdmin:', user.email, user.role);
        next();
    };
};
