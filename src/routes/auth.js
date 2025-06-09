import express from "express";
import { validateRequest } from "../middlewares/validateRequest";
import { loginSchema, registerSchema } from "../validation/user";
import { dangKy, dangNhap } from "../controllers/auth";

const routerAuth = express.Router();
routerAuth.post("/register", validateRequest(registerSchema), dangKy);
routerAuth.post("/login", validateRequest(loginSchema), dangNhap);
export default routerAuth;
