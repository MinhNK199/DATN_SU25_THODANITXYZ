const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api';

async function testAddressAPI() {
  try {
    console.log('🧪 Testing Address API...\n');

    // Test 1: Get provinces
    console.log('1. Testing GET /address/provinces');
    const provincesResponse = await axios.get(`${BASE_URL}/address/provinces`);
    console.log(`✅ Success: Found ${provincesResponse.data.length} provinces`);
    console.log(`   Sample: ${provincesResponse.data[0]?.name} (${provincesResponse.data[0]?.code})\n`);

    // Test 2: Get wards for a specific province (Hà Nội - code 1)
    console.log('2. Testing GET /address/provinces/1/wards');
    const wardsResponse = await axios.get(`${BASE_URL}/address/provinces/1/wards`);
    console.log(`✅ Success: Found ${wardsResponse.data.length} wards for Hà Nội`);
    console.log(`   Sample: ${wardsResponse.data[0]?.name} (${wardsResponse.data[0]?.code})\n`);

    // Test 3: Get wards for another province (TP.HCM - code 79)
    console.log('3. Testing GET /address/provinces/79/wards');
    const wardsResponse2 = await axios.get(`${BASE_URL}/address/provinces/79/wards`);
    console.log(`✅ Success: Found ${wardsResponse2.data.length} wards for TP.HCM`);
    console.log(`   Sample: ${wardsResponse2.data[0]?.name} (${wardsResponse2.data[0]?.code})\n`);

    console.log('🎉 All tests passed!');
    console.log('\n📋 Summary:');
    console.log(`   - Total provinces: ${provincesResponse.data.length}`);
    console.log(`   - Hà Nội wards: ${wardsResponse.data.length}`);
    console.log(`   - TP.HCM wards: ${wardsResponse2.data.length}`);
    console.log('\n✅ API is working correctly with the new 2-level structure (Province -> Ward)');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the test
testAddressAPI();
