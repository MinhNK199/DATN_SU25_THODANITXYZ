import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API base URL
const PROVINCE_API_BASE = 'https://provinces.open-api.vn/api/v2';

// Hàm để lấy tất cả dữ liệu địa chỉ Việt Nam
async function fetchAllAddressData() {
    try {
        console.log('🔄 Đang lấy dữ liệu tỉnh/thành...');
        
        // Lấy danh sách tỉnh/thành
        const provincesResponse = await axios.get(`${PROVINCE_API_BASE}/p/`);
        const provinces = provincesResponse.data;
        
        console.log(`✅ Đã lấy ${provinces.length} tỉnh/thành`);
        
        // Lấy chi tiết từng tỉnh (bao gồm phường/xã)
        const detailedProvinces = [];
        
        for (let i = 0; i < provinces.length; i++) {
            const province = provinces[i];
            console.log(`🔄 Đang lấy chi tiết tỉnh ${i + 1}/${provinces.length}: ${province.name}`);
            
            try {
                const detailResponse = await axios.get(`${PROVINCE_API_BASE}/p/${province.code}?depth=2`);
                const provinceData = detailResponse.data;
                
                // Tạo cấu trúc districts từ wards
                const districts = [];
                const wardsByDistrict = {};
                
                if (provinceData.wards && provinceData.wards.length > 0) {
                    // Nhóm wards theo district dựa trên mã code
                    provinceData.wards.forEach(ward => {
                        // Sử dụng 3 số đầu của ward code làm district code
                        const districtCode = Math.floor(ward.code / 10) * 10;
                        
                        if (!wardsByDistrict[districtCode]) {
                            wardsByDistrict[districtCode] = [];
                        }
                        wardsByDistrict[districtCode].push(ward);
                    });
                    
                    // Tạo districts từ wards đã nhóm
                    Object.keys(wardsByDistrict).forEach(districtCode => {
                        const districtWards = wardsByDistrict[districtCode];
                        const firstWard = districtWards[0];
                        
                        // Tạo tên district từ tên ward đầu tiên
                        let districtName = firstWard.name;
                        if (districtName.includes('Phường')) {
                            districtName = districtName.replace('Phường', 'Quận');
                        } else if (districtName.includes('Xã')) {
                            districtName = districtName.replace('Xã', 'Huyện');
                        }
                        
                        districts.push({
                            code: parseInt(districtCode),
                            name: districtName,
                            wards: districtWards
                        });
                    });
                }
                
                detailedProvinces.push({
                    ...provinceData,
                    districts: districts
                });
                
                // Thêm delay nhỏ để tránh bị rate limit
                await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
                console.error(`❌ Lỗi khi lấy chi tiết tỉnh ${province.name}:`, error.message);
                // Vẫn thêm tỉnh cơ bản nếu không lấy được chi tiết
                detailedProvinces.push({
                    ...province,
                    districts: []
                });
            }
        }
        
        return detailedProvinces;
    } catch (error) {
        console.error('❌ Lỗi khi lấy dữ liệu địa chỉ:', error);
        throw error;
    }
}

// Hàm để lưu dữ liệu vào file JSON
function saveAddressData(data) {
    const outputPath = path.join(__dirname, '../data/vietnam_addresses.json');
    
    // Tạo thư mục nếu chưa tồn tại
    const dataDir = path.dirname(outputPath);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Lưu dữ liệu
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ Đã lưu dữ liệu vào: ${outputPath}`);
    
    // Tạo file CSV để dễ xem
    const csvPath = path.join(__dirname, '../data/vietnam_addresses.csv');
    createCSVFile(data, csvPath);
    
    return outputPath;
}

// Hàm để tạo file CSV
function createCSVFile(data, csvPath) {
    let csvContent = 'Tỉnh/Thành,Quận/Huyện,Phường/Xã,Mã Tỉnh,Mã Quận,Mã Phường\n';
    
    data.forEach(province => {
        const provinceName = province.name || '';
        const provinceCode = province.code || '';
        
        if (province.districts && province.districts.length > 0) {
            province.districts.forEach(district => {
                const districtName = district.name || '';
                const districtCode = district.code || '';
                
                if (district.wards && district.wards.length > 0) {
                    district.wards.forEach(ward => {
                        const wardName = ward.name || '';
                        const wardCode = ward.code || '';
                        csvContent += `"${provinceName}","${districtName}","${wardName}",${provinceCode},${districtCode},${wardCode}\n`;
                    });
                } else {
                    // Nếu không có phường/xã, vẫn ghi quận/huyện
                    csvContent += `"${provinceName}","${districtName}","",${provinceCode},${districtCode},\n`;
                }
            });
        } else {
            // Nếu không có quận/huyện, chỉ ghi tỉnh/thành
            csvContent += `"${provinceName}","","",${provinceCode},,\n`;
        }
    });
    
    fs.writeFileSync(csvPath, csvContent, 'utf8');
    console.log(`✅ Đã tạo file CSV: ${csvPath}`);
}

// Hàm để tạo dữ liệu đơn giản hóa cho frontend
function createSimplifiedData(data) {
    const simplified = {
        provinces: [],
        districts: {},
        wards: {}
    };
    
    data.forEach(province => {
        // Thêm tỉnh/thành
        simplified.provinces.push({
            code: province.code,
            name: province.name
        });
        
        // Thêm quận/huyện
        if (province.districts && province.districts.length > 0) {
            simplified.districts[province.code] = province.districts.map(district => ({
                code: district.code,
                name: district.name
            }));
            
            // Thêm phường/xã
            province.districts.forEach(district => {
                if (district.wards && district.wards.length > 0) {
                    simplified.wards[district.code] = district.wards.map(ward => ({
                        code: ward.code,
                        name: ward.name
                    }));
                }
            });
        }
    });
    
    return simplified;
}

// Hàm chính
async function main() {
    try {
        console.log('🚀 Bắt đầu cập nhật dữ liệu địa chỉ Việt Nam...');
        
        // Lấy dữ liệu từ API
        const addressData = await fetchAllAddressData();
        
        // Lưu dữ liệu đầy đủ
        const fullDataPath = saveAddressData(addressData);
        
        // Tạo dữ liệu đơn giản hóa
        const simplifiedData = createSimplifiedData(addressData);
        const simplifiedPath = path.join(__dirname, '../data/vietnam_addresses_simplified.json');
        fs.writeFileSync(simplifiedPath, JSON.stringify(simplifiedData, null, 2), 'utf8');
        console.log(`✅ Đã tạo dữ liệu đơn giản: ${simplifiedPath}`);
        
        // Thống kê
        const totalProvinces = addressData.length;
        const totalDistricts = addressData.reduce((sum, p) => sum + (p.districts ? p.districts.length : 0), 0);
        const totalWards = addressData.reduce((sum, p) => 
            sum + (p.districts ? p.districts.reduce((dSum, d) => dSum + (d.wards ? d.wards.length : 0), 0) : 0), 0
        );
        
        console.log('\n📊 Thống kê dữ liệu:');
        console.log(`- Tổng số tỉnh/thành: ${totalProvinces}`);
        console.log(`- Tổng số quận/huyện: ${totalDistricts}`);
        console.log(`- Tổng số phường/xã: ${totalWards}`);
        
        console.log('\n✅ Hoàn thành cập nhật dữ liệu địa chỉ!');
        
    } catch (error) {
        console.error('❌ Lỗi trong quá trình cập nhật:', error);
        process.exit(1);
    }
}

// Chạy script
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { fetchAllAddressData, createSimplifiedData };
