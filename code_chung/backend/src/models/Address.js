import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Vui lòng liên kết với người dùng'],
    },
    fullName: {
        type: String,
        required: [true, 'Vui lòng nhập họ và tên'],
    },
    phone: {
        type: String,
        required: [true, 'Vui lòng nhập số điện thoại'],
    },
    address: {
        type: String,
        required: [true, 'Vui lòng nhập địa chỉ'],
    },
    city: {
        type: String,
        required: [true, 'Vui lòng nhập tỉnh/thành phố'],
    },
    district: {
        type: String,
        required: [true, 'Vui lòng nhập quận/huyện'],
    },
    ward: {
        type: String,
        required: [true, 'Vui lòng nhập phường/xã'],
    },
    postalCode: {
        type: String,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
    type: {
        type: String,
        enum: {
            values: ['home', 'work', 'other'],
            message: 'Loại địa chỉ không hợp lệ (home, work, other)',
        },
        default: 'home',
    },
    note: {
        type: String,
    },
}, {
    timestamps: true,
    versionKey: false,
});

const Address = mongoose.model("Address", addressSchema);
export default Address;
