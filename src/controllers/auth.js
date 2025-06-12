import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user";
import { logActivity } from "../utils/activityLog"; 

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
        await logActivity({
        content: `Đăng ký tài khoản`,
        userName: user.name,
        userId: user._id,
        });
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
        await logActivity({
        content: `Đăng nhập hệ thống`,
        userName: user.name,
        userId: user._id,
        });
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

export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (req.user._id.toString() === id) {
            return res.status(400).json({ message: "Không thể thay đổi quyền của chính mình" });
        }
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }
        if (user.active === false) {
            return res.status(400).json({ message: "Không thể đổi quyền cho tài khoản đang bị vô hiệu hóa" });
        }
        if (role === "superadmin") {
            const existingSuperadmin = await User.findOne({ role: "superadmin" });
            if (existingSuperadmin && existingSuperadmin._id.toString() !== id) {
                return res.status(400).json({ message: "Chỉ có duy nhất một superadmin được phép tồn tại" });
            }
        }
        user.role = role;
        await user.save();
        await logActivity({
            content: ` Đã đổi vai trò ${user.name} thành ${role}`,
            userName: user.name,
            userId: user._id,
        });
        res.status(200).json({
            message: "Cập nhật vai trò thành công",
            userId: user._id,
            newRole: user.role,
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const {
            keyword = "",
            role,
            active,
            page = 1,
            limit = 10
        } = req.query;
        
        const query = {
            name: { $regex: keyword, $options: "i" }
        };

        if (role) query.role = role;
        if (active !== undefined) query.active = active === "true";
        const users = await User.find(query)
            .select("-password")
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await User.countDocuments(query);
        let result = users;
        if (req.user.role === "admin") {
            result = users.map(u => {
                if (u.role === "superadmin") {
                    return { _id: u._id, name: u.name, role: u.role };
                }
                return u;
            });
        }
        res.status(200).json({
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
            users: result
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};


export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }
        res.status(200).json({ user });
    } catch (err) {
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};


export const toggleUserStatus = async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.id);
        if (!targetUser) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }
        const currentUser = req.user;

        if (currentUser._id.toString() === targetUser._id.toString()) {
            return res.status(400).json({ message: "Không thể vô hiệu hóa hoặc kích hoạt tài khoản của chính mình" });
        }

        // superadmin có thể thao tác với tất cả
        if (currentUser.role === "superadmin") {
            targetUser.active = !targetUser.active;
        }
        // admin chỉ được thao tác với user không phải admin hoặc superadmin
        else if (currentUser.role === "admin") {
            if (["admin", "superadmin"].includes(targetUser.role)) {
                return res.status(403).json({ message: "Admin không thể vô hiệu hóa hoặc kích hoạt tài khoản admin hoặc superadmin" });
            }
            targetUser.active = !targetUser.active;
        }
        // các role khác không có quyền
        else {
            return res.status(403).json({ message: "Bạn không có quyền thực hiện hành động này" });
        }

        await targetUser.save();
        await logActivity({
            content: `Tài khoản ${targetUser.email} đã ${targetUser.active ? "được kích hoạt" : "bị vô hiệu hóa"}`,
            userName: targetUser.name,
            userId: targetUser._id,
        });
        res.status(200).json({
            message: `Tài khoản đã ${targetUser.active ? "kích hoạt" : "vô hiệu hóa"}`,
            userId: targetUser._id,
            newStatus: targetUser.active,
        });

    } catch (err) {
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};