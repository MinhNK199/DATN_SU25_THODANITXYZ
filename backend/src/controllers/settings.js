import Settings from '../models/Settings.js';

// Lấy cài đặt hệ thống
export const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        
        if (!settings) {
            // Tạo settings mặc định nếu chưa có
            settings = new Settings();
            await settings.save();
        }
        
        res.json(settings);
    } catch (error) {
        console.error('Error getting settings:', error);
        res.status(500).json({ message: 'Lỗi khi lấy cài đặt' });
    }
};

// Cập nhật cài đặt hệ thống
export const updateSettings = async (req, res) => {
    try {
        const settingsData = req.body;
        const userId = req.user.id;
        
        // Validate required fields
        if (!settingsData.siteName || !settingsData.siteUrl || !settingsData.adminEmail) {
            return res.status(400).json({ 
                message: 'Thiếu thông tin bắt buộc: tên website, URL, email admin' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(settingsData.adminEmail)) {
            return res.status(400).json({ message: 'Email không hợp lệ' });
        }

        // Validate URL format
        try {
            new URL(settingsData.siteUrl);
        } catch {
            return res.status(400).json({ message: 'URL không hợp lệ' });
        }

        // Cập nhật settings trong database
        const updatedSettings = await Settings.findOneAndUpdate(
            {}, 
            { 
                ...settingsData,
                lastUpdated: new Date(),
                updatedBy: userId
            }, 
            { 
                upsert: true, 
                new: true,
                runValidators: true
            }
        );
        
        console.log('Settings updated by user:', userId);
        
        res.json({ 
            message: 'Cài đặt đã được cập nhật thành công',
            settings: updatedSettings 
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật cài đặt' });
    }
};

// Reset cài đặt về mặc định
export const resetSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Xóa settings hiện tại và tạo mới với giá trị mặc định
        await Settings.deleteOne({});
        const defaultSettings = new Settings({
            updatedBy: userId,
            lastUpdated: new Date()
        });
        await defaultSettings.save();
        
        res.json({ 
            message: 'Đã khôi phục cài đặt mặc định',
            settings: defaultSettings 
        });
    } catch (error) {
        console.error('Error resetting settings:', error);
        res.status(500).json({ message: 'Lỗi khi khôi phục cài đặt' });
    }
};
