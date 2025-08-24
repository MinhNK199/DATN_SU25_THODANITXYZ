import TaxConfig from '../models/TaxConfig.js';

// Lấy giá trị thuế hiện tại
export const getTaxConfig = async (req, res) => {
    try {
        let config = await TaxConfig.findOne();
        if (!config) {
            config = await TaxConfig.create({ rate: 0.08 });
        }
        res.json({ rate: config.rate, updatedAt: config.updatedAt });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật giá trị thuế (chỉ admin)
export const updateTaxConfig = async (req, res) => {
    try {
        const { rate } = req.body;
        if (typeof rate !== 'number' || rate < 0 || rate > 1) {
            return res.status(400).json({ message: 'Tỉ lệ thuế không hợp lệ' });
        }
        let config = await TaxConfig.findOne();
        if (!config) {
            config = await TaxConfig.create({ rate });
        } else {
            config.rate = rate;
            config.updatedAt = Date.now();
            await config.save();
        }
        res.json({ rate: config.rate, updatedAt: config.updatedAt });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 