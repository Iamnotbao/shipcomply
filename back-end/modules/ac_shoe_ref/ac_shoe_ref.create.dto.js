const Joi = require("joi");

const createAcShoesRefSchema = Joi.object({
  factory_code: Joi.string().max(30).required(),
  customs_shoe_id: Joi.string().max(120).required(),
  prod_no: Joi.string().max(120).required(),
  prod_unit: Joi.string().max(30).allow(null).empty("").optional(),
  is_valid: Joi.string().length(1).allow(null).empty("").optional(),
  valid_date: Joi.date().allow(null).empty("").default(null).optional(),
  unval_date: Joi.date().allow(null).empty("").default(null).optional(),
  status: Joi.number().integer().default(1).optional(),
  grt_dept: Joi.string().max(30).allow(null).empty("").optional(),
  grt_user: Joi.string().max(30).allow(null).empty("").optional(),
  grt_date: Joi.date().allow(null).empty("").optional(),
  last_user: Joi.string().max(30).allow(null).empty("").optional(),
  last_date: Joi.date().allow(null).empty("").optional(),
  locked_information: Joi.string().max(600).allow(null).empty('').default(null).optional(),
});

module.exports = createAcShoesRefSchema;