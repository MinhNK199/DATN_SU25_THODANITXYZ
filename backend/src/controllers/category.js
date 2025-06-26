import Category from "../models/Category.js";
import Product from "../models/Product.js";

// Lấy tất cả danh mục
export const getCategories = async (req, res) => {
    try {
        // Lấy tất cả danh mục (cả active và inactive) nhưng không bao gồm những danh mục đã xóa mềm
        const categories = await Category.find({
            $or: [
                { isActive: true },
                { isActive: false, deletedAt: null }
            ]
        })
            .populate('parent', 'name')
            .sort('order');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy cây danh mục
export const getCategoryTree = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true })
            .populate('parent', 'name')
            .sort('order');

        const buildTree = (items, parentId = null) => {
            return items
                .filter(item => (item.parent?._id?.toString() === parentId?.toString()))
                .map(item => ({
                    ...item.toObject(),
                    children: buildTree(items, item._id)
                }));
        };

        const tree = buildTree(categories);
        res.json(tree);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy chi tiết 1 danh mục
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
            .populate('parent', 'name');
        if (!category) return res.status(404).json({ message: "Không tìm thấy danh mục" });
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo danh mục mới
export const createCategory = async (req, res) => {
    try {
        const { 
            name, 
            slug, 
            description, 
            parent, 
            image, 
            icon, 
            color, 
            order, 
            isActive, 
            metaTitle, 
            metaDescription 
        } = req.body;
        
        const category = new Category({
            name,
            slug,
            description,
            parent,
            image,
            icon,
            color,
            order,
            isActive,
            metaTitle,
            metaDescription,
        });
        const createdCategory = await category.save();
        res.status(201).json(createdCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật danh mục
export const updateCategory = async (req, res) => {
    try {
        const { 
            name, 
            slug, 
            description, 
            parent, 
            image, 
            icon, 
            color, 
            order, 
            isActive, 
            metaTitle, 
            metaDescription 
        } = req.body;
        
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: "Không tìm thấy danh mục" });

        category.name = name;
        category.slug = slug;
        category.description = description;
        category.parent = parent;
        category.image = image;
        category.icon = icon;
        category.color = color;
        category.order = order;
        category.isActive = isActive;
        category.metaTitle = metaTitle;
        category.metaDescription = metaDescription;

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Ẩn danh mục 
export const deactivateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Không tìm thấy danh mục" });
        }

        category.isActive = false;
        await category.save();

        res.json({ message: "Đã ẩn danh mục thành công", category });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa danh mục
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Không tìm thấy danh mục" });
        }
        const hasChildren = await Category.exists({ parent: category._id });
        if (hasChildren) {
            return res.status(400).json({ message: "Không thể xóa danh mục có danh mục con" });
        }
        await Category.findByIdAndDelete(req.params.id); 
        res.json({ message: "Đã xóa danh mục thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa mềm danh mục
export const softDeleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Không tìm thấy danh mục" });
        }
        category.isActive = false;
        category.deletedAt = new Date();
        category.deletedBy = req.user._id;
        await category.save();
        res.json({ message: "Đã chuyển danh mục vào thùng rác thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Khôi phục danh mục đã xóa
export const restoreCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Không tìm thấy danh mục" });
        }
        category.isActive = true;
        category.deletedAt = null;
        category.deletedBy = null;
        await category.save();
        res.json({ message: "Đã khôi phục danh mục thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy danh sách danh mục đã xóa mềm
export const getDeletedCategories = async (req, res) => {
    try {
        const categories = await Category.find({ 
            isActive: false,
            deletedAt: { $ne: null }
        })
        .populate('parent', 'name')
        .populate('deletedBy', 'name email');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Đếm số lượng danh mục đã xóa mềm
export const getDeletedCategoriesCount = async (req, res) => {
    try {
        const count = await Category.countDocuments({ 
            isActive: false,
            deletedAt: { $ne: null }
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy sản phẩm theo danh mục
export const getCategoryProducts = async (req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.page) || 1;

        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: "Không tìm thấy danh mục" });

        const subcategories = await Category.find({
            parent: category._id,
            isActive: true,
        });

        const categoryIds = [category._id, ...subcategories.map(sub => sub._id)];

        const count = await Product.countDocuments({
            category: { $in: categoryIds },
            isActive: true,
        });

        const products = await Product.find({
            category: { $in: categoryIds },
            isActive: true,
        })
            .populate('brand', 'name')
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({
            products,
            page,
            pages: Math.ceil(count / pageSize),
            total: count,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};