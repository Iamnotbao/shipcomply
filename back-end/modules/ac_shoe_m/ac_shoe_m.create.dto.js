const Joi = require("joi");

const createAcShoesMSchema = Joi.object({
  factory_code: Joi.string().max(30).required(),
  customs_shoe_id: Joi.string().max(120).required(),
  customs_shoe_name_l: Joi.string().max(600).allow(null,'').optional(),
  customs_shoe_name_t: Joi.string().max(600).allow(null,'').optional(),
  customs_shoe_name_e: Joi.string().max(600).allow(null,'').optional(),
  customs_tariff: Joi.string().max(200).allow(null,'').optional(),
  size_type: Joi.string().max(30).allow(null,'').optional(),
  unit: Joi.string().max(30).allow(null,'').optional(),
  status: Joi.number().integer().default(1).optional(),
  grt_dept: Joi.string().max(30).allow(null).empty('').optional(),
  grt_user: Joi.string().max(30).allow(null).empty('').optional(),
  grt_date: Joi.date().allow(null).empty('').optional(),
  last_user: Joi.string().max(30).allow(null).empty('').optional(),
  last_date: Joi.date().allow(null).empty('').optional(),
  locked_information: Joi.string().max(600).allow(null).empty('').default(null).optional(),
});

module.exports = createAcShoesMSchema;