import fs from "fs";
import path from "path";
import Banner from "../models/Banner.js";


// Lấy tất cả banner
export const getAllBanners = async (req, res) => {
  try {
    const { status } = req.query; 
    const now = new Date();

    let filter = {};

    if (status === "active") {
      filter = { isActive: true, $or: [{ endDate: null }, { endDate: { $gte: now } }] };
    } else if (status === "inactive") {
      filter = { $or: [{ isActive: false }, { endDate: { $lt: now } }] };
    }

    const banners = await Banner.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ banners });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy banner", error });
  }
};

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
      isActive = true,
      position,
    } = req.body;

    // Check file ảnh upload
    if (!req.file) {
      return res.status(400).json({ message: "Thiếu file ảnh banner" });
    }

    // Luôn thống nhất dùng /uploads/... để FE load được
    const imagePath = `/uploads/banners/${req.file.filename}`;

    // Check thông tin bắt buộc
    if (!title || !position) {
      return res
        .status(400)
        .json({ message: "Thiếu thông tin bắt buộc (title, position)" });
    }

    // Parse features (fallback an toàn)
    let parsedFeatures = [];
    if (features) {
      if (typeof features === "string") {
        try {
          parsedFeatures = JSON.parse(features);
        } catch (err) {
          parsedFeatures = [features]; // nếu không parse được thì coi như 1 item string
        }
      } else if (Array.isArray(features)) {
        parsedFeatures = features;
      }
    }

    // Kết thúc banner cũ cùng position (nếu có)
    await Banner.findOneAndUpdate(
      { endDate: null, position },
      { endDate: new Date() },
      { sort: { startDate: -1 } }
    );

    // Tạo mới banner
    const newBanner = new Banner({
      title,
      subtitle,
      description,
      badge,
      features: parsedFeatures,
      buttonText,
      buttonLink,
      image: imagePath,
      isActive,
      position,
      startDate: new Date(),
      endDate: null,
    });

    await newBanner.save();

    return res.status(201).json({
      success: true,
      message: "Tạo banner mới thành công",
      banner: newBanner,
    });
  } catch (error) {
    console.error("❌ Lỗi khi tạo banner:", error);
    return res.status(500).json({
      message: "Lỗi khi tạo banner" + error.message
    });
  }
};


export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, ...rest } = req.body;

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: "Không tìm thấy banner" });
    }
// Nếu có upload ảnh mới
    if (req.file) {
      const newImagePath = `/uploads/banners/${req.file.filename}`;

      // Xoá ảnh cũ nếu có
      if (banner.image) {
        const oldPath = path.join(process.cwd(), banner.image);
       if (fs.existsSync(oldPath)) {
  try {
    fs.unlinkSync(oldPath);
  } catch (err) {
    console.error("Không thể xoá file:", err);
  }
}

      }

      rest.image = newImagePath;
    }

    // Quản lý trạng thái active/inactive
    if (typeof isActive !== "undefined" && isActive === false && !banner.endDate) {
      rest.endDate = new Date();
    }
    if (typeof isActive !== "undefined" && isActive === true && banner.endDate) {
      rest.endDate = null;
      rest.startDate = new Date();
    }

    const updated = await Banner.findByIdAndUpdate(id, rest, { new: true });

    res.status(200).json({
      success: true,
      message: "Cập nhật banner thành công",
      banner: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật banner", error });
  }
};


export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: "Không tìm thấy banner" });

    // Xoá ảnh khỏi thư mục
    if (banner.image) {
      const oldPath = path.join(process.cwd(), banner.image);
     if (fs.existsSync(oldPath)) {
  try {
    fs.unlinkSync(oldPath);
  } catch (err) {
    console.error("Không thể xoá file:", err);
  }
}

    }

    res.status(200).json({ message: "Đã xoá banner" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xoá banner", error });
  }
};

export const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Không tìm thấy banner" });

    res.status(200).json(banner);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy banner", error });
  }
};