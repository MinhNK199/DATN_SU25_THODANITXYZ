import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề banner là bắt buộc"],
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    buttonText: {
      type: String,
      default: "",
      trim: true,
    },
    buttonLink: {
      type: String,
      default: "",
      trim: true,
    },
    badge: {
      type: String,
      default: "",
      trim: true,
    },
    features: {
      type: [String],
      default: [],
    },
    image: {
      url: { type: String, required: [true, "URL ảnh là bắt buộc"] },
      alt: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    startDate: {
      type: Date,
      required: [true, "Ngày bắt đầu hiển thị là bắt buộc"],
    },
    endDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    position: {
      type: String,
      default: "homepage-top",
    },
  },
  { timestamps: true }
);

// Tạo index để tối ưu hóa truy vấn theo ngày
bannerSchema.index({ startDate: 1, endDate: 1, isActive: 1 });

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;
