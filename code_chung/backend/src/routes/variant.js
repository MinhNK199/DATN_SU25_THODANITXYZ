import express from "express";
import {
    getVariants,
    getVariantById,
    createVariant,
    updateVariant,
    deleteVariant,
    getVariantStats
} from "../controllers/variant";
import { protect } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import { createVariantValidation, updateVariantValidation } from "../validation/variant";

const routerVariant = express.Router();

// Variant CRUD operations
routerVariant.get("/", getVariants);
routerVariant.get("/stats", protect, getVariantStats);
routerVariant.get("/:id", getVariantById);
routerVariant.post("/", protect, createVariantValidation, validateRequest, createVariant);
routerVariant.put("/:id", protect, updateVariantValidation, validateRequest, updateVariant);
routerVariant.delete("/:id", protect, deleteVariant);

export default routerVariant; 