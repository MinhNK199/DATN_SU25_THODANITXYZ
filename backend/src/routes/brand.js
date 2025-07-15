import { Router } from "express";
import {
    getBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand,
    getBrandProducts,
} from "../controllers/brand";
import { protect } from "../middlewares/authMiddleware";


const routerBrand = Router();


routerBrand.get("/", getBrands);
routerBrand.get("/:id",protect, getBrandById);
routerBrand.post("/",protect, createBrand); // Thêm requireAdmin nếu cần
routerBrand.put("/:id",protect, updateBrand); // Thêm requireAdmin nếu cần
routerBrand.delete("/:id", protect, deleteBrand);
routerBrand.get("/:id/products",protect, getBrandProducts);

export default routerBrand;