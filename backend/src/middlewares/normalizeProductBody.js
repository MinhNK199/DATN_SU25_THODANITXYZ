// Middleware chuẩn hóa dữ liệu trước khi validate
export const normalizeProductBody = (req, res, next) => {
    // Parse variants
    if (req.body.variants && typeof req.body.variants === "string") {
        try {
            req.body.variants = JSON.parse(req.body.variants);
        } catch {
            req.body.variants = [];
        }
    }
    // Parse tags
    if (req.body.tags && typeof req.body.tags === "string") {
        try {
            req.body.tags = JSON.parse(req.body.tags);
        } catch {
            req.body.tags = [];
        }
    }
    // Parse specifications
    if (req.body.specifications && typeof req.body.specifications === "string") {
        try {
            req.body.specifications = JSON.parse(req.body.specifications);
        } catch {
            req.body.specifications = {};
        }
    }
    // Parse features
    if (req.body.features && typeof req.body.features === "string") {
        try {
            req.body.features = JSON.parse(req.body.features);
        } catch {
            req.body.features = [];
        }
    }
    // Parse isFeatured
    if (req.body.isFeatured === "undefined" || req.body.isFeatured === undefined) {
        req.body.isFeatured = false;
    } else if (req.body.isFeatured === "true" || req.body.isFeatured === true) {
        req.body.isFeatured = true;
    } else if (req.body.isFeatured === "false" || req.body.isFeatured === false) {
        req.body.isFeatured = false;
    }
    // Parse isActive
    if (req.body.isActive === "true" || req.body.isActive === true) {
        req.body.isActive = true;
    } else if (req.body.isActive === "false" || req.body.isActive === false) {
        req.body.isActive = false;
    }
    // Parse images
    if (req.file) {
        req.body.images = [`/uploads/images/${req.file.filename}`];
    } else if (req.files && Array.isArray(req.files)) {
        req.body.images = req.files.map(f => `/uploads/images/${f.filename}`);
    } else if (req.files && req.files.image) {
        // Handle multiple files upload
        req.body.images = [`/uploads/images/${req.files.image[0].filename}`];
    } else if (req.body.images && typeof req.body.images === "string") {
        try {
            req.body.images = JSON.parse(req.body.images);
        } catch {
            req.body.images = [req.body.images];
        }
    }

    // Parse thumbnails from uploaded files
    const thumbnailFiles = [];
    if (req.files) {
        Object.keys(req.files).forEach(key => {
            if (key.startsWith('thumbnail_')) {
                thumbnailFiles.push(`/uploads/images/${req.files[key][0].filename}`);
            }
        });
    }
    
    // Also parse thumbnails from form data (fallback)
    Object.keys(req.body).forEach(key => {
        if (key.startsWith('thumbnail_')) {
            thumbnailFiles.push(req.body[key]);
            delete req.body[key];
        }
    });
    
    if (thumbnailFiles.length > 0) {
        req.body.thumbnails = thumbnailFiles;
    }
    next();
};