const Joi = require("joi");
const createFactoryDepartmentsSchema = Joi.object({
  factory_code: Joi.string().required(),
  department_code: Joi.string().required(),
  department_name_t: Joi.string().allow(null, "").optional(),
  department_name_e: Joi.string().allow(null, "").optional(),
  department_name_l: Joi.string().allow(null, "").optional(),
  status: Joi.number().optional(),
  grt_dept: Joi.string().allow(null).allow(null, "").optional(),
  grt_user: Joi.string().allow(null).allow(null, "").optional(),
  grt_date: Joi.date().allow(null).allow(null, "").optional(),
  last_user: Joi.string().allow(null).allow(null, "").optional(),
  last_date: Joi.date().allow(null).allow(null, "").optional(),
});
module.exports = createFactoryDepartmentsSchema;
