import express from "express";
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getTopProducts,
    softDeleteProduct,
    restoreProduct,
    getProductStats,
    importProductsFromExcel,
    createProductReview,
    getDeletedProducts
} from "../controllers/product";
import { protect, requireSuperadmin } from "../middlewares/authMiddleware";
import upload from "../middlewares/updateMiddleware";

const routerProduct = express.Router();

routerProduct.get("/top", getTopProducts);
routerProduct.get("/stats", protect, getProductStats);
routerProduct.get("/deleted", protect, getDeletedProducts); 
routerProduct.post("/import", protect, upload.single('file'), importProductsFromExcel);
routerProduct.put("/:id/soft-delete", protect, softDeleteProduct);
routerProduct.put("/:id/restore", protect, restoreProduct);
routerProduct.post("/:id/reviews", protect, createProductReview);

routerProduct.get("/", getProducts);
routerProduct.get("/:id", getProductById); 
routerProduct.post("/", protect, createProduct);
routerProduct.put("/:id", protect, updateProduct);
routerProduct.delete("/:id", protect, requireSuperadmin, deleteProduct);
export default routerProduct;