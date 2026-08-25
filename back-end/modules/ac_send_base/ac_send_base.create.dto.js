const Joi = require("joi");

const createAcSendBaseSchema = Joi.object({
  factory_code: Joi.string().max(30).required(),
  ac_send: Joi.string().max(200).required(),
  ac_type: Joi.string().max(30).required(),
  stoc_type: Joi.string().max(30).allow(null).empty("").optional(),
  sales_type: Joi.string().max(30).allow(null).empty("").optional(),
  status: Joi.number().integer().default(1).optional(),
  grt_dept: Joi.string().max(30).allow(null).empty("").optional(),
  grt_user: Joi.string().max(20).allow(null).empty("").optional(),
  grt_date: Joi.date().allow(null).empty("").optional(),
  last_user: Joi.string().max(30).allow(null).empty("").optional(),
  last_date: Joi.date().allow(null).empty("").optional(),
  locked_information: Joi.string()
    .max(600)
    .allow(null)
    .empty("")
    .default(null)
    .optional(),
});

module.exports = createAcSendBaseSchema;
