import { Router } from "express";
import {
    getUserAddresses,
    getAddressById,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress,
    getProvincesAPI,
    getWardsByProvinceAPI,
    clearCacheAPI,
} from "../controllers/address.js";
import { protect } from "../middlewares/authMiddleware.js";
// import { requireAuth } from "../middlewares/auth.js"; // Bổ sung nếu có middleware xác thực

const routerAddress = Router();

// API để lấy danh sách tỉnh/thành và phường/xã (không cần auth)
routerAddress.get("/provinces", getProvincesAPI);
routerAddress.get("/provinces/:provinceCode/wards", getWardsByProvinceAPI);
routerAddress.get("/clear-cache", clearCacheAPI);

// API quản lý địa chỉ của user (cần auth)
routerAddress.get("/", protect, getUserAddresses);
routerAddress.get("/default", protect, getDefaultAddress);
routerAddress.get("/:id", protect, getAddressById);
routerAddress.post("/", protect, createAddress);
routerAddress.put("/:id", protect, updateAddress);
routerAddress.delete("/:id", protect, deleteAddress);
routerAddress.put("/:id/default", protect, setDefaultAddress);

export default routerAddress;