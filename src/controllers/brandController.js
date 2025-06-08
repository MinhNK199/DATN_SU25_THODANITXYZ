const Brand = require('../models/Brand');
const asyncHandler = require('express-async-handler');

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
    const brands = await Brand.find({ isActive: true }).sort('order');
    res.json(brands);
});

// @desc    Get single brand
// @route   GET /api/brands/:id
// @access  Public
const getBrandById = asyncHandler(async (req, res) => {
    const brand = await Brand.findById(req.params.id);

    if (brand) {
        res.json(brand);
    } else {
        res.status(404);
        throw new Error('Brand not found');
    }
});

// @desc    Create a brand
// @route   POST /api/brands
// @access  Private/Admin
const createBrand = asyncHandler(async (req, res) => {
    const { name, description, logo, website, order } = req.body;

    const brand = new Brand({
        name,
        description,
        logo,
        website,
        order,
    });

    const createdBrand = await brand.save();
    res.status(201).json(createdBrand);
});

// @desc    Update a brand
// @route   PUT /api/brands/:id
// @access  Private/Admin
const updateBrand = asyncHandler(async (req, res) => {
    const { name, description, logo, website, order, isActive } = req.body;

    const brand = await Brand.findById(req.params.id);

    if (brand) {
        brand.name = name;
        brand.description = description;
        brand.logo = logo;
        brand.website = website;
        brand.order = order;
        brand.isActive = isActive;

        const updatedBrand = await brand.save();
        res.json(updatedBrand);
    } else {
        res.status(404);
        throw new Error('Brand not found');
    }
});

// @desc    Delete a brand
// @route   DELETE /api/brands/:id
// @access  Private/Admin
const deleteBrand = asyncHandler(async (req, res) => {
    const brand = await Brand.findById(req.params.id);

    if (brand) {
        await brand.remove();
        res.json({ message: 'Brand removed' });
    } else {
        res.status(404);
        throw new Error('Brand not found');
    }
});

// @desc    Get brand products
// @route   GET /api/brands/:id/products
// @access  Public
const getBrandProducts = asyncHandler(async (req, res) => {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;

    const brand = await Brand.findById(req.params.id);
    if (!brand) {
        res.status(404);
        throw new Error('Brand not found');
    }

    const count = await Product.countDocuments({
        brand: brand._id,
        isActive: true,
    });

    const products = await Product.find({
        brand: brand._id,
        isActive: true,
    })
        .populate('category', 'name')
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
    getBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand,
    getBrandProducts,
}; 