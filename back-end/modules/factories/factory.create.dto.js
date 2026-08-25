const Joi = require("joi");
const createFactorySchema = Joi.object({
  factory_code: Joi.string().required(),
  factory_name_t: Joi.string().allow(null, "").optional(),
  factory_name_e: Joi.string().allow(null, "").optional(),
  factory_name_l: Joi.string().allow(null, "").optional(),
  factory_address: Joi.string().allow(null, "").optional(),
  factory_abbreviation: Joi.string().allow(null, "").optional(),
  factory_tax_no: Joi.string().allow(null, "").optional(),
  status: Joi.number().optional(),
  grt_dept: Joi.string().allow(null, "").optional(),
  grt_user: Joi.string().allow(null, "").optional(),
  grt_date: Joi.date().allow(null, "").optional(),
  last_user: Joi.string().allow(null, "").optional(),
  last_date: Joi.date().allow(null, "").optional(),
  locked_information: Joi.string().allow(null, "").optional(),
});
module.exports = createFactorySchema;
