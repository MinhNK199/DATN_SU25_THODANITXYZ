import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { logActivity } from "../utils/activityLog";
import crypto from "crypto";
import { sendMail } from "../utils/mailer";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";

export const dangKy = async (req, res) => {
  try {
    const { name, email, password, phone, addresses, avatar, recaptchaToken } = req.body;

    // Kiểm tra reCAPTCHA
    if (!recaptchaToken) {
      return res.status(400).json({ message: "Thiếu mã xác thực reCAPTCHA." });
    }
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const recaptchaVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
    const captchaRes = await axios.post(recaptchaVerifyUrl);
    if (!captchaRes.data.success) {
      return res.status(400).json({ message: "Xác thực reCAPTCHA thất bại." });
    }

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

    // Sinh token xác thực email
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      addresses,
      avatar,
      emailVerificationToken,
      emailVerificationExpires,
    });

    // Gửi email xác thực
    const verifyUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/verify-email?token=${emailVerificationToken}&email=${encodeURIComponent(email)}`;
    const html = `<h2>Xác thực email TechTrend</h2><p>Chào ${name},</p><p>Vui lòng xác thực email bằng cách nhấn vào link sau:</p><a href="${verifyUrl}">${verifyUrl}</a><p>Link có hiệu lực trong 24h.</p>`;
    await sendMail({
      to: email,
      subject: "Xác thực email TechTrend",
      html,
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
      message: `Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản!`,
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

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (req.user._id.toString() === id) {
      return res
        .status(400)
        .json({ message: "Không thể thay đổi quyền của chính mình" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
    if (user.active === false) {
      return res
        .status(400)
        .json({
          message: "Không thể đổi quyền cho tài khoản đang bị vô hiệu hóa",
        });
    }
    if (role === "superadmin") {
      const existingSuperadmin = await User.findOne({ role: "superadmin" });
      if (existingSuperadmin && existingSuperadmin._id.toString() !== id) {
        return res
          .status(400)
          .json({
            message: "Chỉ có duy nhất một superadmin được phép tồn tại",
          });
      }
    }
    user.role = role;
    await user.save();
    await logActivity({
      content: ` Đã đổi vai trò ${user.name} thành ${role}`,
      userName: user.name,
      userId: user._id,
      actorName: req.user.name,
      actorId: req.user._id,
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

    // superadmin có thể thao tác với tất cả
    if (currentUser.role === "superadmin") {
      targetUser.active = !targetUser.active;
    }
    // admin chỉ được thao tác với user không phải admin hoặc superadmin
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

export const verifyEmail = async (req, res) => {
  try {
    const { email, token } = req.body;
    if (!email || !token) {
      return res.status(400).json({ message: "Thiếu email hoặc token xác thực." });
    }
    const user = await User.findOne({ email, emailVerificationToken: token });
    if (!user) {
      return res.status(400).json({ message: "Token hoặc email không hợp lệ." });
    }
    if (user.emailVerified) {
      return res.status(400).json({ message: "Email đã được xác thực trước đó." });
    }
    if (!user.emailVerificationExpires || user.emailVerificationExpires < Date.now()) {
      return res.status(400).json({ message: "Token xác thực đã hết hạn." });
    }
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    return res.status(200).json({ message: "Xác thực email thành công!" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { id_token } = req.body;
    if (!id_token) {
      return res.status(400).json({ message: "Thiếu id_token từ Google." });
    }
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;
    if (!email) {
      return res.status(400).json({ message: "Không lấy được email từ Google." });
    }
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: name || email,
        email,
        avatar: picture,
        emailVerified: true,
        password: Math.random().toString(36).slice(-8), // random password
        role: "customer",
      });
    }
    if (!user.active) {
      return res.status(403).json({ message: "Tài khoản đang bị khóa." });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res.status(200).json({
      message: "Đăng nhập Google thành công!",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Đăng nhập Google thất bại", error: error.message });
  }
};
