import Address from "../models/Address.js";
import axios from 'axios';

// API base URL
const PROVINCE_API_BASE = 'https://provinces.open-api.vn/api/v2';

// Cache để lưu trữ dữ liệu tỉnh/thành và phường/xã
let provincesCache = null;
let wardsCache = null;
let wardCodeToNameCache = null; // Cache mapping ward code -> name

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
        // API trả về wards trực tiếp trong province, không có districts
        const wards = response.data.wards || [];
        
        if (!wardsCache) wardsCache = {};
        wardsCache[cacheKey] = wards;
        
        console.log(`✅ Loaded ${wards.length} wards for province ${provinceCode}`);
        return wards;
    } catch (error) {
        console.error('Error fetching wards for province', provinceCode, ':', error.response?.data || error.message);
        
        // Nếu province không tồn tại, trả về mảng rỗng thay vì throw error
        if (error.response?.status === 404) {
            console.warn(`Province code ${provinceCode} not found, returning empty wards list`);
            if (!wardsCache) wardsCache = {};
            wardsCache[cacheKey] = [];
            return [];
        }
        
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
            if (province) {
                return province.name;
            } else {
                // Fallback cho province codes không hợp lệ
                console.warn(`Province code ${code} not found, using fallback name`);
                return `Tỉnh ${code}`;
            }
        } else if (type === 'ward') {
            // Kiểm tra cache trước
            if (wardCodeToNameCache && wardCodeToNameCache[code]) {
                return wardCodeToNameCache[code];
            }
            
            // Sử dụng API depth=3 để lấy wards
            try {
                const response = await axios.get(`${PROVINCE_API_BASE}/?depth=3`);
                const provinces = response.data;
                
                for (const province of provinces) {
                    if (province.districts) {
                        for (const district of province.districts) {
                            if (district.wards) {
                                const ward = district.wards.find(w => w.code === Number(code));
                                if (ward) {
                                    console.log(`✅ Found ward ${code}: ${ward.name} in ${district.name}, ${province.name}`);
                                    
                                    // Cache kết quả
                                    if (!wardCodeToNameCache) wardCodeToNameCache = {};
                                    wardCodeToNameCache[code] = ward.name;
                                    
                                    return ward.name;
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching wards with depth=3:', error);
            }
            
            // Fallback cho ward codes không hợp lệ
            console.warn(`Ward code ${code} not found in any province, using fallback name`);
            const fallbackName = `Phường ${code}`;
            
            // Cache fallback
            if (!wardCodeToNameCache) wardCodeToNameCache = {};
            wardCodeToNameCache[code] = fallbackName;
            
            return fallbackName;
        }
    } catch (error) {
        console.error('Error mapping code to name:', error);
        // Return a fallback name instead of null to prevent crashes
        return type === 'province' ? `Tỉnh ${code}` : `Phường ${code}`;
    }
    return null;
};

// Helper function để thêm tên vào địa chỉ
const addNamesToAddress = async (address) => {
    const addressObj = address.toObject ? address.toObject() : address;
    
    try {
        const [cityName, wardName] = await Promise.all([
            mapCodeToName(addressObj.city, 'province'),
            mapCodeToName(addressObj.ward, 'ward')
        ]);
        
        return {
            ...addressObj,
            cityName: cityName || `Tỉnh ${addressObj.city}`,
            wardName: wardName || `Phường ${addressObj.ward}`,
        };
    } catch (error) {
        console.error('Error adding names to address:', error);
        // Return address with fallback names
        return {
            ...addressObj,
            cityName: `Tỉnh ${addressObj.city}`,
            wardName: `Phường ${addressObj.ward}`,
        };
    }
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
        // Kiểm tra user có tồn tại không
        if (!req.user || !req.user._id) {
            return res.status(401).json({ 
                message: "Không thể xác định người dùng",
                error: "USER_NOT_FOUND"
            });
        }

        const addresses = await Address.find({ user: req.user._id });
        const addressesWithNames = await Promise.all(addresses.map(addNamesToAddress));
        
        console.log(`✅ Lấy ${addressesWithNames.length} địa chỉ cho user ${req.user._id}`);
        res.json(addressesWithNames);
    } catch (error) {
        console.error('❌ Lỗi khi lấy địa chỉ:', error);
        res.status(500).json({ 
            message: "Lỗi khi lấy danh sách địa chỉ",
            error: error.message 
        });
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