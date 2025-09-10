import { body } from 'express-validator';

export const validateCreateCategory = [
    body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Tên danh mục phải có từ 2 đến 100 ký tự'),

    body('slug')
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug chỉ được chứa chữ thường, số và dấu gạch ngang')
    .isLength({ min: 2, max: 50 })
    .withMessage('Slug phải có từ 2 đến 50 ký tự'),

    body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Mô tả không được quá 500 ký tự'),

 

    body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Icon không được quá 50 ký tự'),

    body('color')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Màu sắc phải là mã hex hợp lệ (ví dụ: #1890ff)'),

    body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Thứ tự phải là số nguyên không âm'),

    body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Trạng thái phải là boolean'),

    body('metaTitle')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('Meta title không được quá 60 ký tự'),

    body('metaDescription')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('Meta description không được quá 160 ký tự'),
];

export const validateUpdateCategory = [
    body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Tên danh mục phải có từ 2 đến 100 ký tự'),

    body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug chỉ được chứa chữ thường, số và dấu gạch ngang')
    .isLength({ min: 2, max: 50 })
    .withMessage('Slug phải có từ 2 đến 50 ký tự'),

    body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Mô tả không được quá 500 ký tự'),


    body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Icon không được quá 50 ký tự'),

    body('color')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Màu sắc phải là mã hex hợp lệ (ví dụ: #1890ff)'),

    body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Thứ tự phải là số nguyên không âm'),

    body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Trạng thái phải là boolean'),

    body('metaTitle')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('Meta title không được quá 60 ký tự'),

    body('metaDescription')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('Meta description không được quá 160 ký tự'),
];