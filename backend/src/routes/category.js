import express from "express";
import {
    getCategories,
    getCategoryTree,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    deactivateCategory,
    getCategoryProducts,
    softDeleteCategory,
    restoreCategory,
    getDeletedCategories,
    getDeletedCategoriesCount
} from "../controllers/category.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validateCreateCategory, validateUpdateCategory } from "../validation/category.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { uploadCate } from "../middlewares/updateMiddleware.js";

const routerCategory = express.Router();

routerCategory.get("/", getCategories);
routerCategory.get("/tree", getCategoryTree);
routerCategory.get("/deleted", protect, getDeletedCategories);
routerCategory.get("/deleted-count", protect, getDeletedCategoriesCount);
routerCategory.get("/:id/products", getCategoryProducts);
routerCategory.get("/:id", getCategoryById);
routerCategory.post(
    "/",
    protect,
    uploadCate.single("image"),
    validateCreateCategory,
    validateRequest,
    createCategory
);


routerCategory.put(
    "/:id",
    protect,
    uploadCate.single("image"),
    validateUpdateCategory,
    validateRequest,
    updateCategory
);

routerCategory.put("/:id/deactivate", protect, deactivateCategory);
routerCategory.put("/:id/soft-delete", protect, softDeleteCategory);
routerCategory.put("/:id/restore", protect, restoreCategory);
routerCategory.delete("/:id", protect, deleteCategory);

export default routerCategory;