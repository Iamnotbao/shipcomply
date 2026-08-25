const Joi = require("joi");
const createUserDPSchema = Joi.object({
  user_code: Joi.string().required(),
  factory_code: Joi.string().required(),
  department_code: Joi.string().required(),
  status: Joi.number().allow(null, "").optional(),
  grt_dept: Joi.string().allow(null, "").optional(),
  grt_user: Joi.string().allow(null, "").optional(),
  grt_date: Joi.date().allow(null, "").optional(),
  last_user: Joi.string().allow(null, "").optional(),
  last_date: Joi.date().allow(null, "").optional(),
});
module.exports = createUserDPSchema;
