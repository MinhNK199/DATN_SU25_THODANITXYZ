import Coupon from "../models/coupon";

// Lấy tất cả coupon (phân trang)
export const getCoupons = async (req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.page) || 1;

        const count = await Coupon.countDocuments({});
        const coupons = await Coupon.find({})
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({
            coupons,
            page,
            pages: Math.ceil(count / pageSize),
            total: count,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy coupon theo id
export const getCouponById = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({ message: "Không tìm thấy coupon" });
        res.json(coupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo coupon mới
export const createCoupon = async (req, res) => {
    try {
        const coupon = new Coupon({ ...req.body });
        const createdCoupon = await coupon.save();
        res.status(201).json(createdCoupon);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật coupon
export const updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({ message: "Không tìm thấy coupon" });

        Object.assign(coupon, req.body);
        const updatedCoupon = await coupon.save();
        res.json(updatedCoupon);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa coupon
export const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({ message: "Không tìm thấy coupon" });
        await coupon.remove();
        res.json({ message: "Đã xóa coupon thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Kiểm tra mã giảm giá
export const validateCoupon = async (req, res) => {
    try {
        const { code, orderValue } = req.body;
        const coupon = await Coupon.findOne({ code });
        if (!coupon) return res.status(404).json({ message: "Mã giảm giá không hợp lệ" });

        if (typeof coupon.isValid === "function" && !coupon.isValid()) {
            return res.status(400).json({ message: "Mã giảm giá không còn hiệu lực" });
        }

        if (orderValue < coupon.minOrderValue) {
            return res.status(400).json({ message: `Giá trị đơn hàng tối thiểu là ${coupon.minOrderValue}` });
        }

        let discountAmount = 0;
        if (coupon.type === 'percentage') {
            discountAmount = (orderValue * coupon.value) / 100;
            if (coupon.maxDiscountValue) {
                discountAmount = Math.min(discountAmount, coupon.maxDiscountValue);
            }
        } else {
            discountAmount = coupon.value;
        }

        res.json({
            coupon,
            discountAmount,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};