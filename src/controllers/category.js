import Address from "../models/address.js";

// Lấy tất cả địa chỉ của user
export const getUserAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user._id });
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy một địa chỉ theo id
export const getAddressById = async (req, res) => {
    try {
        const address = await Address.findOne({
            _id: req.params.id,
            user: req.user._id,
        });
        if (!address) return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
        res.json(address);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo địa chỉ mới
export const createAddress = async (req, res) => {
    try {
        const addressObj = new Address({
            user: req.user._id,
            ...req.body,
        });
        const createdAddress = await addressObj.save();
        res.status(201).json(createdAddress);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật địa chỉ
export const updateAddress = async (req, res) => {
    try {
        const addressObj = await Address.findOne({
            _id: req.params.id,
            user: req.user._id,
        });
        if (!addressObj) return res.status(404).json({ message: "Không tìm thấy địa chỉ" });

        Object.assign(addressObj, req.body);
        const updatedAddress = await addressObj.save();
        res.json(updatedAddress);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa địa chỉ
export const deleteAddress = async (req, res) => {
    try {
        const address = await Address.findOne({
            _id: req.params.id,
            user: req.user._id,
        });
        if (!address) return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
        await address.remove();
        res.json({ message: "Đã xóa địa chỉ thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Đặt địa chỉ mặc định
export const setDefaultAddress = async (req, res) => {
    try {
        const address = await Address.findOne({
            _id: req.params.id,
            user: req.user._id,
        });
        if (!address) return res.status(404).json({ message: "Không tìm thấy địa chỉ" });

        await Address.updateMany(
            { user: req.user._id, _id: { $ne: address._id } },
            { isDefault: false }
        );
        address.isDefault = true;
        const updatedAddress = await address.save();
        res.json(updatedAddress);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};