import express from "express";
import { validateRequest } from "../middlewares/validateRequest";
import { loginSchema, registerSchema } from "../validation/user";
import { dangKy, dangNhap, getAllUsers, toggleUserStatus, updateUserRole } from "../controllers/auth";
import { checkAdmin, protect } from "../middlewares/authMiddleware";

const routerAuth = express.Router();
routerAuth.post("/register", validateRequest(registerSchema), dangKy);
routerAuth.post("/login", validateRequest(loginSchema), dangNhap);

routerAuth.patch("/users/:id/role", protect, checkAdmin(["capQuyen"]), updateUserRole);
routerAuth.get("/users", protect, checkAdmin(["view_user"]), getAllUsers);
routerAuth.patch("/users/:id/status", protect, checkAdmin(["CheckTaiKhoan"]), toggleUserStatus);

export default routerAuth;
