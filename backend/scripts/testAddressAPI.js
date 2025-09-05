import axios from 'axios';

const PROVINCE_API_BASE = 'https://provinces.open-api.vn/api/v2';

// Test API địa chỉ
async function testAddressAPI() {
    try {
        console.log('🧪 Bắt đầu test API địa chỉ...');
        
        // Test 1: Lấy danh sách tỉnh/thành
        console.log('\n1. Test lấy danh sách tỉnh/thành...');
        const provincesResponse = await axios.get(`${PROVINCE_API_BASE}/p/`);
        console.log(`✅ Lấy được ${provincesResponse.data.length} tỉnh/thành`);
        
        // Hiển thị 5 tỉnh đầu tiên
        console.log('📋 5 tỉnh/thành đầu tiên:');
        provincesResponse.data.slice(0, 5).forEach((province, index) => {
            console.log(`   ${index + 1}. ${province.name} (Mã: ${province.code})`);
        });
        
        // Test 2: Lấy chi tiết một tỉnh (Hà Nội)
        console.log('\n2. Test lấy chi tiết tỉnh Hà Nội...');
        const hanoiResponse = await axios.get(`${PROVINCE_API_BASE}/p/1?depth=2`);
        const hanoi = hanoiResponse.data;
        
        console.log(`✅ Tỉnh: ${hanoi.name}`);
        console.log(`📊 Số quận/huyện: ${hanoi.districts ? hanoi.districts.length : 0}`);
        
        if (hanoi.districts && hanoi.districts.length > 0) {
            const totalWards = hanoi.districts.reduce((sum, district) => 
                sum + (district.wards ? district.wards.length : 0), 0
            );
            console.log(`📊 Tổng số phường/xã: ${totalWards}`);
            
            // Hiển thị 3 quận đầu tiên
            console.log('📋 3 quận/huyện đầu tiên:');
            hanoi.districts.slice(0, 3).forEach((district, index) => {
                const wardCount = district.wards ? district.wards.length : 0;
                console.log(`   ${index + 1}. ${district.name} (${wardCount} phường/xã)`);
            });
        }
        
        // Test 3: Lấy chi tiết một quận (Quận Hoàn Kiếm)
        if (hanoi.districts && hanoi.districts.length > 0) {
            console.log('\n3. Test lấy chi tiết quận Hoàn Kiếm...');
            const hoanKiem = hanoi.districts.find(d => d.name.includes('Hoàn Kiếm'));
            
            if (hoanKiem) {
                console.log(`✅ Quận: ${hoanKiem.name}`);
                console.log(`📊 Số phường/xã: ${hoanKiem.wards ? hoanKiem.wards.length : 0}`);
                
                if (hoanKiem.wards && hoanKiem.wards.length > 0) {
                    console.log('📋 5 phường/xã đầu tiên:');
                    hoanKiem.wards.slice(0, 5).forEach((ward, index) => {
                        console.log(`   ${index + 1}. ${ward.name} (Mã: ${ward.code})`);
                    });
                }
            }
        }
        
        // Test 4: Kiểm tra API response time
        console.log('\n4. Test response time...');
        const startTime = Date.now();
        await axios.get(`${PROVINCE_API_BASE}/p/`);
        const responseTime = Date.now() - startTime;
        console.log(`✅ Response time: ${responseTime}ms`);
        
        console.log('\n🎉 Tất cả test đều thành công!');
        
    } catch (error) {
        console.error('❌ Lỗi trong quá trình test:', error.message);
        if (error.response) {
            console.error('📊 Status:', error.response.status);
            console.error('📊 Data:', error.response.data);
        }
    }
}

// Chạy test
testAddressAPI();
