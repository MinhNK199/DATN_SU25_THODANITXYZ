import Product from "../models/Product.js"
import xlsx from "xlsx"
import fs from "fs"
import Category from "../models/Category.js"
import Brand from "../models/Brand.js"
import User from "../models/User.js"
import Order from "../models/Order.js"
import mongoose from "mongoose"
import removeAccents from "remove-accents";

// Helper function để xử lý color object - FIXED
const processColorData = (colorData) => {
    console.log("🎨 Processing color data:", JSON.stringify(colorData), typeof colorData)

    if (!colorData) {
        console.log("⚠️ No color data provided, using default")
        return { code: "#000000", name: "" }
    }

    // Nếu đã là object hợp lệ
    if (typeof colorData === "object" && colorData !== null) {
        console.log("✅ Valid color object received")
        const result = {
            code: typeof colorData.code === "string" ? colorData.code : "#000000",
            name: typeof colorData.name === "string" ? colorData.name : "",
        }
        console.log("✅ Processed color result:", JSON.stringify(result))
        return result
    }

    // Xử lý trường hợp string
    if (typeof colorData === "string") {
        if (colorData === "[object Object]" || colorData === "undefined" || colorData === "null") {
            console.log("⚠️ Invalid color string detected, using default")
            return { code: "#000000", name: "" }
        }

        // Kiểm tra nếu là hex color hoặc rgba hợp lệ
        if (colorData.startsWith("#") || colorData.startsWith("rgb")) {
            console.log("✅ Valid color string:", colorData)
            return { code: colorData, name: "" }
        }

        // Cố gắng parse JSON
        try {
            const parsed = JSON.parse(colorData)
            console.log("✅ Parsed color from JSON:", parsed)
            if (parsed && typeof parsed === "object") {
                return {
                    code: typeof parsed.code === "string" ? parsed.code : "#000000",
                    name: typeof parsed.name === "string" ? parsed.name : "",
                }
            }
        } catch (e) {
            console.log("⚠️ Failed to parse color JSON, using default")
            return { code: "#000000", name: "" }
        }
    }

    console.log("⚠️ Fallback to default color")
    return { code: "#000000", name: "" }
}

// Helper function để xử lý specifications - FIXED
const processSpecifications = (specsData) => {
    console.log("📋 Processing specifications:", JSON.stringify(specsData), typeof specsData)

    if (!specsData) {
        console.log("📋 No specs data, returning empty object")
        return {}
    }

    // Nếu đã là object hợp lệ
    if (typeof specsData === "object" && specsData !== null) {
        console.log("✅ Valid specs object received")
        const result = {...specsData }
        console.log("✅ Processed specs result:", JSON.stringify(result))
        return result
    }

    // Xử lý trường hợp string
    if (typeof specsData === "string") {
        if (specsData.trim() === "" || specsData === "undefined" || specsData === "null") {
            return {}
        }

        try {
            const parsed = JSON.parse(specsData)
            console.log("✅ Parsed specs from JSON:", parsed)
            return parsed
        } catch (e) {
            // Nếu không parse được JSON, coi như là text format "key: value"
            console.log("🔧 Parsing specs from text format")
            const specs = {}
            specsData.split("\n").forEach((line) => {
                const [key, ...rest] = line.split(":")
                if (key && rest.length) {
                    specs[key.trim()] = rest.join(":").trim()
                }
            })
            return specs
        }
    }

    return {}
}

// Helper function để xử lý variant data - IMPROVED LOGGING
const processVariantData = (variant, index = 0) => {
    if (!variant || typeof variant !== "object") {
        throw new Error("Invalid variant data")
    }

    console.log(`🔄 Processing variant ${index}:`, variant.name || "unnamed")
    console.log(`📥 Raw variant ${index} data:`, JSON.stringify(variant, null, 2))

    // Process color với logging chi tiết
    console.log(`🎨 Processing color for variant ${index}:`, JSON.stringify(variant.color))
    const processedColor = processColorData(variant.color)
    console.log(`✅ Processed color for variant ${index}:`, JSON.stringify(processedColor))

    // Process specifications với logging chi tiết
    console.log(`📋 Processing specs for variant ${index}:`, JSON.stringify(variant.specifications))
    const processedSpecs = processSpecifications(variant.specifications)
    console.log(`✅ Processed specs for variant ${index}:`, JSON.stringify(processedSpecs))

    // Only set _id if it is a valid ObjectId (24-char hex string)
    let processedVariant = {
            name: variant.name || "",
            sku: variant.sku || "",
            price: typeof variant.price === "number" ? variant.price : Number.parseFloat(variant.price) || 0,
            salePrice: variant.salePrice ?
                typeof variant.salePrice === "number" ?
                variant.salePrice :
                Number.parseFloat(variant.salePrice) : undefined,
            stock: typeof variant.stock === "number" ? variant.stock : Number.parseInt(variant.stock) || 0,
            color: processedColor,
            size: typeof variant.size === "number" ? variant.size : Number.parseFloat(variant.size) || 0,
            length: typeof variant.length === "number" ? variant.length : Number.parseFloat(variant.length) || 0,
            width: typeof variant.width === "number" ? variant.width : Number.parseFloat(variant.width) || 0,
            height: typeof variant.height === "number" ? variant.height : Number.parseFloat(variant.height) || 0,
            weight: typeof variant.weight === "number" ? variant.weight : Number.parseFloat(variant.weight) || 0,
            images: Array.isArray(variant.images) ? variant.images.filter((img) => img && typeof img === "string") : [],
            isActive: Boolean(variant.isActive),
            specifications: processedSpecs,
        }
        // Check if _id or id is a valid ObjectId
    const idCandidate = variant._id || variant.id;
    if (typeof idCandidate === "string" && /^[a-fA-F0-9]{24}$/.test(idCandidate)) {
        processedVariant._id = idCandidate;
    }

    console.log(`✅ Final processed variant ${index}:`, {
        name: processedVariant.name,
        color: processedVariant.color,
        specifications: processedVariant.specifications,
    })

    return processedVariant
}

export const getProducts = async(req, res) => {
    try {
        // ⚙️ Thiết lập phân trang mặc định
        const pageSize = Number(req.query.pageSize) || 10
        const page = Number(req.query.page) || 1

        // ⚙️ Thiết lập sắp xếp: mặc định sắp xếp theo thời gian tạo (cũ lên đầu)
        const sortParam = req.query.sort || "createdAt"
        const sortField = sortParam.replace("-", "") // tên trường sắp xếp
        const sortOrder = sortParam.startsWith("-") ? -1 : 1 // -1: giảm dần, 1: tăng dần

        // 🔎 Khởi tạo bộ lọc dữ liệu
        const filter = {}

        // 🔍 Tìm kiếm theo từ khóa (nếu có)
        if (req.query.keyword) {
            filter.$text = { $search: req.query.keyword }
        }

        // 🏷️ Lọc theo danh mục (hỗ trợ cả ID và slug)
        if (req.query.category) {
            if (mongoose.Types.ObjectId.isValid(req.query.category)) {
                filter.category = req.query.category
            } else {
                // Nếu không phải ObjectId, tìm theo slug
                const category = await Category.findOne({ slug: req.query.category })
                if (category) {
                    filter.category = category._id
                }
            }
        }

        // 🏷️ Lọc theo thương hiệu
        if (req.query.brand) {
            if (mongoose.Types.ObjectId.isValid(req.query.brand)) {
                filter.brand = req.query.brand
            }
        }

        // Nếu filter.brand hoặc filter.category không hợp lệ, xóa khỏi filter để tránh lỗi Cast to ObjectId
        if (filter.brand && !mongoose.Types.ObjectId.isValid(filter.brand)) delete filter.brand
        if (filter.category && !mongoose.Types.ObjectId.isValid(filter.category)) delete filter.category

        // 💰 Lọc theo khoảng giá
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {}
            if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice)
            if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice)
        }

        // 🕒 Lọc theo khoảng thời gian tạo
        if (req.query.startDate || req.query.endDate) {
            filter.createdAt = {}
            if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate)
            if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate)
        }

        // ⭐ Lọc theo đánh giá trung bình
        if (req.query.minRating) {
            filter.averageRating = { $gte: Number(req.query.minRating) }
        }

        // 📦 Lọc sản phẩm còn hàng
        if (req.query.inStock === "true") {
            filter.stock = { $gt: 0 }
        }

        // 👀 Lọc theo trạng thái hiển thị (đang bán / ngừng bán)
        if (req.query.isActive !== undefined) {
            filter.isActive = req.query.isActive === "true"
        }

        // 🏷️ Lọc theo tags
        if (req.query.tags) {
            const tags = req.query.tags.split(",")
            filter.tags = { $in: tags }
        }

        // 🛠️ Lọc theo thông số kỹ thuật (từ query dạng JSON)
        if (req.query.specs) {
            const specs = JSON.parse(req.query.specs)
            Object.keys(specs).forEach((key) => {
                filter[`specifications.${key}`] = specs[key]
            })
        }

        // 🧮 Đếm tổng số sản phẩm phù hợp với bộ lọc
        console.log("Filter used for product search:", filter)
        const count = await Product.countDocuments(filter)

        // 📦 Lấy danh sách sản phẩm đã lọc và sắp xếp theo sortField + sortOrder
        const products = await Product.find(filter)
            .populate("category", "name")
            .populate("brand", "name")
            .select(
                "name slug description price salePrice images category brand stock sku weight dimensions warranty specifications variants isActive isFeatured tags averageRating numReviews createdAt updatedAt vouchers",
            )
            .sort({
                [sortField]: sortOrder,
            })
            .limit(pageSize)
            .skip(pageSize * (page - 1))

        // 🧩 Đảm bảo luôn có mảng biến thể và các trường quan trọng không null
        const productsWithVariants = products.map((product) => {
            const productObj = typeof product.toObject === "function" ? product.toObject() : product
            if (!productObj.hasOwnProperty("variants") || !Array.isArray(productObj.variants)) {
                productObj.variants = []
            }
            if (!productObj.category) productObj.category = null
            if (!productObj.brand) productObj.brand = null
            if (typeof productObj.price !== "number") productObj.price = 0
            if (!Array.isArray(productObj.images)) productObj.images = []
            return productObj
        })

        // 📊 Thống kê (min, max giá và trung bình đánh giá)
        const stats = {
            total: count,
            minPrice: await Product.findOne(filter).sort({ price: 1 }).select("price"),
            maxPrice: await Product.findOne(filter).sort({ price: -1 }).select("price"),
            avgRating: await Product.aggregate([
                { $match: filter },
                { $group: { _id: null, avgRating: { $avg: "$averageRating" } } },
            ]),
        }

        // 📤 Trả kết quả về client
        res.json({
            products: productsWithVariants,
            page,
            pages: Math.ceil(count / pageSize),
            total: count,
            stats: {
                total: stats.total,
                minPrice: stats.minPrice && stats.minPrice.price ? stats.minPrice.price : 0,
                maxPrice: stats.maxPrice && stats.maxPrice.price ? stats.maxPrice.price : 0,
                avgRating: Array.isArray(stats.avgRating) && stats.avgRating[0] && stats.avgRating[0].avgRating ?
                    stats.avgRating[0].avgRating : 0,
            },
        })
    } catch (error) {
        console.error("Error in getProducts:", error)
        res.status(500).json({ message: error.message })
    }
}

// Lấy sản phẩm theo id
export const getProductById = async(req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate("category", "name")
            .populate("brand", "name")
            .populate("questions.user", "name email avatar")
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" })

        // Thêm thống kê Q&A
        const qaStats = {
            totalQuestions: product.questions.length,
            answeredQuestions: product.questions.filter((q) => q.answer).length,
            unansweredQuestions: product.questions.filter((q) => !q.answer).length,
        }

        const productWithStats = {
            ...product.toObject(),
            qaStats,
        }

        res.json(productWithStats)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const createProduct = async(req, res) => {
    // Log dữ liệu nhận được từ FE để debug
    console.log("[DEBUG] req.body:", req.body);
    console.log("[DEBUG] req.file:", req.file);
    console.log("[DEBUG] req.files:", req.files);
    try {
        console.log("🆕 Creating new product:", JSON.stringify(req.body, null, 2))

        // Parse và ép kiểu các trường khi nhận từ FormData
        const name = req.body.name || "";
        const description = req.body.description || "";
        const price = Number(req.body.price);
        const salePrice = req.body.salePrice ? Number(req.body.salePrice) : undefined;
        const stock = req.body.stock ? Number(req.body.stock) : 0;
        const category = req.body.category;
        const brand = req.body.brand;
        const sku = req.body.sku || "";
        const warranty = req.body.warranty ? Number(req.body.warranty) : 0;
        const tags = req.body.tags ? (typeof req.body.tags === "string" ? JSON.parse(req.body.tags) : req.body.tags) : [];
        const isActive = req.body.isActive !== undefined ? (req.body.isActive === "true" || req.body.isActive === true) : true;
        let isFeatured = false;
        if (req.body.isFeatured === "true" || req.body.isFeatured === true) {
            isFeatured = true;
        } else if (req.body.isFeatured === "false" || req.body.isFeatured === false) {
            isFeatured = false;
        } // Nếu là "undefined" hoặc undefined thì giữ là false

        // Validate required fields
        if (!name || name.length < 2 || name.length > 200) {
            return res.status(400).json({ message: "Tên sản phẩm phải có từ 2 đến 200 ký tự" });
        }
        if (!description || description.length < 10 || description.length > 2000) {
            return res.status(400).json({ message: "Mô tả sản phẩm phải có từ 10 đến 2000 ký tự" });
        }
        if (!price || price <= 0) {
            return res.status(400).json({ message: "Giá sản phẩm phải là số dương" });
        }
        if (salePrice && salePrice >= price) {
            return res.status(400).json({ message: "Giá khuyến mãi phải nhỏ hơn giá gốc" });
        }
        if (stock < 0) {
            return res.status(400).json({ message: "Số lượng tồn kho phải là số nguyên không âm" });
        }
        if (!category) {
            return res.status(400).json({ message: "Danh mục không hợp lệ" });
        }
        if (!brand) {
            return res.status(400).json({ message: "Thương hiệu không hợp lệ" });
        }

        // Xử lý ảnh upload
        let imageUrls = [];
        if (req.file) {
            imageUrls.push(`/uploads/images/${req.file.filename}`);
        } else if (req.files && Array.isArray(req.files)) {
            imageUrls = req.files.map(f => `/uploads/images/${f.filename}`);
        } else if (req.body.images) {
            if (typeof req.body.images === "string") {
                try {
                    imageUrls = JSON.parse(req.body.images);
                } catch (e) {
                    imageUrls = [req.body.images];
                }
            } else if (Array.isArray(req.body.images)) {
                imageUrls = req.body.images;
            }
        }
        if (!imageUrls || imageUrls.length < 1) {
            return res.status(400).json({ message: "Phải có ít nhất 1 hình ảnh" });
        }

        // Parse variants robustly
        let processedVariants = [];
        if (req.body.variants) {
            let variantsArr = [];
            if (typeof req.body.variants === "string") {
                try {
                    variantsArr = JSON.parse(req.body.variants);
                } catch (e) {
                    variantsArr = [];
                }
            } else if (Array.isArray(req.body.variants)) {
                variantsArr = req.body.variants;
            }
            if (!Array.isArray(variantsArr)) {
                variantsArr = [];
            }
            processedVariants = variantsArr.map((variant, index) => processVariantData(variant, index));
        }

        // Process main product specifications
        const mainSpecifications = processSpecifications(req.body.specifications);

        const product = new Product({
            name,
            slug: req.body.slug,
            price,
            salePrice,
            user: req.user && req.user._id,
            images: imageUrls,
            videos: req.body.videos || [],
            brand,
            category,
            sku,
            stock,
            numReviews: 0,
            description,
            specifications: mainSpecifications,
            features: req.body.features || [],
            variants: processedVariants,
            isActive,
            isFeatured,
            tags,
            weight: req.body.weight || 0,
            warranty,
            dimensions: {
                length: req.body.dimensions && typeof req.body.dimensions.length !== "undefined" ? req.body.dimensions.length : 0,
                width: req.body.dimensions && typeof req.body.dimensions.width !== "undefined" ? req.body.dimensions.width : 0,
                height: req.body.dimensions && typeof req.body.dimensions.height !== "undefined" ? req.body.dimensions.height : 0,
            },
        });

        const createdProduct = await product.save();
        console.log("✅ Product created successfully");
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error("❌ Error creating product:", error)
        res.status(400).json({ message: error.message })
    }
}

// Cập nhật sản phẩm - ENHANCED LOGGING
export const updateProduct = async(req, res) => {
    try {
        console.log("🔄 Updating product:", req.params.id)
        console.log("📥 Received raw data:", JSON.stringify(req.body, null, 2))

        let {
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
            sku,
            tags,
            weight,
            warranty,
            dimensions,
            videos,
        } = req.body

        const product = await Product.findById(req.params.id)
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
        }

        // Ép brand và category về ID nếu là object
        if (typeof brand === "object") brand = brand._id
        if (typeof category === "object") category = category._id

        // Validate required fields
        if (!name || !price || !category || !brand) {
            return res.status(400).json({
                message: "Thiếu thông tin bắt buộc: tên, giá, danh mục, thương hiệu",
            })
        }

        // Validate giá
        if (price <= 0) {
            return res.status(400).json({ message: "Giá phải lớn hơn 0" })
        }

        if (salePrice && salePrice >= price) {
            return res.status(400).json({ message: "Giá khuyến mãi phải nhỏ hơn giá gốc" })
        }

        if (stock < 0) {
            return res.status(400).json({ message: "Số lượng tồn kho không được âm" })
        }

        // Process variants với logging chi tiết hơn
        let processedVariants = []
        if (variants && Array.isArray(variants)) {
            console.log("🔄 Processing variants...")
            console.log("📥 Raw variants received:", JSON.stringify(variants, null, 2))

            try {
                processedVariants = variants.map((variant, index) => {
                    console.log(`\n--- Processing Variant ${index} ---`)
                    console.log(`📝 Variant name: ${variant.name}`)
                    console.log(`🎨 Raw color:`, JSON.stringify(variant.color))
                    console.log(`📋 Raw specifications:`, JSON.stringify(variant.specifications))

                    const processed = processVariantData(variant, index)

                    console.log(`✅ Final processed variant ${index}:`)
                    console.log(`   - Name: ${processed.name}`)
                    console.log(`   - Color:`, JSON.stringify(processed.color))
                    console.log(`   - Specifications:`, JSON.stringify(processed.specifications))

                    return processed
                })

                console.log("\n🎯 All variants processed successfully!")
                console.log("📤 Final processed variants:", JSON.stringify(processedVariants, null, 2))
            } catch (error) {
                console.error("❌ Error processing variants:", error)
                return res.status(400).json({ message: error.message })
            }
        }

        // Process main specifications
        console.log("📋 Processing main specifications:", JSON.stringify(specifications))
        const processedSpecifications = processSpecifications(specifications)
        console.log("✅ Processed main specifications:", JSON.stringify(processedSpecifications))

        // Gán lại dữ liệu
        product.name = name
        product.price = price
        product.salePrice = salePrice
        product.description = description || product.description
        product.images = images || product.images
        product.videos = videos || product.videos
        product.brand = brand
        product.category = category
        product.stock = stock
        product.sku = sku || product.sku
        product.tags = tags || product.tags
        product.weight = weight || product.weight
        product.warranty = warranty || product.warranty
        product.dimensions = dimensions || product.dimensions

        // Cập nhật specifications chính của sản phẩm
        if (processedSpecifications !== undefined) {
            product.specifications = processedSpecifications
            console.log("✅ Updated main product specifications")
        }
        if (features !== undefined) product.features = features

        // Cập nhật variants
        if (processedVariants.length > 0) {
            console.log("🔄 Updating product variants...")
            product.variants = processedVariants
            product.markModified("variants")
            console.log("✅ Product variants updated and marked as modified")
        }

        if (isActive !== undefined) product.isActive = isActive
        if (isFeatured !== undefined) product.isFeatured = isFeatured

        console.log("💾 Saving product to database...")
        const updatedProduct = await product.save()
        console.log("✅ Product saved successfully!")

        // Log final result để debug
        console.log("\n🎯 FINAL RESULT:")
        console.log("📤 Saved product variants:")
        updatedProduct.variants.forEach((v, index) => {
            console.log(`   Variant ${index}:`)
            console.log(`     - Name: ${v.name}`)
            console.log(`     - Color:`, JSON.stringify(v.color))
            console.log(`     - Specifications:`, JSON.stringify(v.specifications))
        })

        res.json(updatedProduct)
    } catch (error) {
        console.error("❌ Error updating product:", error)
        res.status(400).json({ message: error.message || "Cập nhật thất bại." })
    }
}

// Xóa sản phẩm
export const deleteProduct = async(req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id)
        if (!product) return res.status(404).json({ error: "Không tìm thấy sản phẩm" })
        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Hard delete sản phẩm (xóa vĩnh viễn)
export const hardDeleteProduct = async(req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id)
        if (!product) return res.status(404).json({ error: "Không tìm thấy sản phẩm" })
        res.json({ message: "Đã xóa vĩnh viễn sản phẩm thành công" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Thêm đánh giá sản phẩm
export const createProductReview = async(req, res) => {
    try {
        const { rating, comment } = req.body
        const product = await Product.findById(req.params.id)
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" })

        const alreadyReviewed = product.ratings.find((r) => r.user.toString() === req.user._id.toString())
        if (alreadyReviewed) {
            return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này rồi" })
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
        }

        product.ratings.push(review)
        product.numReviews = product.ratings.length
        product.averageRating = product.ratings.reduce((acc, item) => item.rating + acc, 0) / product.ratings.length

        await product.save()
        res.status(201).json({ message: "Đã thêm đánh giá" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// Lấy top sản phẩm đánh giá cao
export const getTopProducts = async(req, res) => {
    try {
        const products = await Product.find({}).sort({ averageRating: -1 }).limit(3)
        res.json(products)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Soft delete sản phẩm
export const softDeleteProduct = async(req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" })

        product.isActive = false
        await product.save()
        res.json({ message: "Đã xóa sản phẩm thành công" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Khôi phục sản phẩm đã xóa
export const restoreProduct = async(req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" })

        product.isActive = true
        await product.save()
        res.json({ message: "Đã khôi phục sản phẩm thành công" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Lấy thống kê sản phẩm
export const getProductStats = async(req, res) => {
    try {
        const totalProducts = await Product.countDocuments()
        const outOfStockProducts = await Product.countDocuments({ stock: 0 })
        const activeProducts = await Product.countDocuments({ isActive: true })
        const newProducts = await Product.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        })

        res.json({
            totalProducts,
            outOfStockProducts,
            activeProducts,
            newProducts,
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Thêm biến thể cho sản phẩm
export const addProductVariant = async(req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" })

        // Xử lý ảnh upload cho biến thể
        let variantImages = [];
        if (req.file) {
            variantImages.push(`/uploads/images/${req.file.filename}`);
        } else if (req.files && Array.isArray(req.files)) {
            variantImages = req.files.map(f => `/uploads/images/${f.filename}`);
        } else if (req.body.images) {
            variantImages = req.body.images;
        }

        const newVariant = processVariantData({
            name: req.body.name,
            sku: req.body.sku,
            price: req.body.price,
            salePrice: req.body.salePrice,
            stock: req.body.stock,
            color: req.body.color,
            size: req.body.size,
            weight: req.body.weight,
            images: variantImages,
            isActive: req.body.isActive !== undefined ? req.body.isActive : true,
            specifications: req.body.specifications || {},
        });

        product.variants.push(newVariant);
        await product.save();

        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// Cập nhật biến thể sản phẩm
export const updateProductVariant = async(req, res) => {
    try {
        const { productId, variantId } = req.params
        const product = await Product.findById(productId)
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" })

        const variant = product.variants.id(variantId)
        if (!variant) return res.status(404).json({ message: "Không tìm thấy biến thể" })

        // Process và cập nhật các trường
        if (req.body.name !== undefined) variant.name = req.body.name
        if (req.body.sku !== undefined) variant.sku = req.body.sku
        if (req.body.price !== undefined) variant.price = req.body.price
        if (req.body.salePrice !== undefined) variant.salePrice = req.body.salePrice
        if (req.body.stock !== undefined) variant.stock = req.body.stock
        if (req.body.color !== undefined) variant.color = processColorData(req.body.color)
        if (req.body.size !== undefined) variant.size = req.body.size
        if (req.body.weight !== undefined) variant.weight = req.body.weight
        if (req.body.images !== undefined) variant.images = req.body.images
        if (req.body.isActive !== undefined) variant.isActive = req.body.isActive
        if (req.body.specifications !== undefined) variant.specifications = processSpecifications(req.body.specifications)

        await product.save()
        res.json(product)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// Xóa biến thể sản phẩm
export const deleteProductVariant = async(req, res) => {
    try {
        const { productId, variantId } = req.params
        const product = await Product.findById(productId)
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" })

        product.variants = product.variants.filter((variant) => variant._id.toString() !== variantId)
        await product.save()

        res.json({ message: "Đã xóa biến thể thành công" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// Lấy thống kê biến thể
export const getVariantStats = async(req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" })

        const totalVariants = product.variants.length
        const activeVariants = product.variants.filter((v) => v.isActive).length
        const totalVariantStock = product.variants.reduce((sum, v) => sum + v.stock, 0)
        const outOfStockVariants = product.variants.filter((v) => v.stock === 0).length

        res.json({
            totalVariants,
            activeVariants,
            totalVariantStock,
            outOfStockVariants,
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Import sản phẩm từ Excel
export const importProductsFromExcel = async(req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng upload file Excel" })
        }

        const workbook = xlsx.readFile(req.file.path)
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const data = xlsx.utils.sheet_to_json(worksheet)

        // Validate cấu trúc file Excel
        const requiredFields = ["name", "price", "category", "brand", "stock"]
        const optionalFields = ["description", "specifications", "features", "tags", "sku", "weight", "warranty", "images"]
        const allFields = [...requiredFields, ...optionalFields]

        const results = {
            total: data.length,
            success: 0,
            failed: 0,
            errors: [],
        }

        // Validate từng dòng dữ liệu
        for (const [index, row] of data.entries()) {
            try {
                // Kiểm tra các trường bắt buộc
                const missingFields = requiredFields.filter((field) => !row[field])
                if (missingFields.length > 0) {
                    throw new Error(`Thiếu các trường bắt buộc: ${missingFields.join(", ")}`)
                }

                // Validate kiểu dữ liệu
                if (isNaN(Number(row.price)) || Number(row.price) < 0) {
                    throw new Error("Giá sản phẩm không hợp lệ")
                }

                if (isNaN(Number(row.stock)) || Number(row.stock) < 0) {
                    throw new Error("Số lượng tồn kho không hợp lệ")
                }

                // Validate category và brand
                const category = await Category.findById(row.category)
                if (!category) {
                    throw new Error("Danh mục không tồn tại")
                }

                const brand = await Brand.findById(row.brand)
                if (!brand) {
                    throw new Error("Thương hiệu không tồn tại")
                }

                // Xử lý specifications với helper function
                const specifications = processSpecifications(row.specifications)

                // Xử lý features
                let features = []
                if (row.features) {
                    features = typeof row.features === "string" ? row.features.split(",").map((f) => f.trim()) : row.features
                }

                // Xử lý tags
                let tags = []
                if (row.tags) {
                    tags = typeof row.tags === "string" ? row.tags.split(",").map((t) => t.trim()) : row.tags
                }

                // Xử lý ảnh
                const images = []
                if (row.images) {
                    const imageUrls = typeof row.images === "string" ? row.images.split(",").map((url) => url.trim()) : row.images

                    // Validate URL ảnh
                    for (const url of imageUrls) {
                        try {
                            new URL(url)
                            images.push(url)
                        } catch (e) {
                            throw new Error(`URL ảnh không hợp lệ: ${url}`)
                        }
                    }
                }

                // Kiểm tra sản phẩm đã tồn tại
                const existingProduct = await Product.findOne({
                    $or: [{ name: row.name }, { sku: row.sku }],
                })

                if (existingProduct) {
                    throw new Error("Sản phẩm đã tồn tại (tên hoặc SKU trùng)")
                }

                // Tạo sản phẩm mới
                const product = new Product({
                    name: row.name,
                    price: Number(row.price),
                    description: row.description || "",
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
                    isActive: true,
                })

                await product.save()
                results.success++
            } catch (error) {
                results.failed++
                    results.errors.push({
                        row: index + 2, // +2 vì Excel bắt đầu từ 1 và có header
                        data: row,
                        error: error.message,
                    })
            }
        }

        // Xóa file sau khi import
        fs.unlinkSync(req.file.path)

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
                    images: "url1, url2",
                },
            },
        })
    } catch (error) {
        // Xóa file nếu có lỗi
        if (req.file) {
            fs.unlinkSync(req.file.path)
        }
        res.status(500).json({
            message: "Lỗi khi import sản phẩm",
            error: error.message,
        })
    }
}

// Lấy danh sách sản phẩm đã xóa mềm
export const getDeletedProducts = async(req, res) => {
    try {
        const products = await Product.find({ isActive: false }).populate("category", "name").populate("brand", "name")
        res.json(products)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Đếm số lượng sản phẩm đã xóa mềm
export const getDeletedProductsCount = async(req, res) => {
    try {
        const count = await Product.countDocuments({ isActive: false })
        res.json({ count })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const suggestProducts = async(req, res) => {
    try {
        const { query } = req.query
        if (!query || query.length < 1) {
            return res.json({ suggestions: [] })
        }
        // Tìm tên sản phẩm chứa từ khóa, không phân biệt hoa thường
        const suggestions = await Product.find({
                name: { $regex: query, $options: "i" },
            })
            .limit(10)
            .select("name")
        res.json({ suggestions: suggestions.map((p) => p.name) })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Thêm video cho sản phẩm
export const addProductVideo = async(req, res) => {
    try {
        const { id } = req.params
        const { videoUrl } = req.body
        if (!videoUrl) return res.status(400).json({ message: "Thiếu link video" })
        const product = await Product.findById(id)
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
        product.videos.push(videoUrl)
        await product.save()
        res.status(200).json({ message: "Đã thêm video", videos: product.videos })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Xóa video khỏi sản phẩm
export const deleteProductVideo = async(req, res) => {
    try {
        const { id, videoIndex } = req.params
        const product = await Product.findById(id)
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
        if (videoIndex < 0 || videoIndex >= product.videos.length)
            return res.status(400).json({ message: "Index video không hợp lệ" })
        product.videos.splice(videoIndex, 1)
        await product.save()
        res.status(200).json({ message: "Đã xóa video", videos: product.videos })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Cập nhật video cho sản phẩm (theo index)
export const updateProductVideo = async(req, res) => {
    try {
        const { id, videoIndex } = req.params
        const { videoUrl } = req.body
        const product = await Product.findById(id)
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
        if (videoIndex < 0 || videoIndex >= product.videos.length)
            return res.status(400).json({ message: "Index video không hợp lệ" })
        product.videos[videoIndex] = videoUrl
        await product.save()
        res.status(200).json({ message: "Đã cập nhật video", videos: product.videos })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Cập nhật meta SEO cho sản phẩm
export const updateProductMeta = async(req, res) => {
    try {
        const { id } = req.params
        const { metaTitle, metaDescription, metaImage } = req.body
        const product = await Product.findById(id)
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
        product.meta = {
            metaTitle: typeof metaTitle !== "undefined" ?
                metaTitle : product.meta && product.meta.metaTitle ?
                product.meta.metaTitle : "",
            metaDescription: typeof metaDescription !== "undefined" ?
                metaDescription : product.meta && product.meta.metaDescription ?
                product.meta.metaDescription : "",
            metaImage: typeof metaImage !== "undefined" ?
                metaImage : product.meta && product.meta.metaImage ?
                product.meta.metaImage : "",
        }
        await product.save()
        res.status(200).json({ message: "Đã cập nhật meta SEO", meta: product.meta })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Thêm câu hỏi cho sản phẩm
export const addProductQuestion = async(req, res) => {
    try {
        const { id } = req.params
        const { question } = req.body

        // Validate input
        if (!question || question.trim().length < 5) {
            return res.status(400).json({
                message: "Câu hỏi phải có ít nhất 5 ký tự",
            })
        }

        if (question.trim().length > 500) {
            return res.status(400).json({
                message: "Câu hỏi không được vượt quá 500 ký tự",
            })
        }

        // Tìm sản phẩm
        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
        }

        // Kiểm tra sản phẩm có đang hoạt động không
        if (!product.isActive) {
            return res.status(400).json({ message: "Sản phẩm không còn hoạt động" })
        }

        // Tạo câu hỏi mới
        const newQuestion = {
            user: req.user._id,
            question: question.trim(),
            createdAt: new Date(),
        }

        // Thêm câu hỏi vào sản phẩm
        product.questions.push(newQuestion)
        await product.save()

        // Populate thông tin user cho câu hỏi vừa thêm
        const populatedProduct = await Product.findById(id).populate("questions.user", "name email avatar")

        const addedQuestion = populatedProduct.questions[populatedProduct.questions.length - 1]

        res.status(201).json({
            message: "Đã đặt câu hỏi thành công",
            question: addedQuestion,
        })
    } catch (error) {
        console.error("Error adding product question:", error)
        res.status(500).json({ message: error.message })
    }
}

// Lấy danh sách câu hỏi của sản phẩm
export const getProductQuestions = async(req, res) => {
    try {
        const { id } = req.params
        const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = req.query

        // Tìm sản phẩm
        const product = await Product.findById(id)
            .populate("questions.user", "name email avatar")
            .select("questions isActive")

        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
        }

        // Kiểm tra sản phẩm có đang hoạt động không
        if (!product.isActive) {
            return res.status(400).json({ message: "Sản phẩm không còn hoạt động" })
        }

        // Sắp xếp câu hỏi
        const sortedQuestions = [...product.questions]
        sortedQuestions.sort((a, b) => {
            if (order === "desc") {
                return new Date(b[sort]) - new Date(a[sort])
            } else {
                return new Date(a[sort]) - new Date(b[sort])
            }
        })

        // Phân trang
        const startIndex = (page - 1) * limit
        const endIndex = page * limit
        const paginatedQuestions = sortedQuestions.slice(startIndex, endIndex)

        // Thống kê
        const stats = {
            total: product.questions.length,
            answered: product.questions.filter((q) => q.answer).length,
            unanswered: product.questions.filter((q) => !q.answer).length,
        }

        res.json({
            questions: paginatedQuestions,
            pagination: {
                page: Number.parseInt(page),
                limit: Number.parseInt(limit),
                total: product.questions.length,
                pages: Math.ceil(product.questions.length / limit),
            },
            stats,
        })
    } catch (error) {
        console.error("Error getting product questions:", error)
        res.status(500).json({ message: error.message })
    }
}

// Trả lời câu hỏi (chỉ admin và superadmin)
export const answerProductQuestion = async(req, res) => {
    try {
        const { id, questionId } = req.params
        const { answer } = req.body

        // Validate input
        if (!answer || answer.trim().length < 5) {
            return res.status(400).json({
                message: "Câu trả lời phải có ít nhất 5 ký tự",
            })
        }

        if (answer.trim().length > 1000) {
            return res.status(400).json({
                message: "Câu trả lời không được vượt quá 1000 ký tự",
            })
        }

        // Kiểm tra quyền admin hoặc superadmin
        if (req.user.role !== "admin" && req.user.role !== "superadmin") {
            return res.status(403).json({
                message: "Chỉ admin mới có quyền trả lời câu hỏi",
            })
        }

        // Tìm sản phẩm
        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
        }

        // Tìm câu hỏi
        const questionIndex = product.questions.findIndex((q) => q._id.toString() === questionId)
        if (questionIndex === -1) {
            return res.status(404).json({ message: "Không tìm thấy câu hỏi" })
        }

        // Kiểm tra câu hỏi đã được trả lời chưa
        if (product.questions[questionIndex].answer) {
            return res.status(400).json({ message: "Câu hỏi này đã được trả lời" })
        }

        // Cập nhật câu trả lời
        product.questions[questionIndex].answer = answer.trim()
        product.questions[questionIndex].answeredAt = new Date()

        await product.save()

        // Populate thông tin user cho câu hỏi đã trả lời
        const populatedProduct = await Product.findById(id).populate("questions.user", "name email avatar")

        const answeredQuestion = populatedProduct.questions[questionIndex]

        res.json({
            message: "Đã trả lời câu hỏi thành công",
            question: answeredQuestion,
        })
    } catch (error) {
        console.error("Error answering product question:", error)
        res.status(500).json({ message: error.message })
    }
}

// Xóa câu hỏi
export const deleteProductQuestion = async(req, res) => {
    try {
        const { id, questionId } = req.params

        // Tìm sản phẩm
        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
        }

        // Tìm câu hỏi
        const questionIndex = product.questions.findIndex((q) => q._id.toString() === questionId)
        if (questionIndex === -1) {
            return res.status(404).json({ message: "Không tìm thấy câu hỏi" })
        }

        const question = product.questions[questionIndex]

        // Kiểm tra quyền xóa
        // Admin và superadmin có thể xóa mọi câu hỏi
        // User chỉ có thể xóa câu hỏi của chính mình
        if (
            req.user.role !== "admin" &&
            req.user.role !== "superadmin" &&
            question.user.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "Bạn không có quyền xóa câu hỏi này",
            })
        }

        // Xóa câu hỏi
        product.questions.splice(questionIndex, 1)
        await product.save()

        res.json({
            message: "Đã xóa câu hỏi thành công",
        })
    } catch (error) {
        console.error("Error deleting product question:", error)
        res.status(500).json({ message: error.message })
    }
}

// Thêm sản phẩm liên quan
export const addRelatedProduct = async(req, res) => {
    try {
        const { id } = req.params
        const { relatedProductId } = req.body

        // Validate input
        if (!relatedProductId) {
            return res.status(400).json({
                message: "ID sản phẩm liên quan là bắt buộc",
            })
        }

        // Kiểm tra quyền admin hoặc superadmin
        if (req.user.role !== "admin" && req.user.role !== "superadmin") {
            return res.status(403).json({
                message: "Chỉ admin mới có quyền quản lý sản phẩm liên quan",
            })
        }

        // Tìm sản phẩm chính
        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
        }

        // Tìm sản phẩm liên quan
        const relatedProduct = await Product.findById(relatedProductId)
        if (!relatedProduct) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm liên quan" })
        }

        // Kiểm tra không phải chính nó
        if (id === relatedProductId) {
            return res.status(400).json({
                message: "Không thể thêm chính sản phẩm này làm sản phẩm liên quan",
            })
        }

        // Kiểm tra đã tồn tại chưa
        if (product.relatedProducts.includes(relatedProductId)) {
            return res.status(400).json({
                message: "Sản phẩm này đã được thêm vào danh sách liên quan",
            })
        }

        // Thêm sản phẩm liên quan
        product.relatedProducts.push(relatedProductId)
        await product.save()

        // Populate thông tin sản phẩm liên quan
        const populatedProduct = await Product.findById(id).populate(
            "relatedProducts",
            "name price images averageRating numReviews",
        )

        res.json({
            message: "Đã thêm sản phẩm liên quan thành công",
            relatedProducts: populatedProduct.relatedProducts,
        })
    } catch (error) {
        console.error("Error adding related product:", error)
        res.status(500).json({ message: error.message })
    }
}

// Xóa sản phẩm liên quan
export const removeRelatedProduct = async(req, res) => {
    try {
        const { id, relatedProductId } = req.params

        // Kiểm tra quyền admin hoặc superadmin
        if (req.user.role !== "admin" && req.user.role !== "superadmin") {
            return res.status(403).json({
                message: "Chỉ admin mới có quyền quản lý sản phẩm liên quan",
            })
        }

        // Tìm sản phẩm chính
        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
        }

        // Kiểm tra sản phẩm liên quan có tồn tại không
        const relatedIndex = product.relatedProducts.indexOf(relatedProductId)
        if (relatedIndex === -1) {
            return res.status(404).json({
                message: "Không tìm thấy sản phẩm liên quan trong danh sách",
            })
        }

        // Xóa sản phẩm liên quan
        product.relatedProducts.splice(relatedIndex, 1)
        await product.save()

        res.json({
            message: "Đã xóa sản phẩm liên quan thành công",
        })
    } catch (error) {
        console.error("Error removing related product:", error)
        res.status(500).json({ message: error.message })
    }
}

// Lấy danh sách sản phẩm liên quan
export const getRelatedProducts = async(req, res) => {
    try {
        const { id } = req.params
        const { limit = 10 } = req.query

        // Tìm sản phẩm
        const product = await Product.findById(id).populate(
            "relatedProducts",
            "name price images averageRating numReviews stock isActive",
        )

        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
        }

        // Lọc chỉ sản phẩm đang hoạt động
        const activeRelatedProducts = product.relatedProducts.filter((p) => p.isActive)

        // Giới hạn số lượng
        const limitedProducts = activeRelatedProducts.slice(0, Number.parseInt(limit))

        res.json({
            relatedProducts: limitedProducts,
            total: activeRelatedProducts.length,
        })
    } catch (error) {
        console.error("Error getting related products:", error)
        res.status(500).json({ message: error.message })
    }
}

// Tạo flash sale cho sản phẩm
export const createFlashSale = async(req, res) => {
    try {
        const { id } = req.params
        const { price, start, end } = req.body

        // Validate input
        if (!price || !start || !end) {
            return res.status(400).json({
                message: "Giá, thời gian bắt đầu và kết thúc là bắt buộc",
            })
        }

        if (price <= 0) {
            return res.status(400).json({
                message: "Giá flash sale phải lớn hơn 0",
            })
        }

        const startDate = new Date(start)
        const endDate = new Date(end)
        const now = new Date()

        if (startDate <= now) {
            return res.status(400).json({
                message: "Thời gian bắt đầu phải trong tương lai",
            })
        }

        if (endDate <= startDate) {
            return res.status(400).json({
                message: "Thời gian kết thúc phải sau thời gian bắt đầu",
            })
        }

        // Kiểm tra quyền admin hoặc superadmin
        if (req.user.role !== "admin" && req.user.role !== "superadmin") {
            return res.status(403).json({
                message: "Chỉ admin mới có quyền tạo flash sale",
            })
        }

        // Tìm sản phẩm
        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
        }

        // Kiểm tra giá flash sale phải nhỏ hơn giá gốc
        if (price >= product.price) {
            return res.status(400).json({
                message: "Giá flash sale phải nhỏ hơn giá gốc",
            })
        }

        // Kiểm tra đã có flash sale chưa
        if (product.flashSale && product.flashSale.end > now) {
            return res.status(400).json({
                message: "Sản phẩm đã có flash sale đang hoạt động",
            })
        }

        // Tạo flash sale
        product.flashSale = {
            price: price,
            start: startDate,
            end: endDate,
        }

        await product.save()

        res.json({
            message: "Đã tạo flash sale thành công",
            flashSale: product.flashSale,
        })
    } catch (error) {
        console.error("Error creating flash sale:", error)
        res.status(500).json({ message: error.message })
    }
}

// Cập nhật flash sale
export const updateFlashSale = async(req, res) => {
    try {
        const { id } = req.params
        const { price, start, end } = req.body

        // Validate input
        if (!price || !start || !end) {
            return res.status(400).json({
                message: "Giá, thời gian bắt đầu và kết thúc là bắt buộc",
            })
        }

        if (price <= 0) {
            return res.status(400).json({
                message: "Giá flash sale phải lớn hơn 0",
            })
        }

        const startDate = new Date(start)
        const endDate = new Date(end)

        if (endDate <= startDate) {
            return res.status(400).json({
                message: "Thời gian kết thúc phải sau thời gian bắt đầu",
            })
        }

        // Kiểm tra quyền admin hoặc superadmin
        if (req.user.role !== "admin" && req.user.role !== "superadmin") {
            return res.status(403).json({
                message: "Chỉ admin mới có quyền cập nhật flash sale",
            })
        }

        // Tìm sản phẩm
        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
        }

        // Kiểm tra có flash sale không
        if (!product.flashSale) {
            return res.status(404).json({
                message: "Sản phẩm chưa có flash sale",
            })
        }

        // Kiểm tra giá flash sale phải nhỏ hơn giá gốc
        if (price >= product.price) {
            return res.status(400).json({
                message: "Giá flash sale phải nhỏ hơn giá gốc",
            })
        }

        // Cập nhật flash sale
        product.flashSale = {
            price: price,
            start: startDate,
            end: endDate,
        }

        await product.save()

        res.json({
            message: "Đã cập nhật flash sale thành công",
            flashSale: product.flashSale,
        })
    } catch (error) {
        console.error("Error updating flash sale:", error)
        res.status(500).json({ message: error.message })
    }
}

// Xóa flash sale
export const deleteFlashSale = async(req, res) => {
    try {
        const { id } = req.params

        // Kiểm tra quyền admin hoặc superadmin
        if (req.user.role !== "admin" && req.user.role !== "superadmin") {
            return res.status(403).json({
                message: "Chỉ admin mới có quyền xóa flash sale",
            })
        }

        // Tìm sản phẩm
        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
        }

        // Kiểm tra có flash sale không
        if (!product.flashSale) {
            return res.status(404).json({
                message: "Sản phẩm chưa có flash sale",
            })
        }

        // Xóa flash sale
        product.flashSale = undefined
        await product.save()

        res.json({
            message: "Đã xóa flash sale thành công",
        })
    } catch (error) {
        console.error("Error deleting flash sale:", error)
        res.status(500).json({ message: error.message })
    }
}

// Lấy thông tin flash sale
export const getFlashSale = async(req, res) => {
    try {
        const { id } = req.params

        // Tìm sản phẩm
        const product = await Product.findById(id).select("flashSale price")
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
        }

        if (!product.flashSale) {
            return res.json({ flashSale: null })
        }

        const now = new Date()
        const isActive = now >= product.flashSale.start && now <= product.flashSale.end

        res.json({
            flashSale: {
                ...product.flashSale.toObject(),
                isActive,
                originalPrice: product.price,
                discount: Math.round(((product.price - product.flashSale.price) / product.price) * 100),
            },
        })
    } catch (error) {
        console.error("Error getting flash sale:", error)
        res.status(500).json({ message: error.message })
    }
}

// Thêm khuyến mãi cho sản phẩm
export const addProductDiscount = async(req, res) => {
    try {
        const { id } = req.params
        const { type, value, description, start, end } = req.body

        // Validate input
        if (!type || !value || !start || !end) {
            return res.status(400).json({
                message: "Loại, giá trị, thời gian bắt đầu và kết thúc là bắt buộc",
            })
        }

        if (!["percentage", "fixed", "voucher"].includes(type)) {
            return res.status(400).json({
                message: "Loại khuyến mãi phải là: percentage, fixed, hoặc voucher",
            })
        }

        if (value <= 0) {
            return res.status(400).json({
                message: "Giá trị khuyến mãi phải lớn hơn 0",
            })
        }

        if (type === "percentage" && value > 100) {
            return res.status(400).json({
                message: "Phần trăm khuyến mãi không được vượt quá 100%",
            })
        }

        const startDate = new Date(start)
        const endDate = new Date(end)
        const now = new Date()

        if (startDate <= now) {
            return res.status(400).json({
                message: "Thời gian bắt đầu phải trong tương lai",
            })
        }

        if (endDate <= startDate) {
            return res.status(400).json({
                message: "Thời gian kết thúc phải sau thời gian bắt đầu",
            })
        }

        // Kiểm tra quyền admin hoặc superadmin
        if (req.user.role !== "admin" && req.user.role !== "superadmin") {
            return res.status(403).json({
                message: "Chỉ admin mới có quyền thêm khuyến mãi",
            })
        }

        // Tìm sản phẩm
        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
        }

        // Kiểm tra giá trị khuyến mãi
        if (type === "fixed" && value >= product.price) {
            return res.status(400).json({
                message: "Giá trị khuyến mãi cố định phải nhỏ hơn giá sản phẩm",
            })
        }

        // Tạo khuyến mãi mới
        const newDiscount = {
            type,
            value,
            description: description || "",
            start: startDate,
            end: endDate,
        }

        // Thêm khuyến mãi vào sản phẩm
        product.discounts.push(newDiscount)
        await product.save()

        res.json({
            message: "Đã thêm khuyến mãi thành công",
            discount: newDiscount,
        })
    } catch (error) {
        console.error("Error adding product discount:", error)
        res.status(500).json({ message: error.message })
    }
}

// Cập nhật khuyến mãi
export const updateProductDiscount = async(req, res) => {
    try {
        const { id, discountId } = req.params
        const { type, value, description, start, end } = req.body

        // Validate input
        if (!type || !value || !start || !end) {
            return res.status(400).json({
                message: "Loại, giá trị, thời gian bắt đầu và kết thúc là bắt buộc",
            })
        }

        if (!["percentage", "fixed", "voucher"].includes(type)) {
            return res.status(400).json({
                message: "Loại khuyến mãi phải là: percentage, fixed, hoặc voucher",
            })
        }

        if (value <= 0) {
            return res.status(400).json({
                message: "Giá trị khuyến mãi phải lớn hơn 0",
            })
        }

        if (type === "percentage" && value > 100) {
            return res.status(400).json({
                message: "Phần trăm khuyến mãi không được vượt quá 100%",
            })
        }

        const startDate = new Date(start)
        const endDate = new Date(end)

        if (endDate <= startDate) {
            return res.status(400).json({
                message: "Thời gian kết thúc phải sau thời gian bắt đầu",
            })
        }

        // Kiểm tra quyền admin hoặc superadmin
        if (req.user.role !== "admin" && req.user.role !== "superadmin") {
            return res.status(403).json({
                message: "Chỉ admin mới có quyền cập nhật khuyến mãi",
            })
        }

        // Tìm sản phẩm
        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
        }

        // Tìm khuyến mãi
        const discountIndex = product.discounts.findIndex((d) => d._id.toString() === discountId)
        if (discountIndex === -1) {
            return res.status(404).json({ message: "Không tìm thấy khuyến mãi" })
        }

        // Kiểm tra giá trị khuyến mãi
        if (type === "fixed" && value >= product.price) {
            return res.status(400).json({
                message: "Giá trị khuyến mãi cố định phải nhỏ hơn giá sản phẩm",
            })
        }

        // Cập nhật khuyến mãi
        product.discounts[discountIndex] = {
            ...product.discounts[discountIndex].toObject(),
            type,
            value,
            description: description || "",
            start: startDate,
            end: endDate,
        }

        await product.save()

        res.json({
            message: "Đã cập nhật khuyến mãi thành công",
            discount: product.discounts[discountIndex],
        })
    } catch (error) {
        console.error("Error updating product discount:", error)
        res.status(500).json({ message: error.message })
    }
}

// Xóa khuyến mãi
export const deleteProductDiscount = async(req, res) => {
    try {
        const { id, discountId } = req.params

        // Kiểm tra quyền admin hoặc superadmin
        if (req.user.role !== "admin" && req.user.role !== "superadmin") {
            return res.status(403).json({
                message: "Chỉ admin mới có quyền xóa khuyến mãi",
            })
        }

        // Tìm sản phẩm
        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
        }

        // Tìm khuyến mãi
        const discountIndex = product.discounts.findIndex((d) => d._id.toString() === discountId)
        if (discountIndex === -1) {
            return res.status(404).json({ message: "Không tìm thấy khuyến mãi" })
        }

        // Xóa khuyến mãi
        product.discounts.splice(discountIndex, 1)
        await product.save()

        res.json({
            message: "Đã xóa khuyến mãi thành công",
        })
    } catch (error) {
        console.error("Error deleting product discount:", error)
        res.status(500).json({ message: error.message })
    }
}

// Lấy danh sách khuyến mãi
export const getProductDiscounts = async(req, res) => {
    try {
        const { id } = req.params

        // Tìm sản phẩm
        const product = await Product.findById(id).select("discounts price")
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
        }

        const now = new Date()

        // Lọc khuyến mãi đang hoạt động
        const activeDiscounts = product.discounts.filter((d) => now >= d.start && now <= d.end)

        // Tính toán giá sau khuyến mãi
        const discountsWithCalculatedPrice = activeDiscounts.map((discount) => {
            let finalPrice = product.price

            if (discount.type === "percentage") {
                finalPrice = product.price * (1 - discount.value / 100)
            } else if (discount.type === "fixed") {
                finalPrice = product.price - discount.value
            }
            // Voucher type doesn't change product price directly

            return {
                ...discount.toObject(),
                originalPrice: product.price,
                finalPrice: Math.max(0, finalPrice),
                savings: product.price - Math.max(0, finalPrice),
            }
        })

        res.json({
            discounts: discountsWithCalculatedPrice,
            total: product.discounts.length,
            active: activeDiscounts.length,
        })
    } catch (error) {
        console.error("Error getting product discounts:", error)
        res.status(500).json({ message: error.message })
    }
}

// Thêm sản phẩm vào danh sách yêu thích
export const addToFavorites = async(req, res) => {
    try {
        const { id } = req.params

        // Tìm sản phẩm
        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
        }

        // Kiểm tra sản phẩm có đang hoạt động không
        if (!product.isActive) {
            return res.status(400).json({ message: "Sản phẩm không còn hoạt động" })
        }

        // Tìm user và kiểm tra đã yêu thích chưa
        const user = await User.findById(req.user._id)
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" })
        }

        if (user.favorites.includes(id)) {
            return res.status(400).json({ message: "Sản phẩm đã có trong danh sách yêu thích" })
        }

        // Thêm vào danh sách yêu thích
        user.favorites.push(id)
        await user.save()

        res.json({
            message: "Đã thêm sản phẩm vào danh sách yêu thích",
            favoritesCount: user.favorites.length,
        })
    } catch (error) {
        console.error("Error adding to favorites:", error)
        res.status(500).json({ message: error.message })
    }
}

// Xóa sản phẩm khỏi danh sách yêu thích
export const removeFromFavorites = async(req, res) => {
    try {
        const { id } = req.params

        // Tìm user
        const user = await User.findById(req.user._id)
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" })
        }

        // Kiểm tra sản phẩm có trong danh sách yêu thích không
        const favoriteIndex = user.favorites.indexOf(id)
        if (favoriteIndex === -1) {
            return res.status(404).json({ message: "Sản phẩm không có trong danh sách yêu thích" })
        }

        // Xóa khỏi danh sách yêu thích
        user.favorites.splice(favoriteIndex, 1)
        await user.save()

        res.json({
            message: "Đã xóa sản phẩm khỏi danh sách yêu thích",
            favoritesCount: user.favorites.length,
        })
    } catch (error) {
        console.error("Error removing from favorites:", error)
        res.status(500).json({ message: error.message })
    }
}

// Lấy danh sách sản phẩm yêu thích
export const getFavorites = async(req, res) => {
    try {
        const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = req.query

        // Tìm user với populate favorites
        const user = await User.findById(req.user._id).populate({
            path: "favorites",
            select: "name price images averageRating numReviews stock isActive category brand",
            populate: [
                { path: "category", select: "name" },
                { path: "brand", select: "name" },
            ],
        })

        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" })
        }

        // Lọc chỉ sản phẩm đang hoạt động
        const activeFavorites = user.favorites.filter((p) => p.isActive)

        // Sắp xếp
        activeFavorites.sort((a, b) => {
            if (order === "desc") {
                return new Date(b[sort]) - new Date(a[sort])
            } else {
                return new Date(a[sort]) - new Date(b[sort])
            }
        })

        // Phân trang
        const startIndex = (page - 1) * limit
        const endIndex = page * limit
        const paginatedFavorites = activeFavorites.slice(startIndex, endIndex)

        res.json({
            favorites: paginatedFavorites,
            pagination: {
                page: Number.parseInt(page),
                limit: Number.parseInt(limit),
                total: activeFavorites.length,
                pages: Math.ceil(activeFavorites.length / limit),
            },
            totalFavorites: user.favorites.length,
            activeFavorites: activeFavorites.length,
        })
    } catch (error) {
        console.error("Error getting favorites:", error)
        res.status(500).json({ message: error.message })
    }
}

// Kiểm tra sản phẩm có trong danh sách yêu thích không
export const checkFavorite = async(req, res) => {
    try {
        const { id } = req.params

        // Tìm user
        const user = await User.findById(req.user._id)
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" })
        }

        const isFavorite = user.favorites.includes(id)

        res.json({
            isFavorite,
            favoritesCount: user.favorites.length,
        })
    } catch (error) {
        console.error("Error checking favorite:", error)
        res.status(500).json({ message: error.message })
    }
}

// Lấy số lượng sản phẩm yêu thích
export const getFavoritesCount = async(req, res) => {
    try {
        // Tìm user
        const user = await User.findById(req.user._id)
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" })
        }

        res.json({
            favoritesCount: user.favorites.length,
        })
    } catch (error) {
        console.error("Error getting favorites count:", error)
        res.status(500).json({ message: error.message })
    }
}

// Kiểm tra SKU trùng lặp
export const checkSkuExists = async(req, res) => {
    try {
        console.log("🔍 checkSkuExists called with query:", req.query);
        const { sku, productId } = req.query;

        if (!sku) {
            console.log("❌ No SKU provided");
            return res.status(400).json({ message: "SKU là bắt buộc" });
        }

        console.log(`🔍 Checking SKU: "${sku}"`);

        // Kiểm tra SKU trong tất cả sản phẩm
        console.log("🔍 Checking in products...");
        const existingProduct = await Product.findOne({ sku: sku });
        console.log("📋 Existing product result:", existingProduct ? existingProduct.name : "None");

        // Kiểm tra SKU trong variants của tất cả sản phẩm
        console.log("🔍 Checking in variants...");
        const existingVariant = await Product.findOne({
            "variants.sku": sku
        });
        console.log("📋 Existing variant result:", existingVariant ? existingVariant.name : "None");

        let exists = false;
        let message = "";
        let location = "";

        if (existingProduct) {
            exists = true;
            message = `SKU "${sku}" đã tồn tại trong sản phẩm "${existingProduct.name}"`;
            location = "product";
            console.log(`✅ Found in product: ${message}`);
        } else if (existingVariant) {
            const variant = existingVariant.variants.find(v => v.sku === sku);
            exists = true;
            message = `SKU "${sku}" đã tồn tại trong biến thể "${variant.name}" của sản phẩm "${existingVariant.name}"`;
            location = "variant";
            console.log(`✅ Found in variant: ${message}`);
        } else {
            console.log(`✅ SKU "${sku}" is available`);
        }

        const response = {
            exists,
            message,
            location,
            sku
        };

        console.log("📤 Sending response:", response);
        res.json(response);
    } catch (error) {
        console.error("❌ Error checking SKU:", error);
        console.error("❌ Error stack:", error.stack);
        res.status(500).json({
            message: "Lỗi khi kiểm tra SKU",
            error: error.message,
            stack: error.stack
        });
    }
}

// Gợi ý sản phẩm dựa trên sản phẩm hiện tại (collaborative filtering)
export const getProductRecommendations = async(req, res) => {
    try {
        const { id } = req.params
        const { limit = 10 } = req.query

        // Tìm sản phẩm hiện tại
        const currentProduct = await Product.findById(id).populate("category", "name").populate("brand", "name")

        if (!currentProduct) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
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
                            $lte: currentProduct.price * 1.3,
                        },
                    },
                    { averageRating: { $gte: currentProduct.averageRating - 0.5 } },
                ],
            })
            .populate("category", "name")
            .populate("brand", "name")
            .limit(Number.parseInt(limit) * 2) // Lấy nhiều hơn để lọc

        // Tính điểm tương đồng và sắp xếp
        const scoredProducts = similarProducts.map((product) => {
            let score = 0

            // Cùng danh mục: +3 điểm
            if (product.category._id.toString() === currentProduct.category._id.toString()) {
                score += 3
            }

            // Cùng thương hiệu: +2 điểm
            if (product.brand._id.toString() === currentProduct.brand._id.toString()) {
                score += 2
            }

            // Cùng khoảng giá: +1 điểm
            const priceDiff = Math.abs(product.price - currentProduct.price) / currentProduct.price
            if (priceDiff <= 0.3) {
                score += 1
            }

            // Rating tương tự: +1 điểm
            const ratingDiff = Math.abs(product.averageRating - currentProduct.averageRating)
            if (ratingDiff <= 0.5) {
                score += 1
            }

            return { product, score }
        })

        // Sắp xếp theo điểm và lấy top
        scoredProducts.sort((a, b) => b.score - a.score)
        const topRecommendations = scoredProducts.slice(0, Number.parseInt(limit)).map((item) => item.product)

        res.json({
            recommendations: topRecommendations,
            total: topRecommendations.length,
            basedOn: {
                category: currentProduct.category.name,
                brand: currentProduct.brand.name,
                price: currentProduct.price,
                rating: currentProduct.averageRating,
            },
        })
    } catch (error) {
        console.error("Error getting product recommendations:", error)
        res.status(500).json({ message: error.message })
    }
}

// Gợi ý sản phẩm dựa trên lịch sử mua hàng của user
export const getUserRecommendations = async(req, res) => {
    try {
        const { limit = 10 } = req.query

        // Tìm user
        const user = await User.findById(req.user._id)
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" })
        }

        // Tìm lịch sử đơn hàng của user
        const userOrders = await Order.find({
            user: req.user._id,
            status: { $in: ["delivered", "completed"] },
        }).populate("orderItems.product", "category brand price averageRating")

        if (userOrders.length === 0) {
            // Nếu chưa có đơn hàng, trả về sản phẩm phổ biến
            const popularProducts = await Product.find({
                    isActive: true,
                    averageRating: { $gte: 4 },
                })
                .populate("category", "name")
                .populate("brand", "name")
                .sort({ averageRating: -1, numReviews: -1 })
                .limit(Number.parseInt(limit))

            return res.json({
                recommendations: popularProducts,
                total: popularProducts.length,
                type: "popular_products",
            })
        }

        // Phân tích hành vi mua hàng
        const purchaseHistory = {}
        const categoryPreferences = {}
        const brandPreferences = {}

        userOrders.forEach((order) => {
            order.orderItems.forEach((item) => {
                const product = item.product

                // Thống kê sản phẩm đã mua
                purchaseHistory[product._id] = (purchaseHistory[product._id] || 0) + item.quantity

                // Thống kê danh mục ưa thích
                const categoryId = product.category._id.toString()
                categoryPreferences[categoryId] = (categoryPreferences[categoryId] || 0) + item.quantity

                // Thống kê thương hiệu ưa thích
                const brandId = product.brand._id.toString()
                brandPreferences[brandId] = (brandPreferences[brandId] || 0) + item.quantity
            })
        })

        // Tìm danh mục và thương hiệu ưa thích nhất
        const topCategories = Object.entries(categoryPreferences)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([id]) => id)

        const topBrands = Object.entries(brandPreferences)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([id]) => id)

        // Tìm sản phẩm gợi ý dựa trên sở thích
        const recommendedProducts = await Product.find({
                _id: { $nin: Object.keys(purchaseHistory) }, // Chưa mua
                isActive: true,
                $or: [{ category: { $in: topCategories } }, { brand: { $in: topBrands } }],
            })
            .populate("category", "name")
            .populate("brand", "name")
            .sort({ averageRating: -1 })
            .limit(Number.parseInt(limit))

        res.json({
            recommendations: recommendedProducts,
            total: recommendedProducts.length,
            type: "personalized",
            preferences: {
                topCategories: topCategories,
                topBrands: topBrands,
                purchaseHistory: Object.keys(purchaseHistory).length,
            },
        })
    } catch (error) {
        console.error("Error getting user recommendations:", error)
        res.status(500).json({ message: error.message })
    }
}

// Gợi ý sản phẩm dựa trên sản phẩm yêu thích
export const getFavoritesRecommendations = async(req, res) => {
    try {
        const { limit = 10 } = req.query

        // Tìm user với favorites
        const user = await User.findById(req.user._id).populate({
            path: "favorites",
            populate: [
                { path: "category", select: "name" },
                { path: "brand", select: "name" },
            ],
        })

        if (!user || user.favorites.length === 0) {
            return res.status(400).json({
                message: "Bạn chưa có sản phẩm yêu thích nào",
            })
        }

        // Phân tích sản phẩm yêu thích
        const favoriteCategories = {}
        const favoriteBrands = {}
        const favoritePriceRange = {
            min: Math.min(...user.favorites.map((p) => p.price)),
            max: Math.max(...user.favorites.map((p) => p.price)),
        }

        user.favorites.forEach((product) => {
            const categoryId = product.category._id.toString()
            favoriteCategories[categoryId] = (favoriteCategories[categoryId] || 0) + 1

            const brandId = product.brand._id.toString()
            favoriteBrands[brandId] = (favoriteBrands[brandId] || 0) + 1
        })

        // Tìm danh mục và thương hiệu yêu thích nhất
        const topFavoriteCategories = Object.entries(favoriteCategories)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([id]) => id)

        const topFavoriteBrands = Object.entries(favoriteBrands)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([id]) => id)

        // Tìm sản phẩm gợi ý
        const recommendedProducts = await Product.find({
                _id: { $nin: user.favorites.map((p) => p._id) }, // Không phải sản phẩm đã yêu thích
                isActive: true,
                $or: [
                    { category: { $in: topFavoriteCategories } },
                    { brand: { $in: topFavoriteBrands } },
                    {
                        price: {
                            $gte: favoritePriceRange.min * 0.8,
                            $lte: favoritePriceRange.max * 1.2,
                        },
                    },
                ],
            })
            .populate("category", "name")
            .populate("brand", "name")
            .sort({ averageRating: -1 })
            .limit(Number.parseInt(limit))

        res.json({
            recommendations: recommendedProducts,
            total: recommendedProducts.length,
            type: "favorites_based",
            preferences: {
                topCategories: topFavoriteCategories,
                topBrands: topFavoriteBrands,
                priceRange: favoritePriceRange,
                favoritesCount: user.favorites.length,
            },
        })
    } catch (error) {
        console.error("Error getting favorites recommendations:", error)
        res.status(500).json({ message: error.message })
    }
}

// Lấy thông tin điểm thưởng của user
export const getRewardPoints = async(req, res) => {
    try {
        // Tìm user với populate lịch sử điểm thưởng
        const user = await User.findById(req.user._id).populate("rewardPoints.history.orderId", "orderNumber totalAmount")

        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" })
        }

        res.json({
            currentPoints: user.rewardPoints.current,
            totalPoints: user.rewardPoints.total,
            history: user.rewardPoints.history,
        })
    } catch (error) {
        console.error("Error getting reward points:", error)
        res.status(500).json({ message: error.message })
    }
}

// Lấy lịch sử điểm thưởng với phân trang
export const getRewardPointsHistory = async(req, res) => {
    try {
        const { page = 1, limit = 10, type } = req.query

        // Tìm user
        const user = await User.findById(req.user._id)
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" })
        }

        // Lọc theo loại nếu có
        let filteredHistory = user.rewardPoints.history
        if (type && ["earned", "spent", "expired", "bonus"].includes(type)) {
            filteredHistory = filteredHistory.filter((item) => item.type === type)
        }

        // Sắp xếp theo thời gian mới nhất
        filteredHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

        // Phân trang
        const startIndex = (page - 1) * limit
        const endIndex = page * limit
        const paginatedHistory = filteredHistory.slice(startIndex, endIndex)

        // Populate thông tin đơn hàng
        const populatedHistory = await User.populate(paginatedHistory, {
            path: "orderId",
            select: "orderNumber totalAmount",
        })

        res.json({
            history: populatedHistory,
            pagination: {
                page: Number.parseInt(page),
                limit: Number.parseInt(limit),
                total: filteredHistory.length,
                pages: Math.ceil(filteredHistory.length / limit),
            },
            summary: {
                currentPoints: user.rewardPoints.current,
                totalPoints: user.rewardPoints.total,
                totalEarned: user.rewardPoints.history
                    .filter((item) => item.type === "earned" || item.type === "bonus")
                    .reduce((sum, item) => sum + item.amount, 0),
                totalSpent: user.rewardPoints.history
                    .filter((item) => item.type === "spent")
                    .reduce((sum, item) => sum + item.amount, 0),
            },
        })
    } catch (error) {
        console.error("Error getting reward points history:", error)
        res.status(500).json({ message: error.message })
    }
}

// Thêm điểm thưởng (cho admin và superadmin)
export const addRewardPoints = async(req, res) => {
    try {
        const { userId } = req.params
        const { amount, type, description } = req.body

        // Validate input
        if (!amount || amount <= 0) {
            return res.status(400).json({
                message: "Số điểm phải lớn hơn 0",
            })
        }

        if (!["earned", "bonus"].includes(type)) {
            return res.status(400).json({
                message: "Loại điểm không hợp lệ",
            })
        }

        // Kiểm tra quyền admin hoặc superadmin
        if (req.user.role !== "admin" && req.user.role !== "superadmin") {
            return res.status(403).json({
                message: "Chỉ admin mới có quyền thêm điểm thưởng",
            })
        }

        // Tìm user
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" })
        }

        // Thêm điểm
        user.rewardPoints.current += amount
        user.rewardPoints.total += amount

        // Thêm vào lịch sử
        user.rewardPoints.history.push({
            type,
            amount,
            description: description || `Điểm thưởng ${type === "earned" ? "từ đơn hàng" : "khuyến mãi"}`,
            createdAt: new Date(),
        })

        await user.save()

        res.json({
            message: "Đã thêm điểm thưởng thành công",
            currentPoints: user.rewardPoints.current,
            totalPoints: user.rewardPoints.total,
            addedPoints: amount,
        })
    } catch (error) {
        console.error("Error adding reward points:", error)
        res.status(500).json({ message: error.message })
    }
}

// Sử dụng điểm thưởng
export const useRewardPoints = async(req, res) => {
    try {
        const { amount, orderId } = req.body

        // Validate input
        if (!amount || amount <= 0) {
            return res.status(400).json({
                message: "Số điểm phải lớn hơn 0",
            })
        }

        // Tìm user
        const user = await User.findById(req.user._id)
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" })
        }

        // Kiểm tra đủ điểm không
        if (user.rewardPoints.current < amount) {
            return res.status(400).json({
                message: "Không đủ điểm thưởng để sử dụng",
            })
        }

        // Trừ điểm
        user.rewardPoints.current -= amount

        // Thêm vào lịch sử
        user.rewardPoints.history.push({
            type: "spent",
            amount,
            description: `Sử dụng điểm thưởng cho đơn hàng`,
            orderId: orderId || null,
            createdAt: new Date(),
        })

        await user.save()

        res.json({
            message: "Đã sử dụng điểm thưởng thành công",
            currentPoints: user.rewardPoints.current,
            usedPoints: amount,
        })
    } catch (error) {
        console.error("Error using reward points:", error)
        res.status(500).json({ message: error.message })
    }
}

// Tính điểm thưởng từ đơn hàng
export const calculateOrderRewardPoints = async(orderId) => {
    try {
        const order = await Order.findById(orderId).populate("user", "rewardPoints")

        if (!order) {
            throw new Error("Không tìm thấy đơn hàng")
        }

        // Tính điểm thưởng: 1% giá trị đơn hàng
        const pointsToEarn = Math.floor(order.totalAmount * 0.01)

        if (pointsToEarn > 0) {
            // Cập nhật điểm cho user
            const user = await User.findById(order.user._id)
            user.rewardPoints.current += pointsToEarn
            user.rewardPoints.total += pointsToEarn

            // Thêm vào lịch sử
            user.rewardPoints.history.push({
                type: "earned",
                amount: pointsToEarn,
                description: `Điểm thưởng từ đơn hàng #${order.orderNumber}`,
                orderId: orderId,
                createdAt: new Date(),
            })

            await user.save()

            return {
                pointsEarned: pointsToEarn,
                orderAmount: order.totalAmount,
                newBalance: user.rewardPoints.current,
            }
        }

        return { pointsEarned: 0 }
    } catch (error) {
        console.error("Error calculating order reward points:", error)
        throw error
    }
}

// Tổng sản phẩm gồm sản phẩm gốc (mỗi tên chỉ tính 1 lần) + tổng biến thể của tất cả sản phẩm trùng tên
export const getTotalProductWithVariantsByName = async(req, res) => {
    try {
        // Lấy tất cả tên sản phẩm duy nhất
        const uniqueNames = await Product.distinct("name")
        let total = 0
        for (const name of uniqueNames) {
            // Lấy tất cả sản phẩm trùng tên này
            const products = await Product.find({ name })
                // Tính tổng biến thể của tất cả sản phẩm trùng tên
            let variantCount = 0
            for (const p of products) {
                variantCount += p.variants ? p.variants.length : 0
            }
            // Cộng 1 sản phẩm gốc + tổng biến thể
            total += 1 + variantCount
        }
        res.json({ totalProductWithVariantsByName: total })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Tổng số lượng sản phẩm (gộp theo tên, gồm stock sản phẩm gốc và biến thể, mỗi tên chỉ tính 1 lần)
export const getTotalProductQuantityByName = async(req, res) => {
    try {
        // Tạm thời vô hiệu hóa để tránh lỗi 500, sẽ tối ưu sau
        res.json({ totalProductQuantityByName: 0 })
        return

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
        res.status(500).json({ message: error.message })
    }
}

export const searchProducts = async(req, res) => {
    try {
        const { query } = req.query
        if (!query) return res.status(400).json({ message: "Missing search query" })

        // Loại bỏ dấu và chuyển về chữ thường
        const normalizedQuery = removeAccents(query).toLowerCase()

        // Lấy tất cả sản phẩm (hoặc chỉ lấy các trường cần thiết)
        const products = await Product.find()

        // Lọc sản phẩm theo tên không dấu, không phân biệt hoa thường
        const filtered = products.filter((p) => {
            const name = removeAccents(p.name).toLowerCase()
            return name.includes(normalizedQuery)
        })

        res.json(filtered)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Tạo voucher cho sản phẩm (admin)
export const createVoucher = async(req, res) => {
    try {
        const { productId, code, discountType, value, startDate, endDate, usageLimit, minOrderValue } = req.body
        const product = await Product.findById(productId)
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
        if (product.vouchers.find((v) => v.code === code)) {
            return res.status(400).json({ message: "Mã voucher đã tồn tại cho sản phẩm này" })
        }
        product.vouchers.push({ code, discountType, value, startDate, endDate, usageLimit, minOrderValue })
        await product.save()
        res.json({ message: "Tạo voucher thành công", vouchers: product.vouchers })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Kiểm tra và áp dụng voucher (người dùng nhập lúc checkout)
export const checkVoucher = async(req, res) => {
    try {
        const { productId, code, orderValue } = req.body
        const product = await Product.findById(productId)
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
        const voucher = product.vouchers.find((v) => v.code === code)
        if (!voucher) return res.status(400).json({ valid: false, message: "Mã voucher không tồn tại" })
        const now = new Date()
        if (voucher.startDate && now < voucher.startDate)
            return res.status(400).json({ valid: false, message: "Voucher chưa bắt đầu" })
        if (voucher.endDate && now > voucher.endDate)
            return res.status(400).json({ valid: false, message: "Voucher đã hết hạn" })
        if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit)
            return res.status(400).json({ valid: false, message: "Voucher đã hết lượt sử dụng" })
        if (voucher.minOrderValue > 0 && orderValue < voucher.minOrderValue)
            return res.status(400).json({ valid: false, message: `Đơn hàng tối thiểu phải từ ${voucher.minOrderValue}đ` })
                // Tính giảm giá
        let discount = 0
        if (voucher.discountType === "percentage") {
            discount = Math.round(orderValue * (voucher.value / 100))
        } else if (voucher.discountType === "fixed") {
            discount = voucher.value
        }
        res.json({ valid: true, discount, voucher })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Cập nhật lượt dùng voucher (tăng usedCount khi đã sử dụng thành công)
export const updateVoucherUsage = async(req, res) => {
    try {
        const { productId, code } = req.body
        const product = await Product.findById(productId)
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" })
        const voucher = product.vouchers.find((v) => v.code === code)
        if (!voucher) return res.status(404).json({ message: "Không tìm thấy voucher" })
        if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
            return res.status(400).json({ message: "Voucher đã hết lượt sử dụng" })
        }
        voucher.usedCount = (voucher.usedCount || 0) + 1
        await product.save()
        res.json({ message: "Cập nhật lượt dùng voucher thành công", voucher })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}