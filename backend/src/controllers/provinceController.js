import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API base URL
const PROVINCE_API_BASE = 'https://provinces.open-api.vn/api/v2';

// Cache để lưu trữ dữ liệu
let addressDataCache = null;
let lastCacheTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 giờ

// Hàm để load dữ liệu từ file hoặc API
async function loadAddressData() {
    // Kiểm tra cache
    const now = Date.now();
    if (addressDataCache && (now - lastCacheTime) < CACHE_DURATION) {
        return addressDataCache;
    }

    // Thử load từ file trước
    const dataPath = path.join(__dirname, '../../data/vietnam_addresses_simplified.json');
    
    try {
        if (fs.existsSync(dataPath)) {
            const fileData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            addressDataCache = fileData;
            lastCacheTime = now;
            console.log('✅ Đã load dữ liệu địa chỉ từ file');
            return fileData;
        }
    } catch (error) {
        console.warn('⚠️ Không thể load dữ liệu từ file:', error.message);
    }

    // Nếu không có file, load từ API
    try {
        console.log('🔄 Đang load dữ liệu từ API...');
        const response = await axios.get(`${PROVINCE_API_BASE}/p/`);
        const provinces = response.data.map(p => ({ code: p.code, name: p.name }));
        
        addressDataCache = { provinces, districts: {}, wards: {} };
        lastCacheTime = now;
        
        console.log('✅ Đã load dữ liệu địa chỉ từ API');
        return addressDataCache;
    } catch (error) {
        console.error('❌ Lỗi khi load dữ liệu từ API:', error.message);
        // Fallback về dữ liệu mẫu
        return {
            provinces: [
                { code: 1, name: "Hà Nội" },
                { code: 79, name: "TP. Hồ Chí Minh" },
                { code: 92, name: "Cần Thơ" },
                { code: 48, name: "Đà Nẵng" }
            ],
            districts: {},
            wards: {}
        };
    }
}

// Lấy danh sách tỉnh/thành
export const getProvinces = async (req, res) => {
    try {
        const data = await loadAddressData();
        res.json(data.provinces);
    } catch (error) {
        console.error('❌ Lỗi khi lấy danh sách tỉnh:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách tỉnh/thành' });
    }
};

// Lấy danh sách quận/huyện theo tỉnh
export const getDistricts = async (req, res) => {
    try {
        const { provinceCode } = req.params;
        const data = await loadAddressData();
        
        // Nếu có dữ liệu trong cache
        if (data.districts && data.districts[provinceCode]) {
            return res.json(data.districts[provinceCode]);
        }
        
        // Nếu không có, fetch từ API
        const response = await axios.get(`${PROVINCE_API_BASE}/p/${provinceCode}?depth=2`);
        const districts = response.data.districts || [];
        
        const districtList = districts.map(d => ({ code: d.code, name: d.name }));
        res.json(districtList);
    } catch (error) {
        console.error('❌ Lỗi khi lấy danh sách quận/huyện:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách quận/huyện' });
    }
};

// Lấy danh sách phường/xã theo quận/huyện
export const getWards = async (req, res) => {
    try {
        const { districtCode } = req.params;
        const data = await loadAddressData();
        
        // Nếu có dữ liệu trong cache
        if (data.wards && data.wards[districtCode]) {
            return res.json(data.wards[districtCode]);
        }
        
        // Nếu không có, fetch từ API
        const response = await axios.get(`${PROVINCE_API_BASE}/d/${districtCode}?depth=2`);
        const wards = response.data.wards || [];
        
        const wardList = wards.map(w => ({ code: w.code, name: w.name }));
        res.json(wardList);
    } catch (error) {
        console.error('❌ Lỗi khi lấy danh sách phường/xã:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách phường/xã' });
    }
}; 