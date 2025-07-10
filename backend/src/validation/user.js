import Joi from "joi";

// Schema cho Signup
export const registerSchema = Joi.object({
    name: Joi.string().required().max(100).messages({
        "string.base": "Tên phải là chuỗi",
        "string.empty": "Tên không được để trống",
        "string.max": "Tên không được vượt quá {#limit} ký tự",
        "any.required": "Tên là bắt buộc",
    }),
    email: Joi.string().email().required().messages({
        "string.email": "Email không hợp lệ",
        "string.empty": "Email không được để trống",
        "any.required": "Email là bắt buộc",
    }),
    password: Joi.string().required().min(6).messages({
        "string.min": "Mật khẩu phải có ít nhất {#limit} ký tự",
        "string.empty": "Mật khẩu không được để trống",
        "any.required": "Mật khẩu là bắt buộc",
    }),
    phone: Joi.string()
        .pattern(/^\d{10}$/)
        .messages({
            "string.pattern.base": "Số điện thoại phải có đúng 10 chữ số",
        }),
    role: Joi.forbidden().messages({
        "any.unknown": "Không được gửi role khi đăng ký",
    }),
    addresses: Joi.array().items(
        Joi.object({
            street: Joi.string().required(),
            city: Joi.string().required(),
            isDefault: Joi.boolean().default(false),
        })
    ),
    avatar: Joi.string().uri().optional(),
});

// Schema cho Signin
export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.email": "Email không hợp lệ",
        "string.empty": "Email không được để trống",
        "any.required": "Email là bắt buộc",
    }),
    password: Joi.string().required().messages({
        "string.empty": "Mật khẩu không được để trống",
        "any.required": "Mật khẩu là bắt buộc",
    }),
});

// Schema cho đổi mật khẩu
export const changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required().messages({
        "string.empty": "Mật khẩu cũ không được để trống",
        "any.required": "Mật khẩu cũ là bắt buộc",
    }),
    newPassword: Joi.string().min(6).required().messages({
        "string.min": "Mật khẩu mới phải có ít nhất {#limit} ký tự",
        "string.empty": "Mật khẩu mới không được để trống",
        "any.required": "Mật khẩu mới là bắt buộc",
    }),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
        "any.only": "Xác nhận mật khẩu không khớp",
        "string.empty": "Xác nhận mật khẩu không được để trống",
        "any.required": "Xác nhận mật khẩu là bắt buộc",
    }),
});