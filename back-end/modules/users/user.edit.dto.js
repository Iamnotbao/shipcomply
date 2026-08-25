const Joi = require("joi")
const editUserSchema = Joi.object({
    factory_code : Joi.string().required(),
    department_code : Joi.string().required(),
    user_code: Joi.string().required(),
    user_name_t:Joi.string().allow(null, "").optional(),
    user_name_e:Joi.string().allow(null, "").optional(),
    user_name_l : Joi.string().allow(null, "").optional(),
    supervisor_id:Joi.string().allow(null, "").optional(),
    allow_authorization:Joi.string().allow(null, "").required()
}).unknown(true);
module.exports=editUserSchema;