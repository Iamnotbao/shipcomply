const Joi = require("joi");

const createAcVendBaseSchema = Joi.object({
  factory_code: Joi.string().max(30).required(),
  vend_no: Joi.string().max(200).required(),
  ac_send: Joi.string().max(200).required(),
  is_default: Joi.string().max(1).allow(null).empty("").optional(),
  req_qc: Joi.string().max(1).allow(null).empty("").optional(),
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

module.exports = createAcVendBaseSchema;
