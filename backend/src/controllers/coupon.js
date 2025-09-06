import Coupon from "../models/Coupon.js";

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

        const minAmount = coupon.minAmountValue || coupon.minOrderValue || 0;
        if (orderValue < minAmount) {
            return res.status(400).json({ message: `Giá trị đơn hàng tối thiểu là ${minAmount}` });
        }

        let discountAmount = 0;
        const discountValue = coupon.discountValue || coupon.value;
        if (coupon.type === 'percentage') {
            discountAmount = (orderValue * discountValue) / 100;
            const maxDiscount = coupon.maxDiscountAmount || coupon.maxDiscountValue;
            if (maxDiscount) {
                discountAmount = Math.min(discountAmount, maxDiscount);
            }
        } else if (coupon.type === 'shipping') {
            // Mã vận chuyển - giảm phí ship
            discountAmount = discountValue;
        } else {
            discountAmount = Math.min(discountValue, orderValue);
        }

        res.json({
            coupon,
            discountAmount,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Lấy danh sách mã giảm giá có sẵn
export const getAvailableCoupons = async (req, res) => {
    try {
        const now = new Date();
        const coupons = await Coupon.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now },
            $or: [
                { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
                { $expr: { $lt: ["$usageCount", "$usageLimit"] } }
            ]
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            coupons
        });
    } catch (error) {
        console.error('Error fetching available coupons:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Lấy danh sách mã giảm giá đã sử dụng
export const getUsedCoupons = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Tìm các coupon đã được sử dụng bởi user này
        const coupons = await Coupon.find({
            'usedBy.user': userId,
            'usedBy.count': { $gt: 0 }
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            coupons
        });
    } catch (error) {
        console.error('Error fetching used coupons:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Áp dụng mã giảm giá
export const applyCoupon = async (req, res) => {
    try {
        const { code, orderAmount } = req.body;
        const userId = req.user._id;
        
        const coupon = await Coupon.findOne({ code });
        if (!coupon) {
            return res.status(404).json({ 
                success: false,
                message: "Mã giảm giá không tồn tại" 
            });
        }

        // Kiểm tra coupon còn hiệu lực không
        if (!coupon.isValid()) {
            return res.status(400).json({ 
                success: false,
                message: "Mã giảm giá không còn hiệu lực" 
            });
        }

        // Kiểm tra giá trị đơn hàng tối thiểu
        const minAmount = coupon.minAmountValue || coupon.minOrderValue || 0;
        if (orderAmount < minAmount) {
            return res.status(400).json({ 
                success: false,
                message: `Giá trị đơn hàng tối thiểu là ${minAmount}đ` 
            });
        }

        // Kiểm tra user đã sử dụng coupon này chưa
        const userUsage = coupon.usedBy.find(usage => 
            usage.user.toString() === userId.toString()
        );
        
        if (userUsage && userUsage.count >= coupon.userUsageLimit) {
            return res.status(400).json({ 
                success: false,
                message: "Bạn đã sử dụng hết số lần cho phép của mã giảm giá này" 
            });
        }

        // Tính toán số tiền giảm
        let discountAmount = 0;
        const discountValue = coupon.discountValue || coupon.value;
        if (coupon.type === 'percentage') {
            discountAmount = (orderAmount * discountValue) / 100;
            const maxDiscount = coupon.maxDiscountAmount || coupon.maxDiscountValue;
            if (maxDiscount) {
                discountAmount = Math.min(discountAmount, maxDiscount);
            }
        } else if (coupon.type === 'shipping') {
            // Mã vận chuyển - giảm phí ship
            discountAmount = discountValue;
        } else {
            discountAmount = Math.min(discountValue, orderAmount);
        }

        res.json({
            success: true,
            coupon: {
                ...coupon.toObject(),
                discountAmount
            },
            message: "Áp dụng mã giảm giá thành công"
        });
    } catch (error) {
        console.error('Error applying coupon:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Hủy áp dụng mã giảm giá
export const removeCoupon = async (req, res) => {
    try {
        const { couponId } = req.body;
        
        // Chỉ cần trả về success, logic xử lý sẽ được thực hiện ở frontend
        res.json({
            success: true,
            message: "Hủy áp dụng mã giảm giá thành công"
        });
    } catch (error) {
        console.error('Error removing coupon:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};