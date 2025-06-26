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
    getDeletedProductsCount,
    getDeletedProducts,
    addProductVariant,
    updateProductVariant,
    deleteProductVariant,
    getVariantStats,
    hardDeleteProduct
} from "../controllers/product";
import { protect } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import { createProductValidation, updateProductValidation } from "../validation/product";
import upload from "../middlewares/updateMiddleware";

const routerProduct = express.Router();

routerProduct.get("/", getProducts);
routerProduct.get("/top", getTopProducts);
routerProduct.get("/stats", protect, getProductStats);
routerProduct.get("/deleted", protect, getDeletedProducts);
routerProduct.get("/deleted-count", protect, getDeletedProductsCount);
routerProduct.get("/:id", getProductById);
routerProduct.get("/:id/variant-stats", protect, getVariantStats);

// Product CRUD
routerProduct.post("/", protect, createProductValidation, validateRequest, createProduct);
routerProduct.put("/:id", protect, updateProductValidation, validateRequest, updateProduct);
routerProduct.delete("/:id", protect, deleteProduct);
routerProduct.put("/:id/soft-delete", protect, softDeleteProduct);
routerProduct.put("/:id/restore", protect, restoreProduct);
routerProduct.delete("/:id/hard-delete", protect, hardDeleteProduct);

// Product variants
routerProduct.post("/:id/variants", protect, addProductVariant);
routerProduct.put("/:productId/variants/:variantId", protect, updateProductVariant);
routerProduct.delete("/:productId/variants/:variantId", protect, deleteProductVariant);

routerProduct.post("/import", protect, upload.single('file'), importProductsFromExcel);
routerProduct.post("/:id/reviews", protect, createProductReview);
export default routerProduct;