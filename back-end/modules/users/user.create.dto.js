const Joi = require("joi");
const createUserSchema = Joi.object({
  factory_code: Joi.string().required(),
  department_code: Joi.string().required(),
  user_code: Joi.string().required(),
  user_name_t: Joi.string().allow(null, "").optional(),
  user_name_e: Joi.string().allow(null, "").optional(),
  user_name_l: Joi.string().allow(null, "").optional(),
  user_password: Joi.string().allow(null, "").optional(),
  supervisor_id: Joi.string().allow(null, "").optional(),
  allow_authorization: Joi.string().allow(null, "").required(),
  status: Joi.number().optional(),
  grt_dept: Joi.string().allow(null, "").optional(),
  grt_user: Joi.string().allow(null, "").optional(),
  grt_date: Joi.date().allow(null, "").optional(),
  last_user: Joi.string().allow(null, "").optional(),
  last_date: Joi.date().allow(null, "").optional(),
});
module.exports = createUserSchema;
