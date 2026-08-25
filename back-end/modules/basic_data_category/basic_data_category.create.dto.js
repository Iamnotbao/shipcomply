const Joi = require("joi");
const createBasicDataCategorySchema = Joi.object({
  factory_code: Joi.string().required(),
  category_code: Joi.string().required(),
  category_name_t: Joi.string().allow(null, "").optional(),
  category_name_e: Joi.string().allow(null, "").optional(),
  category_name_l: Joi.string().allow(null, "").optional(),
  status: Joi.number().optional(),
  grt_dept: Joi.string().allow(null).allow(null, "").optional(),
  grt_user: Joi.string().allow(null).allow(null, "").optional(),
  grt_date: Joi.date().allow(null).allow(null, "").optional(),
  last_user: Joi.string().allow(null).allow(null, "").optional(),
  last_date: Joi.date().allow(null).allow(null, "").optional(),
  locked_information: Joi.string().allow(null).allow(null, "").optional(),
});
module.exports = createBasicDataCategorySchema;
