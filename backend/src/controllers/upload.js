import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Cấu hình multer cho upload ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/images';
    
    try {
      // Tạo thư mục nếu chưa tồn tại
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    } catch (error) {
      console.error('Lỗi tạo thư mục upload:', error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    try {
      // Tạo tên file unique với timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const filename = file.fieldname + '-' + uniqueSuffix + ext;
      cb(null, filename);
    } catch (error) {
      console.error('Lỗi tạo tên file:', error);
      cb(error);
    }
  }
});

// Filter file upload
const fileFilter = (req, file, cb) => {
  try {
    // Chỉ cho phép upload ảnh
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload file ảnh!'), false);
    }
  } catch (error) {
    console.error('Lỗi filter file:', error);
    cb(error);
  }
};

// Cấu hình upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  }
});

// Middleware upload ảnh
export const uploadImage = upload.single('image');

// Middleware upload multiple ảnh cho thumbnails
export const uploadMultipleImages = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'thumbnail_0', maxCount: 1 },
  { name: 'thumbnail_1', maxCount: 1 },
  { name: 'thumbnail_2', maxCount: 1 },
  { name: 'thumbnail_3', maxCount: 1 },
  { name: 'thumbnail_4', maxCount: 1 }
]);

// Middleware xử lý lỗi multer
export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error('Multer error:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File quá lớn. Kích thước tối đa là 5MB' });
    }
    return res.status(400).json({ message: `Lỗi upload file: ${error.message}` });
  } else if (error) {
    console.error('Upload error:', error);
    return res.status(400).json({ message: error.message });
  }
  next();
};

// Controller xử lý upload ảnh
export const handleImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file ảnh để upload' });
    }

    // Tạo URL cho ảnh đã upload
    const imageUrl = `/uploads/images/${req.file.filename}`;
    
    // Kiểm tra file có tồn tại không
    const filePath = path.join('uploads/images', req.file.filename);
    if (!fs.existsSync(filePath)) {
      console.error('File không tồn tại sau khi upload:', filePath);
      return res.status(500).json({ message: 'Lỗi: File không tồn tại sau khi upload' });
    }
    
    res.json({
      message: 'Upload ảnh thành công',
      url: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Lỗi upload ảnh:', error);
    res.status(500).json({ 
      message: 'Lỗi khi upload ảnh',
      error: error.message 
    });
  }
};

// Controller xóa ảnh
export const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const imagePath = path.join('uploads/images', filename);
    
    // Kiểm tra file có tồn tại không
    if (fs.existsSync(imagePath)) {
      // Xóa file
      fs.unlinkSync(imagePath);
      res.json({ message: 'Đã xóa ảnh thành công' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy ảnh' });
    }
  } catch (error) {
    console.error('Lỗi xóa ảnh:', error);
    res.status(500).json({ message: 'Lỗi khi xóa ảnh' });
  }
};
