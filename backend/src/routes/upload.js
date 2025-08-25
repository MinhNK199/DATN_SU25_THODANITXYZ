import express from "express";
import { uploadImage, handleImageUpload, deleteImage, handleMulterError } from "../controllers/upload.js";
import { protect } from "../middlewares/authMiddleware.js";

const routerUpload = express.Router();

// Routes cho upload ảnh
routerUpload.post("/image", protect, uploadImage, handleMulterError, handleImageUpload);
routerUpload.delete("/image/:filename", protect, deleteImage);

export default routerUpload;
