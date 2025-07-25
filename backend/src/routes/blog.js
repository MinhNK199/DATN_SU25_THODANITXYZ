import express from "express";
import {
    getBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    softDeleteBlog,
    restoreBlog,
    publishBlog
} from "../controllers/blog.js";
// import { protect, checkAdmin } from "../middlewares/authMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";

const routerBlog = express.Router();

routerBlog.get("/", getBlogs);
routerBlog.get("/:id", getBlogById);
routerBlog.post("/", createBlog);
routerBlog.put("/:id", updateBlog);
routerBlog.delete("/:id", protect, softDeleteBlog);
routerBlog.patch("/:id/restore", restoreBlog);
routerBlog.patch("/:id/publish", publishBlog);

export default routerBlog; 