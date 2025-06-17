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
      required: [true, "Vui lòng cung cấp mật khẩu"],
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
      select: false,
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

    avatar: String,
    active: {
      type: Boolean,
      default: true,
      // select: false,
    },
    adminRequest: { type: Boolean, default: false },
    adminRequestStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    adminRequestContent: { type: String },
    adminRequestImage: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
