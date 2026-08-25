const Joi = require("joi");
const editFactorySchema = Joi.object({
  factory_code: Joi.string().required(),
  factory_name_t: Joi.string().optional(),
  factory_name_e: Joi.string().optional(),
  factory_name_l: Joi.string().optional(),
  factory_address: Joi.string().optional(),
  factory_abbreviation: Joi.string().optional(),
  factory_tax_no: Joi.string().optional(),
  status: Joi.number().optional(),
});
module.exports = editFactorySchema;
