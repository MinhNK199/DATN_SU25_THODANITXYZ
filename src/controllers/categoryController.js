const Category = require('../models/Category');
const asyncHandler = require('express-async-handler');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({ isActive: true })
        .populate('parent', 'name')
        .sort('order');

    res.json(categories);
});

// @desc    Get category tree
// @route   GET /api/categories/tree
// @access  Public
const getCategoryTree = asyncHandler(async (req, res) => {
    const categories = await Category.find({ isActive: true })
        .populate('parent', 'name')
        .sort('order');

    const buildTree = (items, parentId = null) => {
        return items
            .filter(item => item.parent?._id?.toString() === parentId?.toString())
            .map(item => ({
                ...item.toObject(),
                children: buildTree(items, item._id)
            }));
    };

    const tree = buildTree(categories);
    res.json(tree);
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id)
        .populate('parent', 'name');

    if (category) {
        res.json(category);
    } else {
        res.status(404);
        throw new Error('Category not found');
    }
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
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
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
    const { name, description, parent, image, order, isActive } = req.body;

    const category = await Category.findById(req.params.id);

    if (category) {
        category.name = name;
        category.description = description;
        category.parent = parent;
        category.image = image;
        category.order = order;
        category.isActive = isActive;

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } else {
        res.status(404);
        throw new Error('Category not found');
    }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (category) {
        // Check if category has children
        const hasChildren = await Category.exists({ parent: category._id });
        if (hasChildren) {
            res.status(400);
            throw new Error('Cannot delete category with subcategories');
        }

        await category.remove();
        res.json({ message: 'Category removed' });
    } else {
        res.status(404);
        throw new Error('Category not found');
    }
});

// @desc    Get category products
// @route   GET /api/categories/:id/products
// @access  Public
const getCategoryProducts = asyncHandler(async (req, res) => {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;

    const category = await Category.findById(req.params.id);
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    // Get all subcategories
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
});

module.exports = {
    getCategories,
    getCategoryTree,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryProducts,
}; 