import Banner from "../models/Banner.js";

// Lấy tất cả banner đang hoạt động và trong thời gian hiển thị
export const getAllBanners = async (req, res) => {
  try {
    const now = new Date();
    const banners = await Banner.find({
      isActive: true,
      startDate: { $lte: now },
      $or: [{ endDate: null }, { endDate: { $gte: now } }]
    }).sort({ createdAt: -1 });

    res.status(200).json(banners);
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
      startDate,
      endDate,
      isActive,
      position,
    } = req.body;

    if (!title || !image?.url || !startDate) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    // 👉 Cập nhật tất cả banner đang hiển thị thành kết thúc
    await Banner.updateMany(
      {
        isActive: true,
        endDate: { $gte: new Date() }, // Chưa hết hạn
      },
      {
        $set: {
          isActive: false,
          endDate: new Date(), // Gán ngày kết thúc là bây giờ
        },
      }
    );

    // 👉 Tạo banner mới
    const newBanner = await Banner.create({
      title,
      subtitle,
      description,
      badge,
      features,
      buttonText,
      buttonLink,
      image,
      startDate,
      endDate,
      isActive,
      position,
    });

    res.status(201).json(newBanner);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo banner", error });
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
