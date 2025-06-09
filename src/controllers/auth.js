import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user";

export const dangKy = async (req, res) => {
    try {
        const { name, email, password, phone, addresses, avatar } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email đã tồn tại" });
        }

        let role = "customer"; 
        if (email === "admindatn@gmail.com") {
            const superAdminExists = await User.findOne({ role: "superadmin" });
            if (!superAdminExists) {
                role = "superadmin"; 
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({ 
            name, 
            email, 
            password: hashedPassword, 
            role,
            phone,
            addresses,
            avatar,
        });

        user.password = undefined;
        return res.status(201).json({
            message: `Đăng ký thành công với vai trò ${role}`,
            user,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Đăng ký thất bại",
            error: error.message,
        });
    }
};



export const dangNhap = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });
        }

        if (!user.active) {
            return res.status(403).json({ message: "Tài khoản đang bị khóa" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        return res.status(200).json({
            message: "Đăng nhập thành công",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
        
    } catch (error) {
        return res.status(500).json({ message: "Đăng nhập thất bại", error: error.message });
    }
};
