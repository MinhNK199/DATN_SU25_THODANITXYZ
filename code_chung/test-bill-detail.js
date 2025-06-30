// Test script để kiểm tra tính năng xem chi tiết hóa đơn
const API_URL = "http://localhost:5000/api/bill";

// Test lấy chi tiết hóa đơn
const testGetBillDetail = async () => {
    console.log("=== TESTING BILL DETAIL API ===");

    // Giả sử có một hóa đơn với ID này
    const testBillId = "YOUR_BILL_ID_HERE"; // Thay thế bằng ID thực tế

    try {
        // Test không có token (sẽ thất bại)
        console.log("1. Testing without token...");
        const res1 = await fetch(`${API_URL}/${testBillId}`);
        if (!res1.ok) {
            console.log("✅ PASS: API correctly requires authentication");
        } else {
            console.log("❌ FAIL: API should require authentication");
        }

        // Test với token hợp lệ (cần thay thế bằng token thực tế)
        console.log("\n2. Testing with valid token...");
        const token = "YOUR_TOKEN_HERE"; // Thay thế bằng token thực tế

        const res2 = await fetch(`${API_URL}/${testBillId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (res2.ok) {
            const data = await res2.json();
            console.log("✅ PASS: Successfully fetched bill detail");
            console.log("Bill data structure:");
            console.log("- Bill Number:", data.data?.billNumber);
            console.log("- Customer:", data.data?.customer?.name || data.data?.customer);
            console.log("- Total Amount:", data.data?.totalAmount);
            console.log("- Status:", data.data?.status);
            console.log("- Items count:", data.data?.items?.length);
        } else {
            console.log("❌ FAIL: Could not fetch bill detail");
            const errorData = await res2.json();
            console.log("Error:", errorData.error || errorData.message);
        }

    } catch (error) {
        console.log("❌ ERROR:", error.message);
    }
};

// Test lấy danh sách hóa đơn (để có ID thực tế)
const testGetBillsList = async () => {
    console.log("\n=== TESTING GET BILLS LIST ===");

    try {
        const token = "YOUR_TOKEN_HERE"; // Thay thế bằng token thực tế

        const res = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (res.ok) {
            const data = await res.json();
            console.log(`✅ PASS: Got ${data.data?.length || 0} bills`);

            if (data.data && data.data.length > 0) {
                console.log("Available bill IDs for testing:");
                data.data.slice(0, 3).forEach((bill, index) => {
                    console.log(`   ${index + 1}. ${bill.billNumber} (ID: ${bill._id})`);
                });
                console.log("\n💡 Tip: Use one of these IDs in testGetBillDetail()");
            }
        } else {
            console.log("❌ FAIL: Could not fetch bills list");
            const errorData = await res.json();
            console.log("Error:", errorData.error || errorData.message);
        }
    } catch (error) {
        console.log("❌ ERROR:", error.message);
    }
};

// Test validation
const testValidation = () => {
    console.log("\n=== TESTING VALIDATION ===");

    const testCases = [
        { id: "invalid_id", expected: "fail", description: "Invalid bill ID" },
        { id: "507f1f77bcf86cd799439011", expected: "fail", description: "Non-existent bill ID" },
        { id: "", expected: "fail", description: "Empty bill ID" },
    ];

    testCases.forEach(testCase => {
        console.log(`Testing: ${testCase.description}`);
        // Logic test validation sẽ được implement ở đây
        console.log(`Expected: ${testCase.expected}`);
    });
};

// Chạy tests
const runTests = async () => {
    console.log("Starting Bill Detail Tests...\n");

    await testGetBillsList();
    await testGetBillDetail();
    testValidation();

    console.log("\nTests completed!");
    console.log("\n📝 Notes:");
    console.log("1. Replace 'YOUR_TOKEN_HERE' with actual admin token");
    console.log("2. Replace 'YOUR_BILL_ID_HERE' with actual bill ID from the list above");
    console.log("3. Run this script after starting both frontend and backend servers");
};

runTests(); 