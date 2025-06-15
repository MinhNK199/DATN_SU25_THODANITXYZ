import Product from "../models/product";
import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import Category from "../models/category";
import Brand from "../models/brand";

export const getProducts = async (req, res) => {
    try {
        const pageSize = Number(req.query.pageSize) || 10;
        const page = Number(req.query.page) || 1;
        const sort = req.query.sort || '-createdAt';
        const order = req.query.order || 'desc';

        // Xây dựng query filter
        const filter = {};

        // Tìm kiếm theo text
        if (req.query.keyword) {
            filter.$text = { $search: req.query.keyword };
        }

        // Lọc theo danh mục
        if (req.query.category) {
            filter.category = req.query.category;
        }

        // Lọc theo thương hiệu
        if (req.query.brand) {
            filter.brand = req.query.brand;
        }

        // Lọc theo khoảng giá
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
        }

        // Lọc theo khoảng thời gian
        if (req.query.startDate || req.query.endDate) {
            filter.createdAt = {};
            if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
            if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
        }

        // Lọc theo đánh giá
        if (req.query.minRating) {
            filter.averageRating = { $gte: Number(req.query.minRating) };
        }

        // Lọc theo số lượng tồn kho
        if (req.query.inStock === 'true') {
            filter.stock = { $gt: 0 };
        }

        // Lọc theo trạng thái
        if (req.query.isActive !== undefined) {
            filter.isActive = req.query.isActive === 'true';
        }

        // Lọc theo tags
        if (req.query.tags) {
            const tags = req.query.tags.split(',');
            filter.tags = { $in: tags };
        }

        // Lọc theo đặc điểm kỹ thuật
        if (req.query.specs) {
            const specs = JSON.parse(req.query.specs);
            Object.keys(specs).forEach(key => {
                filter[`specifications.${key}`] = specs[key];
            });
        }

        // Thực hiện query với populate và sort
        const count = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .populate('category', 'name')
            .populate('brand', 'name')
            .sort({ [sort]: order === 'desc' ? -1 : 1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        // Tính toán các thống kê
        const stats = {
            total: count,
            minPrice: await Product.findOne(filter).sort({ price: 1 }).select('price'),
            maxPrice: await Product.findOne(filter).sort({ price: -1 }).select('price'),
            avgRating: await Product.aggregate([
                { $match: filter },
                { $group: { _id: null, avgRating: { $avg: '$averageRating' } } }
            ])
        };

        res.json({
            products,
            page,
            pages: Math.ceil(count / pageSize),
            total: count,
            stats: {
                total: stats.total,
                minPrice: stats.minPrice?.price || 0,
                maxPrice: stats.maxPrice?.price || 0,
                avgRating: stats.avgRating[0]?.avgRating || 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy sản phẩm theo id
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name')
            .populate('brand', 'name');
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const product = new Product({
            name: req.body.name,
            price: req.body.price,
            user: req.user._id,
            images: req.body.images,
            brand: req.body.brand,
            category: req.body.category,
            stock: req.body.stock,
            description: req.body.description,
            specifications: req.body.specifications,
        });
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật sản phẩm
export const updateProduct = async (req, res) => {
    try {
        console.log('Received update request:', req.body); // Debug log

        const {
            name,
            price,
            description,
            images,
            brand,
            category,
            stock,
            specifications,
        } = req.body;

        // Validate required fields
        if (!name || !price || !description || !brand || !category || stock === undefined) {
            return res.status(400).json({ 
                message: "Thiếu thông tin bắt buộc",
                required: { name, price, description, brand, category, stock }
            });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }

        // Update fields
        product.name = name;
        product.price = Number(price);
        product.description = description;
        product.images = Array.isArray(images) ? images.filter(img => img.trim() !== "") : [];
        product.brand = brand;
        product.category = category;
        product.stock = Number(stock);
        product.specifications = specifications || {};

        console.log('Updating product with data:', product); // Debug log

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        console.error('Update product error:', error); // Debug log
        res.status(400).json({ 
            message: error.message || "Có lỗi xảy ra khi cập nhật sản phẩm",
            error: error.toString()
        });
    }
};

// Xóa sản phẩm
export const deleteProduct = async (req, res) => {
    try {
       const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Thêm đánh giá sản phẩm
export const createProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

        const alreadyReviewed = product.ratings.find(
            (r) => r.user.toString() === req.user._id.toString()
        );
        if (alreadyReviewed) {
            return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này rồi" });
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
        };

        product.ratings.push(review);
        product.numReviews = product.ratings.length;
        product.averageRating =
            product.ratings.reduce((acc, item) => item.rating + acc, 0) /
            product.ratings.length;

        await product.save();
        res.status(201).json({ message: "Đã thêm đánh giá" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Lấy top sản phẩm đánh giá cao
export const getTopProducts = async (req, res) => {
    try {
        const products = await Product.find({}).sort({ averageRating: -1 }).limit(3);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Soft delete sản phẩm
export const softDeleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

        product.isActive = false;
        await product.save();
        res.json({ message: "Đã xóa sản phẩm thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Khôi phục sản phẩm đã xóa
export const restoreProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

        product.isActive = true;
        await product.save();
        res.json({ message: "Đã khôi phục sản phẩm thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy thống kê sản phẩm
export const getProductStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const outOfStockProducts = await Product.countDocuments({ stock: 0 });
        const activeProducts = await Product.countDocuments({ isActive: true });
        const newProducts = await Product.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        res.json({
            totalProducts,
            outOfStockProducts,
            activeProducts,
            newProducts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Import sản phẩm từ Excel
export const importProductsFromExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng upload file Excel" });
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        // Validate cấu trúc file Excel
        const requiredFields = ['name', 'price', 'category', 'brand', 'stock'];
        const optionalFields = ['description', 'specifications', 'features', 'tags', 'sku', 'weight', 'warranty', 'images'];
        const allFields = [...requiredFields, ...optionalFields];

        const results = {
            total: data.length,
            success: 0,
            failed: 0,
            errors: []
        };

        // Validate từng dòng dữ liệu
        for (const [index, row] of data.entries()) {
            try {
                // Kiểm tra các trường bắt buộc
                const missingFields = requiredFields.filter(field => !row[field]);
                if (missingFields.length > 0) {
                    throw new Error(`Thiếu các trường bắt buộc: ${missingFields.join(', ')}`);
                }

                // Validate kiểu dữ liệu
                if (isNaN(Number(row.price)) || Number(row.price) < 0) {
                    throw new Error('Giá sản phẩm không hợp lệ');
                }

                if (isNaN(Number(row.stock)) || Number(row.stock) < 0) {
                    throw new Error('Số lượng tồn kho không hợp lệ');
                }

                // Validate category và brand
                const category = await Category.findById(row.category);
                if (!category) {
                    throw new Error('Danh mục không tồn tại');
                }

                const brand = await Brand.findById(row.brand);
                if (!brand) {
                    throw new Error('Thương hiệu không tồn tại');
                }

                // Xử lý specifications
                let specifications = {};
                if (row.specifications) {
                    try {
                        specifications = typeof row.specifications === 'string' 
                            ? JSON.parse(row.specifications)
                            : row.specifications;
                    } catch (e) {
                        throw new Error('Định dạng specifications không hợp lệ');
                    }
                }

                // Xử lý features
                let features = [];
                if (row.features) {
                    features = typeof row.features === 'string'
                        ? row.features.split(',').map(f => f.trim())
                        : row.features;
                }

                // Xử lý tags
                let tags = [];
                if (row.tags) {
                    tags = typeof row.tags === 'string'
                        ? row.tags.split(',').map(t => t.trim())
                        : row.tags;
                }

                // Xử lý ảnh
                let images = [];
                if (row.images) {
                    const imageUrls = typeof row.images === 'string'
                        ? row.images.split(',').map(url => url.trim())
                        : row.images;

                    // Validate URL ảnh
                    for (const url of imageUrls) {
                        try {
                            new URL(url);
                            images.push(url);
                        } catch (e) {
                            throw new Error(`URL ảnh không hợp lệ: ${url}`);
                        }
                    }
                }

                // Kiểm tra sản phẩm đã tồn tại
                const existingProduct = await Product.findOne({ 
                    $or: [
                        { name: row.name },
                        { sku: row.sku }
                    ]
                });

                if (existingProduct) {
                    throw new Error('Sản phẩm đã tồn tại (tên hoặc SKU trùng)');
                }

                // Tạo sản phẩm mới
                const product = new Product({
                    name: row.name,
                    price: Number(row.price),
                    description: row.description || '',
                    category: row.category,
                    brand: row.brand,
                    stock: Number(row.stock),
                    specifications,
                    features,
                    tags,
                    sku: row.sku,
                    weight: row.weight ? Number(row.weight) : undefined,
                    warranty: row.warranty ? Number(row.warranty) : undefined,
                    images,
                    isActive: true
                });

                await product.save();
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push({
                    row: index + 2, // +2 vì Excel bắt đầu từ 1 và có header
                    data: row,
                    error: error.message
                });
            }
        }

        // Xóa file sau khi import
        fs.unlinkSync(req.file.path);

        res.json({
            message: "Import hoàn tất",
            results,
            template: {
                requiredFields,
                optionalFields,
                example: {
                    name: "Tên sản phẩm",
                    price: "1000000",
                    category: "ID của danh mục",
                    brand: "ID của thương hiệu",
                    stock: "100",
                    description: "Mô tả sản phẩm",
                    specifications: '{"color": "Đen", "size": "128GB"}',
                    features: "Tính năng 1, Tính năng 2",
                    tags: "tag1, tag2",
                    sku: "SKU123",
                    weight: "500",
                    warranty: "12",
                    images: "url1, url2"
                }
            }
        });
    } catch (error) {
        // Xóa file nếu có lỗi
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            message: "Lỗi khi import sản phẩm",
            error: error.message
        });
    }
};