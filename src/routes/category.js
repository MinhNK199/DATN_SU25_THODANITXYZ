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
    getDeletedCategories,
    softDeleteCategory, // Thêm dòng này
    restoreCategory
} from "../controllers/category";
import { protect, requireSuperadmin } from "../middlewares/authMiddleware";

const routerCategory = express.Router();

routerCategory.get("/", getCategories);
routerCategory.get("/tree", getCategoryTree);
routerCategory.get("/deleted", getDeletedCategories);

routerCategory.get("/:id/products", getCategoryProducts);
routerCategory.get("/:id", getCategoryById);
routerCategory.post("/", protect, createCategory);
routerCategory.put("/:id", protect, updateCategory);

// Thêm route xóa mềm
routerCategory.put("/:id/soft-delete", protect, softDeleteCategory);

routerCategory.delete("/:id", protect, requireSuperadmin, deleteCategory);
routerCategory.put("/:id/restore", protect, restoreCategory);

export default routerCategory;