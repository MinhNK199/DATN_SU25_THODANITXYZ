import { body } from "express-validator";

export const createVariantValidation = [
    body('name')
    .trim()
    .notEmpty()
    .withMessage('Tên biến thể không được để trống')
    .isLength({ min: 2, max: 200 })
    .withMessage('Tên biến thể phải từ 2-200 ký tự'),

    body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU không được để trống')
    .isLength({ min: 2, max: 50 })
    .withMessage('SKU phải từ 2-50 ký tự')
    .matches(/^[A-Za-z0-9\-_!@#$%^&*()]+$/)
    .withMessage('SKU chỉ được chứa chữ cái, số và các ký tự đặc biệt: -_!@#$%^&*()'),

    body('price')
    .isFloat({ min: 0 })
    .withMessage('Giá phải là số dương'),

    body('salePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Giá khuyến mãi phải là số dương'),

    body('stock')
    .isInt({ min: 0 })
    .withMessage('Tồn kho phải là số nguyên không âm'),

    body('color')
    .optional()
    .custom((value) => {
        if (value === undefined || value === null) return true;
        if (typeof value === 'string') {
            // Nếu là string, kiểm tra hex color
            return /^#[0-9A-F]{6}$/i.test(value);
        } else if (typeof value === 'object' && value !== null) {
            // Nếu là object, kiểm tra có code và name
            return value.code && typeof value.code === 'string' &&
                /^#[0-9A-F]{6}$/i.test(value.code);
        }
        return false;
    })
    .withMessage('Màu sắc phải là mã màu hex hợp lệ hoặc object có code và name'),

    body('size')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Kích thước không được quá 50 ký tự'),

    body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cân nặng phải là số dương'),

    body('images')
    .optional()
    .isArray()
    .withMessage('Hình ảnh phải là mảng'),

    body('images.*')
    .optional()
    .isString()
    .withMessage('Hình ảnh phải là string'),

    body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Trạng thái phải là boolean'),

    body('product')
    .notEmpty()
    .withMessage('Sản phẩm không được để trống')
    .isMongoId()
    .withMessage('ID sản phẩm không hợp lệ'),

    body('specifications')
    .optional()
    .isObject()
    .withMessage('Thông số kỹ thuật phải là một object'),
];

export const updateVariantValidation = [
    body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Tên biến thể không được để trống')
    .isLength({ min: 2, max: 200 })
    .withMessage('Tên biến thể phải từ 2-200 ký tự'),

    body('sku')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('SKU không được để trống')
    .isLength({ min: 2, max: 50 })
    .withMessage('SKU phải từ 2-50 ký tự')
    .matches(/^[A-Za-z0-9\-_!@#$%^&*()]+$/)
    .withMessage('SKU chỉ được chứa chữ cái, số và các ký tự đặc biệt: -_!@#$%^&*()'),

    body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Giá phải là số dương'),

    body('salePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Giá khuyến mãi phải là số dương'),

    body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Tồn kho phải là số nguyên không âm'),

    body('color')
    .optional()
    .custom((value) => {
        if (value === undefined || value === null) return true;
        if (typeof value === 'string') {
            // Nếu là string, kiểm tra hex color
            return /^#[0-9A-F]{6}$/i.test(value);
        } else if (typeof value === 'object' && value !== null) {
            // Nếu là object, kiểm tra có code và name
            return value.code && typeof value.code === 'string' &&
                /^#[0-9A-F]{6}$/i.test(value.code);
        }
        return false;
    })
    .withMessage('Màu sắc phải là mã màu hex hợp lệ hoặc object có code và name'),

    body('size')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Kích thước không được quá 50 ký tự'),

    body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cân nặng phải là số dương'),

    body('images')
    .optional()
    .isArray()
    .withMessage('Hình ảnh phải là mảng'),

    body('images.*')
    .optional()
    .isString()
    .withMessage('Hình ảnh phải là string'),

    body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Trạng thái phải là boolean'),

    body('specifications')
    .optional()
    .isObject()
    .withMessage('Thông số kỹ thuật phải là một object'),
];