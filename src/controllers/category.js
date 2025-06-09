import Category from "../models/category.js";
import Product from "../models/product.js";

// Lấy tất cả danh mục
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true })
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
        const { name, description, parent, image, order } = req.body;
        const category = new Category({
            name,
            description,
            parent,
            image,
            order,
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
        const { name, description, parent, image, order, isActive } = req.body;
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: "Không tìm thấy danh mục" });

        category.name = name;
        category.description = description;
        category.parent = parent;
        category.image = image;
        category.order = order;
        category.isActive = isActive;

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa danh mục
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: "Không tìm thấy danh mục" });

        const hasChildren = await Category.exists({ parent: category._id });
        if (hasChildren) {
            return res.status(400).json({ message: "Không thể xóa danh mục có danh mục con" });
        }

        await category.remove();
        res.json({ message: "Đã xóa danh mục thành công" });
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