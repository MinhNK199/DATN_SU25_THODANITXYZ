import express from "express";
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getTopProducts
} from "../controllers/product";
import { protect } from "../middlewares/authMiddleware";

const routerProduct = express.Router();

routerProduct.get("/", getProducts);
routerProduct.get("/top", getTopProducts);
routerProduct.get("/:id", getProductById);
routerProduct.post("/", protect, createProduct);
routerProduct.put("/:id", protect, updateProduct);
routerProduct.delete("/:id", protect, deleteProduct);
routerProduct.post("/:id/reviews", protect, createProductReview);

export default routerProduct;