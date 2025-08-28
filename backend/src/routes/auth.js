import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";

import { validateRequestJoi } from "../middlewares/validateRequest.js";
import { loginSchema, registerSchema, changePasswordSchema } from "../validation/user.js";
import { 
  dangKy, 
  dangNhap, 
  dangKyAdmin,
  getAllUsers, 
  getCurrentUser, 
  getUserById, 
  toggleUserStatus, 
  updateUser, 
  updateUserRole, 
  verifyEmail, 
  googleLogin, 
  changePassword,
  uploadAvatar
} from "../controllers/auth.js";
import { checkAdmin, protect } from "../middlewares/authMiddleware.js";
import { getActivityLogs, getMyActivityLogs } from "../utils/activityLog.js";

const routerAuth = express.Router();

/**
 * 📌 Cấu hình Multer để upload avatar
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads/images"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({ storage });

/**
 * 📌 Routes auth
 */
routerAuth.post("/register", validateRequestJoi(registerSchema), dangKy);
routerAuth.post("/register-admin", dangKyAdmin);
routerAuth.post("/login", validateRequestJoi(loginSchema), dangNhap);
routerAuth.post("/verify-email", verifyEmail);
routerAuth.post("/google", googleLogin);
routerAuth.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));

routerAuth.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false, failureRedirect: "/login" }),
  async (req, res) => {
    const user = req.user;
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.redirect(`${process.env.CLIENT_URL}/login-success?token=${token}`);
  }
);

/**
 * 📌 Upload avatar
 * Endpoint: POST /api/auth/upload-avatar
 */
routerAuth.post(
  "/upload-avatar",
  protect,
  upload.single("avatar"),
  uploadAvatar
);

routerAuth.patch("/users/:id/role", protect, checkAdmin(["capQuyen"]), updateUserRole);
routerAuth.get("/users", protect, checkAdmin(["view_user"]), getAllUsers);
routerAuth.get("/me", protect, getCurrentUser);
routerAuth.get("/users/:id", protect, getUserById);
routerAuth.patch("/users/:id/status", protect, checkAdmin(["CheckTaiKhoan"]), toggleUserStatus);
routerAuth.get("/nhatKy", protect, checkAdmin(["view_nhatKy"]), getActivityLogs);
routerAuth.get("/my-activity-logs", protect, getMyActivityLogs);
routerAuth.put("/users/:id", protect, updateUser);
routerAuth.patch("/change-password", protect, validateRequestJoi(changePasswordSchema), changePassword);

export default routerAuth;
