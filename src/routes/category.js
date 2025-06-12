import express from "express";
import {
    getCategories,
    getCategoryTree,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    deactivateCategory,
    getCategoryProducts
} from "../controllers/category";
import { protect } from "../middlewares/authMiddleware";


const routerCategory = express.Router();

routerCategory.get("/", getCategories);
routerCategory.get("/tree", getCategoryTree);
routerCategory.get("/:id/products", getCategoryProducts);
routerCategory.get("/:id", getCategoryById);
routerCategory.post("/", protect, createCategory);
routerCategory.put("/:id", protect, updateCategory);
routerCategory.put("/:id/deactivate", protect, deactivateCategory); 
routerCategory.delete("/:id", protect, deleteCategory);

export default routerCategory;