import express from "express";
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
<<<<<<< HEAD
    getTopProducts,
    softDeleteProduct,
    restoreProduct,
    getProductStats,
    importProductsFromExcel
} from "../controllers/product";
import { protect } from "../middlewares/authMiddleware";
import upload from "../middlewares/uploadMiddleware";
=======
    getTopProducts
} from "../controllers/product";
import { protect } from "../middlewares/authMiddleware";
>>>>>>> d2858e61da01f8dc0e0b21b1356ce2dc9f393412

const routerProduct = express.Router();

routerProduct.get("/", getProducts);
routerProduct.get("/top", getTopProducts);
<<<<<<< HEAD
routerProduct.get("/stats", protect, getProductStats);
=======
>>>>>>> d2858e61da01f8dc0e0b21b1356ce2dc9f393412
routerProduct.get("/:id", getProductById);
routerProduct.post("/", protect, createProduct);
routerProduct.put("/:id", protect, updateProduct);
routerProduct.delete("/:id", protect, deleteProduct);
<<<<<<< HEAD
routerProduct.put("/:id/soft-delete", protect, softDeleteProduct);
routerProduct.put("/:id/restore", protect, restoreProduct);
routerProduct.post("/import", protect, upload.single('file'), importProductsFromExcel);
=======
routerProduct.post("/:id/reviews", protect, createProductReview);
>>>>>>> d2858e61da01f8dc0e0b21b1356ce2dc9f393412

export default routerProduct;