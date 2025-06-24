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
  actorName: user.name, // chính user vừa đăng ký
  actorId: user._id,
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

export const dangKyAdmin = async (req, res) => {
  try {
    const { name, email, password, avatar, adminRequestImage, adminRequestContent } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar,
      adminRequest: true,
      adminRequestStatus: "pending",
      adminRequestContent,
      adminRequestImage,
      role: "customer", // Không phải admin ngay lập tức
    });

    user.password = undefined;

   await logActivity({
  content: `Người dùng ${user.name} (${user.email}) đã đăng ký xin làm admin`,
  userName: user.name,
  userId: user._id,
  actorName: user.name,
  actorId: user._id,
});

    res.status(201).json({
      message: "Đăng ký xin làm admin thành công, vui lòng chờ xác nhận từ superadmin.",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Đăng ký thất bại", error: error.message });
  }
};

export const dangNhap = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    if (!user.active) {
      return res.status(403).json({ message: "Tài khoản đang bị khóa" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    await logActivity({
      content: `Đăng nhập hệ thống`,
  userName: user.name,
  userId: user._id,
  actorName: user.name, // chính user vừa đăng nhập
  actorId: user._id,
    });
    return res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Đăng nhập thất bại", error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  
  try {
    const { keyword = "", role, active, page = 1, limit = 10 } = req.query;

    const query = {
      name: { $regex: keyword, $options: "i" },
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
      result = users.map((u) => {
        if (u.role === "superadmin") {
          return {
            _id: u._id,
            name: u.name,
            role: u.role,
            active: u.active,
            email: "Không thể xem",
          };
        }
        return u;
      });
    }
    res.status(200).json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      users: result,
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
export const getCurrentUser = (req, res) => {
  res.json({ user: req.user });
};

export const getAdminRequests = async (req, res) => {
  try {
    // BỎ điều kiện adminRequestStatus: "pending"
    const requests = await User.find({ adminRequest: true }).select("-password")
    .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

export const approveAdminRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { approve } = req.body; // approve: true/false

    const user = await User.findById(id);
    if (!user || !user.adminRequest) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    }

    if (approve) {
      user.role = "admin";
      user.adminRequestStatus = "approved";
    } else {
      user.adminRequestStatus = "rejected";
    }
    await user.save();

    await logActivity({
      content: approve
        ? `Superadmin đã duyệt quyền admin cho ${user.name}`
        : `Superadmin đã từ chối quyền admin cho ${user.name}`,
      userName: user.name,
      userId: user._id,
      actorName: req.user.name,
      actorId: req.user._id,
    });

    res.json({ message: approve ? "Đã duyệt quyền admin" : "Đã từ chối quyền admin", user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
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
      return res
        .status(400)
        .json({
          message:
            "Không thể vô hiệu hóa hoặc kích hoạt tài khoản của chính mình",
        });
    }

    if (currentUser.role === "superadmin") {
      targetUser.active = !targetUser.active;
    }
    else if (currentUser.role === "admin") {
      if (["admin", "superadmin"].includes(targetUser.role)) {
        return res
          .status(403)
          .json({
            message:
              "Admin không thể vô hiệu hóa hoặc kích hoạt tài khoản admin hoặc superadmin",
          });
      }
      targetUser.active = !targetUser.active;
    }
    // các role khác không có quyền
    else {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền thực hiện hành động này" });
    }

    await targetUser.save();
    await logActivity({
      content: `Tài khoản ${targetUser.email} đã ${
        targetUser.active ? "được kích hoạt" : "bị vô hiệu hóa"
      }`,
      userName: targetUser.name,
  userId: targetUser._id,
  actorName: req.user.name,
  actorId: req.user._id,
    });
    res.status(200).json({
      message: `Tài khoản đã ${
        targetUser.active ? "kích hoạt" : "vô hiệu hóa"
      }`,
      userId: targetUser._id,
      newStatus: targetUser.active,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

// ...existing code...

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra quyền: chỉ cho phép người dùng cập nhật chính họ
    if (req.user._id.toString() !== id) {
      return res
        .status(403)
        .json({
          message: "Bạn không có quyền cập nhật thông tin người dùng này",
        });
    }

    const {
      role,
      active,
      email,
      name,
      phone,
      avatar,
      province_code,
      district_code,
      ward_code,
      street,
      ...rest
    } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Cập nhật thông tin cơ bản
    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.avatar = avatar || user.avatar;

    // ✅ Cập nhật địa chỉ mặc định
    const newAddress = {
      street,
      province_code,
      district_code,
      ward_code,
      isDefault: true,
    };

    if (user.addresses && user.addresses.length > 0) {
      user.addresses = user.addresses.map((addr) =>
        addr.isDefault ? { ...addr.toObject(), ...newAddress } : addr
      );
    } else {
      user.addresses = [newAddress];
    }

    await user.save();

    await logActivity({
      content: `${user.name} đã cập nhật thông tin của mình`,
      userName: user.name,
      userId: user._id,
      actorName: req.user.name,
      actorId: req.user._id,
    });

    res.status(200).json({
      message: "Cập nhật thông tin người dùng thành công",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};
