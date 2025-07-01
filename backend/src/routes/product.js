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
    hardDeleteProduct,
    suggestProducts,
    addProductVideo,
    deleteProductVideo,
    updateProductVideo,
    updateProductMeta,
    addProductQuestion,
    getProductQuestions,
    answerProductQuestion,
    deleteProductQuestion,
    addRelatedProduct,
    removeRelatedProduct,
    getRelatedProducts,
    createFlashSale,
    updateFlashSale,
    deleteFlashSale,
    getFlashSale,
    addProductDiscount,
    updateProductDiscount,
    deleteProductDiscount,
    getProductDiscounts,
    addToFavorites,
    removeFromFavorites,
    getFavorites,
    checkFavorite,
    getFavoritesCount,
    getProductRecommendations,
    getUserRecommendations,
    getFavoritesRecommendations,
    getRewardPoints,
    getRewardPointsHistory,
    addRewardPoints,
    useRewardPoints,
    getTotalProductWithVariantsByName,
    getTotalProductQuantityByName
} from "../controllers/product";
import { protect } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import { createProductValidation, updateProductValidation } from "../validation/product";
import upload from "../middlewares/updateMiddleware";

const routerProduct = express.Router();

routerProduct.get("/top", getTopProducts);
routerProduct.get("/stats", protect, getProductStats);
routerProduct.get("/deleted", protect, getDeletedProducts);
routerProduct.get("/deleted-count", protect, getDeletedProductsCount);
routerProduct.get("/suggest", suggestProducts);

// User Favorites
routerProduct.get("/favorites", protect, getFavorites);
routerProduct.get("/favorites/count", protect, getFavoritesCount);
routerProduct.get("/:id/favorite", protect, checkFavorite);
routerProduct.post("/:id/favorite", protect, addToFavorites);
routerProduct.delete("/:id/favorite", protect, removeFromFavorites);

routerProduct.get("/:id", getProductById);
routerProduct.get("/:id/variant-stats", protect, getVariantStats);

routerProduct.get("/", getProducts);
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
routerProduct.post("/:id/videos", protect, addProductVideo);
routerProduct.delete("/:id/videos/:videoIndex", protect, deleteProductVideo);
routerProduct.put("/:id/videos/:videoIndex", protect, updateProductVideo);
routerProduct.put("/:id/meta", protect, updateProductMeta);

// Product Q&A
routerProduct.get("/:id/questions", getProductQuestions);
routerProduct.post("/:id/questions", protect, addProductQuestion);
routerProduct.put("/:id/questions/:questionId/answer", protect, answerProductQuestion);
routerProduct.delete("/:id/questions/:questionId", protect, deleteProductQuestion);

// Related Products
routerProduct.get("/:id/related", getRelatedProducts);
routerProduct.post("/:id/related", protect, addRelatedProduct);
routerProduct.delete("/:id/related/:relatedProductId", protect, removeRelatedProduct);

// Flash Sale
routerProduct.get("/:id/flash-sale", getFlashSale);
routerProduct.post("/:id/flash-sale", protect, createFlashSale);
routerProduct.put("/:id/flash-sale", protect, updateFlashSale);
routerProduct.delete("/:id/flash-sale", protect, deleteFlashSale);

// Product Discounts
routerProduct.get("/:id/discounts", getProductDiscounts);
routerProduct.post("/:id/discounts", protect, addProductDiscount);
routerProduct.put("/:id/discounts/:discountId", protect, updateProductDiscount);
routerProduct.delete("/:id/discounts/:discountId", protect, deleteProductDiscount);

// AI Recommendations
routerProduct.get("/:id/recommendations", getProductRecommendations);
routerProduct.get("/recommendations/user", protect, getUserRecommendations);
routerProduct.get("/recommendations/favorites", protect, getFavoritesRecommendations);

// Reward Points
routerProduct.get("/reward-points", protect, getRewardPoints);
routerProduct.get("/reward-points/history", protect, getRewardPointsHistory);
routerProduct.post("/reward-points/use", protect, useRewardPoints);
routerProduct.post("/users/:userId/reward-points", protect, addRewardPoints);

routerProduct.get("/total-product-with-variants-by-name", getTotalProductWithVariantsByName);
routerProduct.get("/total-product-quantity-by-name", getTotalProductQuantityByName);

export default routerProduct;