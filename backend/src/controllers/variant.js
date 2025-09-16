import Product from "../models/Product.js";

// Get all variants
export const getVariants = async(req, res) => {
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

        // Extract variants from products (exclude deleted ones)
        let allVariants = [];
        products.forEach(product => {
            product.variants.forEach(variant => {
                // Only include non-deleted variants
                if (!variant.isDeleted) {
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
                }
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
export const getVariantById = async(req, res) => {
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
            length: variant.length,
            width: variant.width,
            height: variant.height,
            images: variant.images,
            isActive: variant.isActive,
            specifications: variant.specifications || {},
            product: {
                _id: product._id,
                name: product.name,
                category: product.category,
                brand: product.brand
            }
        };

        console.log('🔍 getVariantById - Returning variant data:', {
            size: variantData.size,
            weight: variantData.weight,
            length: variantData.length,
            width: variantData.width,
            height: variantData.height
        });

        res.json(variantData);
    } catch (error) {
        console.error('Error getting variant:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create new variant
export const createVariant = async(req, res) => {
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

        // Clean and validate variant data
        const cleanVariantData = {
            name: variantData.name || '',
            sku: variantData.sku || '',
            price: Number(variantData.price) || 0,
            salePrice: variantData.salePrice ? Number(variantData.salePrice) : undefined,
            stock: Number(variantData.stock) || 0,
            size: variantData.size ? Number(variantData.size) : undefined,
            weight: variantData.weight ? Number(variantData.weight) : undefined,
            length: variantData.length ? Number(variantData.length) : undefined,
            width: variantData.width ? Number(variantData.width) : undefined,
            height: variantData.height ? Number(variantData.height) : undefined,
            images: Array.isArray(variantData.images) ? variantData.images : [],
            isActive: Boolean(variantData.isActive),
            specifications: variantData.specifications || {}
        };

        console.log('🔍 createVariant - Received data:', variantData);
        console.log('🔍 createVariant - Cleaned data:', cleanVariantData);

        // Handle color data
        if (variantData.color) {
            if (typeof variantData.color === 'string') {
                cleanVariantData.color = { code: variantData.color, name: '' };
            } else if (typeof variantData.color === 'object' && variantData.color !== null) {
                cleanVariantData.color = {
                    code: variantData.color.code || '#000000',
                    name: variantData.color.name || ''
                };
            } else {
                cleanVariantData.color = { code: '#000000', name: '' };
            }
        }


        // Add variant to product
        product.variants.push(cleanVariantData);
        await product.save();

        const newVariant = product.variants[product.variants.length - 1];

        res.status(201).json({
            message: 'Variant created successfully',
            variant: newVariant
        });
    } catch (error) {
        console.error('Error creating variant:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update variant
export const updateVariant = async(req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        console.log('🔍 updateVariant - Received data:', updateData);
        console.log('🔍 updateVariant - Variant ID:', id);

        const product = await Product.findOne({ "variants._id": id });
        if (!product) {
            console.log('❌ updateVariant - Product not found for variant:', id);
            return res.status(404).json({ message: 'Variant not found' });
        }

        const variant = product.variants.id(id);
        if (!variant) {
            console.log('❌ updateVariant - Variant not found in product:', id);
            return res.status(404).json({ message: 'Variant not found' });
        }

        // Check if SKU already exists (excluding current variant) - only if SKU is being changed
        if (updateData.sku && updateData.sku !== variant.sku) {
            const existingVariant = product.variants.find(v =>
                v.sku === updateData.sku && v._id.toString() !== id
            );
            if (existingVariant) {
                console.log('❌ updateVariant - SKU already exists:', updateData.sku);
                return res.status(400).json({ message: 'SKU already exists for this product' });
            }
        }

        console.log('🔍 updateVariant - Updating variant:', variant.name);

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
                    variant.color = {...color };
                } else if (key === 'specifications' && typeof updateData[key] === 'object') {
                    variant.specifications = updateData[key];
                } else if (['size', 'weight', 'length', 'width', 'height'].includes(key)) {
                    // Handle numeric fields - set to undefined if empty, otherwise convert to number
                    const newValue = updateData[key] ? Number(updateData[key]) : undefined;
                    console.log(`🔍 updateVariant - Setting ${key}:`, newValue);
                    variant[key] = newValue;
                } else {
                    variant[key] = updateData[key];
                }
            }
        });

        console.log('🔍 updateVariant - Final variant data:', {
            size: variant.size,
            weight: variant.weight,
            length: variant.length,
            width: variant.width,
            height: variant.height
        });

        await product.save();

        console.log('✅ updateVariant - Successfully updated variant:', variant.name, 'isActive:', variant.isActive);

        res.json({
            message: 'Variant updated successfully',
            variant: variant
        });
    } catch (error) {
        console.error('❌ updateVariant - Error updating variant:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete variant (hard delete)
export const deleteVariant = async(req, res) => {
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

// Soft delete variant
export const softDeleteVariant = async(req, res) => {
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

        // Mark variant as deleted (soft delete)
        variant.isDeleted = true;
        variant.isActive = false; // Also deactivate it
        variant.deletedAt = new Date();
        
        await product.save();

        res.json({ message: 'Variant moved to trash successfully' });
    } catch (error) {
        console.error('Error soft deleting variant:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get variant statistics
export const getVariantStats = async(req, res) => {
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

// Get deleted variants (trash)
export const getDeletedVariants = async(req, res) => {
    try {
        const products = await Product.find({});
        const deletedVariants = [];

        products.forEach(product => {
            product.variants.forEach(variant => {
                if (variant.isDeleted) {
                    deletedVariants.push({
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
                            name: product.name
                        },
                        deletedAt: variant.deletedAt,
                        createdAt: variant.createdAt,
                        updatedAt: variant.updatedAt
                    });
                }
            });
        });

        res.json({
            variants: deletedVariants,
            total: deletedVariants.length
        });
    } catch (error) {
        console.error('Error getting deleted variants:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Restore variant from trash
export const restoreVariant = async(req, res) => {
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

        if (!variant.isDeleted) {
            return res.status(400).json({ message: 'Variant is not deleted' });
        }

        // Restore variant
        variant.isDeleted = false;
        variant.isActive = true; // Reactivate it
        variant.deletedAt = undefined;
        
        await product.save();

        res.json({ message: 'Variant restored successfully' });
    } catch (error) {
        console.error('Error restoring variant:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Permanently delete variant
export const permanentDeleteVariant = async(req, res) => {
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

        if (!variant.isDeleted) {
            return res.status(400).json({ message: 'Variant is not deleted' });
        }

        // Remove variant from product permanently
        product.variants = product.variants.filter(v => v._id.toString() !== id);
        await product.save();

        res.json({ message: 'Variant permanently deleted successfully' });
    } catch (error) {
        console.error('Error permanently deleting variant:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};