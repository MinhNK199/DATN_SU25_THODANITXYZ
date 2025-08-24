import Address from "../models/Address.js";
import axios from 'axios';

// API base URL
const PROVINCE_API_BASE = 'https://provinces.open-api.vn/api/v2';

// Cache để lưu trữ dữ liệu tỉnh/thành và phường/xã
let provincesCache = null;
let wardsCache = null;

// Helper function để lấy danh sách tỉnh/thành
const getProvinces = async () => {
    if (provincesCache) return provincesCache;
    
    try {
        const response = await axios.get(`${PROVINCE_API_BASE}/p/`);
        provincesCache = response.data;
        return provincesCache;
    } catch (error) {
        console.error('Error fetching provinces:', error);
        throw new Error('Không thể lấy danh sách tỉnh/thành');
    }
};

// Helper function để lấy danh sách phường/xã của một tỉnh
const getWardsByProvince = async (provinceCode) => {
    const cacheKey = `wards_${provinceCode}`;
    if (wardsCache && wardsCache[cacheKey]) return wardsCache[cacheKey];
    
    try {
        const response = await axios.get(`${PROVINCE_API_BASE}/p/${provinceCode}?depth=2`);
        const wards = response.data.wards || [];
        
        if (!wardsCache) wardsCache = {};
        wardsCache[cacheKey] = wards;
        
        return wards;
    } catch (error) {
        console.error('Error fetching wards:', error);
        throw new Error('Không thể lấy danh sách phường/xã');
    }
};

// Helper function để mapping mã sang tên
const mapCodeToName = async (code, type) => {
    if (!code) return null;

    try {
        if (type === 'province') {
            const provinces = await getProvinces();
            const province = provinces.find(p => p.code === Number(code));
            return province ? province.name : null;
        } else if (type === 'ward') {
            // Tìm trong cache hoặc fetch từ API
            const provinceCode = code.toString().substring(0, 2); // Lấy 2 số đầu làm mã tỉnh
            const wards = await getWardsByProvince(Number(provinceCode));
            const ward = wards.find(w => w.code === Number(code));
            return ward ? ward.name : null;
        }
    } catch (error) {
        console.error('Error mapping code to name:', error);
        return null;
    }
    return null;
};

// Helper function để thêm tên vào địa chỉ
const addNamesToAddress = async (address) => {
    const addressObj = address.toObject ? address.toObject() : address;
    
    const [cityName, wardName] = await Promise.all([
        mapCodeToName(addressObj.city, 'province'),
        mapCodeToName(addressObj.ward, 'ward')
    ]);
    
    return {
        ...addressObj,
        cityName,
        wardName,
    };
};

// API để lấy danh sách tỉnh/thành
export const getProvincesAPI = async (req, res) => {
    try {
        const provinces = await getProvinces();
        res.json(provinces);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// API để lấy danh sách phường/xã theo tỉnh/thành
export const getWardsByProvinceAPI = async (req, res) => {
    try {
        const { provinceCode } = req.params;
        const wards = await getWardsByProvince(Number(provinceCode));
        res.json(wards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy tất cả địa chỉ của user
export const getUserAddresses = async(req, res) => {
    try {
        const addresses = await Address.find({ user: req.user._id });
        const addressesWithNames = await Promise.all(addresses.map(addNamesToAddress));
        res.json(addressesWithNames);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy một địa chỉ theo id
export const getAddressById = async(req, res) => {
    try {
        const address = await Address.findOne({
            _id: req.params.id,
            user: req.user._id,
        });
        if (!address) return res.status(404).json({ message: "Không tìm thấy địa chỉ" });

        const addressWithNames = await addNamesToAddress(address);
        res.json(addressWithNames);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo địa chỉ mới
export const createAddress = async(req, res) => {
    try {
        const {
            fullName,
            phone,
            address,
            city,
            ward,
            postalCode,
            isDefault,
            type,
            note,
        } = req.body;

        // Nếu địa chỉ mới là mặc định, bỏ mặc định của các địa chỉ khác
        if (isDefault) {
            await Address.updateMany(
                { user: req.user._id },
                { isDefault: false }
            );
        }

        const addressObj = new Address({
            user: req.user._id,
            fullName,
            phone,
            address,
            city,
            ward,
            postalCode,
            isDefault,
            type,
            note,
        });

        const createdAddress = await addressObj.save();
        const addressWithNames = await addNamesToAddress(createdAddress);
        res.status(201).json(addressWithNames);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật địa chỉ
export const updateAddress = async(req, res) => {
    try {
        const {
            fullName,
            phone,
            address,
            city,
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

        // Nếu địa chỉ này được đặt làm mặc định, bỏ mặc định của các địa chỉ khác
        if (isDefault && !addressObj.isDefault) {
            await Address.updateMany(
                { user: req.user._id, _id: { $ne: req.params.id } },
                { isDefault: false }
            );
        }

        addressObj.fullName = fullName;
        addressObj.phone = phone;
        addressObj.address = address;
        addressObj.city = city;
        addressObj.ward = ward;
        addressObj.postalCode = postalCode;
        addressObj.isDefault = isDefault;
        addressObj.type = type;
        addressObj.note = note;

        const updatedAddress = await addressObj.save();
        const addressWithNames = await addNamesToAddress(updatedAddress);
        res.json(addressWithNames);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa địa chỉ
export const deleteAddress = async(req, res) => {
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
export const setDefaultAddress = async(req, res) => {
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
        const addressWithNames = await addNamesToAddress(updatedAddress);
        res.json(addressWithNames);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Lấy địa chỉ mặc định của user
export const getDefaultAddress = async(req, res) => {
    try {
        const address = await Address.findOne({
            user: req.user._id,
            isDefault: true
        });

        if (!address) {
            return res.status(404).json({ message: "Không có địa chỉ mặc định" });
        }

        const addressWithNames = await addNamesToAddress(address);
        res.json(addressWithNames);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};