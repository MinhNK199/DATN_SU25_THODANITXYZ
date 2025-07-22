import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { validateRequestJoi } from "../middlewares/validateRequest";
import { loginSchema, registerSchema } from "../validation/user";
import { dangKy, dangNhap, getAllUsers, getCurrentUser, getUserById, toggleUserStatus, updateUser, updateUserRole, dangKyAdmin } from "../controllers/auth";
import { checkAdmin, protect } from "../middlewares/authMiddleware";
import { getActivityLogs, getMyActivityLogs } from "../utils/activityLog";
import { verifyEmail } from "../controllers/auth";
import { googleLogin } from "../controllers/auth";
import { changePassword } from "../controllers/auth";
import { changePasswordSchema } from "../validation/user";

const routerAuth = express.Router();
routerAuth.post("/register", validateRequestJoi(registerSchema), dangKy);
routerAuth.post("/register-admin", dangKyAdmin);
routerAuth.post("/login", validateRequestJoi(loginSchema), dangNhap);
routerAuth.post("/verify-email", verifyEmail);
routerAuth.post("/google", googleLogin);
routerAuth.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

routerAuth.get('/facebook/callback', passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
  async (req, res) => {
    const user = req.user;
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.redirect(`${process.env.CLIENT_URL}/login-success?token=${token}`);
  }
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
