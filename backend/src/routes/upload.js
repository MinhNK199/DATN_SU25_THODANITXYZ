import express from "express";
import multer from "multer";
import path from "path";
import { uploadImage, handleImageUpload, deleteImage, handleMulterError } from "../controllers/upload.js";

const router = express.Router();

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(process.cwd(), "uploads", "images"));
    },
    filename: function(req, file, cb) {
        cb(null, "image-" + Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// Route cũ để tương thích ngược
router.post("/", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    res.json({ url: `/uploads/images/${req.file.filename}` });
});

// Route mới sử dụng controller upload.js
router.post("/image", uploadImage, handleMulterError, handleImageUpload);
router.delete("/image/:filename", deleteImage);

export default router;