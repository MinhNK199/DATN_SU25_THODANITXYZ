import Address from "../models/Address";
import fs from 'fs';
import path from 'path';

// Đọc file JSON hành chính một lần khi khởi động
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../../note/Danh-sách-cấp-tỉnh-kèm-theo-quận-huyện_-phường-xã-___09_07_2025.json')));

// Helper function để mapping mã sang tên
const mapCodeToName = (code, type) => {
    if (!code) return null;
    
    const codeNum = Number(code);
    if (type === 'province') {
        const item = data.find(item => item["Mã TP"] === codeNum);
        return item ? item["Tỉnh Thành Phố"] : null;
    } else if (type === 'district') {
        const item = data.find(item => item["Mã QH"] === codeNum);
        return item ? item["Quận Huyện"] : null;
    } else if (type === 'ward') {
        const item = data.find(item => item["Mã PX"] === codeNum);
        return item ? item["Phường Xã"] : null;
    }
    return null;
};

// Helper function để thêm tên vào địa chỉ
const addNamesToAddress = (address) => {
    const addressObj = address.toObject ? address.toObject() : address;
    return {
        ...addressObj,
        cityName: mapCodeToName(addressObj.city, 'province'),
        districtName: mapCodeToName(addressObj.district, 'district'),
        wardName: mapCodeToName(addressObj.ward, 'ward'),
    };
};

// Lấy tất cả địa chỉ của user
export const getUserAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user._id });
        const addressesWithNames = addresses.map(addNamesToAddress);
        res.json(addressesWithNames);
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
        
        const addressWithNames = addNamesToAddress(address);
        res.json(addressWithNames);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo địa chỉ mới
export const createAddress = async (req, res) => {
    try {
        const {
            fullName,
            phone,
            address,
            city,
            district,
            ward,
            postalCode,
            isDefault,
            type,
            note,
        } = req.body;

        const addressObj = new Address({
            user: req.user._id,
            fullName,
            phone,
            address,
            city,
            district,
            ward,
            postalCode,
            isDefault,
            type,
            note,
        });

        const createdAddress = await addressObj.save();
        const addressWithNames = addNamesToAddress(createdAddress);
        res.status(201).json(addressWithNames);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật địa chỉ
export const updateAddress = async (req, res) => {
    try {
        const {
            fullName,
            phone,
            address,
            city,
            district,
            ward,
            postalCode,
            isDefault,
            type,
            note,
        } = req.body;

        const addressObj = await Address.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!addressObj) return res.status(404).json({ message: "Không tìm thấy địa chỉ" });

        addressObj.fullName = fullName;
        addressObj.phone = phone;
        addressObj.address = address;
        addressObj.city = city;
        addressObj.district = district;
        addressObj.ward = ward;
        addressObj.postalCode = postalCode;
        addressObj.isDefault = isDefault;
        addressObj.type = type;
        addressObj.note = note;

        const updatedAddress = await addressObj.save();
        const addressWithNames = addNamesToAddress(updatedAddress);
        res.json(addressWithNames);
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
        
        // Kiểm tra nếu địa chỉ là mặc định
        if (address.isDefault) {
            // Kiểm tra xem có địa chỉ khác không
            const otherAddresses = await Address.find({
                user: req.user._id,
                _id: { $ne: req.params.id }
            });
            
            if (otherAddresses.length === 0) {
                return res.status(400).json({ 
                    message: "Không thể xóa địa chỉ mặc định. Vui lòng thêm địa chỉ khác trước." 
                });
            }
            
            return res.status(400).json({ 
                message: "Không thể xóa địa chỉ mặc định. Vui lòng đặt địa chỉ khác làm mặc định trước." 
            });
        }
        
        await Address.findByIdAndDelete(req.params.id);
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
        const addressWithNames = addNamesToAddress(updatedAddress);
        res.json(addressWithNames);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};