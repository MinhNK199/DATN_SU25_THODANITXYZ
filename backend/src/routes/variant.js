import express from "express";
import {
    getVariants,
    getVariantById,
    createVariant,
    updateVariant,
    deleteVariant,
    softDeleteVariant,
    getVariantStats
} from "../controllers/variant.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { createVariantValidation, updateVariantValidation } from "../validation/variant.js";

const routerVariant = express.Router();

// Variant CRUD operations
routerVariant.get("/", getVariants);
routerVariant.get("/stats", protect, getVariantStats);
routerVariant.get("/:id", getVariantById);
routerVariant.post("/", protect, createVariantValidation, validateRequest, createVariant);
routerVariant.put("/:id", protect, updateVariantValidation, validateRequest, updateVariant);
routerVariant.delete("/:id", protect, deleteVariant);
routerVariant.delete("/:id/soft", protect, softDeleteVariant);

export default routerVariant; 