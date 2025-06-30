import Product from "../models/Product";
import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import Category from "../models/Category";
import Brand from "../models/Brand";
import User from "../models/User";
import Order from "../models/Order";

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
            .select('+variants') // Đảm bảo include variants field
            .sort({ [sort]: order === 'desc' ? -1 : 1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        // Đảm bảo variants field luôn có trong response
        const productsWithVariants = products.map(product => {
            const productObj = product.toObject();
            if (!productObj.hasOwnProperty('variants')) {
                productObj.variants = [];
            }
            return productObj;
        });

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
            products: productsWithVariants,
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
            .populate('brand', 'name')
            .populate('questions.user', 'name email avatar');
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        
        // Thêm thống kê Q&A
        const qaStats = {
            totalQuestions: product.questions.length,
            answeredQuestions: product.questions.filter(q => q.answer).length,
            unansweredQuestions: product.questions.filter(q => !q.answer).length
        };
        
        const productWithStats = {
            ...product.toObject(),
            qaStats
        };
        
        res.json(productWithStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        // Validate required fields
        if (!req.body.name || !req.body.price || !req.body.category || !req.body.brand) {
            return res.status(400).json({ 
                message: "Thiếu thông tin bắt buộc: tên, giá, danh mục, thương hiệu" 
            });
        }

        // Validate price
        if (req.body.price <= 0) {
            return res.status(400).json({ message: "Giá phải lớn hơn 0" });
        }

        // Validate sale price
        if (req.body.salePrice && req.body.salePrice >= req.body.price) {
            return res.status(400).json({ message: "Giá khuyến mãi phải nhỏ hơn giá gốc" });
        }

        // Validate stock
        if (req.body.stock < 0) {
            return res.status(400).json({ message: "Số lượng tồn kho không được âm" });
        }

        // Validate variants if provided
        if (req.body.variants && Array.isArray(req.body.variants)) {
            for (const variant of req.body.variants) {
                if (!variant.name || !variant.sku || variant.price <= 0) {
                    return res.status(400).json({ 
                        message: "Biến thể phải có tên, SKU và giá hợp lệ" 
                    });
                }
            }
        }

        const product = new Product({
            name: req.body.name,
            price: req.body.price,
            salePrice: req.body.salePrice,
            user: req.user._id,
            images: req.body.images || [],
            brand: req.body.brand,
            category: req.body.category,
            stock: req.body.stock || 0,
            numReviews: 0,
            description: req.body.description || "",
            specifications: req.body.specifications || {},
            features: req.body.features || [],
            variants: req.body.variants || [],
            isActive: req.body.isActive !== undefined ? req.body.isActive : true,
            isFeatured: req.body.isFeatured || false,
        });
        
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật sản phẩm
export const updateProduct = async (req, res) => {
    try {
        const {
            name,
            price,
            salePrice,
            description,
            images,
            brand,
            category,
            stock,
            specifications,
            features,
            variants,
            isActive,
            isFeatured,
        } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

        // Validate required fields
        if (!name || !price || !category || !brand) {
            return res.status(400).json({ 
                message: "Thiếu thông tin bắt buộc: tên, giá, danh mục, thương hiệu" 
            });
        }

        // Validate price
        if (price <= 0) {
            return res.status(400).json({ message: "Giá phải lớn hơn 0" });
        }

        // Validate sale price
        if (salePrice && salePrice >= price) {
            return res.status(400).json({ message: "Giá khuyến mãi phải nhỏ hơn giá gốc" });
        }

        // Validate stock
        if (stock < 0) {
            return res.status(400).json({ message: "Số lượng tồn kho không được âm" });
        }

        // Validate variants if provided
        if (variants && Array.isArray(variants)) {
            for (const variant of variants) {
                if (!variant.name || !variant.sku || variant.price <= 0) {
                    return res.status(400).json({ 
                        message: "Biến thể phải có tên, SKU và giá hợp lệ" 
                    });
                }
            }
        }

        product.name = name;
        product.price = price;
        product.salePrice = salePrice;
        product.description = description || product.description;
        product.images = images || product.images;
        product.brand = brand;
        product.category = category;
        product.stock = stock;
        if (specifications !== undefined) product.specifications = specifications;
        if (features !== undefined) product.features = features;
        if (variants !== undefined) product.variants = variants;
        if (isActive !== undefined) product.isActive = isActive;
        if (isFeatured !== undefined) product.isFeatured = isFeatured;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(400).json({ message: error.message });
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

// Hard delete sản phẩm (xóa vĩnh viễn)
export const hardDeleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
        res.json({ message: "Đã xóa vĩnh viễn sản phẩm thành công" });
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

// Thêm biến thể cho sản phẩm
export const addProductVariant = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

        const newVariant = {
            name: req.body.name,
            sku: req.body.sku,
            price: req.body.price,
            salePrice: req.body.salePrice,
            stock: req.body.stock,
            color: req.body.color,
            size: req.body.size,
            weight: req.body.weight,
            images: req.body.images || [],
            isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        };

        product.variants.push(newVariant);
        await product.save();

        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật biến thể sản phẩm
export const updateProductVariant = async (req, res) => {
    try {
        const { productId, variantId } = req.params;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

        const variant = product.variants.id(variantId);
        if (!variant) return res.status(404).json({ message: "Không tìm thấy biến thể" });

        // Cập nhật các trường
        if (req.body.name !== undefined) variant.name = req.body.name;
        if (req.body.sku !== undefined) variant.sku = req.body.sku;
        if (req.body.price !== undefined) variant.price = req.body.price;
        if (req.body.salePrice !== undefined) variant.salePrice = req.body.salePrice;
        if (req.body.stock !== undefined) variant.stock = req.body.stock;
        if (req.body.color !== undefined) variant.color = req.body.color;
        if (req.body.size !== undefined) variant.size = req.body.size;
        if (req.body.weight !== undefined) variant.weight = req.body.weight;
        if (req.body.images !== undefined) variant.images = req.body.images;
        if (req.body.isActive !== undefined) variant.isActive = req.body.isActive;

        await product.save();
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa biến thể sản phẩm
export const deleteProductVariant = async (req, res) => {
    try {
        const { productId, variantId } = req.params;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

        product.variants = product.variants.filter(variant => variant._id.toString() !== variantId);
        await product.save();

        res.json({ message: "Đã xóa biến thể thành công" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Lấy thống kê biến thể
export const getVariantStats = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

        const totalVariants = product.variants.length;
        const activeVariants = product.variants.filter(v => v.isActive).length;
        const totalVariantStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
        const outOfStockVariants = product.variants.filter(v => v.stock === 0).length;

        res.json({
            totalVariants,
            activeVariants,
            totalVariantStock,
            outOfStockVariants
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

// Lấy danh sách sản phẩm đã xóa mềm
export const getDeletedProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: false })
            .populate('category', 'name')
            .populate('brand', 'name');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Đếm số lượng sản phẩm đã xóa mềm
export const getDeletedProductsCount = async (req, res) => {
    try {
        const count = await Product.countDocuments({ isActive: false });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const suggestProducts = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 1) {
      return res.json({ suggestions: [] });
    }
    // Tìm tên sản phẩm chứa từ khóa, không phân biệt hoa thường
    const suggestions = await Product.find({
      name: { $regex: query, $options: 'i' }
    })
      .limit(10)
      .select('name');
    res.json({ suggestions: suggestions.map(p => p.name) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thêm video cho sản phẩm
export const addProductVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { videoUrl } = req.body;
    if (!videoUrl) return res.status(400).json({ message: 'Thiếu link video' });
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    product.videos.push(videoUrl);
    await product.save();
    res.status(200).json({ message: 'Đã thêm video', videos: product.videos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa video khỏi sản phẩm
export const deleteProductVideo = async (req, res) => {
  try {
    const { id, videoIndex } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    if (videoIndex < 0 || videoIndex >= product.videos.length) return res.status(400).json({ message: 'Index video không hợp lệ' });
    product.videos.splice(videoIndex, 1);
    await product.save();
    res.status(200).json({ message: 'Đã xóa video', videos: product.videos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật video cho sản phẩm (theo index)
export const updateProductVideo = async (req, res) => {
  try {
    const { id, videoIndex } = req.params;
    const { videoUrl } = req.body;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    if (videoIndex < 0 || videoIndex >= product.videos.length) return res.status(400).json({ message: 'Index video không hợp lệ' });
    product.videos[videoIndex] = videoUrl;
    await product.save();
    res.status(200).json({ message: 'Đã cập nhật video', videos: product.videos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật meta SEO cho sản phẩm
export const updateProductMeta = async (req, res) => {
  try {
    const { id } = req.params;
    const { metaTitle, metaDescription, metaImage } = req.body;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    product.meta = {
      metaTitle: metaTitle ?? product.meta?.metaTitle,
      metaDescription: metaDescription ?? product.meta?.metaDescription,
      metaImage: metaImage ?? product.meta?.metaImage,
    };
    await product.save();
    res.status(200).json({ message: 'Đã cập nhật meta SEO', meta: product.meta });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thêm câu hỏi cho sản phẩm
export const addProductQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { question } = req.body;
        
        // Validate input
        if (!question || question.trim().length < 5) {
            return res.status(400).json({ 
                message: "Câu hỏi phải có ít nhất 5 ký tự" 
            });
        }
        
        if (question.trim().length > 500) {
            return res.status(400).json({ 
                message: "Câu hỏi không được vượt quá 500 ký tự" 
            });
        }
        
        // Tìm sản phẩm
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        
        // Kiểm tra sản phẩm có đang hoạt động không
        if (!product.isActive) {
            return res.status(400).json({ message: "Sản phẩm không còn hoạt động" });
        }
        
        // Tạo câu hỏi mới
        const newQuestion = {
            user: req.user._id,
            question: question.trim(),
            createdAt: new Date()
        };
        
        // Thêm câu hỏi vào sản phẩm
        product.questions.push(newQuestion);
        await product.save();
        
        // Populate thông tin user cho câu hỏi vừa thêm
        const populatedProduct = await Product.findById(id)
            .populate('questions.user', 'name email avatar');
        
        const addedQuestion = populatedProduct.questions[populatedProduct.questions.length - 1];
        
        res.status(201).json({
            message: "Đã đặt câu hỏi thành công",
            question: addedQuestion
        });
        
    } catch (error) {
        console.error("Error adding product question:", error);
        res.status(500).json({ message: error.message });
    }
};

// Lấy danh sách câu hỏi của sản phẩm
export const getProductQuestions = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
        
        // Tìm sản phẩm
        const product = await Product.findById(id)
            .populate('questions.user', 'name email avatar')
            .select('questions isActive');
            
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        
        // Kiểm tra sản phẩm có đang hoạt động không
        if (!product.isActive) {
            return res.status(400).json({ message: "Sản phẩm không còn hoạt động" });
        }
        
        // Sắp xếp câu hỏi
        let sortedQuestions = [...product.questions];
        sortedQuestions.sort((a, b) => {
            if (order === 'desc') {
                return new Date(b[sort]) - new Date(a[sort]);
            } else {
                return new Date(a[sort]) - new Date(b[sort]);
            }
        });
        
        // Phân trang
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedQuestions = sortedQuestions.slice(startIndex, endIndex);
        
        // Thống kê
        const stats = {
            total: product.questions.length,
            answered: product.questions.filter(q => q.answer).length,
            unanswered: product.questions.filter(q => !q.answer).length
        };
        
        res.json({
            questions: paginatedQuestions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: product.questions.length,
                pages: Math.ceil(product.questions.length / limit)
            },
            stats
        });
        
    } catch (error) {
        console.error("Error getting product questions:", error);
        res.status(500).json({ message: error.message });
    }
};

// Trả lời câu hỏi (chỉ admin và superadmin)
export const answerProductQuestion = async (req, res) => {
    try {
        const { id, questionId } = req.params;
        const { answer } = req.body;
        
        // Validate input
        if (!answer || answer.trim().length < 5) {
            return res.status(400).json({ 
                message: "Câu trả lời phải có ít nhất 5 ký tự" 
            });
        }
        
        if (answer.trim().length > 1000) {
            return res.status(400).json({ 
                message: "Câu trả lời không được vượt quá 1000 ký tự" 
            });
        }
        
        // Kiểm tra quyền admin hoặc superadmin
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ 
                message: "Chỉ admin mới có quyền trả lời câu hỏi" 
            });
        }
        
        // Tìm sản phẩm
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        
        // Tìm câu hỏi
        const questionIndex = product.questions.findIndex(q => q._id.toString() === questionId);
        if (questionIndex === -1) {
            return res.status(404).json({ message: "Không tìm thấy câu hỏi" });
        }
        
        // Kiểm tra câu hỏi đã được trả lời chưa
        if (product.questions[questionIndex].answer) {
            return res.status(400).json({ message: "Câu hỏi này đã được trả lời" });
        }
        
        // Cập nhật câu trả lời
        product.questions[questionIndex].answer = answer.trim();
        product.questions[questionIndex].answeredAt = new Date();
        
        await product.save();
        
        // Populate thông tin user cho câu hỏi đã trả lời
        const populatedProduct = await Product.findById(id)
            .populate('questions.user', 'name email avatar');
        
        const answeredQuestion = populatedProduct.questions[questionIndex];
        
        res.json({
            message: "Đã trả lời câu hỏi thành công",
            question: answeredQuestion
        });
        
    } catch (error) {
        console.error("Error answering product question:", error);
        res.status(500).json({ message: error.message });
    }
};

// Xóa câu hỏi
export const deleteProductQuestion = async (req, res) => {
    try {
        const { id, questionId } = req.params;
        
        // Tìm sản phẩm
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        
        // Tìm câu hỏi
        const questionIndex = product.questions.findIndex(q => q._id.toString() === questionId);
        if (questionIndex === -1) {
            return res.status(404).json({ message: "Không tìm thấy câu hỏi" });
        }
        
        const question = product.questions[questionIndex];
        
        // Kiểm tra quyền xóa
        // Admin và superadmin có thể xóa mọi câu hỏi
        // User chỉ có thể xóa câu hỏi của chính mình
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && question.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                message: "Bạn không có quyền xóa câu hỏi này" 
            });
        }
        
        // Xóa câu hỏi
        product.questions.splice(questionIndex, 1);
        await product.save();
        
        res.json({
            message: "Đã xóa câu hỏi thành công"
        });
        
    } catch (error) {
        console.error("Error deleting product question:", error);
        res.status(500).json({ message: error.message });
    }
};

// Thêm sản phẩm liên quan
export const addRelatedProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { relatedProductId } = req.body;
        
        // Validate input
        if (!relatedProductId) {
            return res.status(400).json({ 
                message: "ID sản phẩm liên quan là bắt buộc" 
            });
        }
        
        // Kiểm tra quyền admin hoặc superadmin
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ 
                message: "Chỉ admin mới có quyền quản lý sản phẩm liên quan" 
            });
        }
        
        // Tìm sản phẩm chính
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        
        // Tìm sản phẩm liên quan
        const relatedProduct = await Product.findById(relatedProductId);
        if (!relatedProduct) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm liên quan" });
        }
        
        // Kiểm tra không phải chính nó
        if (id === relatedProductId) {
            return res.status(400).json({ 
                message: "Không thể thêm chính sản phẩm này làm sản phẩm liên quan" 
            });
        }
        
        // Kiểm tra đã tồn tại chưa
        if (product.relatedProducts.includes(relatedProductId)) {
            return res.status(400).json({ 
                message: "Sản phẩm này đã được thêm vào danh sách liên quan" 
            });
        }
        
        // Thêm sản phẩm liên quan
        product.relatedProducts.push(relatedProductId);
        await product.save();
        
        // Populate thông tin sản phẩm liên quan
        const populatedProduct = await Product.findById(id)
            .populate('relatedProducts', 'name price images averageRating numReviews');
        
        res.json({
            message: "Đã thêm sản phẩm liên quan thành công",
            relatedProducts: populatedProduct.relatedProducts
        });
        
    } catch (error) {
        console.error("Error adding related product:", error);
        res.status(500).json({ message: error.message });
    }
};

// Xóa sản phẩm liên quan
export const removeRelatedProduct = async (req, res) => {
    try {
        const { id, relatedProductId } = req.params;
        
        // Kiểm tra quyền admin hoặc superadmin
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ 
                message: "Chỉ admin mới có quyền quản lý sản phẩm liên quan" 
            });
        }
        
        // Tìm sản phẩm chính
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        
        // Kiểm tra sản phẩm liên quan có tồn tại không
        const relatedIndex = product.relatedProducts.indexOf(relatedProductId);
        if (relatedIndex === -1) {
            return res.status(404).json({ 
                message: "Không tìm thấy sản phẩm liên quan trong danh sách" 
            });
        }
        
        // Xóa sản phẩm liên quan
        product.relatedProducts.splice(relatedIndex, 1);
        await product.save();
        
        res.json({
            message: "Đã xóa sản phẩm liên quan thành công"
        });
        
    } catch (error) {
        console.error("Error removing related product:", error);
        res.status(500).json({ message: error.message });
    }
};

// Lấy danh sách sản phẩm liên quan
export const getRelatedProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 10 } = req.query;
        
        // Tìm sản phẩm
        const product = await Product.findById(id)
            .populate('relatedProducts', 'name price images averageRating numReviews stock isActive');
            
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        
        // Lọc chỉ sản phẩm đang hoạt động
        const activeRelatedProducts = product.relatedProducts.filter(p => p.isActive);
        
        // Giới hạn số lượng
        const limitedProducts = activeRelatedProducts.slice(0, parseInt(limit));
        
        res.json({
            relatedProducts: limitedProducts,
            total: activeRelatedProducts.length
        });
        
    } catch (error) {
        console.error("Error getting related products:", error);
        res.status(500).json({ message: error.message });
    }
};

// Tạo flash sale cho sản phẩm
export const createFlashSale = async (req, res) => {
    try {
        const { id } = req.params;
        const { price, start, end } = req.body;
        
        // Validate input
        if (!price || !start || !end) {
            return res.status(400).json({ 
                message: "Giá, thời gian bắt đầu và kết thúc là bắt buộc" 
            });
        }
        
        if (price <= 0) {
            return res.status(400).json({ 
                message: "Giá flash sale phải lớn hơn 0" 
            });
        }
        
        const startDate = new Date(start);
        const endDate = new Date(end);
        const now = new Date();
        
        if (startDate <= now) {
            return res.status(400).json({ 
                message: "Thời gian bắt đầu phải trong tương lai" 
            });
        }
        
        if (endDate <= startDate) {
            return res.status(400).json({ 
                message: "Thời gian kết thúc phải sau thời gian bắt đầu" 
            });
        }
        
        // Kiểm tra quyền admin hoặc superadmin
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ 
                message: "Chỉ admin mới có quyền tạo flash sale" 
            });
        }
        
        // Tìm sản phẩm
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        
        // Kiểm tra giá flash sale phải nhỏ hơn giá gốc
        if (price >= product.price) {
            return res.status(400).json({ 
                message: "Giá flash sale phải nhỏ hơn giá gốc" 
            });
        }
        
        // Kiểm tra đã có flash sale chưa
        if (product.flashSale && product.flashSale.end > now) {
            return res.status(400).json({ 
                message: "Sản phẩm đã có flash sale đang hoạt động" 
            });
        }
        
        // Tạo flash sale
        product.flashSale = {
            price: price,
            start: startDate,
            end: endDate
        };
        
        await product.save();
        
        res.json({
            message: "Đã tạo flash sale thành công",
            flashSale: product.flashSale
        });
        
    } catch (error) {
        console.error("Error creating flash sale:", error);
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật flash sale
export const updateFlashSale = async (req, res) => {
    try {
        const { id } = req.params;
        const { price, start, end } = req.body;
        
        // Validate input
        if (!price || !start || !end) {
            return res.status(400).json({ 
                message: "Giá, thời gian bắt đầu và kết thúc là bắt buộc" 
            });
        }
        
        if (price <= 0) {
            return res.status(400).json({ 
                message: "Giá flash sale phải lớn hơn 0" 
            });
        }
        
        const startDate = new Date(start);
        const endDate = new Date(end);
        
        if (endDate <= startDate) {
            return res.status(400).json({ 
                message: "Thời gian kết thúc phải sau thời gian bắt đầu" 
            });
        }
        
        // Kiểm tra quyền admin hoặc superadmin
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ 
                message: "Chỉ admin mới có quyền cập nhật flash sale" 
            });
        }
        
        // Tìm sản phẩm
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        
        // Kiểm tra có flash sale không
        if (!product.flashSale) {
            return res.status(404).json({ 
                message: "Sản phẩm chưa có flash sale" 
            });
        }
        
        // Kiểm tra giá flash sale phải nhỏ hơn giá gốc
        if (price >= product.price) {
            return res.status(400).json({ 
                message: "Giá flash sale phải nhỏ hơn giá gốc" 
            });
        }
        
        // Cập nhật flash sale
        product.flashSale = {
            price: price,
            start: startDate,
            end: endDate
        };
        
        await product.save();
        
        res.json({
            message: "Đã cập nhật flash sale thành công",
            flashSale: product.flashSale
        });
        
    } catch (error) {
        console.error("Error updating flash sale:", error);
        res.status(500).json({ message: error.message });
    }
};

// Xóa flash sale
export const deleteFlashSale = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Kiểm tra quyền admin hoặc superadmin
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ 
                message: "Chỉ admin mới có quyền xóa flash sale" 
            });
        }
        
        // Tìm sản phẩm
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        
        // Kiểm tra có flash sale không
        if (!product.flashSale) {
            return res.status(404).json({ 
                message: "Sản phẩm chưa có flash sale" 
            });
        }
        
        // Xóa flash sale
        product.flashSale = undefined;
        await product.save();
        
        res.json({
            message: "Đã xóa flash sale thành công"
        });
        
    } catch (error) {
        console.error("Error deleting flash sale:", error);
        res.status(500).json({ message: error.message });
    }
};

// Lấy thông tin flash sale
export const getFlashSale = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Tìm sản phẩm
        const product = await Product.findById(id).select('flashSale price');
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        
        if (!product.flashSale) {
            return res.json({ flashSale: null });
        }
        
        const now = new Date();
        const isActive = now >= product.flashSale.start && now <= product.flashSale.end;
        
        res.json({
            flashSale: {
                ...product.flashSale.toObject(),
                isActive,
                originalPrice: product.price,
                discount: Math.round(((product.price - product.flashSale.price) / product.price) * 100)
            }
        });
        
    } catch (error) {
        console.error("Error getting flash sale:", error);
        res.status(500).json({ message: error.message });
    }
};

// Thêm khuyến mãi cho sản phẩm
export const addProductDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, value, description, start, end } = req.body;
        
        // Validate input
        if (!type || !value || !start || !end) {
            return res.status(400).json({ 
                message: "Loại, giá trị, thời gian bắt đầu và kết thúc là bắt buộc" 
            });
        }
        
        if (!['percentage', 'fixed', 'voucher'].includes(type)) {
            return res.status(400).json({ 
                message: "Loại khuyến mãi phải là: percentage, fixed, hoặc voucher" 
            });
        }
        
        if (value <= 0) {
            return res.status(400).json({ 
                message: "Giá trị khuyến mãi phải lớn hơn 0" 
            });
        }
        
        if (type === 'percentage' && value > 100) {
            return res.status(400).json({ 
                message: "Phần trăm khuyến mãi không được vượt quá 100%" 
            });
        }
        
        const startDate = new Date(start);
        const endDate = new Date(end);
        const now = new Date();
        
        if (startDate <= now) {
            return res.status(400).json({ 
                message: "Thời gian bắt đầu phải trong tương lai" 
            });
        }
        
        if (endDate <= startDate) {
            return res.status(400).json({ 
                message: "Thời gian kết thúc phải sau thời gian bắt đầu" 
            });
        }
        
        // Kiểm tra quyền admin hoặc superadmin
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ 
                message: "Chỉ admin mới có quyền thêm khuyến mãi" 
            });
        }
        
        // Tìm sản phẩm
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        
        // Kiểm tra giá trị khuyến mãi
        if (type === 'fixed' && value >= product.price) {
            return res.status(400).json({ 
                message: "Giá trị khuyến mãi cố định phải nhỏ hơn giá sản phẩm" 
            });
        }
        
        // Tạo khuyến mãi mới
        const newDiscount = {
            type,
            value,
            description: description || '',
            start: startDate,
            end: endDate
        };
        
        // Thêm khuyến mãi vào sản phẩm
        product.discounts.push(newDiscount);
        await product.save();
        
        res.json({
            message: "Đã thêm khuyến mãi thành công",
            discount: newDiscount
        });
        
    } catch (error) {
        console.error("Error adding product discount:", error);
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật khuyến mãi
export const updateProductDiscount = async (req, res) => {
    try {
        const { id, discountId } = req.params;
        const { type, value, description, start, end } = req.body;
        
        // Validate input
        if (!type || !value || !start || !end) {
            return res.status(400).json({ 
                message: "Loại, giá trị, thời gian bắt đầu và kết thúc là bắt buộc" 
            });
        }
        
        if (!['percentage', 'fixed', 'voucher'].includes(type)) {
            return res.status(400).json({ 
                message: "Loại khuyến mãi phải là: percentage, fixed, hoặc voucher" 
            });
        }
        
        if (value <= 0) {
            return res.status(400).json({ 
                message: "Giá trị khuyến mãi phải lớn hơn 0" 
            });
        }
        
        if (type === 'percentage' && value > 100) {
            return res.status(400).json({ 
                message: "Phần trăm khuyến mãi không được vượt quá 100%" 
            });
        }
        
        const startDate = new Date(start);
        const endDate = new Date(end);
        
        if (endDate <= startDate) {
            return res.status(400).json({ 
                message: "Thời gian kết thúc phải sau thời gian bắt đầu" 
            });
        }
        
        // Kiểm tra quyền admin hoặc superadmin
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ 
                message: "Chỉ admin mới có quyền cập nhật khuyến mãi" 
            });
        }
        
        // Tìm sản phẩm
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        
        // Tìm khuyến mãi
        const discountIndex = product.discounts.findIndex(d => d._id.toString() === discountId);
        if (discountIndex === -1) {
            return res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
        }
        
        // Kiểm tra giá trị khuyến mãi
        if (type === 'fixed' && value >= product.price) {
            return res.status(400).json({ 
                message: "Giá trị khuyến mãi cố định phải nhỏ hơn giá sản phẩm" 
            });
        }
        
        // Cập nhật khuyến mãi
        product.discounts[discountIndex] = {
            ...product.discounts[discountIndex].toObject(),
            type,
            value,
            description: description || '',
            start: startDate,
            end: endDate
        };
        
        await product.save();
        
        res.json({
            message: "Đã cập nhật khuyến mãi thành công",
            discount: product.discounts[discountIndex]
        });
        
    } catch (error) {
        console.error("Error updating product discount:", error);
        res.status(500).json({ message: error.message });
    }
};

// Xóa khuyến mãi
export const deleteProductDiscount = async (req, res) => {
    try {
        const { id, discountId } = req.params;
        
        // Kiểm tra quyền admin hoặc superadmin
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ 
                message: "Chỉ admin mới có quyền xóa khuyến mãi" 
            });
        }
        
        // Tìm sản phẩm
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        
        // Tìm khuyến mãi
        const discountIndex = product.discounts.findIndex(d => d._id.toString() === discountId);
        if (discountIndex === -1) {
            return res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
        }
        
        // Xóa khuyến mãi
        product.discounts.splice(discountIndex, 1);
        await product.save();
        
        res.json({
            message: "Đã xóa khuyến mãi thành công"
        });
        
    } catch (error) {
        console.error("Error deleting product discount:", error);
        res.status(500).json({ message: error.message });
    }
};

// Lấy danh sách khuyến mãi
export const getProductDiscounts = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Tìm sản phẩm
        const product = await Product.findById(id).select('discounts price');
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        
        const now = new Date();
        
        // Lọc khuyến mãi đang hoạt động
        const activeDiscounts = product.discounts.filter(d => 
            now >= d.start && now <= d.end
        );
        
        // Tính toán giá sau khuyến mãi
        const discountsWithCalculatedPrice = activeDiscounts.map(discount => {
            let finalPrice = product.price;
            
            if (discount.type === 'percentage') {
                finalPrice = product.price * (1 - discount.value / 100);
            } else if (discount.type === 'fixed') {
                finalPrice = product.price - discount.value;
            }
            // Voucher type doesn't change product price directly
            
            return {
                ...discount.toObject(),
                originalPrice: product.price,
                finalPrice: Math.max(0, finalPrice),
                savings: product.price - Math.max(0, finalPrice)
            };
        });
        
        res.json({
            discounts: discountsWithCalculatedPrice,
            total: product.discounts.length,
            active: activeDiscounts.length
        });
        
    } catch (error) {
        console.error("Error getting product discounts:", error);
        res.status(500).json({ message: error.message });
    }
};

// Thêm sản phẩm vào danh sách yêu thích
export const addToFavorites = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Tìm sản phẩm
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        
        // Kiểm tra sản phẩm có đang hoạt động không
        if (!product.isActive) {
            return res.status(400).json({ message: "Sản phẩm không còn hoạt động" });
        }
        
        // Tìm user và kiểm tra đã yêu thích chưa
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        
        if (user.favorites.includes(id)) {
            return res.status(400).json({ message: "Sản phẩm đã có trong danh sách yêu thích" });
        }
        
        // Thêm vào danh sách yêu thích
        user.favorites.push(id);
        await user.save();
        
        res.json({
            message: "Đã thêm sản phẩm vào danh sách yêu thích",
            favoritesCount: user.favorites.length
        });
        
    } catch (error) {
        console.error("Error adding to favorites:", error);
        res.status(500).json({ message: error.message });
    }
};

// Xóa sản phẩm khỏi danh sách yêu thích
export const removeFromFavorites = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Tìm user
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        
        // Kiểm tra sản phẩm có trong danh sách yêu thích không
        const favoriteIndex = user.favorites.indexOf(id);
        if (favoriteIndex === -1) {
            return res.status(404).json({ message: "Sản phẩm không có trong danh sách yêu thích" });
        }
        
        // Xóa khỏi danh sách yêu thích
        user.favorites.splice(favoriteIndex, 1);
        await user.save();
        
        res.json({
            message: "Đã xóa sản phẩm khỏi danh sách yêu thích",
            favoritesCount: user.favorites.length
        });
        
    } catch (error) {
        console.error("Error removing from favorites:", error);
        res.status(500).json({ message: error.message });
    }
};

// Lấy danh sách sản phẩm yêu thích
export const getFavorites = async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
        
        // Tìm user với populate favorites
        const user = await User.findById(req.user._id)
            .populate({
                path: 'favorites',
                select: 'name price images averageRating numReviews stock isActive category brand',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'brand', select: 'name' }
                ]
            });
            
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        
        // Lọc chỉ sản phẩm đang hoạt động
        const activeFavorites = user.favorites.filter(p => p.isActive);
        
        // Sắp xếp
        activeFavorites.sort((a, b) => {
            if (order === 'desc') {
                return new Date(b[sort]) - new Date(a[sort]);
            } else {
                return new Date(a[sort]) - new Date(b[sort]);
            }
        });
        
        // Phân trang
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedFavorites = activeFavorites.slice(startIndex, endIndex);
        
        res.json({
            favorites: paginatedFavorites,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: activeFavorites.length,
                pages: Math.ceil(activeFavorites.length / limit)
            },
            totalFavorites: user.favorites.length,
            activeFavorites: activeFavorites.length
        });
        
    } catch (error) {
        console.error("Error getting favorites:", error);
        res.status(500).json({ message: error.message });
    }
};

// Kiểm tra sản phẩm có trong danh sách yêu thích không
export const checkFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Tìm user
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        
        const isFavorite = user.favorites.includes(id);
        
        res.json({
            isFavorite,
            favoritesCount: user.favorites.length
        });
        
    } catch (error) {
        console.error("Error checking favorite:", error);
        res.status(500).json({ message: error.message });
    }
};

// Lấy số lượng sản phẩm yêu thích
export const getFavoritesCount = async (req, res) => {
    try {
        // Tìm user
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        
        res.json({
            favoritesCount: user.favorites.length
        });
        
    } catch (error) {
        console.error("Error getting favorites count:", error);
        res.status(500).json({ message: error.message });
    }
};

// Gợi ý sản phẩm dựa trên sản phẩm hiện tại (collaborative filtering)
export const getProductRecommendations = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 10 } = req.query;
        
        // Tìm sản phẩm hiện tại
        const currentProduct = await Product.findById(id)
            .populate('category', 'name')
            .populate('brand', 'name');
            
        if (!currentProduct) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        
        // Tìm sản phẩm tương tự dựa trên:
        // 1. Cùng danh mục
        // 2. Cùng thương hiệu
        // 3. Cùng khoảng giá
        // 4. Cùng rating cao
        const similarProducts = await Product.find({
            _id: { $ne: id }, // Không phải chính sản phẩm này
            isActive: true,
            $or: [
                { category: currentProduct.category },
                { brand: currentProduct.brand },
                { 
                    price: { 
                        $gte: currentProduct.price * 0.7, 
                        $lte: currentProduct.price * 1.3 
                    } 
                },
                { averageRating: { $gte: currentProduct.averageRating - 0.5 } }
            ]
        })
        .populate('category', 'name')
        .populate('brand', 'name')
        .limit(parseInt(limit) * 2); // Lấy nhiều hơn để lọc
        
        // Tính điểm tương đồng và sắp xếp
        const scoredProducts = similarProducts.map(product => {
            let score = 0;
            
            // Cùng danh mục: +3 điểm
            if (product.category._id.toString() === currentProduct.category._id.toString()) {
                score += 3;
            }
            
            // Cùng thương hiệu: +2 điểm
            if (product.brand._id.toString() === currentProduct.brand._id.toString()) {
                score += 2;
            }
            
            // Cùng khoảng giá: +1 điểm
            const priceDiff = Math.abs(product.price - currentProduct.price) / currentProduct.price;
            if (priceDiff <= 0.3) {
                score += 1;
            }
            
            // Rating tương tự: +1 điểm
            const ratingDiff = Math.abs(product.averageRating - currentProduct.averageRating);
            if (ratingDiff <= 0.5) {
                score += 1;
            }
            
            return { product, score };
        });
        
        // Sắp xếp theo điểm và lấy top
        scoredProducts.sort((a, b) => b.score - a.score);
        const topRecommendations = scoredProducts
            .slice(0, parseInt(limit))
            .map(item => item.product);
        
        res.json({
            recommendations: topRecommendations,
            total: topRecommendations.length,
            basedOn: {
                category: currentProduct.category.name,
                brand: currentProduct.brand.name,
                price: currentProduct.price,
                rating: currentProduct.averageRating
            }
        });
        
    } catch (error) {
        console.error("Error getting product recommendations:", error);
        res.status(500).json({ message: error.message });
    }
};

// Gợi ý sản phẩm dựa trên lịch sử mua hàng của user
export const getUserRecommendations = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        // Tìm user
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        
        // Tìm lịch sử đơn hàng của user
        const userOrders = await Order.find({ 
            user: req.user._id,
            status: { $in: ['delivered', 'completed'] }
        }).populate('orderItems.product', 'category brand price averageRating');
        
        if (userOrders.length === 0) {
            // Nếu chưa có đơn hàng, trả về sản phẩm phổ biến
            const popularProducts = await Product.find({ 
                isActive: true,
                averageRating: { $gte: 4 }
            })
            .populate('category', 'name')
            .populate('brand', 'name')
            .sort({ averageRating: -1, numReviews: -1 })
            .limit(parseInt(limit));
            
            return res.json({
                recommendations: popularProducts,
                total: popularProducts.length,
                type: 'popular_products'
            });
        }
        
        // Phân tích hành vi mua hàng
        const purchaseHistory = {};
        const categoryPreferences = {};
        const brandPreferences = {};
        
        userOrders.forEach(order => {
            order.orderItems.forEach(item => {
                const product = item.product;
                
                // Thống kê sản phẩm đã mua
                purchaseHistory[product._id] = (purchaseHistory[product._id] || 0) + item.quantity;
                
                // Thống kê danh mục ưa thích
                const categoryId = product.category._id.toString();
                categoryPreferences[categoryId] = (categoryPreferences[categoryId] || 0) + item.quantity;
                
                // Thống kê thương hiệu ưa thích
                const brandId = product.brand._id.toString();
                brandPreferences[brandId] = (brandPreferences[brandId] || 0) + item.quantity;
            });
        });
        
        // Tìm danh mục và thương hiệu ưa thích nhất
        const topCategories = Object.entries(categoryPreferences)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([id]) => id);
            
        const topBrands = Object.entries(brandPreferences)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([id]) => id);
        
        // Tìm sản phẩm gợi ý dựa trên sở thích
        const recommendedProducts = await Product.find({
            _id: { $nin: Object.keys(purchaseHistory) }, // Chưa mua
            isActive: true,
            $or: [
                { category: { $in: topCategories } },
                { brand: { $in: topBrands } }
            ]
        })
        .populate('category', 'name')
        .populate('brand', 'name')
        .sort({ averageRating: -1 })
        .limit(parseInt(limit));
        
        res.json({
            recommendations: recommendedProducts,
            total: recommendedProducts.length,
            type: 'personalized',
            preferences: {
                topCategories: topCategories,
                topBrands: topBrands,
                purchaseHistory: Object.keys(purchaseHistory).length
            }
        });
        
    } catch (error) {
        console.error("Error getting user recommendations:", error);
        res.status(500).json({ message: error.message });
    }
};

// Gợi ý sản phẩm dựa trên sản phẩm yêu thích
export const getFavoritesRecommendations = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        // Tìm user với favorites
        const user = await User.findById(req.user._id)
            .populate({
                path: 'favorites',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'brand', select: 'name' }
                ]
            });
            
        if (!user || user.favorites.length === 0) {
            return res.status(400).json({ 
                message: "Bạn chưa có sản phẩm yêu thích nào" 
            });
        }
        
        // Phân tích sản phẩm yêu thích
        const favoriteCategories = {};
        const favoriteBrands = {};
        const favoritePriceRange = {
            min: Math.min(...user.favorites.map(p => p.price)),
            max: Math.max(...user.favorites.map(p => p.price))
        };
        
        user.favorites.forEach(product => {
            const categoryId = product.category._id.toString();
            favoriteCategories[categoryId] = (favoriteCategories[categoryId] || 0) + 1;
            
            const brandId = product.brand._id.toString();
            favoriteBrands[brandId] = (favoriteBrands[brandId] || 0) + 1;
        });
        
        // Tìm danh mục và thương hiệu yêu thích nhất
        const topFavoriteCategories = Object.entries(favoriteCategories)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([id]) => id);
            
        const topFavoriteBrands = Object.entries(favoriteBrands)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([id]) => id);
        
        // Tìm sản phẩm gợi ý
        const recommendedProducts = await Product.find({
            _id: { $nin: user.favorites.map(p => p._id) }, // Không phải sản phẩm đã yêu thích
            isActive: true,
            $or: [
                { category: { $in: topFavoriteCategories } },
                { brand: { $in: topFavoriteBrands } },
                { 
                    price: { 
                        $gte: favoritePriceRange.min * 0.8, 
                        $lte: favoritePriceRange.max * 1.2 
                    } 
                }
            ]
        })
        .populate('category', 'name')
        .populate('brand', 'name')
        .sort({ averageRating: -1 })
        .limit(parseInt(limit));
        
        res.json({
            recommendations: recommendedProducts,
            total: recommendedProducts.length,
            type: 'favorites_based',
            preferences: {
                topCategories: topFavoriteCategories,
                topBrands: topFavoriteBrands,
                priceRange: favoritePriceRange,
                favoritesCount: user.favorites.length
            }
        });
        
    } catch (error) {
        console.error("Error getting favorites recommendations:", error);
        res.status(500).json({ message: error.message });
    }
};

// Lấy thông tin điểm thưởng của user
export const getRewardPoints = async (req, res) => {
    try {
        // Tìm user với populate lịch sử điểm thưởng
        const user = await User.findById(req.user._id)
            .populate('rewardPoints.history.orderId', 'orderNumber totalAmount');
            
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        
        res.json({
            currentPoints: user.rewardPoints.current,
            totalPoints: user.rewardPoints.total,
            history: user.rewardPoints.history
        });
        
    } catch (error) {
        console.error("Error getting reward points:", error);
        res.status(500).json({ message: error.message });
    }
};

// Lấy lịch sử điểm thưởng với phân trang
export const getRewardPointsHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10, type } = req.query;
        
        // Tìm user
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        
        // Lọc theo loại nếu có
        let filteredHistory = user.rewardPoints.history;
        if (type && ['earned', 'spent', 'expired', 'bonus'].includes(type)) {
            filteredHistory = filteredHistory.filter(item => item.type === type);
        }
        
        // Sắp xếp theo thời gian mới nhất
        filteredHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Phân trang
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedHistory = filteredHistory.slice(startIndex, endIndex);
        
        // Populate thông tin đơn hàng
        const populatedHistory = await User.populate(paginatedHistory, {
            path: 'orderId',
            select: 'orderNumber totalAmount'
        });
        
        res.json({
            history: populatedHistory,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: filteredHistory.length,
                pages: Math.ceil(filteredHistory.length / limit)
            },
            summary: {
                currentPoints: user.rewardPoints.current,
                totalPoints: user.rewardPoints.total,
                totalEarned: user.rewardPoints.history
                    .filter(item => item.type === 'earned' || item.type === 'bonus')
                    .reduce((sum, item) => sum + item.amount, 0),
                totalSpent: user.rewardPoints.history
                    .filter(item => item.type === 'spent')
                    .reduce((sum, item) => sum + item.amount, 0)
            }
        });
        
    } catch (error) {
        console.error("Error getting reward points history:", error);
        res.status(500).json({ message: error.message });
    }
};

// Thêm điểm thưởng (cho admin và superadmin)
export const addRewardPoints = async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount, type, description } = req.body;
        
        // Validate input
        if (!amount || amount <= 0) {
            return res.status(400).json({ 
                message: "Số điểm phải lớn hơn 0" 
            });
        }
        
        if (!['earned', 'bonus'].includes(type)) {
            return res.status(400).json({ 
                message: "Loại điểm không hợp lệ" 
            });
        }
        
        // Kiểm tra quyền admin hoặc superadmin
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ 
                message: "Chỉ admin mới có quyền thêm điểm thưởng" 
            });
        }
        
        // Tìm user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        
        // Thêm điểm
        user.rewardPoints.current += amount;
        user.rewardPoints.total += amount;
        
        // Thêm vào lịch sử
        user.rewardPoints.history.push({
            type,
            amount,
            description: description || `Điểm thưởng ${type === 'earned' ? 'từ đơn hàng' : 'khuyến mãi'}`,
            createdAt: new Date()
        });
        
        await user.save();
        
        res.json({
            message: "Đã thêm điểm thưởng thành công",
            currentPoints: user.rewardPoints.current,
            totalPoints: user.rewardPoints.total,
            addedPoints: amount
        });
        
    } catch (error) {
        console.error("Error adding reward points:", error);
        res.status(500).json({ message: error.message });
    }
};

// Sử dụng điểm thưởng
export const useRewardPoints = async (req, res) => {
    try {
        const { amount, orderId } = req.body;
        
        // Validate input
        if (!amount || amount <= 0) {
            return res.status(400).json({ 
                message: "Số điểm phải lớn hơn 0" 
            });
        }
        
        // Tìm user
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        
        // Kiểm tra đủ điểm không
        if (user.rewardPoints.current < amount) {
            return res.status(400).json({ 
                message: "Không đủ điểm thưởng để sử dụng" 
            });
        }
        
        // Trừ điểm
        user.rewardPoints.current -= amount;
        
        // Thêm vào lịch sử
        user.rewardPoints.history.push({
            type: 'spent',
            amount,
            description: `Sử dụng điểm thưởng cho đơn hàng`,
            orderId: orderId || null,
            createdAt: new Date()
        });
        
        await user.save();
        
        res.json({
            message: "Đã sử dụng điểm thưởng thành công",
            currentPoints: user.rewardPoints.current,
            usedPoints: amount
        });
        
    } catch (error) {
        console.error("Error using reward points:", error);
        res.status(500).json({ message: error.message });
    }
};

// Tính điểm thưởng từ đơn hàng
export const calculateOrderRewardPoints = async (orderId) => {
    try {
        const order = await Order.findById(orderId)
            .populate('user', 'rewardPoints');
            
        if (!order) {
            throw new Error('Không tìm thấy đơn hàng');
        }
        
        // Tính điểm thưởng: 1% giá trị đơn hàng
        const pointsToEarn = Math.floor(order.totalAmount * 0.01);
        
        if (pointsToEarn > 0) {
            // Cập nhật điểm cho user
            const user = await User.findById(order.user._id);
            user.rewardPoints.current += pointsToEarn;
            user.rewardPoints.total += pointsToEarn;
            
            // Thêm vào lịch sử
            user.rewardPoints.history.push({
                type: 'earned',
                amount: pointsToEarn,
                description: `Điểm thưởng từ đơn hàng #${order.orderNumber}`,
                orderId: orderId,
                createdAt: new Date()
            });
            
            await user.save();
            
            return {
                pointsEarned: pointsToEarn,
                orderAmount: order.totalAmount,
                newBalance: user.rewardPoints.current
            };
        }
        
        return { pointsEarned: 0 };
        
    } catch (error) {
        console.error("Error calculating order reward points:", error);
        throw error;
    }
};

// Tổng sản phẩm gồm sản phẩm gốc (mỗi tên chỉ tính 1 lần) + tổng biến thể của tất cả sản phẩm trùng tên
export const getTotalProductWithVariantsByName = async (req, res) => {
    try {
        // Lấy tất cả tên sản phẩm duy nhất
        const uniqueNames = await Product.distinct('name');
        let total = 0;
        for (const name of uniqueNames) {
            // Lấy tất cả sản phẩm trùng tên này
            const products = await Product.find({ name });
            // Tính tổng biến thể của tất cả sản phẩm trùng tên
            let variantCount = 0;
            for (const p of products) {
                variantCount += (p.variants ? p.variants.length : 0);
            }
            // Cộng 1 sản phẩm gốc + tổng biến thể
            total += 1 + variantCount;
        }
        res.json({ totalProductWithVariantsByName: total });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tổng số lượng sản phẩm (gộp theo tên, gồm stock sản phẩm gốc và biến thể, mỗi tên chỉ tính 1 lần)
export const getTotalProductQuantityByName = async (req, res) => {
    try {
        // Tạm thời vô hiệu hóa để tránh lỗi 500, sẽ tối ưu sau
        res.json({ totalProductQuantityByName: 0 });
        return;

        /*
        const uniqueNames = await Product.distinct('name');
        let totalQuantity = 0;
        for (const name of uniqueNames) {
            // Lấy tất cả sản phẩm trùng tên này
            const products = await Product.find({ name });
            let nameQuantity = 0;
            for (const p of products) {
                nameQuantity += (p.stock || 0);
                if (p.variants && p.variants.length > 0) {
                    for (const v of p.variants) {
                        nameQuantity += (v.stock || 0);
                    }
                }
            }
            totalQuantity += nameQuantity;
        }
        res.json({ totalProductQuantityByName: totalQuantity });
        */
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};