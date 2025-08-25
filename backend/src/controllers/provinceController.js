import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ TẠM THỜI COMMENT OUT - File JSON đã bị xóa trong cleanup
// const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../../note/Danh-sách-cấp-tỉnh-kèm-theo-quận-huyện_-phường-xã-___09_07_2025.json')));

export const getProvinces = (req, res) => {
  // ✅ TẠM THỜI: Trả về dữ liệu mẫu
  const provinces = [
    { code: 1, name: "Hà Nội" },
    { code: 79, name: "TP. Hồ Chí Minh" },
    { code: 92, name: "Cần Thơ" },
    { code: 48, name: "Đà Nẵng" }
  ];
  res.json(provinces);
};

export const getWards = (req, res) => {
  // ✅ TẠM THỜI: Trả về dữ liệu mẫu
  const wards = [
    { name: "Phường 1", code: 1 },
    { name: "Phường 2", code: 2 },
    { name: "Phường 3", code: 3 }
  ];
  res.json(wards);
};

export const getDistricts = (req, res) => {
  // ✅ TẠM THỜI: Trả về dữ liệu mẫu
  const districts = [
    { name: "Quận 1", code: 1 },
    { name: "Quận 2", code: 2 },
    { name: "Quận 3", code: 3 }
  ];
  res.json(districts);
}; 