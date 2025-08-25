import express from "express";
import {
    getBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    softDeleteBlog,
    restoreBlog,
    publishBlog,
    getPublishedBlogs,
    getBlogBySlug
} from "../controllers/blog.js";
// import { protect, checkAdmin } from "../middlewares/authMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";

const routerBlog = express.Router();

// Routes cho admin
routerBlog.get("/", getBlogs);
routerBlog.get("/:id", getBlogById);
routerBlog.post("/", protect, createBlog);
routerBlog.put("/:id", protect, updateBlog);
routerBlog.delete("/:id", protect, softDeleteBlog);
routerBlog.patch("/:id/restore", protect, restoreBlog);
routerBlog.patch("/:id/publish", protect, publishBlog);

// Routes cho khách hàng (không cần auth)
routerBlog.get("/public/published", getPublishedBlogs);
routerBlog.get("/public/slug/:slug", getBlogBySlug);

export default routerBlog; 