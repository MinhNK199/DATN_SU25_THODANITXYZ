import { Router } from "express";
import {
    getUserAddresses,
    getAddressById,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
} from "../controllers/address";
import { protect } from "../middlewares/authMiddleware";
// import { requireAuth } from "../middlewares/auth.js"; // Bổ sung nếu có middleware xác thực

const routerAddress = Router();

// router.use(requireAuth); // Bỏ comment nếu muốn bảo vệ tất cả route

routerAddress.get("/",protect, getUserAddresses);
routerAddress.get("/:id",protect, getAddressById);
routerAddress.post("/",protect, createAddress);
routerAddress.put("/:id",protect, updateAddress);
routerAddress.delete("/:id",protect, deleteAddress);
routerAddress.put("/:id/default",protect, setDefaultAddress);

export default routerAddress;