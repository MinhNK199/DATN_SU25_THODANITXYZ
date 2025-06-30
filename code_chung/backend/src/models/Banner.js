import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề banner là bắt buộc"],
      trim: true,
    },
    image: {
      url: { type: String, required: [true, "URL ảnh là bắt buộc"] },
      alt: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    link: { type: String, default: "" },
    startDate: { type: Date, required: [true, "Ngày bắt đầu hiển thị là bắt buộc"] },
    endDate: { type: Date, required: [true, "Ngày kết thúc hiển thị là bắt buộc"] },
    isActive: { type: Boolean, default: true },
    position: { type: String, default: "homepage-top" },
  },
  { timestamps: true }
);

// Indexes to optimize date queries
bannerSchema.index({ startDate: 1, endDate: 1, isActive: 1 });

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;