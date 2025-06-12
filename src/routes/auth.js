import express from "express";
import { validateRequest } from "../middlewares/validateRequest";
import { loginSchema, registerSchema } from "../validation/user";
import { dangKy, dangNhap, getAllUsers, getUserById, toggleUserStatus, updateUserRole } from "../controllers/auth";
import { checkAdmin, protect } from "../middlewares/authMiddleware";
import { getActivityLogs } from "../utils/activityLog";

const routerAuth = express.Router();
routerAuth.post("/register", validateRequest(registerSchema), dangKy);
routerAuth.post("/login", validateRequest(loginSchema), dangNhap);

routerAuth.patch("/users/:id/role", protect, checkAdmin(["capQuyen"]), updateUserRole);
routerAuth.get("/users", protect, checkAdmin(["view_user"]), getAllUsers);
routerAuth.get("/users/:id", protect, checkAdmin(["view_user"]), getUserById);
routerAuth.patch("/users/:id/status", protect, checkAdmin(["CheckTaiKhoan"]), toggleUserStatus);
routerAuth.get("/nhatKy", protect, checkAdmin(["view_nhatKy"]), getActivityLogs);

export default routerAuth;
