import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  // Thông tin cơ bản
  siteName: {
    type: String,
    required: [true, "Tên website là bắt buộc"],
    default: "TechTrend Store"
  },
  siteDescription: {
    type: String,
    default: "Cửa hàng điện tử hàng đầu Việt Nam"
  },
  siteUrl: {
    type: String,
    required: [true, "URL website là bắt buộc"],
    default: "http://localhost:3000"
  },
  adminEmail: {
    type: String,
    required: [true, "Email admin là bắt buộc"],
    default: "admin@techtrend.com"
  },

  // Cấu hình hệ thống
  currency: {
    type: String,
    enum: ["VND", "USD", "EUR"],
    default: "VND"
  },
  timezone: {
    type: String,
    default: "Asia/Ho_Chi_Minh"
  },
  language: {
    type: String,
    enum: ["vi", "en"],
    default: "vi"
  },
  maxUploadSize: {
    type: Number,
    default: 10,
    min: 1,
    max: 100
  },

  // Trạng thái hệ thống
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  allowRegistration: {
    type: Boolean,
    default: true
  },
  cacheEnabled: {
    type: Boolean,
    default: true
  },

  // Cài đặt thông báo
  emailNotifications: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: false
  },

  // SEO
  seoTitle: {
    type: String,
    default: "TechTrend Store - Điện thoại, Laptop, Phụ kiện"
  },
  seoDescription: {
    type: String,
    default: "Mua sắm điện tử online với giá tốt nhất"
  },
  seoKeywords: {
    type: String,
    default: "điện thoại, laptop, phụ kiện, công nghệ"
  },

  // Mạng xã hội
  socialFacebook: {
    type: String,
    default: "https://facebook.com/techtrend"
  },
  socialTwitter: {
    type: String,
    default: "https://twitter.com/techtrend"
  },
  socialInstagram: {
    type: String,
    default: "https://instagram.com/techtrend"
  },

  // Thông tin liên hệ
  contactPhone: {
    type: String,
    default: "1900 1234"
  },
  contactAddress: {
    type: String,
    default: "123 Đường ABC, Quận 1, TP.HCM"
  },
  contactEmail: {
    type: String,
    default: "contact@techtrend.com"
  },

  // Metadata
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true,
  versionKey: false
});

// Đảm bảo chỉ có 1 document settings duy nhất
settingsSchema.index({}, { unique: true });

export default mongoose.model("Settings", settingsSchema);
