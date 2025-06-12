import Banner from '../models/Banner.js';

// Tạo banner mới
export const createBanner = async (req, res) => {
  try {
    const banner = new Banner(req.body);
    await banner.save();
    res.status(201).json({ success: true, banner });
  } catch (error) {
    console.error("Lỗi tạo banner:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Lấy tất cả banners
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ sortOrder: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: banners.length, banners });
  } catch (error) {
    console.error("Lỗi lấy banners:", error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Lấy banners theo id
export const getActiveBanners = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy banner' });
    }
    res.status(200).json({ success: true, banner });
  } catch (error) {
    console.error("Lỗi lấy banner theo ID:", error);
    res.status(400).json({ success: false, message: 'Lỗi khi lấy banner' });
  }
};


// Cập nhật banner
export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!banner) return res.status(404).json({ success: false, message: 'Không tìm thấy banner' });
    res.status(200).json({ success: true, message: 'Cập nhậtnhật banner thành công' });
  } catch (error) {
    console.error("Lỗi cập nhật banner:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Xóa banner
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Không tìm thấy banner' });
    res.status(200).json({ success: true, message: 'Xóa banner thành công' });
  } catch (error) {
    console.error("Lỗi xóa banner:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};