import Product from "../models/product";
import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';


export const getProducts = async (req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.page) || 1;

        const keyword = req.query.keyword
            ? {
                  name: {
                      $regex: req.query.keyword,
                      $options: 'i',
                  },
              }
            : {};

        const count = await Product.countDocuments({ ...keyword });
        const products = await Product.find({ ...keyword })
            .populate('category', 'name')
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
            image: req.body.image,
            brand: req.body.brand,
            category: req.body.category,
            countInStock: req.body.countInStock,
            numReviews: 0,
            description: req.body.description,
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
        const {
            name,
            price,
            description,
            image,
            brand,
            category,
            countInStock,
        } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

        product.name = name;
        product.price = price;
        product.description = description;
        product.image = image;
        product.brand = brand;
        product.category = category;
        product.countInStock = countInStock;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
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

        const results = {
            total: data.length,
            success: 0,
            failed: 0,
            errors: []
        };

        for (const row of data) {
            try {
                // Validate dữ liệu
                if (!row.name || !row.price || !row.category || !row.brand) {
                    throw new Error('Thiếu thông tin bắt buộc');
                }

                // Kiểm tra sản phẩm đã tồn tại
                const existingProduct = await Product.findOne({ name: row.name });
                if (existingProduct) {
                    throw new Error('Sản phẩm đã tồn tại');
                }

                // Parse specifications và features nếu là string
                let specifications = row.specifications;
                let features = row.features;

                if (typeof specifications === 'string') {
                    try {
                        specifications = JSON.parse(specifications);
                    } catch (e) {
                        specifications = {};
                    }
                }

                if (typeof features === 'string') {
                    try {
                        features = JSON.parse(features);
                    } catch (e) {
                        features = [];
                    }
                }

                // Tạo sản phẩm mới
                const product = new Product({
                    name: row.name,
                    price: Number(row.price),
                    description: row.description || '',
                    category: row.category,
                    brand: row.brand,
                    stock: Number(row.stock) || 0,
                    specifications: specifications || {},
                    features: features || [],
                    isActive: true
                });

                await product.save();
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push({
                    row,
                    error: error.message
                });
            }
        }

        // Xóa file sau khi import
        fs.unlinkSync(req.file.path);

        res.json({
            message: "Import hoàn tất",
            results
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