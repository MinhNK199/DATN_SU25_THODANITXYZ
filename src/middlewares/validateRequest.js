import Joi from "joi";

export const validateRequest = (schema, target = "body") =>{
    return (req,res,next) =>{
        const {error, value} = schema.validate(req[target], {
            abortEarly: false,
            stripUnknown: true,
        });
        if(error){
             return res.status(400).json({
                error: "Dữ liệu không hợp lệ",
                details: error.details.map((err) => err.message),
            });
        }
        req[target] = value;
        next();
    };
};