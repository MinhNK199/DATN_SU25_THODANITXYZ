import jwt from "jsonwebtoken";
import User from "../models/User";

export const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Không có token, vui lòng đăng nhập" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        next();
    } catch (error) {
        console.error("Lỗi xác thực:", error);
        res.status(401).json({ message: "Xác thực thất bại" });
    }
};

export const checkAdmin = (requiredCheck = []) => {
    return (req, res, next) => {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: "Chưa xác thực" });
        }

        // Phân quyền theo vai trò
        const roleCheck = {
            superadmin: ["capQuyen", "CheckTaiKhoan", "view_user", "view_nhatKy"],
            admin: ["view_user", "CheckTaiKhoan"], 
            staff: ["view_user"],
            customer: [],
        };

        const userCheck = roleCheck[user.role] || [];

        const okCheck = requiredCheck.every(p => userCheck.includes(p));

        if (!okCheck) {
            return res.status(403).json({ message: "Không đủ quyền để thực hiện hành động này" });
        }

        next();
    };
};
