import express from "express";
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getTopProducts,
    softDeleteProduct,
    restoreProduct,
    getProductStats,
    importProductsFromExcel
} from "../controllers/product";
import { protect } from "../middlewares/authMiddleware";
import upload from "../middlewares/uploadMiddleware";

const routerProduct = express.Router();

routerProduct.get("/", getProducts);
routerProduct.get("/top", getTopProducts);
routerProduct.get("/stats", protect, getProductStats);
routerProduct.get("/:id", getProductById);
routerProduct.post("/", protect, createProduct);
routerProduct.put("/:id", protect, updateProduct);
routerProduct.delete("/:id", protect, deleteProduct);
routerProduct.put("/:id/soft-delete", protect, softDeleteProduct);
routerProduct.put("/:id/restore", protect, restoreProduct);
routerProduct.post("/import", protect, upload.single('file'), importProductsFromExcel);

export default routerProduct;