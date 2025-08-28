import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng cung cấp tên"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Vui lòng cung cấp email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Vui lòng cung cấp địa chỉ email hợp lệ",
      ],
    },
    password: {
      type: String,
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
      select: false,
      required: function () {
        return this.provider === "local";
      },
    },
    passwordChangedAt: Date,
    role: {
      type: String,
      enum: ["customer", "staff", "admin", "superadmin"],
      default: "customer",
    },
    phone: {
      type: String,
      validate: {
        validator: (v) => /^\d{10}$/.test(v),
        message: (props) =>
          `${props.value} không phải là số điện thoại hợp lệ!`,
      },
    },
    addresses: [
      {
        street: String,
        city: String,
        isDefault: {
          type: Boolean,
          default: false,
        },
        province_code: Number,
        district_code: Number,
        ward_code: Number,
        street: String,
      },
    ],

    avatar: {
  type: String,
  default: "uploads/images/default-avatar.png"
},


    notificationSettings: {
      orderEmail: { type: Boolean, default: true },
      promotionEmail: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    privacySettings: {
      shareHistory: { type: Boolean, default: true },
      thirdPartyAnalytics: { type: Boolean, default: false },
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    rewardPoints: {
      current: {
        type: Number,
        default: 0,
        min: 0,
      },
      total: {
        type: Number,
        default: 0,
        min: 0,
      },
      history: [
        {
          type: {
            type: String,
            enum: ["earned", "spent", "expired", "bonus"],
            required: true,
          },
          amount: {
            type: Number,
            required: true,
          },
          description: String,
          orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    provider: {
      type: String,
      default: "local",
    },
    active: {
      type: Boolean,
      default: true,
      // select: false,
    },
    adminRequest: {
      image: String,
      content: String,
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
