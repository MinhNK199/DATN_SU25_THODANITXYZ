import Banner from "../models/Banner.js";

// Lấy tất cả banner đang hoạt động và trong thời gian hiển thị
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.status(200).json({ banners }); // lưu ý trả về dưới dạng object
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy banner", error });
  }
};


// Tạo banner mới
export const createBanner = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      description,
      badge,
      features,
      buttonText,
      buttonLink,
      image,
      isActive = true,
      position,
    } = req.body;

    // Kiểm tra thông tin bắt buộc
    if (!title || !image|| !position) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc (title, image, position)" });
    }

    // Cập nhật banner 
   await Banner.findOneAndUpdate(
  { endDate: null, position }, // Chỉ kết thúc banner ở vị trí hiện tại
  { endDate: new Date() },
  { sort: { startDate: -1 } }
);

    // Tạo banner mới với startDate là thời điểm hiện tại, endDate là null
    const newBanner = new Banner({
      title,
      subtitle,
      description,
      badge,
      features,
      buttonText,
      buttonLink,
      image,
      isActive,
      position,
      startDate: new Date(),
      endDate: null,
    });

    await newBanner.save();

    return res.status(201).json({
      success: true,
      message: "Tạo banner mới thành công và cập nhật banner cũ",
      banner: newBanner,
    });

  } catch (error) {
    console.error("❌ Lỗi khi tạo banner:", error);
    return res.status(500).json({ message: "Lỗi khi tạo banner", error: error.message });
  }
};


// Cập nhật banner
export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Không tìm thấy banner" });

    const updated = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật banner", error });
  }
};

// Xoá banner
export const deleteBanner = async (req, res) => {
  try {
    const deleted = await Banner.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy banner" });

    res.status(200).json({ message: "Đã xoá banner" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xoá banner", error });
  }
};

// Lấy banner theo ID
export const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Không tìm thấy banner" });

    res.status(200).json(banner);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy banner", error });
  }
};
