const fs = require('fs');
const path = require('path');

// Đọc file JSON hành chính một lần khi khởi động
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../../note/Danh-sách-cấp-tỉnh-kèm-theo-quận-huyện_-phường-xã-___09_07_2025.json')));

exports.getProvinces = (req, res) => {
  // Lấy tất cả các tỉnh/thành phố duy nhất theo mã
  const provinceMap = new Map();
  data.forEach(item => {
    if (!provinceMap.has(item["Mã TP"])) {
      provinceMap.set(item["Mã TP"], item["Tỉnh Thành Phố"]);
    }
  });
  const provinces = Array.from(provinceMap, ([code, name]) => ({ code, name }));
  res.json(provinces);
};

exports.getWards = (req, res) => {
  const provinceCode = Number(req.query.provinceCode);
  const districtCode = req.query.districtCode ? Number(req.query.districtCode) : null;
  if (!provinceCode) return res.status(400).json({ error: 'provinceCode is required' });
  let wards = data.filter(item => item["Mã TP"] === provinceCode);
  // Nếu có districtCode và tỉnh thực sự có quận/huyện thì filter theo quận/huyện
  if (districtCode && wards.some(item => item["Mã QH"])) {
    wards = wards.filter(item => item["Mã QH"] === districtCode);
  }
  // Trả về tất cả phường/xã của tỉnh nếu không có quận/huyện
  wards = wards.map(item => ({
    name: item["Phường Xã"],
    code: item["Mã PX"]
  }));
  res.json(wards);
};

exports.getDistricts = (req, res) => {
  const provinceCode = Number(req.query.provinceCode);
  if (!provinceCode) return res.status(400).json({ error: 'provinceCode is required' });
  // Lấy danh sách quận/huyện không trùng theo mã tỉnh
  const districts = Array.from(
    new Set(data.filter(item => item["Mã TP"] === provinceCode).map(item => item["Quận Huyện"]))
  ).map(name => ({
    name,
    code: data.find(item => item["Mã TP"] === provinceCode && item["Quận Huyện"] === name)["Mã QH"]
  }));
  res.json(districts);
}; 