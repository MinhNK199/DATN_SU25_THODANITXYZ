import Product from "../models/Product.js";

// Get all variants
export const getVariants = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, product, isActive } = req.query;
        
        let query = {};
        
        // Search filter
        if (search) {
            query.$or = [
                { "variants.name": { $regex: search, $options: 'i' } },
                { "variants.sku": { $regex: search, $options: 'i' } }
            ];
        }
        
        // Product filter
        if (product) {
            query._id = product;
        }
        
        // Active filter
        if (isActive !== undefined) {
            query["variants.isActive"] = isActive === 'true';
        }
        
        const products = await Product.find(query)
            .populate('category', 'name')
            .populate('brand', 'name')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        
        // Extract variants from products
        let allVariants = [];
        products.forEach(product => {
            product.variants.forEach(variant => {
                allVariants.push({
                    _id: variant._id,
                    name: variant.name,
                    sku: variant.sku,
                    price: variant.price,
                    salePrice: variant.salePrice,
                    stock: variant.stock,
                    color: variant.color,
                    size: variant.size,
                    weight: variant.weight,
                    images: variant.images,
                    isActive: variant.isActive,
                    product: {
                        _id: product._id,
                        name: product.name,
                        category: product.category,
                        brand: product.brand
                    }
                });
            });
        });
        
        // Apply search filter to variants if needed
        if (search) {
            allVariants = allVariants.filter(variant => 
                variant.name.toLowerCase().includes(search.toLowerCase()) ||
                variant.sku.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        // Apply active filter to variants if needed
        if (isActive !== undefined) {
            allVariants = allVariants.filter(variant => 
                variant.isActive === (isActive === 'true')
            );
        }
        
        const total = allVariants.length;
        const totalPages = Math.ceil(total / limit);
        
        // Paginate variants
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedVariants = allVariants.slice(startIndex, endIndex);
        
        res.json({
            variants: paginatedVariants,
            totalPages,
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Error getting variants:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get variant by ID
export const getVariantById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findOne({ "variants._id": id })
            .populate('category', 'name')
            .populate('brand', 'name');
        
        if (!product) {
            return res.status(404).json({ message: 'Variant not found' });
        }
        
        const variant = product.variants.id(id);
        
        if (!variant) {
            return res.status(404).json({ message: 'Variant not found' });
        }
        
        const variantData = {
            _id: variant._id,
            name: variant.name,
            sku: variant.sku,
            price: variant.price,
            salePrice: variant.salePrice,
            stock: variant.stock,
            color: variant.color,
            size: variant.size,
            weight: variant.weight,
            images: variant.images,
            isActive: variant.isActive,
            product: {
                _id: product._id,
                name: product.name,
                category: product.category,
                brand: product.brand
            }
        };
        
        res.json(variantData);
    } catch (error) {
        console.error('Error getting variant:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create new variant
export const createVariant = async (req, res) => {
    try {
        const { product: productId, ...variantData } = req.body;
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Check if SKU already exists
        const existingVariant = product.variants.find(v => v.sku === variantData.sku);
        if (existingVariant) {
            return res.status(400).json({ message: 'SKU already exists for this product' });
        }
        
        // Add variant to product
        product.variants.push({
            ...variantData,
            specifications: variantData.specifications || {}
        });
        await product.save();
        
        const newVariant = product.variants[product.variants.length - 1];
        
        res.status(201).json({
            message: 'Variant created successfully',
            variant: newVariant
        });
    } catch (error) {
        console.error('Error creating variant:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update variant
export const updateVariant = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const product = await Product.findOne({ "variants._id": id });
        if (!product) {
            return res.status(404).json({ message: 'Variant not found' });
        }
        
        const variant = product.variants.id(id);
        if (!variant) {
            return res.status(404).json({ message: 'Variant not found' });
        }
        
        // Check if SKU already exists (excluding current variant)
        if (updateData.sku && updateData.sku !== variant.sku) {
            const existingVariant = product.variants.find(v => 
                v.sku === updateData.sku && v._id.toString() !== id
            );
            if (existingVariant) {
                return res.status(400).json({ message: 'SKU already exists for this product' });
            }
        }
        
        // Update variant fields
        Object.keys(updateData).forEach(key => {
            if (key !== 'product') {
                if (key === 'color') {
                    let color = updateData[key];
                    if (typeof color === 'string') {
                        color = { code: color, name: '' };
                    } else if (typeof color === 'object' && color !== null) {
                        if (typeof color.code !== 'string') color.code = '';
                        if (typeof color.name !== 'string') color.name = '';
                    } else {
                        color = { code: '', name: '' };
                    }
                    variant.color = { ...color };
                } else if (key === 'specifications' && typeof updateData[key] === 'object') {
                    variant.specifications = updateData[key];
                } else {
                    variant[key] = updateData[key];
                }
            }
        });
        
        await product.save();
        
        res.json({
            message: 'Variant updated successfully',
            variant: variant
        });
    } catch (error) {
        console.error('Error updating variant:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete variant
export const deleteVariant = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findOne({ "variants._id": id });
        if (!product) {
            return res.status(404).json({ message: 'Variant not found' });
        }
        
        const variant = product.variants.id(id);
        if (!variant) {
            return res.status(404).json({ message: 'Variant not found' });
        }
        
        // Remove variant from product
        product.variants = product.variants.filter(v => v._id.toString() !== id);
        await product.save();
        
        res.json({ message: 'Variant deleted successfully' });
    } catch (error) {
        console.error('Error deleting variant:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get variant statistics
export const getVariantStats = async (req, res) => {
    try {
        const products = await Product.find({});
        
        let totalVariants = 0;
        let activeVariants = 0;
        let totalStock = 0;
        let outOfStockVariants = 0;
        let lowStockVariants = 0;
        
        products.forEach(product => {
            totalVariants += product.variants.length;
            product.variants.forEach(variant => {
                if (variant.isActive) activeVariants++;
                totalStock += variant.stock;
                if (variant.stock === 0) outOfStockVariants++;
                if (variant.stock > 0 && variant.stock <= 10) lowStockVariants++;
            });
        });
        
        res.json({
            totalVariants,
            activeVariants,
            totalStock,
            outOfStockVariants,
            lowStockVariants,
            averageStock: totalVariants > 0 ? Math.round(totalStock / totalVariants) : 0
        });
    } catch (error) {
        console.error('Error getting variant stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}; 