import Brand from "../models/Brand";
import Product from "../models/Product";

// Lấy tất cả thương hiệu
export const getBrands = async (req, res) => {
    try {
        const brands = await Brand.find({ isActive: true }).sort('order');
        res.json(brands);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy thương hiệu theo id
export const getBrandById = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) return res.status(404).json({ message: "Không tìm thấy thương hiệu" });
        res.json(brand);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo thương hiệu mới
export const createBrand = async (req, res) => {
    try {
        const { name, description, logo, website, order } = req.body;
        const brand = new Brand({ name, description, logo, website, order });
        const createdBrand = await brand.save();
        res.status(201).json(createdBrand);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật thương hiệu
export const updateBrand = async (req, res) => {
    try {
        const { name, description, logo, website, order, isActive } = req.body;
        const brand = await Brand.findById(req.params.id);
        if (!brand) return res.status(404).json({ message: "Không tìm thấy thương hiệu" });

        brand.name = name;
        brand.description = description;
        brand.logo = logo;
        brand.website = website;
        brand.order = order;
        brand.isActive = isActive;

        const updatedBrand = await brand.save();
        res.json(updatedBrand);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa thương hiệu
export const deleteBrand = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) return res.status(404).json({ message: "Không tìm thấy thương hiệu" });
        await brand.remove();
        res.json({ message: "Đã xóa thương hiệu thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy sản phẩm theo thương hiệu
export const getBrandProducts = async (req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.page) || 1;
        const brand = await Brand.findById(req.params.id);
        if (!brand) return res.status(404).json({ message: "Không tìm thấy thương hiệu" });

        const count = await Product.countDocuments({ brand: brand._id, isActive: true });
        const products = await Product.find({ brand: brand._id, isActive: true })
            .populate('category', 'name')
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