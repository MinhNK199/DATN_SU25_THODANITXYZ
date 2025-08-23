import { validationResult } from 'express-validator';
import Joi from "joi";

// Middleware cho express-validator
export const validateRequest = (req, res, next) => {
    console.log('🔍 Validating request:', req.method, req.path);
    console.log('📦 Request body:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('❌ Validation errors:', errors.array());
        return res.status(400).json({
            error: "Dữ liệu không hợp lệ",
            details: errors.array().map(err => err.msg),
        });
    }

    console.log('✅ Validation passed');
    next();
};

// Middleware cho Joi (giữ lại cho backward compatibility)
export const validateRequestJoi = (schema, target = "body") => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[target], {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            return res.status(400).json({
                error: "Dữ liệu không hợp lệ",
                details: error.details.map((err) => err.message),
            });
        }
        req[target] = value;
        next();
    };
};