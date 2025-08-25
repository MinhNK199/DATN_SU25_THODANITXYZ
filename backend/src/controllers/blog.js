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
        let { slug, title, content, summary } = req.body;
        
        // Validation cơ bản
        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Tiêu đề bài viết không được để trống' });
        }
        
        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Nội dung bài viết không được để trống' });
        }
        
        if (!summary || !summary.trim()) {
            return res.status(400).json({ message: 'Tóm tắt bài viết không được để trống' });
        }
        
        // Tạo slug tự động nếu chưa có
        if (!slug && title) {
            slug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .replace(/-+/g, '-');
        }
        
        // Lấy author ID từ user đã xác thực
        const authorId = req.user?._id;
        if (!authorId) {
            return res.status(400).json({ message: 'Không thể xác định tác giả bài viết' });
        }
        
        // Kiểm tra slug unique
        const existingBlog = await Blog.findOne({ slug, deletedAt: null });
        if (existingBlog) {
            return res.status(400).json({ message: 'Slug đã tồn tại, vui lòng chọn slug khác' });
        }
        
        const blog = new Blog({ 
            ...req.body, 
            slug, 
            author: authorId,
            title: title.trim(),
            content: content.trim(),
            summary: summary.trim()
        });
        
        await blog.save();
        res.status(201).json(blog);
    } catch (error) {
        console.error('Lỗi tạo blog:', error);
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

// Lấy danh sách blog đã publish cho khách hàng
export const getPublishedBlogs = async (req, res) => {
    try {
        const { page = 1, limit = 10, tag } = req.query;
        const skip = (page - 1) * limit;
        
        let query = { 
            deletedAt: null, 
            isPublished: true 
        };
        
        if (tag) {
            query.tags = { $in: [tag] };
        }
        
        const blogs = await Blog.find(query)
            .populate('author', 'name')
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('title summary coverImage tags publishedAt author slug');
            
        const total = await Blog.countDocuments(query);
        
        res.json({
            blogs,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy blog theo slug cho khách hàng
export const getBlogBySlug = async (req, res) => {
    try {
        const blog = await Blog.findOne({ 
            slug: req.params.slug, 
            deletedAt: null, 
            isPublished: true 
        }).populate('author', 'name');
        
        if (!blog) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        res.json(blog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 