import express from "express";
import { validateRequestJoi } from "../middlewares/validateRequest";
import { loginSchema, registerSchema } from "../validation/user";
import { dangKy, dangNhap, getAllUsers, getCurrentUser, getUserById, toggleUserStatus, updateUser, updateUserRole, dangKyAdmin } from "../controllers/auth";
import { checkAdmin, protect } from "../middlewares/authMiddleware";
import { getActivityLogs } from "../utils/activityLog";
import { verifyEmail } from "../controllers/auth";
import { googleLogin } from "../controllers/auth";

const routerAuth = express.Router();
routerAuth.post("/register", validateRequestJoi(registerSchema), dangKy);
routerAuth.post("/register-admin", dangKyAdmin);
routerAuth.post("/login", validateRequestJoi(loginSchema), dangNhap);
routerAuth.post("/verify-email", verifyEmail);
routerAuth.post("/google", googleLogin);

routerAuth.patch("/users/:id/role", protect, checkAdmin(["capQuyen"]), updateUserRole);
routerAuth.get("/users", protect, checkAdmin(["view_user"]), getAllUsers);
routerAuth.get("/me", protect, getCurrentUser);
routerAuth.get("/users/:id", protect, getUserById);
routerAuth.patch("/users/:id/status", protect, checkAdmin(["CheckTaiKhoan"]), toggleUserStatus);
routerAuth.get("/nhatKy", protect, checkAdmin(["view_nhatKy"]), getActivityLogs);
routerAuth.put("/users/:id", protect, updateUser);

export default routerAuth;
