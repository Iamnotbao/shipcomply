const Joi = require("joi");

const createAcItemRefSchema = Joi.object({
  factory_code: Joi.string().max(30).required(),
  item_acno: Joi.string().max(120).required(),
  item_no: Joi.string().max(120).required(),
  item_unit: Joi.string().max(30).allow(null).empty('').optional(),
  formula: Joi.number().allow(null).empty('').default(null).optional(),
  status: Joi.number().integer().default(1).optional(),
  grt_dept: Joi.string().max(30).allow(null).empty('').optional(),
  grt_user: Joi.string().max(30).allow(null).empty('').optional(),
  grt_date: Joi.date().allow(null).empty('').optional(),
  last_user: Joi.string().max(30).allow(null).empty('').optional(),
  last_date: Joi.date().allow(null).empty('').optional(),
  locked_information: Joi.string().max(600).allow(null).empty('').default(null).optional(),
});

module.exports = createAcItemRefSchema;