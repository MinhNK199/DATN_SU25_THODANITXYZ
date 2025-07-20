import Blog from "../models/Blog.js";
import User from "../models/User.js";

// Lấy danh sách bài viết
export const getBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ deletedAt: null }).populate('author', 'name email');
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy chi tiết bài viết
export const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('author', 'name email');
        if (!blog) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        res.json(blog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo mới bài viết
export const createBlog = async (req, res) => {
    try {
        let { slug, title } = req.body;
        if (!slug && title) {
            slug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .replace(/-+/g, '-');
        }
        const authorId = req.user?._id || req.body.author || null;
        const blog = new Blog({ ...req.body, slug, author: authorId });
        await blog.save();
        res.status(201).json(blog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật bài viết
export const updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!blog) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        res.json(blog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa mềm bài viết
export const softDeleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(req.params.id, { deletedAt: new Date(), deletedBy: req.user._id }, { new: true });
        if (!blog) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        res.json({ message: 'Đã xóa bài viết', blog });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Khôi phục bài viết đã xóa mềm
export const restoreBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(req.params.id, { deletedAt: null, deletedBy: null }, { new: true });
        if (!blog) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        res.json({ message: 'Đã khôi phục bài viết', blog });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Đăng bài viết (publish)
export const publishBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(req.params.id, { isPublished: true, publishedAt: new Date() }, { new: true });
        if (!blog) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        res.json({ message: 'Đã đăng bài viết', blog });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}; 