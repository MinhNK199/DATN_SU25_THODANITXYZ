import { body } from 'express-validator';

export const createProductValidation = [
    body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Tên sản phẩm phải có từ 2 đến 200 ký tự'),

    body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Mô tả sản phẩm phải có từ 10 đến 2000 ký tự'),

    body('price')
    .isFloat({ min: 0 })
    .withMessage('Giá sản phẩm phải là số dương'),

    body('salePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Giá khuyến mãi phải là số dương'),

    body('stock')
    .isInt({ min: 0 })
    .withMessage('Số lượng tồn kho phải là số nguyên không âm'),

    body('category')
    .isMongoId()
    .withMessage('Danh mục không hợp lệ'),

    body('brand')
    .isMongoId()
    .withMessage('Thương hiệu không hợp lệ'),

    body('images')
    .isArray({ min: 1 })
    .withMessage('Phải có ít nhất 1 hình ảnh'),

    body('variants.*.name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Tên biến thể phải có từ 1 đến 100 ký tự'),

    body('variants.*.sku')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('SKU phải có từ 1 đến 50 ký tự'),

    body('variants.*.price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Giá biến thể phải là số dương'),

    body('variants.*.salePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Giá khuyến mãi biến thể phải là số dương'),

    body('variants.*.stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Tồn kho biến thể phải là số nguyên không âm'),

    body('variants.*.color')
    .optional()
    .custom((value) => {
        if (typeof value === 'string') {
            // Kiểm tra hex color hoặc rgba
            return /^#[0-9A-F]{6}$/i.test(value) || /^rgba?\([^)]+\)$/i.test(value) || value.length <= 50;
        } else if (typeof value === 'object' && value !== null) {
            // Nếu là object, kiểm tra có code và name
            if (value.code && typeof value.code === 'string') {
                return /^#[0-9A-F]{6}$/i.test(value.code) || /^rgba?\([^)]+\)$/i.test(value.code);
            }
            return true; // Allow color objects without code
        }
        return false;
    })
    .withMessage('Màu sắc phải là chuỗi hợp lệ hoặc object có code và name'),

    body('variants.*.size')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Kích thước không được quá 50 ký tự'),

    body('variants.*.weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cân nặng phải là số dương'),

    body('variants.*.images')
    .optional()
    .isArray()
    .withMessage('Hình ảnh biến thể phải là một mảng'),

    body('variants.*.images.*')
    .optional()
    .isString()
    .withMessage('URL hình ảnh biến thể phải là chuỗi'),

    body('specifications')
    .optional()
    .isObject()
    .withMessage('Thông số kỹ thuật phải là một object'),

    body('features')
    .optional()
    .isArray()
    .withMessage('Tính năng phải là một mảng'),

    body('features.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Tính năng phải có từ 1 đến 200 ký tự'),

    body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Trạng thái kích hoạt phải là boolean'),

    body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('Trạng thái nổi bật phải là boolean'),
];

export const updateProductValidation = [
    body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Tên sản phẩm phải có từ 2 đến 200 ký tự'),

    body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Mô tả sản phẩm phải có từ 10 đến 2000 ký tự'),

    body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Giá sản phẩm phải là số dương'),

    body('salePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Giá khuyến mãi phải là số dương'),

    body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Số lượng tồn kho phải là số nguyên không âm'),

    body('category')
    .optional()
    .isMongoId()
    .withMessage('Danh mục không hợp lệ'),

    body('brand')
    .optional()
    .isMongoId()
    .withMessage('Thương hiệu không hợp lệ'),

    body('images')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Phải có ít nhất 1 hình ảnh'),

    body('variants.*.name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Tên biến thể phải có từ 1 đến 100 ký tự'),

    body('variants.*.sku')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('SKU phải có từ 1 đến 50 ký tự'),

    body('variants.*.price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Giá biến thể phải là số dương'),

    body('variants.*.salePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Giá khuyến mãi biến thể phải là số dương'),

    body('variants.*.stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Tồn kho biến thể phải là số nguyên không âm'),

    body('variants.*.color')
    .optional()
    .custom((value) => {
        if (typeof value === 'string') {
            // Kiểm tra hex color hoặc rgba
            return /^#[0-9A-F]{6}$/i.test(value) || /^rgba?\([^)]+\)$/i.test(value) || value.length <= 50;
        } else if (typeof value === 'object' && value !== null) {
            // Nếu là object, kiểm tra có code và name
            if (value.code && typeof value.code === 'string') {
                return /^#[0-9A-F]{6}$/i.test(value.code) || /^rgba?\([^)]+\)$/i.test(value.code);
            }
            return true; // Allow color objects without code
        }
        return false;
    })
    .withMessage('Màu sắc phải là chuỗi hợp lệ hoặc object có code và name'),

    body('variants.*.size')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Kích thước không được quá 50 ký tự'),

    body('variants.*.weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cân nặng phải là số dương'),

    body('variants.*.images')
    .optional()
    .isArray()
    .withMessage('Hình ảnh biến thể phải là một mảng'),

    body('variants.*.images.*')
    .optional()
    .isString()
    .withMessage('URL hình ảnh biến thể phải là chuỗi'),

    body('specifications')
    .optional()
    .isObject()
    .withMessage('Thông số kỹ thuật phải là một object'),

    body('features')
    .optional()
    .isArray()
    .withMessage('Tính năng phải là một mảng'),

    body('features.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Tính năng phải có từ 1 đến 200 ký tự'),

    body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Trạng thái kích hoạt phải là boolean'),

    body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('Trạng thái nổi bật phải là boolean'),
];